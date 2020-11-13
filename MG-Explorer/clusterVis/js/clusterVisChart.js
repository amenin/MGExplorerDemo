/**
 * clusterVis
 *
 */

define(["model","libCava"], function (Model,LibCava) {
    return function ClusterVis (idDiv) {

        let _clusterVisPanel = null,  // Represents the panel associated with the graphic
            _xClusterCenter = 0,
            _yClusterCenter = 0,
            _innerRadius = 0,     // (calculated) Internal circle radius where the graph is drawn
            _outerRadius = 0,
            _grpCluster = null,   // Group representing ClusterVis
            _grpRings = null,    // Selection that contains all groups that store the rings
            _grpBars = null,
            _grpLinks = null,
            _links    = null,   // Selection that contains the links
            _sameScale = false,  // Indicates that the same scale should be used for all bars

            _vRings = [],       // List with the data of the rings:
            // { indexAttr, typeAttr ("L"-label, "V"-value), pHeight (percentage of _widthAllFaixas, maxValue (maximum value of the data for the ring }

            _barsArea = {
                widthBar: 0,       // (calculated) Width of bar in the area of maximum width (focus) Original: 11
                angleBar: 0.0,     // (calculated) Angle of the sector occupied by the bars that are in Focus
                startSector: 0,     // Position of the sector where the first bar is positioned
                marginBar: 1,      //
                pMarginBar: 0.0033,
                maxBars: 0,        // (calculated) maximum number of bars considering the innermost ring of the clusterVis
                numBars: 0         //  Number of bars in the clusterVis
            },

            _dataLinks = {
                heightTree: 2,       // Height of the tree to be generated
                degreeTree: 2,       // Degree of intermediate nodes
                tree : null,         // Artificially generated tree
                vBundleLinks : null,  // Vector of edges
                tension : 0.85,        // Voltage used in drawing the edges
                bundle  : d3.layout.bundle()   // Beam generator
            },

            _indexAttrSort = 0,  // Index of the attribute used for sort (0-first labels[] 1000-first values[])
                                 // Vector of colors with 20 elements inverted (da d3)
            _vCores20Inv = ["#17becf","#bcbd22","#7f7f7f","#e377c2","#8c564b","#9467bd","#9edae5","#dbdb8d","#c7c7c7","#f7b6d2",
                "#c49c94","#c5b0d5","#ff9896","#d62728","#98df8a","#2ca02c","#ffbb78","#ff7f0e","#aec7e8","#1f77b4"],
            _vOrder = null,      // Indirect ordering vector
            _vAngle = null,      // Vector that contains the angular measurement of each bar. Calculated at _calcGeometry
            _grpBarsRotScale = d3.scale.ordinal(),    // Scale used to set the angle of rotation of each bar
            _ringScale = d3.scale.linear().domain([ 0, 100 ]),
            _colorScale = d3.scale.category10();

// ---------------- Model
        let model = Model();
        let lcv   = LibCava();

// ---------------- Geometric attributes of the graph
        model.margin = {top: 30, right: 40, bottom: 30, left: 40};
        model.box = { width:150, height:150};
        model.pInnerRadius = 0.20;    // Percentage of the width of the graph for calculating the _innerRadius
        model.pOuterRadius = 0.47;    // Percentage of the width of the graph for calculating the _OuterRadius
        model.pWidthBar =  0.0275;    // Percentage relative to the width of the graph for calculating the width of the bars

        model.redraw = 0;        // When changed perform a redraw

// ---------------- Initialization Actions
        let _svg = d3.select("#"+idDiv).append("svg"),  //Create dimensionless svg
            _grpChart = _svg.append("g"),                       // Does not exist in the original Iris
            _sort  = lcv.sort(),                     // Creates sorting function
            _drawLine = d3.svg.line.radial()         // Generator of splines that makes up the edges
                .interpolate("bundle")
                .tension(_dataLinks.tension)
                .radius(function(d) { return d.y; })
                .angle(function(d) { return d.x / 180 * Math.PI; });

        _grpCluster = _grpChart.append("g").attr("class","ClusterVisChart");
        _grpCluster.append("circle").attr("class","CV-Inner");

//===================================================
        model.when(["box", "margin"], function (box, margin) {
            model.widthChart = box.width - margin.left - margin.right;
            model.heightChart = box.height - margin.top - margin.bottom;
        });

        model.when("box", function (box) {
            _svg.attr("width", box.width).attr("height", box.height);
        });

        //---------------------
        model.when("margin", function (margin) {
            _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        });

        //---------------------
        model.when(["widthChart","pInnerRadius"], function (widthChart,pInnerRadius) {
            _innerRadius = Math.floor(widthChart  * pInnerRadius);
            _grpCluster.select(".CV-Inner").attr("r",_innerRadius);
            _ringScale.range([ _innerRadius, _outerRadius ]);
            model.redraw += 1;    // To force the redesign
        });

        //---------------------
        model.when(["widthChart","pOuterRadius"], function (widthChart,pOuterRadius) {
            _outerRadius = Math.floor(widthChart * pOuterRadius);
            _ringScale.range([ _innerRadius, _outerRadius ]);
            model.redraw += 1;    // To force the redesign
        });

        //---------------------
        model.when(["widthChart","pWidthBar"], function (widthChart,pWidthBar) {
            _barsArea.widthBar = widthChart  * pWidthBar;
            _barsArea.marginBar = widthChart * _barsArea.pMarginBar;

        });

        //---------------------
        model.when(["data","widthChart","heightChart","redraw"], function (data,widthChart,heightChart) {
            _xClusterCenter = Math.floor(widthChart / 2);
            _yClusterCenter = Math.floor(heightChart / 2);

            _grpCluster.attr("transform", "translate(" + _xClusterCenter + "," + _yClusterCenter + ")");

            _calcGeometry(data);
            _grpBarsRotScale.range(_vAngle).domain(_vOrder);

            _calcCoordinates(data.nodes.dataNodes);
            _appendRings();
            _appendBars(data);
            _appendLinks();
        });
//--------------------------------- Private functions

        /**
         * _appendRings
         *
         * Adds the SVG elements relative to the rings
         */
        function _appendRings() {
            if (_grpRings != null)
                _grpRings.remove();
            _grpRings =  _grpCluster.selectAll(".CV-grpRings")
                .data(_vRings)    // Original _vRings
                .enter()
                .append("g")
                .attr("class", "CV-grpRings");

            _grpRings.append("circle")
                .attr("r", function (d){ return _ringScale(d.pHeight)} );
        }

        /**
         * _appendBars
         *
         * Adds the SVG elements relative to the bars
         */
        function _appendBars(data) {
            let i, j,k, achei, maxDoAnel, categoriasAux=[], categorias=[];
            let circleScale = d3.scale.ordinal();

            if (_grpBars != null)
                _grpBars.remove();
            _grpBars =  _grpCluster.selectAll(".CV-grpBars")
                .data( data.nodes.dataNodes)
                .enter()
                .append("g")
                .attr("class", "CV-grpBars")
                .attr("transform", function(d, i) { return "rotate(" + _grpBarsRotScale(i) + ")"; 	});

            _grpBars.append("line")
                .attr("x1", _ringScale(0))
                .attr("y1", 0)
                .attr("x2", _ringScale(100))
                .attr("y2",  0);

            for (i=0; i<_vRings.length; i++) {
                if (_vRings[i].typeAttr==="L")
                    categoriasAux = categoriasAux.concat( _vRings[i].vLabelDomain.sort());
            }

            // Removes duplicate vector elements
            k=0;
            for (i=0; i<categoriasAux.length; i++) {
                achei = false;
                for (j=0; j<categorias.length; j++)
                    if (categoriasAux[i] === categorias[j]) {
                        achei = true;
                        break;
                    }
                if (!achei) {
                    categorias[k] = categoriasAux[i];
                    k++;
                }
            }

            if (_sameScale) {
                maxDoAnel = -1;
                for (i=0; i<_vRings.length; i++) {
                    if (_vRings[i].maxValue > maxDoAnel)
                        maxDoAnel = _vRings[i].maxValue;
                }
                for (i=0; i<_vRings.length; i++) {
                    if (_vRings[i].typeAttr==="V") {
                        _vRings[i].barCircleScale.range( [1, Math.floor(_vRings[i].pHeightBar* (_outerRadius - _innerRadius))]).domain([0,maxDoAnel]);
                    } else {
                        _vRings[i].barCircleScale.range(_vCores20Inv).domain(categorias);
                    }
                }
            } else {
                for (i=0; i<_vRings.length; i++) {
                    if (_vRings[i].typeAttr==="V") {
                        _vRings[i].barCircleScale.range( [1, Math.floor(_vRings[i].pHeightBar* (_outerRadius - _innerRadius))]).domain([0,_vRings[i].maxValue]);
                    } else {
                        _vRings[i].barCircleScale.range(_vCores20Inv).domain(categorias);
                    }
                }
            }
            for (i=0; i<_vRings.length; i++) {
                if (_vRings[i].typeAttr==="V") {
                    _grpBars.append("rect")
                        .attr("class", "CV-node")
                        .attr("x", _ringScale(_vRings[i].pX))
                        .attr("y", function () {return -_barsArea.widthBar/2;})
                        .attr("height", function () { return _barsArea.widthBar; })
                        .attr("width",  function (d) { return _vRings[i].barCircleScale( d.values[ _vRings[i].indexAttr]); })
                        .style("fill", function () { return _colorScale(_vRings[i].indexAttr); })
                        .on("mouseover", _mouseOverNode)
                        .on("mouseout", _mouseOutNode)
                        .append("title")
                        .text(function(d) { return d.labels[0] + "\n" + data.nodes.valueTitle[_vRings[i].indexAttr] + ": " + d.values[ _vRings[i].indexAttr]});
                } else {
                    circleScale.range(_vCores20Inv).domain(_vRings[i].vLabelDomain);
                    _grpBars.append("circle")
                        .attr("class", "CV-node")
                        .attr("cx",  _ringScale(_vRings[i].pX) + _barsArea.widthBar/2 )
                        .attr("cy", 0)
                        .attr("r", _barsArea.widthBar/2)
                        .style("fill", function (d) { return _vRings[i].barCircleScale(d.labels[ _vRings[i].indexAttr]); })	//<-- Check how to put the color
                        .on("mouseover", _mouseOverNode)
                        .on("mouseout", _mouseOutNode)
                        .append("title")
                        .text(function(d) {
                            return d.labels[0] + "\n" +
                            data.nodes.labelTitle[_vRings[i].indexAttr] + ": " + d.labels[ _vRings[i].indexAttr]
                        });
                }
            }

        }

        /**
         * _appendLinkss
         *
         * Adds the SVG elements relative to the edges
         */
        function _appendLinks() {
            if (_grpLinks != null)
                _grpLinks.remove();

            _grpLinks =  _grpCluster.append("g")
                .attr("class","CV-grpLinks")
                .attr("transform","rotate(90)");

            _links = _grpLinks.selectAll("path")
                .data(_dataLinks.vBundleLinks)
                .enter()
                .append("path")
                .attr("d", _drawLine);
        }

        /**
         * _mouseOverNode
         */
        function _mouseOverNode(d) {
            _grpBars.each( function(n) { n.highLight=false;} );

            _links.classed("CV-linkHL", function(link) {
                if (link.source===d || link.target===d) return link.source.highLight=link.target.highLight=true;
                else return false;
            });

            _grpBars.classed("CV-nodeHL", function(node) { return node.highLight; });

            _grpBars.append("text")
                .text("")
                .classed("CV-names", true); // For showing names on mouseover

            let index = _findMaxValue();
            let x = _ringScale(_vRings[_vRings.length-1].pX) + _vRings[index].barCircleScale(_vRings[index].maxValue);

            _grpBars.selectAll("text.CV-names")
                .attr("x", x)
                .attr("y", 0)
                .attr("text-anchor", "start")
                .text(function (n) {
                    if (n.highLight === true) {
                        if (_isTheFirstOccurence(n.id, d.cluster)) {
                            d.cluster.push(n);
                        }
                        let names = n.labels[0].split(",");
                        if (names.length === 1) {
                            names = n.labels[0].split(".");
                            if (names.length === 2) {
                                return names[1];
                            } else {
                                return names[2];
                            }
                        }
                        return names[0];
                    }
                    return "";
                })
                .style("font-size", "10px" )
                .style("font-family", "Arial")
                .style("color", "black");

            function _isTheFirstOccurence(id, tab) {
                if (tab.length===0) return true;
                else {
                    for (let i=0; i < tab.length; i++) {
                        if (tab[i].id === id)
                            return false;
                    }
                    return true;
                }
            }

            function _findMaxValue() {
                let i, max = 0;
                for (i = 0; i < _vRings.length; i++){
                    if (_vRings[i].maxValue>max)
                        max = i;
                }
                return max;
            }
        }

        /**
         * _mouseOutNode
         */
        function _mouseOutNode() {
            _grpBars.classed("CV-nodeHL", false);
            _links.classed("CV-linkHL", false);
            _grpBars.selectAll("text.CV-names").text(" ");
        }

        /**
         * _calcGeometry
         *
         * Calculates all geometric parameters for ClusterVis display
         */
        function _calcGeometry(data) {
            let largBarra, percMargin, percBar; // Percentage of the margin in relation to the width occupied by the sector

            _barsArea.angleBar = _widthToAngle( _barsArea.widthBar + _barsArea.marginBar , _innerRadius );

            _barsArea.maxBars =  Math.floor (360/_barsArea.angleBar);
            _barsArea.angleBar = 360.0 / _barsArea.maxBars;
            _barsArea.numBars = model.data.nodes.dataNodes.length;
            _barsArea.startSector = Math.round( (_barsArea.maxBars - _barsArea.numBars)/2);

            if (_barsArea.numBars > _barsArea.maxBars) {
                percMargin = _barsArea.pMarginBar/ (model.pWidthBar + _barsArea.pMarginBar);
                percBar =  1- percMargin;
                _barsArea.angleBar = 360.0 / _barsArea.numBars;

                largBarra =  _angleToWidth(_barsArea.angleBar,_innerRadius);
                _barsArea.widthBar = largBarra * percBar;
                _barsArea.marginBar = largBarra * percMargin;
                _barsArea.startSector = 0;
            }


            _vAngle = [];
            data.nodes.dataNodes.forEach( function (d,i) {
                _vAngle[i] =  ( (i+_barsArea.startSector) * _barsArea.angleBar + 180)%360;
            });

        }

        /**
         * _calcCoordinates
         *
         * Calculates the coordinates of the leaf nodes
         */
        function _calcCoordinates(dataNodes) {
            let distScale = d3.scale.linear().range([20,_innerRadius]).domain([0,_dataLinks.heightTree]);

            _vOrder.forEach( function (d,i) {
                dataNodes[d].x = _vAngle[i];
                dataNodes[d].y = _innerRadius;
            });

            posOrdem(_dataLinks.tree);

            function posOrdem(raiz) {
                let xPrim, xUlt;

                if (raiz.children !== undefined) {
                    raiz.children.forEach( function (d) {
                        posOrdem(d);
                    });

                    xPrim = raiz.children[0].x;
                    xUlt  = raiz.children[raiz.children.length-1].x;

                    if (xPrim < xUlt)
                        raiz.x = (xPrim + xUlt)/2;
                    else
                        raiz.x = ((xUlt + 360-xPrim)/2 + xPrim)%360;
                    raiz.y = distScale(raiz.depth);
                }
            }
        }

        /**
         * _widthToAngle
         *
         * Calculates the angle of the occupied sector by a width
         * E: width, radius
         * S: angle in degrees
         */
        function _widthToAngle ( width, radius) {
            return Math.acos(1.0 - width*width / (2*radius*radius))*180.0 / Math.PI;
        }

        /**
         * _angleToWidth
         *
         * Calculates the sector width from the angle and a radius
         * E: width, radius
         * S: angle in degrees
         */
        function _angleToWidth ( angle, radius) {
            let angRadianos = angle * Math.PI/ 180.0;
            return Math.sqrt( 2*radius*radius - 2*radius*radius*Math.cos(angRadianos));
        }

        /**
         * _getTree
         *
         * Generates a tree in the format { id:..., chidren[] }
         */
        function _getTree(heightTree, dados, degree, vOrder) {
            let children = null;
            let levelMax = heightTree-1;
            let result = createTree(0,vOrder);
            result.depth = 0;

            function createTree(nivel, vNodos) {
                let obj=[], objPai, inic, fim , delta;
                if (nivel < levelMax) {
                    delta = Math.floor(vNodos.length/degree);
                    inic = 0;
                    fim = delta;
                    for (let i=0; i<degree-1; i++) {
                        obj.push ( createTree(nivel+1, vNodos.slice(inic, fim)));
                        inic = fim;
                        fim += delta;
                    }
                    obj.push ( createTree(nivel+1, vNodos.slice(inic)));
                    objPai = { id:"N"+nivel, children:obj};
                } else
                if (nivel===levelMax) {
                    children = [];
                    vNodos.forEach( function (d) {
                        children.push( dados[d]);
                    });
                    objPai = { id:"N"+nivel, children:children};
                }
                objPai.children.forEach( function (d) {
                    d.parent = objPai;
                    d.depth = nivel+1;
                });
                return objPai;
            }
            return result;
        }

        /**
         * _getEdges
         *
         * Generates a vector with the list of edges in the format: [ {source:Object, target: Object},...]
         */
        function _getEdges(dados) {
            let nodos = dados.nodes.dataNodes,
                edges = dados.edges.dataEdges,
                objSource, objTarget;

            let result = [];
            edges.forEach( function (d) {
                objSource = findNodo(d.src);
                objTarget = findNodo(d.tgt);
                result.push( {source: objSource, target:objTarget} );
            }) ;

            function findNodo(id) {
                for (let i=0; i< nodos.length; i++)
                    if (nodos[i].id === id)
                        return nodos[i];
                return  null;
            }
            return result;
        }

// This function is only valid for numeric attributes
        function _updateMaxRings() {
            _vRings.forEach( function(ring) {
                if (ring.typeAttr==="V")
                    ring.maxValue = d3.max( model.data.nodes.dataNodes, function (d) { return d.values[ring.indexAttr];});
                else
                    ring.maxValue = 0;	// Copy here what was done in the addAttribute()
            });
        }

//--------------------------------- Public functions

        function chart() {}

        //----------------
        // It was put to the panel to be able to change the ordering comboBox
        chart.obtemRings = function () {
            return _vRings;
        };

        //---------------------
        chart.box = function(_) {
            if (!arguments.length)
                return model.box;
            model.box = _;

            return chart;
        };

        //---------------------
        // This function is required in all techniques
        //It is called internally in connectChart
        chart.panel = function(_) {
            if (!arguments.length)
                return _clusterVisPanel;
            _clusterVisPanel = _;

            return chart;
        };

        //---------------------
        chart.data = function(_) {
            if (!arguments.length)
                return model.data;
            model.data = _;

            _sort.inic(model.data.nodes.labelTitle.length, model.data.nodes.valueTitle.length)
                .data(model.data.nodes.dataNodes);
            _sort.exec(_indexAttrSort);
            _vOrder = _sort.getVetOrder();
            _dataLinks.tree = _getTree( _dataLinks.heightTree,model.data.nodes.dataNodes,_dataLinks.degreeTree,_vOrder );
            _dataLinks.vBundleLinks = _dataLinks.bundle(_getEdges(model.data));
            // Appends the source and target attributes to the data of each edge
            _dataLinks.vBundleLinks.forEach(function(d) { d.source = d[0]; d.target = d[d.length - 1]; });
            model.data.nodes.dataNodes.forEach( function(d) { d.highLight=false;});
            _updateMaxRings();
            _clusterVisPanel.update();   // For now it's only here.
            return chart;
        };

        //---------------------
        chart.pInnerRadius = function(_) {
            if (!arguments.length)
                return model.pInnerRadius;
            model.pInnerRadius = _;

            return chart;
        };

        //---------------------
        chart.pOuterRadius = function(_) {
            if (!arguments.length)
                return model.pOuterRadius;
            model.pOuterRadius = _;

            return chart;
        };

        //---------------------
        chart.removeAnelExterno = function() {
            let i,deltaHeight,pHeight,pX;

            _vRings.pop();  // Removes the data from the ring
            deltaHeight = 100/_vRings.length;

            // Adjust todo o _vRings
            for (i=0, pHeight=deltaHeight; i< _vRings.length; i++, pHeight+=deltaHeight) {
                _vRings[i].pHeight = pHeight;
                _vRings[i].pHeightBar = deltaHeight/100;
            }

            if (_vRings.length > 0) {
                _vRings[0].pX = 0;
                pX = _vRings[_vRings.length-1].pHeight;

                for (i=1; i< _vRings.length; i++)
                    _vRings[i].pX = _vRings[i-1].pHeight;
            }

            model.redraw += 1;
            return chart;

        };

        //---------------------
        chart.addAttribute = function( _indexAttr, _typeAttr) {
            let 	maxValue, tempKeys,i,pX,
                deltaHeight = 100/ (_vRings.length+1),
                _vLabelDomain = [];

            if (_typeAttr==="V") {
                maxValue = d3.max( model.data.nodes.dataNodes, function(d){return d.values[_indexAttr];});
            }
            else {    // Determines domain for categorical attributes (deve ser colocado também na função chart.data)
                maxValue = -1;
                tempKeys = d3.nest().key ( function(d){return d.labels[_indexAttr];}).sortKeys(d3.ascending).entries(model.data.nodes.dataNodes);
                for (i=0; i<tempKeys.length; i++)
                    _vLabelDomain[i] = tempKeys[i].key;
            }

            pX = 0;
//		  barScale = d3.scale.linear().range(0, model.ringScale(deltaHeight)-_innerRadius).domain(0,maxValue);

            // Adjust todo o _vRings
            for (i=0, pHeight=deltaHeight; i< _vRings.length; i++, pHeight+=deltaHeight) {
                _vRings[i].pHeight = pHeight;
                _vRings[i].pHeightBar = deltaHeight/100;
            }

//	  barScale.range(0, ringScale() ).domain(0,maxValue);	
            if (_vRings.length > 0) {
                _vRings[0].pX = 0;
                pX = _vRings[_vRings.length-1].pHeight;

                for (i=1; i< _vRings.length; i++)
                    _vRings[i].pX = _vRings[i-1].pHeight;
            }

            if (_typeAttr === "V")
                _vRings.push(	{	indexAttr:_indexAttr, typeAttr:_typeAttr, pHeight:pHeight, pX:pX,
                    pHeightBar:deltaHeight/100,maxValue: maxValue, vLabelDomain:_vLabelDomain, barCircleScale : d3.scale.linear()});
            else
                _vRings.push(	{	indexAttr:_indexAttr, typeAttr:_typeAttr, pHeight:pHeight, pX:pX,
                    pHeightBar:deltaHeight/100,maxValue: maxValue, vLabelDomain:_vLabelDomain, barCircleScale : d3.scale.ordinal()});

            model.redraw += 1;
            return chart;
        };

        //---------------------
        chart.alteraAttribute = function( _indexAnel, _indexAttr, _typeAttr) {
            let 	maxValue, tempKeys,i,
                _vLabelDomain = [];

            if (_typeAttr==="V") {
                maxValue = d3.max( model.data.nodes.dataNodes, function(d){return d.values[_indexAttr];});
            } else {    // Determines or domain for categorical attributes (should also be placed in the function chart.data)
                maxValue = -1;
                tempKeys = d3.nest().key ( function(d){return d.labels[_indexAttr];}).sortKeys(d3.ascending).entries(model.data.nodes.dataNodes);
                for (i=0; i<tempKeys.length; i++)
                    _vLabelDomain[i] = tempKeys[i].key;
            }

            _vRings[_indexAnel].indexAttr = _indexAttr;
            _vRings[_indexAnel].typeAttr = _typeAttr;
            _vRings[_indexAnel].maxValue = maxValue;
            _vRings[_indexAnel].vLabelDomain = _vLabelDomain;
            if (_typeAttr==="V")
                _vRings[_indexAnel].barCircleScale = d3.scale.linear();
            else
                _vRings[_indexAnel].barCircleScale = d3.scale.ordinal();
            model.redraw += 1;

            return chart;
        };

        //---------------------
        chart.indexAttrSort = function(_) {
            if (!arguments.length)
                return _indexAttrSort;
            _indexAttrSort = _;

            return chart;
        };

        //======== Actions Functions
        chart.acSortExec = function(_) {
            _indexAttrSort = _;
            _sort.exec(_indexAttrSort);
            _vOrder = _sort.getVetOrder();
            _grpBarsRotScale.domain(_vOrder);

            _dataLinks.tree = _getTree( _dataLinks.heightTree,model.data.nodes.dataNodes,_dataLinks.degreeTree,_vOrder );
            _dataLinks.vBundleLinks = _dataLinks.bundle(_getEdges(model.data));
            _dataLinks.vBundleLinks.forEach(function(d) { d.source = d[0]; d.target = d[d.length - 1]; });
            _calcCoordinates(model.data.nodes.dataNodes);

            _grpBars.transition().duration(800)
                .attr("transform", function(d, i) { return "rotate(" + _grpBarsRotScale(i) + ")"; });

            _grpLinks.selectAll("path")
                .data(_dataLinks.vBundleLinks).transition().duration(800).attr("d", _drawLine);

            return chart;
        };

        //-------------------------
        chart.acAlteraAnel = function(indexAnel, indexAttr) {
            let indexAtributo;

            indexAtributo = +indexAttr;

            if (indexAtributo >= 1000)
                this.alteraAttribute(indexAnel, indexAtributo-1000, "V");
            else
                this.alteraAttribute(indexAnel, indexAtributo, "L");
            _clusterVisPanel.alteraSelectOrder();
        };

        //-------------------------
        chart.acSameScale = function(checked) {
            _sameScale = checked;
            model.redraw += 1;
        };

        return chart;
    }

});
