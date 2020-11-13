/**
 * historyTree
 *
 */

define(["model","libCava"], function (Model) {
    return function HistoryTree (idDiv, dashboard) {

        let _historyTreePanel = null,  // Represents the panel associated with the graphic
            _nodoHeight = 14,    // Space height for each node without the margins
            _leftText = 18,      // Distance from the text to the left coordinate of the node
            _nodeMargin = 1,
            _rectHeight = _nodoHeight - _nodeMargin*2,
            _treeLayout = d3.layout.tree().nodeSize([0, _nodoHeight ]),
            _vNodes = [],				// Vector with objects of all nodes

            _dashboard = dashboard,

            _grpHistory = null,   // Group representing history tree
            _grpNodes = null;     // Selection that contains all groups that store nodes

// ---------------- Model
        let model = Model();

// ---------------- Geometric attributes of the graph
        model.margin = {top: 4, right: 4, bottom: 4, left: 4};
        model.box = { width:150, height:150};

// ---------------- Initialization Actions
        let _svg = d3.select("#"+idDiv).append("svg"),  // Create dimensionless svg
            _grpChart = _svg.append("g");
        _grpHistory = _grpChart.append("g").attr("class","HistoryTreeChart");

        let _zoomListenerTree = d3.behavior.zoom().on("zoom", _chartZoomTree);
        _svg.call(_zoomListenerTree);


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
        model.when(["data"], function () {
            _appendNodos();
        });

//--------------------------------- Private functions

        /**
         * _appendNodes
         *
         * Adds the SVG elements relative to the nodes
         */
        function _appendNodos() {
            if (_grpNodes != null)
                _grpNodes.remove();

            _grpNodes =  _grpHistory.selectAll(".HT-grpNodos")
                .data(_vNodes)
                .enter()
                .append("g")
                .attr("class", function (d) { if (d.id === "view-1-c")
                    return "HT-grpNodos HT-grpRoot";
                else
                    return "HT-grpNodos"})
                .attr("transform", function(d) { return "translate(" + d.y + "," + d.x + ")"; 	})
                .classed("HT-NodeHidden", function(d){ return d.hidden});

            _grpNodes.append("rect")
                .attr("x", _nodeMargin)
                .attr("y", _nodeMargin)
                .attr("height", _rectHeight)
                .attr("width",  _rectHeight)
                .on("click", function (d) {
                    if (d.id !== "view-1-c") {
                        if (!d.hidden) {
                            _dashboard.closeView(d.view);
                        } else {
                            _dashboard.showView(d.view);
                        }
                        _grpNodes.classed("HT-NodeHidden",function (d) { return d.hidden});
                    }
                });

            _grpNodes.append("text")
                .attr("x", _leftText)
                .attr("y", _nodoHeight/2 + 3)
                .attr("text-anchor", "start")
                .text(function(d) {
                    return d.title;
                });
        }

        function _chartZoomTree() {
            let zoomTranslate = _zoomListenerTree.translate();
            _grpChart.attr("transform",
                "translate("+zoomTranslate[0]+","+zoomTranslate[1] + ")");
        }

//--------------------------------- Public functions

        function chart() {}

        //---------------------
        chart.box = function(_) {
            if (!arguments.length)
                return model.box;
            model.box = _;

            return chart;
        };

        //---------------------
        // This function is required in all techniques
        // It is called internally in conectChart
        chart.panel = function(_) {
            if (!arguments.length)
                return _historyTreePanel;
            _historyTreePanel = _;

            return chart;
        };

        //---------------------
        chart.data = function(_) {
            if (!arguments.length)
                return model.data;
            model.data = _;

            _vNodes = _treeLayout(model.data);

            _vNodes.forEach(function(n, i) {
                n.x = i * _nodoHeight;
            });
            return chart;
        };



        return chart;
    };


});
