/**
 * histogramChart
 *
 */

define(["model", "libCava"], function (Model, LibCava) {
    let i = 150;
    return function HistogramChart(idDiv) {

        let _irisPanel = null,  // represents the panel associated with the graph
            _sortByText = true,

            _innerRadius = 0,  // (calculated) radius of the circle where the centroid is inserted
            _outerRadius = 0,
            _maxHeightBar = 0, // (calculated) distance occupied by the bars - Change causes change in the maximum number of bars of the Iris - Original 40

            _grpHistogram = null,   // Group representing IRIS
            _abscissa = null,
            _ordinate = null,
            _ordinateTitle = null,
            _abscissaTitle = null,
            _abscissaBottomMargin = 70,
            _abscissaRightMargin = 40,
            _yAxis = null,
            _xAxis = null,
            _x = null,
            _y = null,
            _bins = null,
            _documentType = null,
            _orderedDocumentArray = null,
            _years = null,

            // Used only when the amount of elements in this.data is less than or equal to "dataVis"


            _vOrder = null,      // Indirect ordering vector

            _orders = {
                publications: [0, 1, 2, 3],
                journals: [1, 2, 3, 0],
                books: [2, 3, 0, 1],
                proceedings: [3, 0, 1, 2],
            },

            _focusArea = {
                widthBar: 0,       // (calculated) Width of bar in the area of maximum width (focus) Original: 11
                angleBar: 0.0,     // (calculated) Angle of the sector occupied by the bars that are in Focus
                marginBar: 1,      //
                angleSector: 0.0,  // (calculated)
                indexCenter: 0,    // (calculated) index in the dataVis vector where the center of the focus is
                numBars: 7         // Number of bars in focus (best odd number)
            },

            //_updateIndexCenter = true,   // Indicates that IndexCenter should be updated

            _fishEyeArea = {
                geometry: [{ width: 0.0, angle: 0.0 }],   // One element for each bar
                marginBar: 1,                          // Margin between the bars of the fish eye area
                numBars: 0,         // (calculated)
                angleSector: 0.0                        // (calculated) Sum of the angle of all bars forming the fish eye area
            },

            _minArea = {
                widthBar: 0,        // Width of the bar in the area where the width of the bars is minimum Original: 4
                angleBar: 0.0,      // (calculated) Angle of the sector occupied by the bars that are in the area of minimum width (MIN)
                marginBar: 1,
                numBars: 0,       // (calculated)
                angleSector: 0.0    // (calculated)
            },

            _hiddenArea = {
                widthBar: 0,    // (calculated) Bar width of area not visible (equal to focus)
                angleBar: 0.0,  // (calculated)
                numBars: 1,    // Number of bars with a width equal to the focus in hidden area
                angleSector: 0.0   // (calculated) Sector angle occupied by hidden area
            },

            _cfgIndexAttr = {          // Contains the indexes of the attributes that can be configured in the graph
                titleCentroid: 0,       // Index of the attribute to be printed in the center of the circle (Must be Label)
                titleDegree: "co-authors",     // Text to be used after degree value in centroid
                textBar: 0             // Text that will be printed after the bars
            },

            _nbOfTypesDoc = 4,     // number of types of documents in the base
            _colorsBars = ["#1f77b4", "#2ca02c", "#d62728", "#ff7d0e"];     // colors for the different types

        // ---------------- Model
        let model = Model();
        let lcv = LibCava();

        // ---------------- Geometric attributes of the graph
        model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
        model.box = { width: 150, height: 150 };
        model.pInnerRadius = 0.13;    // Percentage relative to graph width for _innerRadius calculation
        model.pOuterRadius = 0.57;    // Percentage relative to graph width for _OuterRadius calculation
        model.pMaxHeightBar = 0.15;  // Percentage relative to graph width for _MaxHeightBar calculation
        model.pFocusWidthBar = 0.0275;  // Percentage relative to graph width for calculation of _focusArea.widthBar
        model.pMinWidthBar = 0.01;       // Percentage relative to graph width for calculation of _minArea.widthBar Original 4

        model.indexAttBar = 0;           // Index of the attribute that will be plotted in the toolbar

        model.redraw = 0;


        // ---------------- Initialization Actions
        let _svg = d3.select("#" + idDiv).append("svg"),  // Create dimensionless svg
            _sort = lcv.sortIris(),                     // Creates sorting function
            _grpChart = _svg.append("g");                       // Does not exist in the original Iris

        _grpHistogram = _grpChart.append("g").attr("class", "HistogramChart").attr("transform", "translate(30,20)");

        // _______________________

        const dataTest = [{ price: "20.0" }, { price: "34.0" }, { price: "35.0" }, { price: "40.0" }, { price: "59.0" }, { price: "60.0" }, { price: "61.0" }, { price: "62.0" }, { price: "70.0" }, { price: "80.0" }, { price: "100.0" }];
        const dataTestResearch = [{ year: '2007', qtResearch: "6", qtPublication: "5" }, { year: '2008', qtResearch: "1", qtPublication: "7" }, { year: '2009', qtResearch: "2", qtPublication: "3" }]


        //_______________________________

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
            // _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        });

        //---------------------
        model.when(["widthChart", "pInnerRadius"], function (widthChart, pInnerRadius) {
            _innerRadius = Math.floor(widthChart * pInnerRadius);
        });

        //---------------------
        model.when(["widthChart", "pOuterRadius"], function (widthChart, pOuterRadius) {
            _outerRadius = Math.floor(widthChart * pOuterRadius);
        });

        //---------------------
        model.when(["data", "widthChart", "indexAttBar", "pMaxHeightBar"], function (data, widthChart, indexAttBar, pMaxHeightBar) {
            let maxValue = 150
            _maxHeightBar = Math.floor(widthChart * pMaxHeightBar);
            model.barScale = d3.scale.linear().range([0, _maxHeightBar]).domain([0, maxValue]);
        });

        //---------------------
        model.when(["widthChart", "pFocusWidthBar"], function (widthChart, pFocusWidthBar) {
            _focusArea.widthBar = Math.floor(widthChart * pFocusWidthBar);
            _hiddenArea.widthBar = _focusArea.widthBar;
        });

        //---------------------
        model.when(["widthChart", "pMinWidthBar"], function (widthChart, pMinWidthBar) {
            _minArea.widthBar = Math.floor(widthChart * pMinWidthBar);
            if (_minArea.widthBar === 0)
                _minArea.widthBar = 1;
        });

        //---------------------
        model.when(["data", "widthChart", "heightChart", "barScale", "pInnerRadius", "pOuterRadius", "redraw"],
            function _createHistogram(data, widthChart, heightChart) {


                // Update abscissa
                _x.rangeRoundBands([0, model.box.width * 0.80 - _abscissaRightMargin]);
                _xAxis.scale(_x)
                _abscissa.attr("transform", "translate(0," + `${model.box.height - _abscissaBottomMargin}` + ")")
                    .call(_xAxis);

                // Update ordinate
                _y.domain([0, model.data.root.data.documents.length]);

                _y.range([`${model.box.height - _abscissaBottomMargin}`, 0]);

                _yAxis.scale(_y)
                _ordinate.call(_yAxis);

                constructChartBars();

                _abscissaTitle.attr("transform", "translate(40," + `${model.box.height - 40}` + ")")

                for (labelIndex in model.data.root.valueTitle) {
                }

            } // End
        );

        //--------------------------------- Private functions
        /**
                *
                * _getTheRightOrder
                *
                * Returns the order in which we need to display the types of documents
                *
                * @param i
                * @returns {number[]}
                * @private
                */
        function _getTheRightOrder(i) {
            switch (i) {
                case 0:
                    return _orders.publications;
                case 1:
                    return _orders.journals;
                case 2:
                    return _orders.books;
                case 3:
                    return _orders.proceedings;
            }
        }


        function setupPrimaryVersion() {
            _x = d3.scale.linear()
                .domain([0, d3.max(dataTest, function (d) { return +d.price })])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
                .range([0, model.box.width]);

            _xAxis = d3.svg.axis()
                .scale(_x)
                .orient("bottom");

            // Y axis: 
            _y = d3.scale.linear()

            _yAxis = d3.svg.axis()
                .scale(_y)
                .orient("left")
        }

        function setupVersionWithYearAndPublications() {

            _x = d3.scale.ordinal()
                .rangeRoundBands([0, model.box.width], .1)
                .domain(Array.from(_years))    // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })

            _xAxis = d3.svg.axis()
                .scale(_x)
                .orient("bottom");

            getMaximumOrdinate();
            // Y axis: 
            _y = d3.scale.linear()

            _yAxis = d3.svg.axis()
                .scale(_y)
                .orient("left")
                .tickFormat(d3.format("d"));

            _abscissaTitle = _grpHistogram.append("text")
                .attr("y", 1)
                .attr("dy", ".71em")
                .text("<Should be custom parameter>");


            _ordinateTitle = _grpHistogram.append("g")
                .attr("class", "HC-legend")
                .attr("transform", "translate(0,0)")
                .attr("y", 1)
                .attr("dy", ".71em")

            _ordinate = _grpHistogram.append("g")
                .attr("class", "HC-ordina")
                .style("fill", "none")
                .style("stroke", "black")
                .style("shape-rendering", "crispEdges")
                .call(_yAxis);

            _abscissa = _grpHistogram.append("g")
                .attr("transform", "translate(0," + model.box.height + ")")
                .attr("class", "HC-abscissa")
                .style("fill", "none")
                .style("stroke", "black")
                .style("shape-rendering", "crispEdges")
                .call(_xAxis);
        }

        function computeMaximumValue(data) { // Data should be replaced by passed json data in MGExplorer
            // for (document of model.data.root.data.documents)
        }
        function constructChartBars() {
            _grpHistogram.selectAll(".HC-grpBar").remove();

            let paramNumber = 0;
            for (value of dataTestResearch) {
                if (paramNumber < Object.keys(value).length - 1) {
                    paramNumber = Object.keys(value).length - 1;
                }
            }

            // Soit par année, [{year:"", documents : {type:"..."}}, {year:""...}]
            // Soit construire une nouvelle structure par type en fonction d'une année passée en paramétre

            let _grpBars = _grpHistogram.selectAll(".HC-grpBar")
                .data(Array.from(_years))
                .enter()
                .append("g")
                .attr("x", 1)
                .attr("class", "HC-grpBar")
                .attr("transform", function (d) { return "translate(0,0)"; })
                .attr("width", function (d) { return _x.rangeBand() - 0.5 })
                .attr("height", function (d) { return (model.box.height - _abscissaBottomMargin) })
                .on("mouseover", d => {
                    console.log(d);
                })

            let index = 0;

            _ordinateTitle.selectAll("*").remove();
            for (type of _documentType) {
                _orderedDocumentArray = getDocumentNumberByTypePerYear(type)
                _grpBars.append("rect")
                    .attr("class", "HC-bars")
                    .attr("x", 1)
                    .attr("transform", function (d) { return "translate(" + `${_x(d) + (_x.rangeBand() / _documentType.size) * index}` + "," + _y(_orderedDocumentArray[d].length) + ")"; })
                    .attr("width", function (d) { return (_x.rangeBand() / _documentType.size) - 0.5 })
                    .attr("height", function (d) { return (model.box.height - _abscissaBottomMargin) - _y(_orderedDocumentArray[d].length); })
                    .style("fill", _colorsBars[_getTheIndex(type)])
                    .append("title")
                    .text((d) => type + " : " + _orderedDocumentArray[d].length)

                _ordinateTitle
                    .append("rect")
                    .attr("width", 10)
                    .attr("height", 10)
                    .style("fill", _colorsBars[_getTheIndex(type)])
                    .attr("transform", (d) => "translate(" + model.box.width * 0.81 + "," + 20 * index + ")");

                _ordinateTitle.append("text")
                    .attr("transform", (d) => "translate(" + model.box.width * 0.83 + "," + 20 * index + ")")
                    .attr("y", "10")
                    .text(type)
                    .append("title")
                    .text(type);

                index++;

            }
        }

        function getDocumentNumberByTypePerYear(type) {
            let orderedDocumentArray = [];
            for (let year of _years) {
                orderedDocumentArray[year] = []
                for (let doc of model.data.root.data.documents) {
                    if (type === doc.type && year === doc.date) {
                        orderedDocumentArray[year].push(doc);
                    }
                }
            }
            return orderedDocumentArray
        }

        function getMaximumOrdinate() {

        }

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

        //--------------------------------- Public functions


        function chart() { }

        chart.box = function (_) {
            if (!arguments.length)
                return model.box;
            model.box = _;

            return chart;
        };

        //---------------------
        chart.pInnerRadius = function (_) {
            if (!arguments.length)
                return model.pInnerRadius;
            model.pInnerRadius = _;
            return chart;
        };

        //---------------------
        chart.pOuterRadius = function (_) {
            if (!arguments.length)
                return model.pOuterRadius;
            model.pOuterRadius = _;
            return chart;
        };

        //---------------------
        chart.pMaxHeightBar = function (_) {
            if (!arguments.length)
                return model.pMaxHeightBar;
            model.pMaxHeightBar = _;
            return chart;
        };

        //---------------------
        // This function is required in all techniques
        // It is called internally in conectChart
        chart.panel = function (_) {
            if (!arguments.length)
                return _irisPanel;
            _irisPanel = _;

            return chart;
        };

        //---------------------
        chart.data = function (_) {
            if (!arguments.length)
                return model.data;
            model.data = _;

            _documentType = new Set([]);
            yearTemp = []
            for (let doc of model.data.root.data.documents) {
                _documentType.add(doc.type);
                yearTemp.push(doc.date);
            }
            // Configure to sort node names
            _sort.inic(model.data.children.labelTitle.length, model.data.children.valueTitle.length)
                .data(model.data.children.data);
            _sort.exec(_cfgIndexAttr.textBar);
            _vOrder = _sort.getVetOrder();

            yearTemp.sort()
            _years = new Set(yearTemp)
            _irisPanel.update();
            setupVersionWithYearAndPublications();

            return chart;
        };

        chart.constructAbscissa = function () {

        }

        chart.ordinate = function () {

        }

        chart.constructBars = function () {

        }

        //---------------------
        // Configure the data that will be printed in the centroid and the text of the bar (Label only)
        chart.configCentroid = function (titulo, tituloGrau, textoBarra) {
            _cfgIndexAttr.titleCentroid = titulo;
            _cfgIndexAttr.titleDegree = tituloGrau;
            _cfgIndexAttr.textBar = textoBarra;
            return chart;
        };

        //---------------------
        chart.dataVisToNode = function (index) {
            return model.data.children.data[index];
        };

        chart.getSourceObject = function () {
            return model.data.root.data;
        };

        //---------------------
        chart.indexAttrBar = function (_) {
            if (!arguments.length)
                return model.indexAttBar + 1000;
            model.indexAttBar = _ - 1000;
            return chart;
        };

        chart.getVOrder = function () {
            return _vOrder;
        };


        //======== Actions Functions
        chart.acSortExecText = function () {
            _sortByText = true;
            _sort.exec(_cfgIndexAttr.textBar);
            _vOrder = _sort.getVetOrder();
            model.redraw += 1;
        };

        //---------------------
        chart.acSortExecAttribute = function () {
            _sortByText = false;
            _sort.exec(model.indexAttBar + 1000);
            _vOrder = _sort.getVetOrder();
            model.redraw += 1;
        };

        return chart;
    };
});
