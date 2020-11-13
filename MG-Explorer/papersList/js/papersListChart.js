/**
 * papersListChart
 *
 */

define(["model", "libCava"], function (Model) {

    return function PapersListChart(idDiv) {

        let _papersListPanel = null,  // represents the panel associated with the graph
            _sortByText = true,
            _grpPapersList = null,   // Group representing IRIS
            _grpPapers = null,       // Selection that contains all groups of bars
            _names = null,          // Selection that contains the names of the members of a cluster
            _maxLenghtTitleIndex = 7.8,
            _maxNamesLenght = 87,
            _data = null,

            _colorsRect = ["#1f77b4", "#2ca02c", "#d62728", "#ff7d0e"];     // colors for the different types

        // ---------------- Model
        let model = Model();

        // ---------------- Geometric attributes of the graph
        model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
        model.box = { width: 500, height: 500 };
        model.pInnerRadius = 0.13;    // Percentage relative to graph width for _innerRadius calculation
        model.pOuterRadius = 0.57;    // Percentage relative to graph width for _OuterRadius calculation
        model.pMaxHeightBar = 0.15;  // Percentage relative to graph width for _MaxHeightBar calculation
        model.pFocusWidthBar = 0.0275;  // Percentage relative to graph width for calculation of _focusArea.widthBar
        model.pMinWidthBar = 0.01;       // Percentage relative to graph width for calculation of _minArea.widthBar Original 4

        model.indexAttBar = 0;           // Index of the attribute that will be plotted in the toolbar

        model.redraw = 0;


        // ---------------- Initialization Actions
        let _container = d3.select("#" + idDiv).append("div").attr("class", "PL-container");
        let _svg = _container.append("svg"),  // Create dimensionless svg
            _grpChart = _svg.append("g");

        _svg.attr("class", "PaperListView");
        _grpPapersList = _grpChart.append("g").attr("class", "PapersListChart");

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
        model.when(["data", "widthChart", "heightChart", "redraw"],
            function _createPapersList() {
                if (_grpPapers !== null)
                    _grpPapers.remove();

                _data = model.data;

                if (_sortByText)
                    chart.sortByText();

                let endOfNames = 0;

                if (model.data.root.data.documents.length * 38 >= 350) {
                    _svg.attr("height", model.data.root.data.documents.length * 38);
                }

                if (model.data.children.cluster === true) {
                    if (_names !== null)
                        _names.remove();

                    let names = " ";
                    for (let i = 0; i < model.data.children.data.length; i++) {
                        names += model.data.children.data[i].labels[0];
                        if (i !== model.data.children.data.length - 1) {
                            names += ", ";
                        }
                    }

                    let tempNamesTab;
                    tempNamesTab = names.split(",");

                    let finalNamesTab = [];
                    let j = 0;
                    let pas = Math.round(model.widthChart / _maxNamesLenght);

                    for (let i = 0; i < tempNamesTab.length; i += pas) {
                        finalNamesTab[j] = tempNamesTab[i] + ", ";
                        for (let k = 1; k < pas; k++) {
                            if (i + k < tempNamesTab.length && i + k !== tempNamesTab.length - 1) {
                                finalNamesTab[j] += tempNamesTab[i + k] + ", ";
                            } else if (i + k < tempNamesTab.length && i + k === tempNamesTab.length - 1) {
                                finalNamesTab[j] += tempNamesTab[i + k];
                            }
                        }
                        j++;
                    }

                    _names = _grpPapersList.selectAll(".PL-grpNames")
                        .data(finalNamesTab)
                        .enter()
                        .append("g")
                        .attr("class", "PL-names");


                    _names.append("text")
                        .attr("class", "PL-names")
                        .text("Cluster : ")
                        .attr("x", 10)
                        .attr("y", 12)
                        .style("font-size", "12px")
                        .append("title")
                        .text(names);

                    let y = 0;
                    let i = 0;

                    _names.append("text")
                        .attr("class", "PL-names")
                        .text(function () {
                            let result = finalNamesTab[i];
                            i++;
                            return result;
                        })
                        .attr("x", 55)
                        .attr("y", function () { return y += 12 })
                        .style("font-size", "12px")
                        .append("title")
                        .text(names);

                    endOfNames = y - 15;
                }

                _grpPapers = _grpPapersList.selectAll(".PL-grpPapers")
                    .data(model.data.root.data.documents)
                    .enter()
                    .append("g")
                    .attr("class", "PL-grpPapers");

                let x = 5, y = (model.data.children.cluster === true ? endOfNames : -15);
                _grpPapers.append("rect")
                    .attr("class", "PL-type")
                    .attr("x", x)
                    .attr("y", function () { return y += 35 })
                    .attr("height", 10)
                    .attr("width", 10)
                    .attr("fill", function (d) {
                        return _colorsRect[_getTheIndex(d.type)];
                    })
                    .append("title")
                    .text(function (d) { return d.type });

                x = 25;
                y = (model.data.children.cluster === true ? endOfNames + 5 : -9);
                let maxLenghtTitle = model.widthChart / _maxLenghtTitleIndex;

                _grpPapers.append("a")
                    .attr("xlink:href", function (d) { return d.link })
                    .attr("target", "_blank")
                    .append("text")
                    .attr("class", "PL-title")
                    .text(function (d) {
                        // if (d.title.length <= maxLenghtTitle)
                        return d.title;
                        // else
                        //     return d.title.slice(0, maxLenghtTitle) + "..."
                    })
                    .attr("x", x)
                    .attr("y", function () { return y += 35; })
                    .style("font-size", "12px")
                    .append("title")
                    .text(function (d) { return d.title });

                x = 25;
                y = (model.data.children.cluster === true ? endOfNames + 17 : 5);

                _grpPapers.append("text")
                    .attr("class", "PL-infos")
                    .text(function (d) {
                        let authorsNames = "";
                        for (let i = 0; i < d.authors.length; i++) {
                            authorsNames += _findAuthorById(d.authors[i]);
                            if (i !== d.authors.length - 1)
                                authorsNames += ", ";
                        }
                        return authorsNames + " - " + d.date + " - " + d.link.slice(d.link.length - 2);
                    })
                    .attr("x", x)
                    .attr("y", function () { return y += 35; })
                    .style("font-size", "12px")
                    .append("title")
                    .text(function (d) {
                        let authorsNames = "";
                        for (let i = 0; i < d.authors.length; i++) {
                            authorsNames += _findAuthorById(d.authors[i]);
                            if (i !== d.authors.length - 1)
                                authorsNames += ", ";
                        }
                        return authorsNames + " - " + d.date + " - " + d.link.slice(d.link.length - 2);
                    });

            } // End
        );
        //--------------------------------- Private functions

        /**
         *
         * _getTheRightOrder
         *
         * Returns the index for the color
         *
         * @param type
         * @returns number
         * @private
         */
        function _getTheIndex(type) {
            switch (type) {
                case "publications":
                    return 0;
                case "conference paper":
                    return 1;
                case "report":
                    return 2;
                case "article":
                    return 3;
            }
        }

        /**
         *
         * _findAuthorById
         *
         * Returns the author depending on his id
         *
         * @param id
         * @returns string
         * @private
         */
        function _findAuthorById(id) {
            for (let i = 0; i < model.data.children.data.length; i++) {
                if (model.data.children.data[i].id === id) {
                    return model.data.children.data[i].labels[0];
                } else if (model.data.children.data[i].idOrig === id) {
                    return model.data.children.data[i].labels[0];
                }
            }
            if (model.data.children.others.length === 0) {
                return "Not known";
            } else {
                for (let j = 0; j < model.data.children.others.length; j++) {
                    if (model.data.children.others[j].id === id) {
                        return model.data.children.others[j].labels[0];
                    } else if (model.data.children.others[j].idOrig === id) {
                        return model.data.children.others[j].labels[0];
                    }
                }
            }
        }


        //--------------------------------- Public functions

        function chart() { }

        chart.box = function (_) {
            if (!arguments.length)
                return model.box;
            model.box = _;

            return chart;
        };

        //---------------------
        // This function is required in all techniques
        // It is called internally in conectChart
        chart.panel = function (_) {
            if (!arguments.length)
                return _papersListPanel;
            _papersListPanel = _;

            return chart;
        };

        //---------------------
        chart.data = function (_, nbArticle) {
            if (!arguments.length)
                return model.data;
            model.data = _;
            let headerHeight = 50;
            if (_.root.data.documents.length <= 10)
                model.box.height = _.root.data.documents.length * 35 + headerHeight;
            else {
                model.box.height = 10 * 35 + headerHeight;
            }
            // _papersListPanel.update();
            return chart;
        };

        //---------------------
        chart.dataVisToNode = function (index) {
            return model.data.children.data[index];
        };

        //======== Actions Functions
        chart.sortByText = function () {
            _sortByText = false;
            _data.root.data.documents.sort(function (x, y) {
                return d3.ascending(x.title, y.title);
            });
            model.redraw += 1;
        };

        //---------------------
        chart.sortByYear = function () {
            _sortByText = false;
            _data.root.data.documents.sort(function (x, y) {
                return d3.ascending(x.date, y.date);
            });
            model.redraw += 1;
        };

        //---------------------
        return chart;
    };
});
