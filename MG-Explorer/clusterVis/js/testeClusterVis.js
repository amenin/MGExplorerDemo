require(["dashboard","databaseLib","libCava","algCluster","clusterVisChart","clusterVisPanel" ],
		 
        function (Dashboard,DatabaseLib,LibCava,AlgCluster,ClusterVisChart,ClusterVisPanel) {
			
	var ATN_ShortName = 0,   // ATN: Atributo Nodo
		ATN_AuthorName = 1,
		ATN_Category = 2,
		ATN_LinhaPesq = 3,
		ATN_Area = 4,
		
		ATN_AnoUltima = 1000,
		ATN_QtLinhaPesq = 1001,
		ATN_QtArea = 1002,		
		
		ATN_QtPublicacoes = 1003,
		ATN_QtJournals = 1004,
		ATN_QtBooks = 1005,
		ATN_QtProceedings = 1006,
		
		ATN_ConnectComp = 1007,
		ATN_EdgeBetW = 1008,
		
		ATN_CloseCent = 1009,
		ATN_BetCent = 1010,
		ATN_Degree = 1011,
		
		ATE_QtPublicacoes = 1000,   // ATE: Atributo aresta
		ATE_QtJournals = 1001,
		ATE_QtBooks = 1002,
		ATE_QtProceedings = 1003,
		ATE_Year = 1004,		
		ATE_English = 1005,
		ATE_QtCompGrafica = 1014,		

		TC_NodeEdge = 0,   // Técnica
		TC_ClusterVis = 1,
		TC_Iris = 2,
		TC_GlyphMatrix = 3,

		MG_WidthChart = 300;

	var GLYPH_STAR = 4;
	var _IdChartRoot = 0;  // Id do gráfico raiz da exploração. Nessa aplicação NodeEdge
	var _vAttrSelecionaveis = [ ATN_Category, ATN_LinhaPesq,ATN_QtLinhaPesq,
	                            ATN_QtPublicacoes,ATN_QtJournals,ATN_QtBooks,ATN_QtProceedings,ATN_Degree];  // CLUSTERVIS
	var _vAttrEdgesSelecionaveis = [ ATE_QtPublicacoes, ATE_QtJournals, ATE_QtBooks, ATE_QtProceedings];	// IRIS							

	var _vAttrSizeSelecionaveis = [ATN_Degree,ATN_QtPublicacoes,ATN_QtJournals,ATN_QtBooks,ATN_QtProceedings];
	var _selectSizeAttrExiste = false;
	
//--------------- Variaveis do gerenciador de
					 
	var _dashboard = null,     	// Representa toda a área de visualização	
		_data = null,           // Armazena os dados visualizados no nodeEdge
		
		_chart = {   // Estrutura com a view e chart a ser instanciado e armazenado no gerenciador 
			view : null,  	// View associada ao nodo e arestas
			chart : null 	// Gráfico de nodos e arestas
		},
		_alg =  AlgCluster(),		
		_subGraph =  LibCava().subGraph(),
		_tooltips =  LibCava().tooltips();

	
// ---------------- Acoes de inicializacao

	_loadDataProcess("json/dataUFRGS-2011.json");
	
	
//========================== É chamada dentro de _loadDataProcess

function _mostraClusterVis() {
	var node, title, data;
	
	_dashboard = Dashboard("viewArea");
//	_chart.view = _dashboard
	//					.configureView({barTitle:true, btClose:false, draggable:true, resizable:true,aspectRatio:true})
		//				.newView(0,0);
						
	_chart.view = _dashboard
		.configureView({barTitle:true, btTool:true, btClose:false, draggable:true, resizable:true,aspectRatio:true, visible:false})
		.newView(0, 0);						
						
	_chart.chart = ClusterVisChart(_chart.view.idChart()).box ( {width:MG_WidthChart, height:MG_WidthChart});
	_chart.view.conectChart(_chart.chart,ClusterVisPanel);
	
console.log("Passei");	
	node = _data.nodes.dataNodes[628]; // 628 é o cluster Modelagem conceitual

	if (node.cluster) {
		data = _subGraph.clusterClusterVis(node,_data);
	} else {
		data = _subGraph.normalClusterVis(node,_data);	
	}
	
	if (node.cluster) {
//		title = node.key + "\'s cluster";
//		title = "Conceptual Modeling" + "\'s cluster";
		title = "Author 4 and coauthors";
		_chart.view.setTitle(title);
	} else {
		title = node.labels[ATN_ShortName] + " and coauthors";
		_chart.view.setTitle(title);	
	}

	_IdChartRoot =	_dashboard.addChart ( 0,{id:_chart.view.idChart(), title:"", typeChart: "CV", hidden:false, 
									x:0, y:0, chart:_chart.chart, view:_chart.view});	
	_chart.chart
		.indexAttrSort(ATN_Category)     // Atributo 0 numérico. Deve estar antes de data()		   
		.data(data);
		
	_chart.chart     // Alterado para fazer com que o primeiro anel seja sempre categórico	
				.addAttribute(ATN_Category,"L")
				.addAttribute(ATN_QtPublicacoes-1000,"V")				
//				.addAttribute(ATN_LinhaPesq,"L")
				.addAttribute(ATN_QtProceedings-1000,"V")
				.addAttribute(ATN_QtJournals-1000,"V")
				.addAttribute(ATN_QtBooks-1000,"V");
//				.addAttribute(ATN_LinhaPesq,"L");
//				.addAttribute(ATN_Degree-1000,"V");

		_chart.chart.panel().alteraSelectOrder();
		_chart.chart.panel().incluiSelectAneis(_vAttrSelecionaveis);	 // Entrada: atributos selecionaveis	
		_chart.view.show(true);	
}	
			   
//------ Carrega um novo conjunto de dados
	function _loadDataProcess(url) {
		d3.json(url, function(data) {
			_data = data;
							// Inclui o atributo idOrig
			_data.nodes.dataNodes.forEach( function (node) {
				node.idOrig = node.id;
			});
			_alg.byAttribute(_data,ATN_LinhaPesq);
			_mostraClusterVis();
		});			
	}
	
});
