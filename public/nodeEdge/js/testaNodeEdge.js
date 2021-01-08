require(["dashboard","databaseUFRGS2004","nodeEdgeChart","nodeEdgePanel","algCluster"],
                     function (Dashboard,DatabaseUFRGS2004,NodeEdgeChart,NodeEdgePanel, AlgCluster) {

	var databaseSoccer = DatabaseUFRGS2004();
	var alg =  AlgCluster();	
//	var alg = AlgCluster();   // Instancia o algoritmo para gerar cluster
	
//	var dados = databaseSoccer.getDataNodeEdges(50);
//	var dados = databaseSoccer.getDataNodeEdges(100);
	var dados = databaseSoccer.getDataGraph();	
	alg.byAttribute(dados,1001);
//	console.log(dados);



	var dashboard = Dashboard("viewArea");
	
	var v1 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(0,0);  
	var nodeEdgeChart = NodeEdgeChart(v1.idChart());  

	
    nodeEdgeChart
	       .box ( {width:300, height:300})	   
		   .data(dados);
		   
	v1.conectChart(nodeEdgeChart,NodeEdgePanel);

//--------------------------------------	      
// Testa alteracao de dados
/*	
    setTimeout(function () { 
	    matrixGlyphChart.pLegendWidth(0.30);
    }, 3000);	
*/		   

// Testa alteracao de dados
/*	
    setTimeout(function () { 
	    matrixGlyphChart.pFontHeight(0.024);
    }, 3000);	
*/	
		   
/*	
    setTimeout(function () { 
	    matrixGlyphChart.data(databaseSoccer.getDataMatrix(10));	
    }, 3000);	
*/
/*    	
    setTimeout(function () { 
	    matrixGlyphChart.acChangeAttrLegend(1);		   
    }, 3000);	
*/  
/* 
 	var v2 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(100,0);  
	var clusterVisChart2 = ClusterVisChart(v2.idChart());  
 
    clusterVisChart2
	       .box ( {width:300, height:300})
           .indexAttrSort(1001)     // Atributo 0 numérico. Deve estar antes de data()		   
		   .data(dados)
		   .addAttribute(1,"V")
		   .addAttribute(2,"V");


		   v2.conectChart(clusterVisChart2,ClusterVisPanel);
*/		   
});