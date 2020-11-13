/**
 * LibCav
 *
 */

define(["d3"], function (d3) {

    return function LibCava() {

        //-----------------------------------

        function lcv() { }

        //=========================== sort
        lcv.sort = function () {

            let _vData = null,             // Vector with data to be sorted (dataNodes [] or dataEdges [])
                _vOrder = null,            // Ordering Vector
                _vLabelConfigSort = null,  // Configuration vector of sort. Each element contains
                //  { ascending: true or false, desempate:[ "indexAttr":x, value: true or false, ascending: true or false]
                _vValueConfigSort = null,
                _indexAttrSort = 0,          // Index of the attribute to be classified index + 1000 indicates VALUE Ex: 1001
                _labelAttrSort = 0,          // Index adjusted for label (equal to _indexAttrSort)
                _valueAttrSort = 0,		  // Index set to value (_indexAttrSort-1000)

                // --- Function that performs labeling for LABEL
                _fLabelSort = function (a, b) {
                    if (_vLabelConfigSort[_labelAttrSort].ascending)
                        return d3.ascending(_vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
                    else
                        return d3.descending(_vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
                },

                // --- Function that performs rating for VALUE
                _fValueSort = function (a, b) {
                    if (_vValueConfigSort[_valueAttrSort].ascending)
                        return d3.ascending(_vData[a].values[_valueAttrSort], _vData[b].values[_valueAttrSort]);
                    else
                        return d3.descending(_vData[a].values[_valueAttrSort], _vData[b].values[_valueAttrSort]);
                },

                // --- Function that performs rating for VALUE with tiebreaker
                _fValueSortDesempate = function (a, b) {
                    var i, attrSortConfig, result;

                    attrSortConfig = _vValueConfigSort[_valueAttrSort];

                    for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                        if (attrSortConfig.vDesempate[i].numeric) {
                            if (attrSortConfig.vDesempate[i].ascending) {
                                result = d3.ascending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                            } else {
                                result = d3.descending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                            }
                        } else {
                            if (attrSortConfig.vDesempate[i].ascending) {
                                result = d3.ascending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                            } else {
                                result = d3.descending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                            }

                        }

                        if (result !== 0)
                            return result;
                    }

                    return result;
                },

                // --- Function that performs the classification for LABEL with tie breaker

                _fLabelSortDesempate = function (a, b) {
                    let i, attrSortConfig, result;

                    attrSortConfig = _vLabelConfigSort[_labelAttrSort];

                    for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                        if (attrSortConfig.vDesempate[i].numeric) {
                            if (attrSortConfig.vDesempate[i].ascending) {
                                result = d3.ascending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                            } else {
                                result = d3.descending(_vData[a].values[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
                            }
                        } else {
                            if (attrSortConfig.vDesempate[i].ascending) {
                                result = d3.ascending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                            } else {
                                result = d3.descending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                            }

                        }

                        if (result !== 0)
                            return result;
                    }

                    return result;
                };



            //--------------------------------- Public functions
            let obj = {};

            // Initializes the classification functions for each attribute
            obj.inic = function (qtLabel, qtValue) {
                let i;
                _vLabelConfigSort = [];
                for (i = 0; i < qtLabel; i++) {
                    _vLabelConfigSort.push({ fSortOrder: _fLabelSort, vDesempate: null, ascending: true, desempate: false });
                }

                _vValueConfigSort = [];
                for (i = 0; i < qtValue; i++) {
                    _vValueConfigSort.push({ fSortOrder: _fValueSort, vDesempate: null, ascending: false, desempate: false });
                }
                return obj;
            };

            //---------------------
            obj.data = function (_) {
                _vData = _;
                _vOrder = d3.range(_vData.length);
                return obj;
            };

            //---------------------
            obj.getVetOrder = function () {
                return _vOrder;
            };

            //---------------------
            obj.config = function (indexAttr, numeric, ascending, vDesempate) {
                if (vDesempate === undefined) {
                    if (numeric) { // For numerical attributes
                        _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSort, vDesempate: null, ascending: ascending, desempate: false };
                    } else {
                        _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSort, vDesempate: null, ascending: ascending, desempate: false };
                    }
                } else {
                    vDesempate.unshift({ indexAttr: indexAttr, numeric: numeric, ascending: ascending });
                    if (numeric) { // For numerical attributes
                        _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSortDesempate, vDesempate: vDesempate, ascending: ascending, desempate: false };
                    } else {
                        _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSortDesempate, vDesempate: vDesempate, ascending: ascending, desempate: false };
                    }
                }
                return obj;
            };

            //---------------------
            obj.exec = function (indexAttrSort) {
                _indexAttrSort = indexAttrSort;

                if (_indexAttrSort < 1000) {
                    _labelAttrSort = _indexAttrSort;
                    _vOrder.sort(function (a, b) {
                        return _vLabelConfigSort[_labelAttrSort].fSortOrder.call(obj, a, b);
                    })
                } else {
                    _valueAttrSort = _indexAttrSort - 1000;
                    _vOrder.sort(function (a, b) {
                        return _vValueConfigSort[_valueAttrSort].fSortOrder(a, b);
                    });
                }
            };

            return obj;
        };


        //=========================== sortIris
        lcv.sortIris = function () {

            let _vData = null,             // Vector with data to be sorted (dataNodes [] or dataEdges [])
                _vOrder = null,            // Ordering Vector
                _vLabelConfigSort = null,  // Configuration vector of sort. Each element contains
                //  { ascending: true or false, desempate:[ "indexAttr":x, value: true or false, ascending: true or false]
                _vValueConfigSort = null,
                _indexAttrSort = 0,          // Index of the attribute to be classified index + 1000 indicates VALUE Ex: 1001
                _labelAttrSort = 0,          // Index adjusted for label (equal to _indexAttrSort)
                _valueAttrSort = 0,		  // Index set to value (_indexAttrSort-1000)

                // --- Function that performs labeling for LABEL
                _fLabelSort = function (a, b) {
                    if (_vLabelConfigSort[_labelAttrSort].ascending)
                        return d3.ascending(_vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
                    else
                        return d3.descending(_vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
                },

                // --- Function that performs rating for VALUE
                _fValueSort = function (a, b) {
                    if (_vValueConfigSort[_valueAttrSort].ascending)
                        return d3.ascending(_vData[a].edge.values[_valueAttrSort], _vData[b].edge.values[_valueAttrSort]);
                    else
                        return d3.descending(_vData[a].edge.values[_valueAttrSort], _vData[b].edge.values[_valueAttrSort]);
                },

                // --- Function that performs rating for VALUE with tiebreaker
                _fValueSortDesempate = function (a, b) {
                    let i, attrSortConfig, result;

                    attrSortConfig = _vValueConfigSort[_valueAttrSort];

                    for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                        if (attrSortConfig.vDesempate[i].numeric) {
                            if (attrSortConfig.vDesempate[i].ascending) {
                                result = d3.ascending(_vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
                            } else {
                                result = d3.descending(_vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
                            }
                        } else {
                            if (attrSortConfig.vDesempate[i].ascending) {
                                result = d3.ascending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                            } else {
                                result = d3.descending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                            }

                        }

                        if (result !== 0)
                            return result;
                    }

                    return result;
                },

                // --- Function that performs the classification for LABEL with tie breaker

                _fLabelSortDesempate = function (a, b) {
                    let i, attrSortConfig, result;

                    attrSortConfig = _vLabelConfigSort[_labelAttrSort];

                    for (i = 0; i < attrSortConfig.vDesempate.length; i++) {
                        if (attrSortConfig.vDesempate[i].numeric) {
                            if (attrSortConfig.vDesempate[i].ascending) {
                                result = d3.ascending(_vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
                            } else {
                                result = d3.descending(_vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
                            }
                        } else {
                            if (attrSortConfig.vDesempate[i].ascending) {
                                result = d3.ascending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                            } else {
                                result = d3.descending(_vData[a].labels[attrSortConfig.vDesempate[i].indexAttr],
                                    _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
                            }

                        }

                        if (result !== 0)
                            return result;
                    }

                    return result;
                };



            //--------------------------------- Public functions
            let obj = {};

            // Initializes the classification functions for each attribute
            obj.inic = function (qtLabel, qtValue) {
                var i;
                _vLabelConfigSort = [];
                for (i = 0; i < qtLabel; i++) {
                    _vLabelConfigSort.push({ fSortOrder: _fLabelSort, vDesempate: null, ascending: true, desempate: false });
                }

                _vValueConfigSort = [];
                for (i = 0; i < qtValue; i++) {
                    _vValueConfigSort.push({ fSortOrder: _fValueSort, vDesempate: null, ascending: false, desempate: false });
                }
                return obj;
            };

            //---------------------
            obj.data = function (_) {
                _vData = _;
                _vOrder = d3.range(_vData.length);
                return obj;
            };

            //---------------------
            obj.getVetOrder = function () {
                return _vOrder;
            };

            //---------------------
            obj.config = function (indexAttr, numeric, ascending, vDesempate) {
                if (vDesempate === undefined) {
                    if (numeric) { // For numerical attributes
                        _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSort, vDesempate: null, ascending: ascending, desempate: false };
                    } else {
                        _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSort, vDesempate: null, ascending: ascending, desempate: false };
                    }
                } else {
                    vDesempate.unshift({ indexAttr: indexAttr, numeric: numeric, ascending: ascending });
                    if (numeric) { // For numerical attributes
                        _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSortDesempate, vDesempate: vDesempate, ascending: ascending, desempate: false };
                    } else {
                        _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSortDesempate, vDesempate: vDesempate, ascending: ascending, desempate: false };
                    }
                }
                return obj;
            };

            //---------------------
            obj.exec = function (indexAttrSort) {
                _indexAttrSort = indexAttrSort;

                if (_indexAttrSort < 1000) {
                    _labelAttrSort = _indexAttrSort;
                    _vOrder.sort(function (a, b) {
                        return _vLabelConfigSort[_labelAttrSort].fSortOrder.call(obj, a, b);
                    })
                } else {
                    _valueAttrSort = _indexAttrSort - 1000;
                    _vOrder.sort(function (a, b) {
                        return _vValueConfigSort[_valueAttrSort].fSortOrder(a, b);
                    });
                }
            };

            return obj;
        };








        //=========================== Returns TOOLTIPS
        lcv.tooltips = function () {
            let _colorTitle = "#238f23";
            let obj = {};

            //---------- Private functions

            function _addIconeEdge(svgTooltip) {
                svgTooltip.append("circle")
                    .attr("cx", 21)
                    .attr("cy", 9)
                    .attr("r", 3)
                    .style("fill", "blue");

                svgTooltip.append("line")
                    .attr("x1", 21)
                    .attr("y1", 9)
                    .attr("x2", 9)
                    .attr("y2", 26)
                    .style("stroke", "blue");

                svgTooltip.append("circle")
                    .attr("cx", 9)
                    .attr("cy", 26)
                    .attr("r", 3)
                    .style("fill", "blue");
            }

            //---------- Public functions

            obj.normalNode = function (data, indexAttrTitle, vIndexAttr, stAdjacent) {
                let _data = data,
                    _indexAttrTitle = indexAttrTitle,	// Index of the attribute that will be printed in the tooltip title
                    _vIndexAttr = vIndexAttr,  		// Vector with the index of the attributes that will be printed
                    _stAdjacent = stAdjacent,  		// String representing the meaning of adjacent nodes
                    _divTooltip = null,
                    _svgTooltip = null;

                let objNormal = {};

                objNormal.create = function (divTooltip, node) {
                    let y = 54,
                        height = _vIndexAttr.length * 14 + 49,
                        width;

                    width = 190;

                    if (width < 90)
                        width = 90;
                    _divTooltip = divTooltip;
                    _svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);
                    _svgTooltip.append("text")      // Title
                        .attr("x", 5)
                        .attr("y", 12)
                        .text(node.labels[_indexAttrTitle]);

                    _svgTooltip.append("text")    // n co-authors
                        .attr("x", 5)
                        .attr("y", 26)
                        .text(node.grau + " " + _stAdjacent);

                    _vIndexAttr.forEach(function (d, i) {
                        if (d >= 1000) {
                            _svgTooltip.append("text")
                                .attr("x", 5)
                                .attr("y", i * 14 + y)
                                .text(_data.nodes.valueTitle[d - 1000] + ": " + node.values[d - 1000]);
                        } else {
                            _svgTooltip.append("text")
                                .attr("x", 5)
                                .attr("y", i * 14 + y)
                                .text(_data.nodes.labelTitle[d] + ": " + node.labels[d]);
                        }


                    });

                    _divTooltip.style("top", (d3.event.layerY + 20) + "px")
                        .style("left", d3.event.layerX + "px")
                        .style("display", "block");
                };

                objNormal.remove = function () {
                    _divTooltip.style("display", "none");
                    _svgTooltip.remove();
                    _svgTooltip = null;
                };

                return objNormal;
            };
            //------------------ Tooltip Cluster Louvain
            obj.clusterLouvainNode = function () {
                let _divTooltip = null,
                    _svgTooltip = null;

                let objCluster = {};

                objCluster.create = function (divTooltip, node) {
                    _divTooltip = divTooltip;

                    _svgTooltip = _divTooltip.append("svg").attr("width", 65).attr("height", 53);
                    _svgTooltip.append("text")    // n co-authors
                        .attr("x", 5)
                        .attr("y", 12)
                        .style("fill", _colorTitle)
                        .text("Cluster " + node.key);

                    _svgTooltip.append("text")    // n co-authors
                        .attr("x", 5)
                        .attr("y", 35)
                        .text(node.qtNodes + " nodes");

                    _svgTooltip.append("text")    // n co-authors
                        .attr("x", 5)
                        .attr("y", 49)
                        .text(node.qtEdges + " edges");

                    _divTooltip.style("top", (d3.event.layerY + 20) + "px")
                        .style("left", d3.event.layerX + "px")
                        .style("display", "block");
                };

                objCluster.remove = function () {
                    _divTooltip.style("display", "none");
                    _svgTooltip.remove();
                    _svgTooltip = null;
                };

                return objCluster;
            };

            //------------------ Tooltip Cluster Attribute
            obj.clusterAttributeNode = function (data, indexAttr) {
                let _data = data,
                    _indexAttr = indexAttr,
                    _divTooltip = null,
                    _svgTooltip = null;

                let objCluster = {};

                objCluster.create = function (divTooltip, node) {
                    let width, stTemp;

                    if (_indexAttr >= 1000)
                        stTemp = _data.nodes.valueTitle[_indexAttr - 1000] + "=" + node.key;
                    else
                        stTemp = _data.nodes.labelTitle[_indexAttr] + "=" + node.key;

                    width = Math.round(6.5 * stTemp.length);
                    if (width < 70)
                        width = 70;

                    _divTooltip = divTooltip;

                    _svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", 68);
                    _svgTooltip.append("text")
                        .attr("x", 5)
                        .attr("y", 12)
                        .style("fill", _colorTitle)
                        .text("Nodes with");

                    _svgTooltip.append("text")
                        .attr("x", 5)
                        .attr("y", 26)
                        .style("fill", _colorTitle)
                        .text(stTemp);

                    _svgTooltip.append("text")
                        .attr("x", 5)
                        .attr("y", 49)
                        .text(node.qtNodes + " nodes");

                    _svgTooltip.append("text")
                        .attr("x", 5)
                        .attr("y", 63)
                        .text(node.qtEdges + " edges");

                    _divTooltip.style("top", (d3.event.layerY + 20) + "px")
                        .style("left", d3.event.layerX + "px")
                        .style("display", "block");
                };

                objCluster.remove = function () {
                    _divTooltip.style("display", "none");
                    _svgTooltip.remove();
                    _svgTooltip = null;
                };

                return objCluster;
            };

            //------------------ Tooltip Normal Edge
            obj.normalEdge = function (data, indexAttrTitle, vIndexAttr) {
                let _data = data,
                    _indexAttrTitle = indexAttrTitle,
                    _vIndexAttr = vIndexAttr,
                    _divTooltip = null,
                    _svgTooltip = null;

                let objNormalEdge = {};

                objNormalEdge.create = function (divTooltip, edge) {
                    let y = 54,
                        attNodeSrc, attNodeTgt,
                        height = _vIndexAttr.length * 14 + 49,
                        width, widthSrc, widthTgt;

                    if (_indexAttrTitle >= 1000) {
                        attNodeSrc = edge.source.values[_indexAttrTitle - 1000];
                        attNodeTgt = edge.target.values[_indexAttrTitle - 1000];
                    } else {
                        attNodeSrc = edge.source.labels[_indexAttrTitle];
                        attNodeTgt = edge.target.labels[_indexAttrTitle];
                    }

                    widthSrc = 34 + attNodeSrc.length * 7;
                    widthTgt = 22 + attNodeTgt.length * 7;

                    if (widthSrc > widthTgt)
                        width = widthSrc;
                    else
                        width = widthTgt;

                    if (width < 90)
                        width = 90;

                    _divTooltip = divTooltip;

                    _svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);

                    //----- Edge icon
                    _addIconeEdge(_svgTooltip);

                    // --------------

                    _svgTooltip.append("text")
                        .attr("x", 34)
                        .attr("y", 12)
                        .text(attNodeSrc);

                    _svgTooltip.append("text")
                        .attr("x", 22)
                        .attr("y", 30)
                        .text(attNodeTgt);

                    _vIndexAttr.forEach(function (d, i) {
                        if (d >= 1000) {
                            _svgTooltip.append("text")
                                .attr("x", 8)
                                .attr("y", i * 14 + y)
                                .text(_data.edges.valueTitle[d - 1000] + ": " + edge.values[d - 1000]);
                        } else {
                            _svgTooltip.append("text")
                                .attr("x", 8)
                                .attr("y", i * 14 + y)
                                .text(_data.edges.labelTitle[d] + ": " + edge.labels[d]);
                        }
                    });

                    _divTooltip.style("top", (d3.event.layerY + 20) + "px")
                        .style("left", d3.event.layerX + "px")
                        .style("display", "block");
                };

                objNormalEdge.remove = function () {
                    _divTooltip.style("display", "none");
                    _svgTooltip.remove();
                    _svgTooltip = null;
                };
                return objNormalEdge;
            };

            //------------------ Tooltip Cluster Louvain Edge
            obj.clusterLouvainEdge = function () {
                let _divTooltip = null,
                    _svgTooltip = null;

                let objLouvainEdge = {};

                objLouvainEdge.create = function (divTooltip, edge) {
                    _divTooltip = divTooltip;

                    _svgTooltip = _divTooltip.append("svg").attr("width", 88).attr("height", 60);

                    //----- Edge Icon
                    _addIconeEdge(_svgTooltip);

                    // --------------

                    _svgTooltip.append("text")
                        .attr("x", 34)
                        .attr("y", 12)
                        .text("Cluster " + edge.source.key);

                    _svgTooltip.append("text")
                        .attr("x", 22)
                        .attr("y", 30)
                        .text("Cluster " + edge.target.key);

                    _svgTooltip.append("text")
                        .attr("x", 8)
                        .attr("y", 54)
                        .text(edge.qt + " edges ");

                    _divTooltip.style("top", (d3.event.layerY + 20) + "px")
                        .style("left", d3.event.layerX + "px")
                        .style("display", "block");
                };

                objLouvainEdge.remove = function () {
                    _divTooltip.style("display", "none");
                    _svgTooltip.remove();
                    _svgTooltip = null;
                };
                return objLouvainEdge;
            };

            //------------------ Tooltip Cluster Attribute Edge
            obj.clusterAttributeEdge = function (data, indexAttr) {
                let _data = data,
                    _indexAttr = indexAttr,
                    _divTooltip = null,
                    _svgTooltip = null;

                let objAttributeEdge = {};

                objAttributeEdge.create = function (divTooltip, edge) {
                    let stTempSrc, stTempTgt, widthSrc, widthTgt, width;

                    _divTooltip = divTooltip;

                    if (_indexAttr >= 1000) {
                        stTempSrc = _data.nodes.valueTitle[_indexAttr - 1000] + "=" + edge.source.key;
                        stTempTgt = _data.nodes.valueTitle[_indexAttr - 1000] + "=" + edge.target.key;
                    } else {
                        stTempSrc = _data.nodes.labelTitle[_indexAttr] + "=" + edge.source.key;
                        stTempTgt = _data.nodes.labelTitle[_indexAttr] + "=" + edge.target.key;
                    }

                    widthSrc = 34 + Math.round(6.5 * stTempSrc.length);
                    widthTgt = 22 + Math.round(6.5 * stTempTgt.length);

                    if (widthSrc > widthTgt)
                        width = widthSrc;
                    else
                        width = widthTgt;

                    if (width < 90)
                        width = 90;

                    _svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", 60);

                    //----- Edge Icon
                    _addIconeEdge(_svgTooltip);

                    // --------------

                    _svgTooltip.append("text")
                        .attr("x", 34)
                        .attr("y", 12)
                        .text(stTempSrc);

                    _svgTooltip.append("text")
                        .attr("x", 22)
                        .attr("y", 30)
                        .text(stTempTgt);

                    _svgTooltip.append("text")
                        .attr("x", 8)
                        .attr("y", 54)
                        .text(edge.qt + " edges ");

                    _divTooltip.style("top", (d3.event.layerY + 20) + "px")
                        .style("left", d3.event.layerX + "px")
                        .style("display", "block");
                };

                objAttributeEdge.remove = function () {
                    _divTooltip.style("display", "none");
                    _svgTooltip.remove();
                    _svgTooltip = null;
                };
                return objAttributeEdge;
            };

            //------------------ Tooltip MatrixGliph Cell		
            obj.matrixCell = function (data, glyph, indexAttrTitle) {
                let _data = data,
                    _glyph = glyph,
                    _indexAttrTitle = indexAttrTitle,
                    _divTooltip = null,
                    _svgTooltip = null;

                let objMatrixGlyphCell = {};

                objMatrixGlyphCell.create = function (divTooltip, cell) {
                    let height = 190,
                        width,
                        attNodeSrc, attNodeTgt, widthSrc, widthTgt,
                        grpGlyphTooltip;

                    if (_indexAttrTitle >= 1000) {
                        attNodeSrc = _data.nodes.dataNodes[cell.x].values[_indexAttrTitle - 1000];
                        attNodeTgt = _data.nodes.dataNodes[cell.y].values[_indexAttrTitle - 1000];
                    } else {
                        attNodeSrc = _data.nodes.dataNodes[cell.x].labels[_indexAttrTitle];
                        attNodeTgt = _data.nodes.dataNodes[cell.y].labels[_indexAttrTitle];
                    }

                    widthSrc = 270;
                    widthTgt = 270;


                    if (widthSrc > widthTgt)
                        width = widthSrc;
                    else
                        width = widthTgt;

                    if (width < 130)
                        width = 130;

                    _divTooltip = divTooltip;

                    _svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);

                    //----- Edge Icon
                    _addIconeEdge(_svgTooltip);

                    // --------------

                    _svgTooltip.append("text")
                        .attr("x", 34)
                        .attr("y", 12)
                        .text(attNodeSrc);

                    _svgTooltip.append("text")
                        .attr("x", 22)
                        .attr("y", 30)
                        .text(attNodeTgt);

                    grpGlyphTooltip = _svgTooltip.append("g")
                        .attr("transform", "translate(0,60)");

                    _glyph.calcScaleTooltip(width, 100); // Tooltip height and diameter
                    _glyph.drawTooltip(grpGlyphTooltip, cell);

                    _divTooltip.style("top", (d3.event.layerY + 20) + "px")
                        .style("left", d3.event.layerX + "px")
                        .style("display", "block");

                };

                objMatrixGlyphCell.remove = function () {
                    _divTooltip.style("display", "none");
                    _svgTooltip.remove();
                    _svgTooltip = null;
                };

                return objMatrixGlyphCell;
            };

            //-----------------		
            return obj;
        };

        //=========================== Returns subgraphs
        lcv.subGraph = function () {

            //--------------
            // graphEdges: Original edges of the graph

            function _addEdges(vNodes, vEdges, graphEdges) {
                let i, j, qtNodes, qtEdges;
                qtNodes = vNodes.length;

                //------- Includes edges
                vNodes.forEach(function (node, k) {
                    graphEdges.forEach(function (edge) {
                        if (edge.src === node.idOrig) {
                            for (i = k + 1; i < qtNodes; i++) {
                                if (edge.tgt === vNodes[i].idOrig) {
                                    vEdges.push({
                                        src: edge.src,
                                        tgt: edge.tgt,
                                        labels: edge.labels,
                                        values: edge.values
                                    });
                                    break;
                                }
                            }
                        } else {
                            if (edge.tgt === node.idOrig) {
                                for (i = k + 1; i < qtNodes; i++) {
                                    if (edge.src === vNodes[i].idOrig) {
                                        vEdges.push({
                                            src: edge.src,
                                            tgt: edge.tgt,
                                            labels: edge.labels,
                                            values: edge.values
                                        });
                                        break;
                                    }
                                }
                            }
                        }
                    });
                });
                //------- Adjust the ids to conform to the indices
                qtNodes = vNodes.length;
                qtEdges = vEdges.length;

                for (i = 0; i < qtEdges; i++) {
                    for (j = 0; j < qtNodes; j++) {
                        if (vNodes[j].idOrig === vEdges[i].src) {
                            vEdges[i].src = j;
                            break;
                        }
                    }
                    for (j = 0; j < qtNodes; j++) {
                        if (vNodes[j].idOrig === vEdges[i].tgt) {
                            vEdges[i].tgt = j;
                            break;
                        }
                    }
                }

                vNodes.forEach(function (node, k) {
                    node.id = k;
                });
            }
            //--------------- Adds the edges in the array of edges

            function _addEdgesMatrix(vNodes, vMatrix, graphEdges) {
                let i, j, qtNodes, qtEdges,
                    vEdges = [];   // Auxiliary variable to temporarily store the set of edges

                qtNodes = vNodes.length;

                //------- Includes edges
                vNodes.forEach(function (node, k) {
                    graphEdges.forEach(function (edge) {
                        if (edge.src === node.idOrig) {
                            for (i = k + 1; i < qtNodes; i++) {
                                if (edge.tgt === vNodes[i].idOrig) {
                                    vEdges.push({
                                        src: edge.src,
                                        tgt: edge.tgt,
                                        labels: edge.labels,
                                        values: edge.values
                                    });
                                    break;
                                }
                            }
                        } else {
                            if (edge.tgt === node.idOrig) {
                                for (i = k + 1; i < qtNodes; i++) {
                                    if (edge.src === vNodes[i].idOrig) {
                                        vEdges.push({
                                            src: edge.src,
                                            tgt: edge.tgt,
                                            labels: edge.labels,
                                            values: edge.values
                                        });
                                        break;
                                    }
                                }
                            }
                        }
                    });
                });
                //------- Adjust the ids to conform to the indices
                qtNodes = vNodes.length;
                qtEdges = vEdges.length;

                for (i = 0; i < qtEdges; i++) {
                    for (j = 0; j < qtNodes; j++) {
                        if (vNodes[j].idOrig === vEdges[i].src) {
                            vEdges[i].src = j;
                            break;
                        }
                    }
                    for (j = 0; j < qtNodes; j++) {
                        if (vNodes[j].idOrig === vEdges[i].tgt) {
                            vEdges[i].tgt = j;
                            break;
                        }
                    }
                }

                vNodes.forEach(function (node, k) {
                    node.id = k;
                });

                vEdges.forEach(
                    function (d) {
                        vMatrix[d.src].push({ "x": d.tgt, "y": d.src, "exist": true, "labels": d.labels, "values": d.values });
                        vMatrix[d.tgt].push({ "x": d.src, "y": d.tgt, "exist": true, "labels": d.labels, "values": d.values });
                    }
                );
            }

            //--------------------------------- Public functions
            let obj = {};

            /*---------------------------------
             * Returns the graph in the ClusterVis format of the graph contained in the node of type Cluster
             */
            obj.clusterClusterVis = function (clusterNode, graphData) {
                let result = {
                    nodes: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        dataNodes: []
                    },
                    edges: {
                        labelTitle: graphData.edges.labelTitle,
                        valueTitle: graphData.edges.valueTitle,
                        dataEdges: []
                    }
                };

                // Includes all cluster node nodes
                clusterNode.cluster.forEach(function (node) {
                    result.nodes.dataNodes.push({
                        id: node.id,
                        idOrig: node.idOrig,
                        labels: node.labels,
                        values: node.values,
                        images: node.images,
                        cluster: []
                    });
                });

                _addEdges(result.nodes.dataNodes, result.edges.dataEdges, graphData.edges.dataEdges);
                return result;
            };

            /*---------------------------------
             * Node and its adjacent ClusterVis
             */
            obj.normalClusterVis = function (normalNode, graphData) {
                let result = {
                    nodes: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        dataNodes: []
                    },
                    edges: {
                        labelTitle: graphData.edges.labelTitle,
                        valueTitle: graphData.edges.valueTitle,
                        dataEdges: []
                    }
                };
                // Include the passed node as argument
                result.nodes.dataNodes.push({
                    id: normalNode.id,
                    idOrig: normalNode.idOrig,
                    labels: normalNode.labels,
                    values: normalNode.values,
                    images: normalNode.images,
                    cluster: []
                });

                graphData.edges.dataEdges.forEach(function (d) {
                    if (d.src === normalNode.idOrig)
                        result.nodes.dataNodes.push({
                            id: graphData.nodes.dataNodes[d.tgt].id,
                            idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,
                            labels: graphData.nodes.dataNodes[d.tgt].labels,
                            values: graphData.nodes.dataNodes[d.tgt].values,
                            images: graphData.nodes.dataNodes[d.tgt].images,
                            cluster: []
                        });
                    else
                        if (d.tgt === normalNode.idOrig)
                            result.nodes.dataNodes.push({
                                id: graphData.nodes.dataNodes[d.src].id,
                                idOrig: graphData.nodes.dataNodes[d.src].idOrig,
                                labels: graphData.nodes.dataNodes[d.src].labels,
                                values: graphData.nodes.dataNodes[d.src].values,
                                images: graphData.nodes.dataNodes[d.src].images,
                                cluster: []
                            });

                });
                // Includes only edges that bind existing nodes
                _addEdges(result.nodes.dataNodes, result.edges.dataEdges, graphData.edges.dataEdges);

                return result;
            };

            /*---------------------------------
             * Node and its adjacent Iris
             */
            obj.normalIris = function (normalNode, graphData) {
                let result = {
                    root: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        data: {
                            id: normalNode.id,
                            idOrig: normalNode.idOrig,
                            labels: normalNode.labels,
                            values: normalNode.values,
                            images: normalNode.images
                        }
                    },
                    children: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        data: []           // Data of the child nodes and the edge that binds it to the root
                    },
                    edges: {
                        labelTitle: graphData.edges.labelTitle,
                        valueTitle: graphData.edges.valueTitle,
                        data: [] // Data of the other edges (that do not bind to the root (MISSING IMPLEMENTATION))
                    }
                };

                graphData.edges.dataEdges.forEach(
                    function (d) {
                        if (d.src === normalNode.idOrig) {
                            result.children.data.push({
                                id: graphData.nodes.dataNodes[d.tgt].id,
                                idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,
                                labels: graphData.nodes.dataNodes[d.tgt].labels,
                                values: graphData.nodes.dataNodes[d.tgt].values,
                                images: graphData.nodes.dataNodes[d.tgt].images,
                                edge: {
                                    src: d.src,
                                    tgt: d.tgt,
                                    labels: d.labels,
                                    values: d.values
                                }
                            });
                        } else
                            if (d.tgt === normalNode.idOrig) {
                                result.children.data.push({
                                    id: graphData.nodes.dataNodes[d.src].id,
                                    idOrig: graphData.nodes.dataNodes[d.src].idOrig,
                                    labels: graphData.nodes.dataNodes[d.src].labels,
                                    values: graphData.nodes.dataNodes[d.src].values,
                                    images: graphData.nodes.dataNodes[d.src].images,
                                    edge: {
                                        src: d.tgt,
                                        tgt: d.src,
                                        labels: d.labels,
                                        values: d.values
                                    }
                                });
                            }
                    }
                );
                return result;
            };

            /*---------------------------------
             * Node and its adjacent Iris
             */
            obj.allPapersList = function (normalNode, graphData) {
                let result = {
                    root: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        data: {
                            id: normalNode.id,
                            idOrig: normalNode.idOrig,
                            labels: normalNode.labels,
                            values: normalNode.values,
                            images: normalNode.images,
                            documents: [],
                        }
                    },
                    children: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        cluster: false,
                        data: [],           // Data of the child nodes and the edge that binds it to the root
                        others: []
                    }
                };

                result.children.data.push({
                    id: normalNode.id,
                    idOrig: normalNode.idOrig,
                    labels: normalNode.labels,
                    values: normalNode.values,
                    images: normalNode.images,
                });

                graphData.edges.dataEdges.forEach(
                    function (d) {
                        if (d.src === normalNode.idOrig) {
                            result.children.data.push({
                                id: graphData.nodes.dataNodes[d.tgt].id,
                                idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,
                                labels: graphData.nodes.dataNodes[d.tgt].labels,
                                values: graphData.nodes.dataNodes[d.tgt].values,
                                images: graphData.nodes.dataNodes[d.tgt].images,
                            });
                            d.documents.forEach(function (doc) {
                                if (isTheFirstOccurence(doc.link, result.root.data.documents)) {
                                    result.root.data.documents.push({
                                        type: doc.type,
                                        title: doc.title,
                                        link: doc.link,
                                        date: doc.date,
                                        authors: doc.authors,
                                    })
                                }
                            });
                        } else
                            if (d.tgt === normalNode.idOrig) {
                                result.children.data.push({
                                    id: graphData.nodes.dataNodes[d.src].id,
                                    idOrig: graphData.nodes.dataNodes[d.src].idOrig,
                                    labels: graphData.nodes.dataNodes[d.src].labels,
                                    values: graphData.nodes.dataNodes[d.src].values,
                                    images: graphData.nodes.dataNodes[d.src].images,
                                });
                                d.documents.forEach(function (doc) {
                                    for (let i = 0; i < doc.authors.length; i++) {
                                        if (doc.authors[i] === d.tgt) {
                                            if (isTheFirstOccurence(doc.link, result.root.data.documents)) {
                                                result.root.data.documents.push({
                                                    type: doc.type,
                                                    title: doc.title,
                                                    link: doc.link,
                                                    date: doc.date,
                                                    authors: doc.authors,
                                                })
                                            }
                                        }
                                    }
                                });
                            }
                    }
                );

                return result;

                //---- Returns true if the document isn't already stored
                function isTheFirstOccurence(id, tab) {
                    if (tab.length === 0) return true;
                    else {
                        for (let i = 0; i < tab.length; i++) {
                            if (tab[i].link === id)
                                return false;
                        }
                        return true;
                    }
                }
            };

            obj.duoPapersList = function (firstNode, secondNode, graphData) {
                let result = {
                    root: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        data: {
                            id: firstNode.id,
                            idOrig: firstNode.idOrig,
                            labels: firstNode.labels,
                            values: firstNode.values,
                            images: firstNode.images,
                            documents: [],
                        }
                    },
                    children: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        cluster: false,
                        data: [],           // Data of the child nodes and the edge that binds it to the root
                        others: []
                    },
                };

                result.children.data.push({
                    id: firstNode.id,
                    idOrig: firstNode.idOrig,
                    labels: firstNode.labels,
                    values: firstNode.values,
                    images: firstNode.images,
                });

                result.children.data.push({
                    id: secondNode.id,
                    idOrig: secondNode.idOrig,
                    labels: secondNode.labels,
                    values: secondNode.values,
                    images: secondNode.images,
                });

                graphData.edges.dataEdges.forEach(
                    function (d) {
                        if ((d.src === firstNode.idOrig && d.tgt === secondNode.idOrig)
                            || (d.tgt === firstNode.idOrig && d.src === secondNode.idOrig)) {
                            d.documents.forEach(function (doc) {
                                for (let i = 0; i < doc.authors.length; i++) {
                                    for (let j = 0; j < doc.authors.length; j++) {
                                        if ((doc.authors[i] === firstNode.id && doc.authors[j] === secondNode.id)
                                            || (doc.authors[j] === firstNode.id && doc.authors[i] === secondNode.id)) {
                                            if (isTheFirstOccurence(doc.link, result.root.data.documents)) {
                                                result.root.data.documents.push({
                                                    type: doc.type,
                                                    title: doc.title,
                                                    link: doc.link,
                                                    date: doc.date,
                                                    authors: doc.authors,
                                                });
                                            }
                                        }
                                    }
                                }
                            });
                        }
                    }
                );

                result.root.data.documents.forEach((doc) => {
                    for (let i = 0; i < doc.authors.length; i++) {
                        let author = i_findNormalNode(doc.authors[i]);
                        if (isTheFirstOccurenceAuthor(doc.authors[i], result.children.data)) {
                            result.children.data.push({
                                id: author.id,
                                idOrig: author.idOrig,
                                labels: author.labels,
                                values: author.values,
                                images: author.images,
                            });
                        }
                    }
                });

                return result;

                //---- Returns true if the document isn't already stored
                function isTheFirstOccurence(id, tab) {
                    if (tab.length === 0) return true;
                    else {
                        for (let i = 0; i < tab.length; i++) {
                            if (tab[i].link === id)
                                return false;
                        }
                        return true;
                    }
                }

                //---- Returns true if the document isn't already stored
                function isTheFirstOccurenceAuthor(id, tab) {
                    if (tab.length === 0) return true;
                    else {
                        for (let i = 0; i < tab.length; i++) {
                            if (tab[i].id === id)
                                return false;
                        }
                        return true;
                    }
                }

                //---- Search for the node that has the id passed as an argument
                function i_findNormalNode(id) {
                    let i;
                    for (i = 0; i < graphData.nodes.qtNodes; i++) {
                        if (graphData.nodes.dataNodes[i].id === id)
                            return graphData.nodes.dataNodes[i];
                    }
                    return null;
                }
            };

            obj.clusterPapersList = function (sourceNode, graphData) {
                let result = {
                    root: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        data: {
                            id: sourceNode.id,
                            idOrig: sourceNode.idOrig,
                            labels: sourceNode.labels,
                            values: sourceNode.values,
                            images: sourceNode.images,
                            documents: [],
                        }
                    },
                    children: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        cluster: true,
                        data: [],        // Data of the child nodes and the edge that binds it to the root
                        others: []
                    },
                };

                result.children.data.push({
                    id: sourceNode.id,
                    idOrig: sourceNode.idOrig,
                    labels: sourceNode.labels,
                    values: sourceNode.values,
                    images: sourceNode.images,
                });

                sourceNode.cluster.forEach((author) => {
                    if (author.id !== sourceNode.id) {
                        result.children.data.push({
                            id: author.id,
                            idOrig: author.idOrig,
                            labels: author.labels,
                            values: author.values,
                            images: author.images,
                        });
                    }
                });

                graphData.edges.dataEdges.forEach(
                    function (d) {
                        for (let k = 0; k < result.children.data.length; k++) {
                            if (d.src === result.children.data[k].idOrig || d.tgt === result.children.data[k].idOrig) {
                                d.documents.forEach(function (doc) {
                                    if (isFromSource(result.children.data[k].idOrig, doc.authors)) {
                                        for (let i = 0; i < doc.authors.length; i++) {
                                            if (oneIsFromCluster(doc.authors[i], result.children.data, result.children.data[k].idOrig)) {
                                                if (isTheFirstOccurence(doc.link, doc.authors, result.root.data.documents)) {
                                                    result.root.data.documents.push({
                                                        type: doc.type,
                                                        title: doc.title,
                                                        link: doc.link,
                                                        date: doc.date,
                                                        authors: doc.authors,
                                                    });
                                                }
                                            }
                                        }
                                    }
                                });
                            }
                        }
                    }
                );

                result.root.data.documents.forEach((doc) => {
                    for (let i = 0; i < doc.authors.length; i++) {
                        if (isTheFirstOccurenceAuthor(doc.authors[i], result.children.data)
                            && isTheFirstOccurenceAuthor(doc.authors[i], result.children.others)) {
                            let author = i_findNormalNode(doc.authors[i]);
                            result.children.others.push({
                                id: author.id,
                                idOrig: author.idOrig,
                                labels: author.labels,
                                values: author.values,
                                images: author.images,
                            });
                        }
                    }
                });

                return result;

                //---- Returns true if the document isn't already stored
                function isTheFirstOccurence(id, authors, tab) {
                    if (tab.length === 0) return true;
                    else {
                        for (let i = 0; i < tab.length; i++) {
                            if (tab[i].link === id && tab[i].authors.length === authors.length)
                                return false;
                        }
                        return true;
                    }
                }

                //---- Returns true if the id of the source node is part of the authors
                function isFromSource(authorId, authors) {
                    for (let i = 0; i < authors.length; i++) {
                        if (authorId === authors[i])
                            return true;
                    }
                    return false;
                }

                //---- Returns true if the author is part of the cluster
                function oneIsFromCluster(authorId, cluster, sourceId) {
                    for (let i = 0; i < cluster.length; i++) {
                        for (let j = 0; j < cluster.length; j++) {
                            if (((authorId === cluster[i].idOrig && sourceId === cluster[j].idOrig)
                                || sourceId === cluster[i].idOrig && authorId === cluster[i].idOrig)
                                && authorId !== sourceId) {
                                return true;
                            }
                        }
                    }
                    return false;
                }

                //---- Returns true if the document isn't already stored
                function isTheFirstOccurenceAuthor(id, tab) {
                    if (tab.length === 0) return true;
                    else {
                        for (let i = 0; i < tab.length; i++) {
                            if (tab[i].idOrig === id)
                                return false;
                        }
                        return true;
                    }
                }

                //---- Search for the node that has the id passed as an argument
                function i_findNormalNode(id) {
                    let i;
                    for (i = 0; i < graphData.nodes.qtNodes; i++) {
                        if (graphData.nodes.dataNodes[i].idOrig === id)
                            return graphData.nodes.dataNodes[i];
                    }
                    return null;
                }
            };

            /*---------------------------------
             * Cluster MatrixGlyph
             */
            obj.clusterMatrixGlyph = function (clusterNode, graphData) {
                let result = {
                    nodes: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        dataNodes: []
                    },
                    edges: graphData.edges.valueTitle,
                    matrix: []
                };

                // Includes all cluster node nodes
                clusterNode.cluster.forEach(function (node) {
                    result.nodes.dataNodes.push({
                        id: node.id,
                        idOrig: node.idOrig,
                        labels: node.labels,
                        values: node.values,
                        images: node.images
                    });
                });


                result.nodes.dataNodes.forEach(
                    function (d, i) {
                        result.matrix[i] = [];
                    }
                );

                _addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges);

                return result;
            };

            /*---------------------------------
             * Edges between 2 clusters
             */
            obj.edgesBtClustersMatrixGlyph = function (edge, graphData) {
                let i, idClusterA, idClusterB, nodeSrc, nodeTgt, qtNodes, qtEdges,
                    vEdges = [];   // Auxiliary variable to temporarily store the set of edges
                let result = {
                    nodes: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        dataNodes: []
                    },
                    edges: graphData.edges.valueTitle,
                    matrix: []
                };

                idClusterA = edge.source.idCluster;
                idClusterB = edge.target.idCluster;

                console.log("IDCLUSTER: " + idClusterA + " " + idClusterB);

                // Includes nodes belonging to distinct clusters connected by an edge
                for (i = 0; i < graphData.edges.qtEdges; i++) {
                    nodeSrc = i_findNormalNode(graphData.edges.dataEdges[i].src);
                    nodeTgt = i_findNormalNode(graphData.edges.dataEdges[i].tgt);
                    if (nodeSrc == null || nodeTgt == null)
                        alert("Node not found!");
                    if (nodeSrc.idCluster === idClusterA && nodeTgt.idCluster === idClusterB ||
                        nodeSrc.idCluster === idClusterB && nodeTgt.idCluster === idClusterA) {
                        vEdges.push({
                            src: graphData.edges.dataEdges[i].src,
                            tgt: graphData.edges.dataEdges[i].tgt,
                            labels: graphData.edges.dataEdges[i].labels,
                            values: graphData.edges.dataEdges[i].values
                        });
                        i_addNode(nodeSrc, result.nodes.dataNodes);
                        i_addNode(nodeTgt, result.nodes.dataNodes);
                    }
                }


                // Initializes the matrix of edges
                result.nodes.dataNodes.forEach(
                    function (d, i) {
                        result.matrix[i] = [];
                    }
                );

                //------- Adjust the ids to conform to the indices
                qtNodes = result.nodes.dataNodes.length;
                qtEdges = vEdges.length;

                for (i = 0; i < qtEdges; i++) {
                    for (j = 0; j < qtNodes; j++) {
                        if (result.nodes.dataNodes[j].id === vEdges[i].src) {
                            vEdges[i].src = j;
                            break;
                        }
                    }
                    for (j = 0; j < qtNodes; j++) {
                        if (result.nodes.dataNodes[j].id === vEdges[i].tgt) {
                            vEdges[i].tgt = j;
                            break;
                        }
                    }
                }

                result.nodes.dataNodes.forEach(function (node, k) {
                    node.id = k;
                });

                vEdges.forEach(
                    function (d) {
                        result.matrix[d.src].push({ "x": d.tgt, "y": d.src, "exist": true, "labels": d.labels, "values": d.values });
                        result.matrix[d.tgt].push({ "x": d.src, "y": d.tgt, "exist": true, "labels": d.labels, "values": d.values });
                    }
                );

                return result;

                //---- Search for the node that has the id passed as an argument
                function i_findNormalNode(id) {
                    let i;
                    for (i = 0; i < graphData.nodes.qtNodes; i++) {
                        if (graphData.nodes.dataNodes[i].id === id)
                            return graphData.nodes.dataNodes[i];
                    }
                    return null;
                }

                //---- Adds a node in vNode if it does not already exist
                function i_addNode(node, vNodes) {
                    let achei, i;

                    achei = false;
                    for (i = 0; i < vNodes.length; i++) {
                        if (node.id === vNodes[i].id) {
                            achei = true;
                            break;
                        }
                    }
                    if (!achei) {
                        vNodes.push({
                            id: node.id,
                            labels: node.labels,
                            values: node.values,
                            images: node.images
                        });

                    }
                }
            };




            /*---------------------------------
             * Node and its adjacent MatrixGlyph
             */
            obj.normalMatrixGlyph = function (normalNode, graphData) {

                let result = {
                    nodes: {
                        labelTitle: graphData.nodes.labelTitle,
                        valueTitle: graphData.nodes.valueTitle,
                        imageTitle: graphData.nodes.imageTitle,
                        dataNodes: []
                    },
                    edges: graphData.edges.valueTitle,
                    matrix: []
                };

                // Include the passed node as argument
                result.nodes.dataNodes.push({
                    id: normalNode.id,
                    idOrig: normalNode.idOrig,
                    labels: normalNode.labels,
                    values: normalNode.values,
                    images: normalNode.images
                });

                graphData.edges.dataEdges.forEach(function (d) {
                    if (d.src === normalNode.idOrig)
                        result.nodes.dataNodes.push({
                            id: graphData.nodes.dataNodes[d.tgt].id,
                            idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,
                            labels: graphData.nodes.dataNodes[d.tgt].labels,
                            values: graphData.nodes.dataNodes[d.tgt].values,
                            images: graphData.nodes.dataNodes[d.tgt].images
                        });
                    else
                        if (d.tgt === normalNode.idOrig)
                            result.nodes.dataNodes.push({
                                id: graphData.nodes.dataNodes[d.src].id,
                                idOrig: graphData.nodes.dataNodes[d.src].idOrig,
                                labels: graphData.nodes.dataNodes[d.src].labels,
                                values: graphData.nodes.dataNodes[d.src].values,
                                images: graphData.nodes.dataNodes[d.src].images
                            });

                });

                result.nodes.dataNodes.forEach(
                    function (d, i) {
                        result.matrix[i] = [];
                    }
                );

                _addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges);

                return result;
            };

            obj.normalListDocs = function (normalNode, graphData) {
                let result = {
                };

                return result;
            };
            //---------------------------	  
            return obj;
        };

        return lcv;
    };

});
