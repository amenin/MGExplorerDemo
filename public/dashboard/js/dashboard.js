define(["view"], function (View) {

    return function Dashboard(idDiv) {

        let _idDashboard = idDiv,     // The div id containing the dashboard
            _lastIndex = 0,           // Last index used to identify the view
            _activeView = null,       // View that is active with higher z-index
            _vIdViews = [],           // List of existing views no dashboard
            _vObjViews = [],          // List of views objects
            _zIndexActive = 99,

            _treeCharts = null,       // Stores the tree of connections between views
            _historyChart = null,     // Stores the graph that contains history
            //_svgLinks = null,

            _dragConect = d3.behavior.drag().on("drag", _onDragConect);

        let DS_NodeEdge = 0,
            DS_ClusterVis = 1,
            DS_Iris = 2,
            DS_GlyphMatrix = 3,
            DS_Iris_Solo = 4,
            DS_Papers_List = 5,
            DS_NodeEdge_HAL = 6,
            DS_ClusterVis_HAL = 7;

        let _selectedQuery;

        let _configView = {
            barTitle: true,
            btTool: true,
            btClose: true,
            draggable: true,
            resizable: true,
            aspectRatio: false,
            visible: true
        },

            _contextMenu = {
                showing: false,
                vItens: [null, null, null, null]
            },

            _subContextMenu = {
                showing: false
            },

            _dashboardArea = {
                div: null,
                svg: null,
                width: 0,
                height: 0
            };

        // ---------------- Initialization Actions


        _dashboardArea.div = d3.select("#" + idDiv);
        _dashboardArea.div.classed("DS-viewArea", true)
            .on("click", _onClickAction)
            .on("contextmenu", _onContextMenu)
            .on("dblclick", _dblClickAction);

        _dashboardArea.width = _dashboardArea.div.node().scrollWidth;
        _dashboardArea.height = _dashboardArea.div.node().scrollHeight;
        _dashboardArea.svg = _dashboardArea.div.append("svg")
            .attr("width", _dashboardArea.width)
            .attr("height", _dashboardArea.height);

        //-----Initialize select Query
        $("#selectQuery").on("change", function () {
            _selectedQuery = parseInt(this.value);
        });

        //--------------------------------- Private functions
        function _addLink(viewParent, viewChild) {
            let line, conect;

            let centerViewParent = viewParent.getCenter(),
                centerViewChild = viewChild.getCenter();
            line = _dashboardArea.svg.
                insert("line", ".DS-conect")
                .attr({ x1: centerViewParent.cx, y1: centerViewParent.cy, x2: centerViewChild.cx, y2: centerViewChild.cy })
                .attr("class", "DS-linkChartShow P-" + viewParent.idChart() + " F-" + viewChild.idChart());
            conect = _dashboardArea.svg.
                append("rect")
                .datum([{ x: centerViewChild.cx, y: centerViewChild.cy, viewParent: viewParent, viewChild: viewChild }])
                .attr("class", "DS-conect " + viewChild.idChart())
                .attr("x", centerViewChild.cx - 6)
                .attr("y", centerViewChild.cy - 6)
                .attr("width", 12)
                .attr("height", 12)
                .call(_dragConect);
            return { line: line, conect: conect, visible: true };
        }

        function _onDragConect(d) {
            let dt;

            d.x = d3.event.x;
            d.y = d3.event.y;
            d3.select(this).attr("x", d.x - 6).attr("y", d.y - 6);
            dt = d3.select(this).datum();
            _dashboardArea.svg.select(".F-" + dt[0].viewChild.idChart()).attr("x2", d.x).attr("y2", d.y);
            _dashboardArea.svg.selectAll(".P-" + dt[0].viewChild.idChart()).attr("x1", d.x).attr("y1", d.y);
            dt[0].viewChild.setCenter(d.x, d.y);	  // Move the hidden window
            dt[0].viewChild.refresh();
            dt[0].x = d.x;
            dt[0].y = d.y;
        }

        function _onClickAction() {

            if (_contextMenu.showing && _contextMenu.showing !== "keep") {
                _contextMenu.showing = false;
                d3.select(".DS-popup").remove();
                d3.select("#subContextMenuDiv").remove();
            }
        }

        function _onContextMenu() {
            let clickedElem, viewDiv, popupDiv, mousePos;

            _selectedQuery = 8;
            //parseInt($("#selectQuery")[0].selectedIndex);
            d3.event.preventDefault();


            if (_contextMenu.showing) {
                d3.event.preventDefault();
                _contextMenu.showing = false;
                d3.select(".DS-popup").remove();
            }
            if (d3.event.target.nodeName !== "svg") {
                _contextMenu.showing = true;

                clickedElem = d3.select(d3.event.target);

                if (clickedElem.classed("IC-node") || clickedElem.classed("GM-node")) {
                    d3.event.preventDefault();

                    viewDiv = _findParentDiv(clickedElem);
                    mousePos = d3.mouse(viewDiv.node());

                    popupDiv = viewDiv.append("div")
                        .attr("class", "DS-popup medium-size")
                        .style("left", mousePos[0] + "px")
                        .style("top", mousePos[1] + "px");

                    if (clickedElem.classed("IC-node"))
                        _execCtxMenuIris(popupDiv, clickedElem, viewDiv.node().id);
                    else
                        if (clickedElem.classed("GM-node"))
                            _execCtxMenuGlyphMatrix(popupDiv, clickedElem, viewDiv.node().id);
                }

                if (_selectedQuery !== 8) {
                    if (clickedElem.classed("NE-node")
                        || clickedElem.classed("NE-edge")
                        || clickedElem.classed("CV-node")) {

                        d3.event.preventDefault();

                        viewDiv = _findParentDiv(clickedElem);
                        mousePos = d3.mouse(viewDiv.node());

                        popupDiv = viewDiv.append("div")
                            .attr("class", "DS-popup medium-size")
                            .style("left", mousePos[0] + "px")
                            .style("top", mousePos[1] + "px");
                        _contextMenu.showing = true;

                        if ((clickedElem.classed("NE-node") || clickedElem.classed("NE-edge")) && _selectedQuery !== 8)
                            _execCtxMenuNodeEdge(popupDiv, clickedElem, viewDiv.node().id);
                        else
                            if (clickedElem.classed("CV-node"))
                                _execCtxMenuClusterVis(popupDiv, clickedElem, viewDiv.node().id);
                    }
                } else {
                    d3.event.preventDefault();

                    viewDiv = _findParentDiv(clickedElem);
                    mousePos = d3.mouse(viewDiv.node());

                    if (clickedElem.classed("IC-bars")) {
                        popupDiv = viewDiv.append("div")
                            .attr("class", "DS-popup small-size")
                            .style("left", mousePos[0] + "px")
                            .style("top", mousePos[1] + "px");
                        _contextMenu.showing = true;

                        _execCtxMenuIrisBars(popupDiv, clickedElem, viewDiv.node().id);
                    } else if (clickedElem.classed("NE-node") || clickedElem.classed("NE-edge")) {
                        popupDiv = viewDiv.append("div")
                            .attr("class", "DS-popup big-size")
                            .style("left", mousePos[0] + "px")
                            .style("top", mousePos[1] + "px");
                        _contextMenu.showing = true;

                        _execCtxMenuNodeEdgeHAL(popupDiv, clickedElem, viewDiv.node().id);
                    } else if (clickedElem.classed("CV-node")) {
                        popupDiv = viewDiv.append("div")
                            .attr("class", "DS-popup big-size")
                            .style("left", mousePos[0] + "px")
                            .style("top", mousePos[1] + "px");
                        _contextMenu.showing = true;

                        _execCtxMenuClusterVisHAL(popupDiv, clickedElem, viewDiv.node().id);
                    }
                }
            }
        }

        function _dblClickAction() {
            let clickedElem = d3.select(d3.event.target);
            let viewDiv = _findParentDiv(clickedElem);
            if (clickedElem.classed("IC-node")) {
                let data = _contextMenu.vItens[DS_Iris_Solo];
                data[0].fActionNode(clickedElem.datum(), viewDiv.node().id)
            }
        }

        //------------
        function _findParentDiv(clickedElem) {
            let nodeElem = clickedElem.node();

            while (nodeElem.nodeName !== "svg") {
                nodeElem = d3.select(nodeElem.parentNode).node();
            }
            return d3.select(nodeElem.parentNode);
        }
        //------------	
        function _execCtxMenuNodeEdge(popupDiv, clickedElem, parentId) {
            popupDiv.selectAll("div")
                .data(_contextMenu.vItens[DS_NodeEdge])
                .enter()
                .append("div")
                .on("click", function (d) {
                    _contextMenu.showing = false;
                    d3.select(".DS-popup").remove();
                    if (clickedElem.classed("NE-node"))
                        d.fActionNode(clickedElem.datum(), parentId);
                    // else
                    // d.fActionEdge(clickedElem.datum(),parentId);
                })
                .append("label")
                .text(function (d) { return d.label; });
        }

        //------------
        function _execCtxMenuNodeEdgeHAL(popupDiv, clickedElem, parentId) {
            console.log("enter here 1");

            if (clickedElem.classed("NE-node")) {
                // Display the main context menu only if a node is clicked
                popupDiv.selectAll("div")
                    .data(_contextMenu.vItens[DS_NodeEdge_HAL])
                    .enter()
                    .append("div")
                    .on("click", function (d) {
                        let mousePos,
                            viewDiv,
                            contextMenuDivRight,
                            subContextMenuDiv;
                        if (typeof(d.submenu) === "undefined") {
                            if (clickedElem.classed("NE-node"))
                                d.fActionNode(clickedElem.datum(), parentId);
                            else
                                d.fActionEdge(clickedElem.datum(), parentId);
                            _contextMenu.showing = false;
                            d3.select(".DS-popup").remove();

                        } else if (d.submenu) { //if you clicked on New Query
                            var chart = this.parentNode.parentNode;
                            mousePos = d3.mouse(chart);
                            contextMenuDivRight = this.parentNode.getBoundingClientRect().width
                                + this.parentNode.getBoundingClientRect().left
                                - chart.getBoundingClientRect().left;

                            if (d3.select("#subContextMenuDiv")[0][0] === null) {
                                viewDiv = d3.select(d3.event.target.parentNode.parentNode.parentNode);
                                viewDiv.append("div")
                                    .attr("id", "subContextMenuDiv")
                                    .attr("class", "DS-popup medium-size")
                                    .style("left", contextMenuDivRight + "px")
                                    .style("top", mousePos[1] + "px");
                                subContextMenuDiv = d3.select("#subContextMenuDiv")

                                /*  the following will load the submenu of "New Query" containing
                                    query 1, ..., query7
                                 */
                                d.styleSheet.predefined_request_list.forEach(elt => {
                                    subContextMenuDiv
                                        .append("div")
                                        .on("click", function() {
                                            var form = undefined,
                                                dataToSend = {
                                                "query": elt.query,
                                                "uri": elt.uri,
                                                "title": elt.title
                                            };
                                            _contextMenu.showing = true;
                                            dashboard.parentId = chart.id;
                                            dashboard.title = elt.title;
                                            if ([4, 5, 6, 7].includes(parseInt(elt.title.split("query")[1]))) {
                                                form = document.querySelectorAll("textarea[id=" + elt.title + "]")[0]
                                                    .parentNode;
                                            }
                                            if ([6, 7].includes(parseInt(elt.title.split("query")[1]))) {
                                                processVisualizationQueryType(dataToSend, 2, form);
                                            } else {
                                                processVisualizationQuery(dataToSend, form);
                                            }

                                        })
                                        .append("label")
                                        .text(elt.title);
                                });
                                _contextMenu.showing = "keep";
                            }
                        }
                    })
                    .append("label")
                    .text(function (d) { return d.label; });

                // var numQuery = parseInt(document.querySelectorAll("h3.active")[0]
                //     .outerText.trim().split(" ")[1]),
                //     button = document.querySelectorAll("button.collapsible#query" + numQuery)[0];
                // console.log("coucou");
                // if you didn't activate stylesheet then we remove the entry New Query from main context menu
                // if (!button.previousElementSibling.previousElementSibling.checked)
                //     Array.from(popupDiv.selectAll("div")[0]).forEach((elt, index) => {
                //         if (elt.outerText === "New Query")
                //             elt.remove();
                //     });
            }
        }

        //------------	
        function _execCtxMenuClusterVis(popupDiv, clickedElem, parentId) {

            popupDiv.selectAll("div")
                .data(_contextMenu.vItens[DS_ClusterVis])
                .enter()
                .append("div")
                .on("click", function (d) {
                    _contextMenu.showing = false;
                    d3.select(".DS-popup").remove();
                    d.fActionNode(clickedElem.datum(), parentId);
                    console.log("here 1");
                })
                .append("label")
                .text(function (d) { return d.label; });
        }

        //------------
        function _execCtxMenuClusterVisHAL(popupDiv, clickedElem, parentId) {

            popupDiv.selectAll("div")
                .data(_contextMenu.vItens[DS_ClusterVis_HAL])
                .enter()
                .append("div")
                .on("click", function (d) {
                    _contextMenu.showing = false;
                    d3.select(".DS-popup").remove();
                    d.fActionNode(clickedElem.datum(), parentId);
                    console.log("here 2");
                })
                .append("label")
                .text(function (d) { return d.label; });
        }

        //------------	
        function _execCtxMenuIris(popupDiv, clickedElem, parentId) {
            popupDiv.selectAll("div")
                .data(_contextMenu.vItens[DS_Iris])
                .enter()
                .append("div")
                .on("click", function (d) {
                    _contextMenu.showing = false;
                    d3.select(".DS-popup").remove();
                    d.fActionNode(clickedElem.datum(), parentId);
                })
                .append("label")
                .text(function (d) { return d.label; });
        }

        //------------	
        function _execCtxMenuGlyphMatrix(popupDiv, clickedElem, parentId) {
            popupDiv.selectAll("div")
                .data(_contextMenu.vItens[DS_GlyphMatrix])
                .enter()
                .append("div")
                .on("click", function (d) {
                    _contextMenu.showing = false;
                    d3.select(".DS-popup").remove();
                    d.fActionNode(clickedElem.datum(), parentId);
                })
                .append("label")
                .text(function (d) { return d.label; });
        }

        //------------
        function _execCtxMenuIrisBars(popupDiv, clickedElem, parentId) {
            popupDiv.selectAll("div")
                .data(_contextMenu.vItens[DS_Papers_List])
                .enter()
                .append("div")
                .on("click", function (d) {
                    _contextMenu.showing = false;
                    d3.select(".DS-popup").remove();
                    d.fActionNode(clickedElem.datum(), parentId);
                })
                .append("label")
                .text(function (d) { return d.label; });
        }
        //--------------------------------- 		
        function dashboard() { }

        //---------------------
        dashboard.sameView = function () {
            _lastIndex++;
            let idView = "view-" + _lastIndex;
            let objView = View(idView, this);

            _vIdViews.push(idView);
            _vObjViews.push(objView);
            _activeView = objView;

        };

        //---------------------
        dashboard.newView = function (x, y) {
            _lastIndex++;
            let idView = "view-" + _lastIndex;
            let objView = View(idView, this);

            _vIdViews.push(idView);
            _vObjViews.push(objView);
            _activeView = objView;

            objView
                .create(x, y, _configView);

            return objView;	// returns the created view
        };

        //---------------------
        dashboard.configureView = function (configView) {

            if (configView.barTitle !== undefined)
                _configView.barTitle = configView.barTitle;

            if (configView.btTool !== undefined)
                _configView.btTool = configView.btTool;

            if (configView.btClose !== undefined)
                _configView.btClose = configView.btClose;

            if (configView.draggable !== undefined)
                _configView.draggable = configView.draggable;

            if (configView.resizable !== undefined)
                _configView.resizable = configView.resizable;

            if (configView.aspectRatio !== undefined)
                _configView.aspectRatio = configView.aspectRatio;

            if (configView.visible !== undefined)
                _configView.visible = configView.visible;
            
            if (configView.btLegend != undefined)
                _configView.btLegend = configView.btLegend;

            return dashboard;
        };

        //---------------------
        dashboard.activeView = function (_) {
            if (!arguments.length)
                return _activeView;
            _activeView = _;

            return dashboard;
        };

        //---------------------
        dashboard.idDashboard = function () {
            return _idDashboard;
        };

        //---------------------
        dashboard.nextZIndex = function () {
            _zIndexActive++;
            return _zIndexActive;
        };

        //---------------------
        dashboard.setItensContextMenu = function (codChart, itens) {
            _contextMenu.vItens[codChart] = itens;
        };

        //---------------------
        // Includes the technique data in the tree as the last child of the parent. Parent equal to 0 means include as root
        //Returns the id of the included node. Returns -1 if it was not possible to include
        dashboard.addChart = function (idParent, objChart) {
            let nodeTree, link;

            if (idParent === 0) {
                if (_treeCharts == null) {
                    _treeCharts = {
                        id: objChart.id, title: objChart.title, typeChart: objChart.typeChart, hidden: objChart.hidden,
                        x: objChart.x, y: objChart.y, chart: objChart.chart, view: objChart.view,
                        parentNode: null, isLeaf: true, link: null
                    };
                } else {
                    return -1;
                }
            } else {
                nodeTree = this.getChart(idParent);
                if (nodeTree == null)
                    return -1;
                if (nodeTree.children === undefined)
                    nodeTree.children = [];
                nodeTree.isLeaf = false;
                link = _addLink(nodeTree.view, objChart.view);
                nodeTree.children.push({
                    id: objChart.id, title: objChart.title, typeChart: objChart.typeChart, hidden: objChart.hidden,
                    x: objChart.x, y: objChart.y, chart: objChart.chart, view: objChart.view,
                    parentNode: nodeTree, isLeaf: true, link: link
                });
            }
            return objChart.id;
        };

        //---------------------
        dashboard.getChart = function (idChart) {

            return getChartRec(_treeCharts);

            function getChartRec(nodeTree) {
                let tempNodeTree;

                if (nodeTree == null)
                    return null;
                if (nodeTree.id === idChart)
                    return nodeTree;
                if (nodeTree.children === undefined)
                    return null;

                for (let i = 0; i < nodeTree.children.length; i++) {
                    tempNodeTree = getChartRec(nodeTree.children[i]);
                    if (tempNodeTree != null)
                        return tempNodeTree;
                }
                return null;
            }
        };

        //---------------------
        dashboard.getTree = function () {
            return _treeCharts;
        };

        //---------------------
        dashboard.historyChart = function (_) {
            if (!arguments.length)
                return _historyChart;
            _historyChart = _;
            return dashboard;
        };

        //---------------------
        dashboard.refreshSvg = function () {
            _dashboardArea.width = _dashboardArea.div.node().scrollWidth;
            _dashboardArea.height = _dashboardArea.div.node().scrollHeight;
            _dashboardArea.svg.attr("width", _dashboardArea.width);
            _dashboardArea.svg.attr("height", _dashboardArea.height);
        };

        //---------------------
        dashboard.getSvg = function () {
            return _dashboardArea.svg;
        };

        //---------------------
        dashboard.refreshLinks = function () {
            refreshLinksRec(_treeCharts);

            function refreshLinksRec(nodeTree) {
                //let tempNodeTree;

                if (nodeTree != null) {
                    processNode(nodeTree);
                }
                if (nodeTree.children !== undefined) {
                    for (let i = 0; i < nodeTree.children.length; i++) {
                        refreshLinksRec(nodeTree.children[i]);
                    }
                }
            }

            function processNode(nodeTree) {
                if (nodeTree.link != null) {
                    if (nodeTree.link.visible) {
                        if (nodeTree.hidden === true || (nodeTree.parentNode.hidden && !nodeTree.hidden)) {
                            nodeTree.link.line.classed("DS-linkChartShow", false);
                            nodeTree.link.line.classed("DS-linkChartHidden", true);
                        } else {
                            nodeTree.link.line.classed("DS-linkChartShow", true);
                            nodeTree.link.line.classed("DS-linkChartHidden", false);
                        }
                        nodeTree.link.conect.style("display", null);
                        nodeTree.link.line.style("display", null);
                    } else {
                        nodeTree.link.conect.style("display", "none");
                        nodeTree.link.line.style("display", "none");
                    }
                }
            }
        };

        //---------------------
        dashboard.closeView = function (view) {
            let nodeTree = this.getChart(view.idChart());
            let node = nodeTree;

            if (node.isLeaf) {
                while (node != null) {
                    node.link.visible = false;
                    if (temFilhosVisiveis(node.parentNode)) {
                        break;
                    } else {
                        node.parentNode.isLeaf = true;
                    }
                    node = node.parentNode;
                    if (node.hidden === false) {
                        break;
                    }
                }
            }

            nodeTree.hidden = true;
            view.show(false);
            this.refreshLinks();

            /*
                    nodeTree.hidden = true;
                    view.show(false);
        
                    node = nodeTree;
                    while (node.hidden) {
                        if (node.isLeaf) {
                            node.link.visible = false;
                            console.log(node);
                            if ( temFilhosVisiveis(node.parentNode)) {
                                console.log("tem filho");
                                break;
                            } else {
                                node.parentNode.isLeaf = true;
                            }
                        }
                        node = node.parentNode;
                    }
            */
            this.historyChart().data(dashboard.getTree());
            //		this.refreshLinks();

            function temFilhosVisiveis(node) {
                let i;
                if (node.children === undefined)
                    return false;
                else {
                    for (i = 0; i < node.children.length; i++)
                        //					if (node.children[i].hidden===false)
                        if (node.children[i].link.visible)
                            return true;
                }
                return false;
            }
        };

        //---------------------
        dashboard.showView = function (view) {
            let nodeTree = this.getChart(view.idChart());
            let node = nodeTree;

            while (node.link.visible === false) {
                node.link.visible = true;
                node = node.parentNode;
                node.isLeaf = false;
                if (node.parentNode == null)  // Check if root
                    break;
            }

            nodeTree.hidden = false;
            view.show(true);
            this.refreshLinks();
        };

        dashboard.removeTudo = function () {
            let i;
            _dashboardArea.svg.remove();
            for (i = 0; i < _vIdViews.length; i++)
                d3.select("#" + _vIdViews[i]).remove();
        };
        //---------------------
        return dashboard;
    }
});
