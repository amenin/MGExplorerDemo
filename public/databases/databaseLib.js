define( [], function ( ) {

    return function DatabaseUFRGS2004 () {

        var _data;

        /**
         * _copyArray
         *
         * Returns a copy of the input array
         */

        function _copyArray (array) {
            if (array === null)
                return null;
            else
                return array.slice();
        }

        function database() {}

        /**
         * getDataClusterVis
         *
         * Returns the data of the graph considering the n first nodes
         */
        database.getDataClusterVis = function (nNodos)  {
            let result = {
                nodes : {
                    labelTitle : _data.nodes.labelTitle,
                    valueTitle : _data.nodes.valueTitle,
                    imageTitle : _data.nodes.imageTitle,
                    dataNodes  : []
                },
                edges : {
                    labelTitle: _data.edges.labelTitle,
                    valueTitle: _data.edges.valueTitle,
                    dataEdges: []
                }
            };

            _data.nodes.dataNodes.forEach(
                function (d,i) {
                    if (i<nNodos)
                        result.nodes.dataNodes.push(d);
                }
            );

            _data.edges.dataEdges.forEach(
                function (d,i) {
                    if (d.src>=0 && d.src<nNodos)
                        if (d.tgt>=0 && d.tgt<nNodos)
                            result.edges.dataEdges.push(d);
                }
            );

            return result;
        };

        /**
         * getDataNodeEdges
         *
         * Returns the data of the graph considering the n first nodes
         */
        database.getDataNodeEdges = function (nNodos)  {
            let result = {
                nodes : {
                    labelTitle : _data.nodes.labelTitle,
                    valueTitle : _data.nodes.valueTitle,
                    imageTitle : _data.nodes.imageTitle,
                    dataNodes  : []
                },
                edges : {
                    labelTitle: _data.edges.labelTitle,
                    valueTitle: _data.edges.valueTitle,
                    dataEdges: []
                }
            };

            _data.nodes.dataNodes.forEach(
                function (d,i) {
                    if (i<nNodos)
                        result.nodes.dataNodes.push(d);
                }
            );

            _data.edges.dataEdges.forEach(
                function (d,i) {
                    if (d.src>=0 && d.src<nNodos)
                        if (d.tgt>=0 && d.tgt<nNodos)
                            result.edges.dataEdges.push(d);
                }
            );

            return result;
        };


        /**
         * getDataGraph
         *
         * Loads and returns the data of the graph whose URL is passed as argument
         */
        database.getDataGraph = function (url)  {
            d3.json(url, function(data) {
                _data = data;
                console.log(_data);
            });
            console.log(_data);
            return _data;
        };

        /**
         * getDataMatrix
         *
         * Returns the data of the graph indicated by indexDataBase in the original format (graph)
         */
        database.getDataMatrix = function (nNodos) {

            let result = {
                nodes : {
                    labelTitle : _data.nodes.labelTitle,
                    valueTitle : _data.nodes.valueTitle,
                    imageTitle : _data.nodes.imageTitle,
                    dataNodes  : []
                },
                matrix : []
            };

            _data.nodes.dataNodes.forEach(
                function (d,i) {
                    if (i<nNodos)
                        result.nodes.dataNodes.push(d);
                }
            );


            _data.nodes.dataNodes.forEach(
                function (d,i) {
                    if (i<nNodos)
                        result.matrix[i] = [];
                }
            );

            _data.edges.dataEdges.forEach(
                function (d,i) {
                    if (d.src < nNodos && d.tgt < nNodos) {
                        result.matrix[d.src].push( { "x":d.tgt, "y":d.src, "exist":true,"labels": d.labels,"values": d.values});
                    }
                }
            );

            return result;

        };



        /**
         * getDataIrisNew
         *
         * New version of the data structure for IRIS
         */
        database.getDataIrisNew = function (indexRoot)  {
            let result = {};

            result.root = {
                labelTitle : _data.nodes.labelTitle,
                valueTitle : _data.nodes.valueTitle,
                imageTitle : _data.nodes.imageTitle,
                data       : _data.nodes.dataNodes[indexRoot]
            };

            result.children = {
                labelTitle : _data.nodes.labelTitle,
                valueTitle : _data.nodes.valueTitle,
                imageTitle : _data.nodes.imageTitle,
                data       : []  // Data of the child nodes and the edge that binds it to the root
            };

            result.edges = {
                labelTitle : _data.edges.labelTitle,
                valueTitle : _data.edges.valueTitle,
                data       : [] // Data of the other edges (which do not bind to the root)
            };



            /****
             * the children field should receive a copy because the elements will be changed
             * The change can not generate changes in the original
             */

            _data.edges.dataEdges.forEach(
                function (d,i) {
                    if (d.src === indexRoot) {
                        result.children.data.push({
                            id: _data.nodes.dataNodes[d.tgt].id,
                            labels: _data.nodes.dataNodes[d.tgt].labels,
                            values: _data.nodes.dataNodes[d.tgt].values,
                            images: _data.nodes.dataNodes[d.tgt].images,
                            edge: {
                                src: d.src,
                                tgt: d.tgt,
                                labels: d.labels,
                                values: d.values
                            }
                        });
                    } else
                    if (d.tgt === indexRoot) {
                        result.children.data.push({
                            id: _data.nodes.dataNodes[d.src].id,
                            labels: _data.nodes.dataNodes[d.src].labels,
                            values: _data.nodes.dataNodes[d.src].values,
                            images: _data.nodes.dataNodes[d.src].images,
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


        /**
         * getDataIris
         *
         * Returns the data of the graph indicated by indexDataBase in Iris format
         */
        database.getDataIris = function (indexRoot)  {
            let result = {};
            let PUBLICATIONS = 0;

            result.root = {
                labelTitle : _data.nodes.labelTitle,
                valueTitle : _data.nodes.valueTitle,
                imageTitle : _data.nodes.imageTitle,
                data       : _data.nodes.dataNodes[indexRoot]
            };

            result.children = {
                labelTitle : _copyArray( _data.nodes.labelTitle),
                valueTitle : ["Publications"],
                imageTitle : _copyArray( _data.nodes.imageTitle),
                data       : []
            };



            /****
             * the children field should receive a copy because the elements will be changed
             * The change can not generate changes in the original
             */

            _data.edges.dataEdges.forEach(
                function (d,i) {
                    if (d.src === indexRoot) {
                        result.children.data.push({
                            id: _data.nodes.dataNodes[d.tgt].id,
                            labels: _copyArray(_data.nodes.dataNodes[d.tgt].labels),
                            values: [d.values[PUBLICATIONS]],
                            images: _copyArray(_data.nodes.dataNodes[d.tgt].images)
                        });
                    }
                    else if (d.tgt === indexRoot){
                        result.children.data.push({
                            id: _data.nodes.dataNodes[d.src].id,
                            labels: _copyArray(_data.nodes.dataNodes[d.src].labels),
                            values: [d.values[PUBLICATIONS]],
                            images: _copyArray(_data.nodes.dataNodes[d.src].images)
                        });

                    }
                }
            ) ;


            return result;
        };


        return database;
    }
});
