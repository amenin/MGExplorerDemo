require(["dashboard","circleChart","circlePanel"],function (Dashboard,CircleChart,CirclePanel) {

	var dashboard = Dashboard("viewArea");
	
	var v1 = dashboard
	           .configureView({barTitle:true, btTool:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(50,50);  // Cria a view no dashboard na posição indicada
	var circleChart = CircleChart(v1.idChart());  // Cria o chart na view
	                                              // Redimensiona a view
   
    circleChart
	   .box ( {width: 150, height: 150})	   
	   .margin ( {top: 5, right: 5, bottom: 5, left: 5} )
	   .data([ {valor:100, idade:50}])
	   .rAttribute("valor");

    v1.conectChart(circleChart,CirclePanel);
	
/*	
	var v2 = dashboard.newView(null,100,100);  // Cria a view no dashboard na posição indicada
	var circleChart2 = CircleChart(v2.idChart());  // Cria o chart na view
	                                              // Redimensiona a view
												   
//	dashboard.newView(null,100,100);	
   
    circleChart2
	   .box ( {width: 50, height: 50})	   
	   .margin ( {top: 5, right: 5, bottom: 5, left: 5} )
	   .data([ {valor:100, idade:50}])
	   .rAttribute("valor");

    v2.conectChart(circleChart2);
*/	
});