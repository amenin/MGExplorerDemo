define(["jquery", "jqueryui", "d3"], function ($, JQueryUI, d3) {

    return function View(idView, dashboard) {

        let _dimView = { width: 10, height: 10 },   // View dimensions
            _dimChart = { width: _dimView.width, height: _dimView.height },

            _barTitleHeight = 15,       // Title bar height
            _yPanel = 15,              // Initial position of the control panel relative to the top of the window
            _marginButton = 2,          // Margins of the buttons in relation to the title bar
            _divView = null,            // Div that represents the view included
            _objChart = null,            // Chart associated with view
            _objPanel = null,           // Panel associated with the chart and the view
            _idChart = (idView + "-c"), // div id where <svg> will be included
            _idPanel = (idView + "-p"), // id of <div> where the control panel of the technique will be inserted
            _config = null,
            _position = { x: 0, y: 0 },
            _center = { cx: 0, cy: 0 },
            _svgBarTitle = null,  // title bar svg
            _rectBtClose = null,  // close button rectangle
            _lineClose = null;  // Close button line (icon)


        //--------------------------------- Private functions
        function _refreshBarTitle() {
            _svgBarTitle.attr("width", _dimChart.width).attr("height", _barTitleHeight);

            if (_config.btClose) {
                _rectBtClose.attr("x", _dimChart.width - (_barTitleHeight - _marginButton));
                _lineClose.attr("x1", _dimChart.width - (_barTitleHeight - _marginButton) + 3)
                    .attr("x2", _dimChart.width - (_barTitleHeight - _marginButton) + 9);
            }
        }

        //---------------------		
        function view() { }

        //---------------------		
        view.create = function (x, y, config) {
            let viewDiv, barDiv, chartDiv, panelDiv, idBar, stDisplay, thisView = this;
            let selLinkPai, selLinkFilhos, selConect;

            _config = {
                barTitle: config.barTitle, btTool: config.btTool, btClose: config.btClose, draggable: config.draggable,
                resizable: config.resizable, aspectRatio: config.aspectRatio, visible: config.visible
            };
            if (!_config.barTitle) {
                _barTitleHeight = 0;
            }

            if (_config.visible)
                stDisplay = "block";
            else
                stDisplay = "none";


            _dimView.height = _dimView.height + _barTitleHeight;
            //-----  Creates the external window
            viewDiv = $("<div/>", {
                id: idView,
                class: "view-view"
            }).css({ "top": y, "left": x, "width": _dimView.width, "height": _dimView.height, "display": stDisplay });

            _position.x = x;
            _position.y = y;
            _center.cx = x + _dimView.width / 2;
            _center.cy = y + _dimView.height / 2;

            $("#" + dashboard.idDashboard()).append(viewDiv);
            idView = "#" + idView;
            _divView = $(idView);
            _divView.css("z-index", dashboard.nextZIndex());

            //----------------------- Creates the title bar
            if (_config.barTitle) {
                //----------- Creates the container for the title
                barDiv = $("<div/>", {
                    class: "view-bar"
                }).css({ "height": _barTitleHeight });
                $(idView).append(barDiv);

                idBar = idView + " .view-bar";

                _svgBarTitle = d3.select(idBar).append("svg");		// I removed from inside if
                if (_config.btTool) {

                    _svgBarTitle.append("rect")   // Botao tools
                        .attr("x", _marginButton)
                        .attr("y", _marginButton)
                        .attr("width", _barTitleHeight - 2 * _marginButton)
                        .attr("height", _barTitleHeight - 2 * _marginButton)
                        .on("click", function () {
                            let panel = $("#" + _idPanel);
                            if (panel.css("display") === "none")
                                panel.css({ "display": "block" });
                            else
                                panel.css({ "display": "none" });
                        })
                        .append("title")
                        .text("Tools");
                    _svgBarTitle.append("line")
                        .attr("x1", 5).attr("y1", 5)
                        .attr("x2", 11).attr("y2", 5).style({ "stroke": "black" });
                    _svgBarTitle.append("line")
                        .attr("x1", 8).attr("y1", 5)
                        .attr("x2", 8).attr("y2", 11).style({ "stroke": "black" });
                }
                //--------------- Adds an empty title that will be changed by setTitle
                if (_config.btTool) {
                    _svgBarTitle.append("text").text("")
                        .attr("class", "view-bar-titulo")
                        .attr("x", 20).attr("y", 11);

                } else {
                    _svgBarTitle.append("text").text("")
                        .attr("class", "view-bar-titulo")
                        .attr("x", 5).attr("y", 11);
                    _svgBarTitle.append("text").text("clicking on the square will hide/unhide the view")
                        .attr("class", "view-bar-history")
                        .attr("x", 55).attr("y", 11);

                }
                if (_config.btClose) {

                    _rectBtClose = _svgBarTitle.append("rect")  // Botao close
                        .attr("x", _marginButton)
                        .attr("y", _marginButton)
                        .attr("width", _barTitleHeight - 2 * _marginButton)
                        .attr("height", _barTitleHeight - 2 * _marginButton)
                        .on("click", function () {
                            dashboard.closeView(thisView);
                        });
                    _rectBtClose.append("title")
                        .text("Hide");
                    _lineClose = _svgBarTitle.append("line")
                        .attr("x1", 290).attr("y1", 7)
                        .attr("x2", 296).attr("y2", 7).style({ "stroke": "black" });
                }
                panelDiv = $("<div/>", {
                    id: _idPanel,
                    class: "view-panel"
                }).css({ "position": "absolute", "top": _yPanel, "display": "none" }).draggable();
                $(idView).append(panelDiv);

                if (_config.draggable) {     //----------- Make the view draggable
                    _divView.draggable({
                        handle: $(idBar),
                        start: function () {
                            _divView.css("z-index", dashboard.nextZIndex());

                            dashboard.activeView(thisView);
                            selLinkPai = dashboard.getSvg().select(".F-" + _idChart);
                            selLinkFilhos = dashboard.getSvg().selectAll(".P-" + _idChart);
                            selConect = dashboard.getSvg().select("." + _idChart);
                        },
                        drag: function (event, ui) {
                            _position.x = ui.position.left;
                            _position.y = ui.position.top;
                            _center.cx = _position.x + _dimView.width / 2;
                            _center.cy = _position.y + _dimView.height / 2;
                            if (!selLinkPai.empty()) {
                                selLinkPai.attr("x2", _center.cx).attr("y2", _center.cy);
                                selConect.attr("x", _center.cx - 6).attr("y", _center.cy - 6);
                            }
                            selLinkFilhos.attr("x1", _center.cx).attr("y1", _center.cy);

                            dashboard.refreshSvg();
                        },
                        stop: function (event, ui) {

                            _position.x = ui.position.left;
                            _position.y = ui.position.top;
                            _center.cx = _position.x + _dimView.width / 2;
                            _center.cy = _position.y + _dimView.height / 2;

                            if (!selLinkPai.empty()) {
                                let dt = selConect.datum();
                                selLinkPai.attr("x2", _center.cx).attr("y2", _center.cy);

                                selConect.attr("x", _center.cx - 6).attr("y", _center.cy - 6);
                                dt[0].x = _center.cx;
                                dt[0].y = _center.cy;
                            }
                            selLinkFilhos.attr("x1", _center.cx).attr("y1", _center.cy);
                            dashboard.refreshSvg();
                        }

                    });
                }
            }

            //----------------------------------- Creates the container for the chart (<svg>)
            chartDiv = $("<div/>", {
                id: _idChart,
                class: "view-chart"
            }).css({ "top": _barTitleHeight, "height": _dimChart.height });
            $(idView).append(chartDiv);

            if (_config.resizable) {             //----------- Make the view resizable
                $(idView).resizable({
                    // helper: "resizable-helper",
                    // aspectRatio: config.aspectRatio,
                    autoHide: true,
                    start: function () {
                        _divView.css("z-index", dashboard.nextZIndex());
                        $(".resizable-helper").css("z-index", dashboard.nextZIndex());

                        dashboard.activeView(thisView);
                        selLinkPai = dashboard.getSvg().select(".F-" + _idChart);
                        selLinkFilhos = dashboard.getSvg().selectAll(".P-" + _idChart);
                        selConect = dashboard.getSvg().select("." + _idChart);

                    },
                    resize: function (event, ui) {
                        let aspect = _dimChart.height / _dimChart.width;

                        // Updates the dimensions of the <div>
                        _dimChart.width = ui.size.width - 2;
                        _dimView.width = _dimChart.width;
                        _dimView.height = ui.size.height - 2;
                        _dimChart.height = _dimView.height - _barTitleHeight;

                        if (_config.aspectRatio) {
                            // Adjusts height to maintain appearance
                            _dimChart.height = aspect * _dimChart.width;
                            _dimView.height = _dimChart.height + _barTitleHeight;

                            _divView.css({ "height": _dimView.height });
                        }
                        _refreshBarTitle();
                        _objChart.box({ width: _dimChart.width, height: _dimChart.height });
                        $("#" + _idChart).css({ "height": _dimChart.height });
                        _center.cx = _position.x + _dimView.width / 2;
                        _center.cy = _position.y + _dimView.height / 2;
                        dashboard.refreshSvg();
                        if (!selLinkPai.empty()) {
                            let dt = selConect.datum();
                            selLinkPai.attr("x2", _center.cx).attr("y2", _center.cy);
                            selConect.attr("x", _center.cx - 6).attr("y", _center.cy - 6);
                            dt[0].x = _center.cx;
                            dt[0].y = _center.cy;
                        }
                        selLinkFilhos.attr("x1", _center.cx).attr("y1", _center.cy);
                    },
                    stop: function (event, ui) {
                        let aspect = _dimChart.height / _dimChart.width;

                        // Updates the dimensions of the <div>
                        _dimChart.width = ui.size.width - 2;
                        _dimView.width = _dimChart.width;
                        _dimView.height = ui.size.height - 2;
                        _dimChart.height = _dimView.height - _barTitleHeight;

                        if (_config.aspectRatio) {
                            // Adjusts height to maintain appearance
                            _dimChart.height = aspect * _dimChart.width;
                            _dimView.height = _dimChart.height + _barTitleHeight;

                            _divView.css({ "height": _dimView.height });
                        }
                        _refreshBarTitle();
                        _objChart.box({ width: _dimChart.width, height: _dimChart.height });
                        $("#" + _idChart).css({ "height": _dimChart.height });
                        _center.cx = _position.x + _dimView.width / 2;
                        _center.cy = _position.y + _dimView.height / 2;
                        dashboard.refreshSvg();
                        if (!selLinkPai.empty()) {
                            let dt = selConect.datum();
                            selLinkPai.attr("x2", _center.cx).attr("y2", _center.cy);
                            selConect.attr("x", _center.cx - 6).attr("y", _center.cy - 6);
                            dt[0].x = _center.cx;
                            dt[0].y = _center.cy;
                        }
                        selLinkFilhos.attr("x1", _center.cx).attr("y1", _center.cy);
                    }
                });
            }

        };

        //---------------------	
        view.divView = function () {
            return _divView;
        };

        //---------------------	
        view.show = function (status) {
            if (status)
                _divView.css({ "display": "block" });
            else
                _divView.css({ "display": "none" });
        };

        //---------------------	
        view.idChart = function () {
            return _idChart;
        };

        //---------------------
        view.setIdChart = function (idChart) {
            _idChart = idChart;
        };

        //---------------------
        view.conectChart = function (objChart, ConstPanel) {
            let box = objChart.box();
            _dimView.width = box.width;
            _dimChart.width = box.width;

            _dimView.height = box.height;
            _dimChart.height = box.height;
            if (_config.barTitle) {
                _dimView.height = _dimView.height + _barTitleHeight;
            }
            _divView.css({ "width": _dimView.width, "height": _dimView.height });
            $("#" + _idChart).css({ "height": _dimChart.height });
            _objChart = objChart;
            if (_config.btTool) {
                _refreshBarTitle();
                _objPanel = ConstPanel(_objChart);
                _objPanel.create(_idPanel);
                //	     _objChart.createToolPanel(_idPanel);
                _objChart.panel(_objPanel);

            }
            _center.cx = _position.x + _dimView.width / 2;
            _center.cy = _position.y + _dimView.height / 2;
        };

        //---------------------	
        view.setTitle = function (stTitle) {
            d3.select(idView + " .view-bar text").text(stTitle);
        };

        //---------------------	
        view.getPosition = function () {
            return _position;
        };

        //---------------------	
        view.getCenter = function () {
            return _center;
        };

        //---------------------	
        view.setCenter = function (x, y) {
            _center.x = x;
            _center.y = y;
            _position.x = _center.x - _dimView.width / 2;
            _position.y = _center.y - _dimView.height / 2;
        };

        view.refresh = function () {
            _divView.css({ "top": _position.y, "left": _position.x });
        };

        //---------------------		
        return view;

    }
});
