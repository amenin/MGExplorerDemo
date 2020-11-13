define( ["dataUFRGS2004"], function ( dataUFRGS2004) {

  return function DatabaseUFRGS2004 () {
   
  var _data = dataUFRGS2004().getData();
 
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
  
  function database() {};

/**
 * getDataClusterVis
 * 
 * Retorna os dados do grafo considerando os n primeiros nodos 
 */
  database.getDataClusterVis = function (nNodos)  {
 	var result = {
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
 * Retorna os dados do grafo considerando os n primeiros nodos 
 */
  database.getDataNodeEdges = function (nNodos)  {
 	var result = {
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
 * Retorna os dados do grafo indicado por indexDataBase no formato original (grafo) 
 */
  database.getDataGraph = function ()  {
	return _data;
  };
  
/**
 * getDataMatrix
 * 
 * Retorna os dados do grafo indicado por indexDataBase no formato original (grafo) 
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
	
// Inicializa a matriz  
/*	_data.nodes.dataNodes.forEach( 
		function (d,i) {
		    if (i<nNodos)
			   result.matrix[i] = d3.range(nNodos).map( function(d,j){return {x:j, y:i, exist:false, labels:[],values:[]}; });
		}			
	);
	
	_data.edges.dataEdges.forEach( 
			function (d,i) { 
			    if (d.src < nNodos && d.tgt < nNodos) {
				  result.matrix[d.src][d.tgt].labels = d.labels;
				  result.matrix[d.src][d.tgt].values = d.values;
				  result.matrix[d.src][d.tgt].exist = true;
				}
			}			
	);
*/	
	return result;

};
  
  
  
/**
 * getDataIrisNew
 * 
 * Nova versao da estrutura de dados para a IRIS
 */  
  database.getDataIrisNew = function (indexRoot)  {
	var result = {};
//	var data = this.dataBase;
//	var dataBaseUFRGSThis = this;
	var PUBLICATIONS = 0;
	
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
					data       : []  // Dados dos nodos filhos e da aresta que o liga ao raiz
	};
	
	result.edges = {
					labelTitle : _data.edges.labelTitle,
					valueTitle : _data.edges.valueTitle,
					data       : [] // Dados das demais arestas (que nao se ligam ao raiz
	};
	

	
/****
 * o campo children deve receber uma cópia em razão de que os elementos serão alterados
 * A alteração não pode gerar alterações no original
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
 * Retorna os dados do grafo indicado por indexDataBase no formato da Iris 
 */  
  database.getDataIris = function (indexRoot)  {
	var result = {};
//	var data = this.dataBase;
//	var dataBaseUFRGSThis = this;
	var PUBLICATIONS = 0;
	
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
 * o campo children deve receber uma cópia em razão de que os elementos serão alterados
 * A alteração não pode gerar alterações no original
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