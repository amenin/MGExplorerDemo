require(["dashboard","historyTreeChart","historyTreePanel"],function (Dashboard,HistoryTreeChart,HistoryTreePanel) {
/*
	var dados = {
		id : 1, title: "Root", children: [ 
			{ id:2, title:"Nodo 1.1", children: [ 
				{id:2, title:"Nodo 1.1.1"} 
			]},
			{ id:3, title:"Nodo 1.2"},
			{ id:3, title:"Nodo 1.3"} 
		]
	};
*/	
	var dashboard = Dashboard("viewArea");
	
	var v1 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:false})
	           .newView(0,0);
			   
	var historyTreeChart = HistoryTreeChart(v1.idChart());  
	
	d3.json("historyTreeData-Exemplo-01.json", function(dados) { 

		historyTreeChart
	       .box ( {width:300, height:300})
		   .data(dados);

		v1.conectChart(historyTreeChart,HistoryTreePanel);
		
	});
		   
});