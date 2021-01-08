define( ["dataSoccer2013"], function ( dataSoccer2013) {

  return function DatabaseSoccer2013 () {
   
  var _data = dataSoccer2013().getData();
  
  _addAttributesNodos(_data);
  _addAttributesEdges(_data);
  
/**
 * _copyArray
 * 
 * Retorna uma copia do array de entrada
 */

  function _copyArray (array) {
    if (array === null)
	   return null;
    else
	   return array.slice();
  }; 
  
/**
 * _addAttributesNodos
 * 
 * Adiciona ao atributos dos nodos valores calculados 
 */

  function _addAttributesNodos(dataGraph) {
	var matches = dataGraph.edges.dataEdges,
	    GOLS_M  = 1,
	    GOLS_V  = 8,
	    PTS = 0,
	    GOLS_SCORED = 1,
	    GOLS_CONCEDED = 2,
	    MATCHES_WON = 3,
	    GOLS_DIFF   = 4;

    
	dataGraph.nodes.valueTitle = ["Points","Gols Scored","Gols conceded", "Matches Won","Gols Difference"];
	dataGraph.nodes.dataNodes.forEach( function (d) { d.values = [0,0,0,0,0];});

	matches.forEach(function(d) {
		    // Soma Pontos e partidas vencidas
		if (d.values[GOLS_M] > d.values[GOLS_V]) {
			dataGraph.nodes.dataNodes[d.source].values[PTS] += 3;
			dataGraph.nodes.dataNodes[d.source].values[MATCHES_WON] += 1;
		} else
			if (d.values[GOLS_M] < d.values[GOLS_V]) {
				dataGraph.nodes.dataNodes[d.target].values[PTS] += 3;
				dataGraph.nodes.dataNodes[d.target].values[MATCHES_WON] += 1;
			} else {
				dataGraph.nodes.dataNodes[d.source].values[PTS] += 1;
				dataGraph.nodes.dataNodes[d.target].values[PTS] += 1;
			}
			
			// Soma gols marcados
		dataGraph.nodes.dataNodes[d.source].values[GOLS_SCORED] += d.values[GOLS_M];
		dataGraph.nodes.dataNodes[d.target].values[GOLS_SCORED] += d.values[GOLS_V];
		
		    // Soma gols sofridos
		dataGraph.nodes.dataNodes[d.source].values[GOLS_CONCEDED] += d.values[GOLS_V];
		dataGraph.nodes.dataNodes[d.target].values[GOLS_CONCEDED] += d.values[GOLS_M];	
		
			// Soma saldo de gols
		dataGraph.nodes.dataNodes[d.source].values[GOLS_DIFF] += (d.values[GOLS_M] - d.values[GOLS_V]);
		dataGraph.nodes.dataNodes[d.target].values[GOLS_DIFF] += (d.values[GOLS_V] - d.values[GOLS_M]);
	});

  };

/**
 * _addAttributesEdges
 * 
 * Adiciona ao atributos das arestas o resultado das partidas
 *   0 Vitoria
 *   1 Empate
 *   2 Derrota 
 */

  function _addAttributesEdges(dataGraph) {
	var matches = dataGraph.edges.dataEdges,
	    GOLS_M  = 1,
	    GOLS_V  = 8,
	
	    VITORIA = 0,
	    EMPATE  = 1,
	    DERROTA = 2;

    dataGraph.edges.valueTitle.push("Home Result","Away Result");

    matches.forEach(function(d) {
		    // Soma Pontos e partidas vencidas
		if (d.values[GOLS_M] > d.values[GOLS_V]) {
			d.values.push(VITORIA,DERROTA);
		} else
			if (d.values[GOLS_M] < d.values[GOLS_V]) {
				d.values.push(DERROTA,VITORIA);
			} else {
				d.values.push(EMPATE,EMPATE);
			}
	});

};

//--------------------------------- Funcoes publicas
  
  function database() {};
  
/**
 * getDataGraph
 * 
 * Retorna os dados do grafo indicado por indexDataBase no formato original (grafo) 
 */
  database.getDataGraph = function ()  {
	return _data;
  };

/**
 * getDataMatrix
 * 
 * Retorna os dados do grafo considerando N nodos no formato
 * visualizado no gráfico de matriz
 * 
 *     {
 *		"nodes": {
 *          "labelTitle": [ "Name", "Acronym","Simbol"],
 *			"valueTitle": null,
 *			"imageTitle": ["Simbol"],
 *          "dataNodes" : [ 
 *			                { "id":0,  "labels":["Atlético-MG"   , "CAM",  null], "values":null },
 *			                { "id":1,  "labels":["Atlético-PR"   , "CAP",  null], "values":null }
 *                        ]
 *	     },
 *      "matrix"    : [
 *                        [ "labels":null, "values":[1,  3,  15,41,18,10,1,1,  0,  12,46, 5,11,0,3]}, {...}],
 *                        [...]
 *                    ]
 *	}
 */
  database.getDataMatrix = function (nNodos) {

 	var result = {
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
// Inicializa a matriz
	_data.nodes.dataNodes.forEach( 
		function (d,i) {
		    if (i<nNodos)
			   result.matrix[i] = d3.range(nNodos).map( function(d,j){return {x:j, y:i, exist:false, labels:[],values:[]}; });
		}			
	);
	
	_data.edges.dataEdges.forEach( 
			function (d,i) { 
			    if (d.source < nNodos && d.target < nNodos) {
				  result.matrix[d.source][d.target].labels = d.labels;
				  result.matrix[d.source][d.target].values = d.values;
				  result.matrix[d.source][d.target].exist = true;
				}
			}			
	);
	
	return result;

};
  
  
/**
 * getDataMatrix
 * 
 * Retorna os dados do grafo indicado por indexDataBase no formato para ser 
 * visualizado no gráfico de matriz
 * 
 *     {
 *		"nodes": {
 *          "labelTitle": [ "Name", "Acronym","Simbol"],
 *			"valueTitle": null,
 *			"imageTitle": ["Simbol"],
 *          "dataNodes" : [ 
 *			                { "id":0,  "labels":["Atlético-MG"   , "CAM",  null], "values":null },
 *			                { "id":1,  "labels":["Atlético-PR"   , "CAP",  null], "values":null }
 *                        ]
 *	     },
 *      "matrix"    : [
 *                        [ "labels":null, "values":[1,  3,  15,41,18,10,1,1,  0,  12,46, 5,11,0,3]}, {...}],
 *                        [...]
 *                    ]
 *	}
 */
  database.getDataMatrixOld = function () {
	
	var result = {};
	var size = _data.nodes.dataNodes.length;

	result.nodes = _data.nodes;
//	result.nodes.label = this.dataChart.nodes.dataNodes.map( function(d){ return d.label;});

	result.matrix = [];

	_data.nodes.dataNodes.forEach( 
			function (d,i) {
				result.matrix[i] = d3.range(size).map( function(d,j){return {x:j, y:i, exist:false, labels:[],values:[]}; });
			}			
	);
	
	_data.edges.dataEdges.forEach( 
			function (d,i) { 
				result.matrix[d.source][d.target].labels = d.labels;
				result.matrix[d.source][d.target].values = d.values;
				result.matrix[d.source][d.target].exist = true;
			}			
	);
	
	return result;

};
  
  
/**
 * getDataIris
 * 
 * Retorna os dados do grafo indicado por indexDataBase no formato da Iris
 *
 *  {
 *		"root": {
 *          "labelTitle": [ "Name", "Acronym"],
 *			"valueTitle": null,
 *			"imageTitle": ["Simbol"],
 *          "data" : { "id":0,  "labels":["Atlético-MG"   , "CAM",  null], "values":null }
 *	     },
 *      "children" : {
 *      	"labelTitle": [ "Name", "Acronym"],
 *			"valueTitle": ["Round","Gols Scored","Gols conceded"],
 *			"imageTitle": ["Simbol"],
 *          "data" : [ 
 *			                { "id":0,  "labels":["Atlético-MG"   , "CAM"], "values":[1,3,2], "images": null },
 *			                { "id":1,  "labels":["Atlético-PR"   , "CAP"], "values":[2,0,1], "images": null }
 *                   ]
 *      
 *      }
 * 	
 */
  database.getDataIris = function (indexRoot)  {
	var result = {};

	var ROUNDS = 0,
	    GOLS_MANDANTE = 1,
	    GOLS_VISITANTE = 8;
	
	result.root = {
			        labelTitle : _data.nodes.labelTitle,
			        valueTitle : _data.nodes.valueTitle,
			        imageTitle : _data.nodes.imageTitle,
			        data       : _data.nodes.dataNodes[indexRoot]
	};
	
	result.children = {
					labelTitle : _copyArray(_data.nodes.labelTitle),
					valueTitle : ["Round","Gols Scored","Gols conceded"],
					imageTitle : _copyArray(_data.nodes.imageTitle),
					data       : []
	};
	

	
/****
 * o campo children deve receber uma cópia em razão de que os elementos serão alterados
 * A alteração não pode gerar alterações no original
 */			
	
	_data.edges.dataEdges.forEach(
		function (d,i) {
			if (d.source === indexRoot) {
				result.children.data.push({
					                       id: _data.nodes.dataNodes[d.target].id,
					                       labels: _copyArray(_data.nodes.dataNodes[d.target].labels),
					                       values: [d.values[ROUNDS],d.values[GOLS_VISITANTE],d.values[GOLS_MANDANTE]],
					                       images: _copyArray(_data.nodes.dataNodes[d.target].images)
					                       });
			} 
			else if (d.target === indexRoot){
				result.children.data.push({
                    id: _data.nodes.dataNodes[d.source].id,
                    labels: _copyArray(_data.nodes.dataNodes[d.source].labels),
                    values: [d.values[ROUNDS],d.values[GOLS_MANDANTE],d.values[GOLS_VISITANTE]],
                    images: _copyArray(_data.nodes.dataNodes[d.source].images)
                    });
				
			} 
		}			
	) ;

	return result;
};



  
  return database;
  }
}); 