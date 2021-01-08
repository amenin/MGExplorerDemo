require(["dashboard","databaseUFRGS2004","irisChart","irisPanel"],function (Dashboard,DatabaseUFRGS2004,IrisChart,IrisPanel) {

	var databaseUFRGS = DatabaseUFRGS2004();
	var dados = databaseUFRGS.getDataIrisNew(155);
	console.log(dados);
	
	
	var dashboard = Dashboard("viewArea");
	
	var v1 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(0,0);  
	var irisChart = IrisChart(v1.idChart());  
   
    irisChart
	       .box ( {width:400, height:400})
//	       .pOuterRadius(0.70)
//		   .data(databaseUFRGS.getDataIris(110));		   
		   .data(dados);

    v1.conectChart(irisChart,IrisPanel);
	
	
	
//    setTimeout(function () { irisChart.pMaxHeightBar(0.15) }, 3000);
	
	
	
//	setTimeout(function () { /*irisChart.data(databaseUFRGS.getDataIris(109))*/}, 3000);
/*	
	var v2 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(100,0);  
	var irisChart2 = IrisChart(v2.idChart());  
   
    irisChart2.box ( {width:200, height:200})
		   .data(databaseUFRGS.getDataIris(110));

    v2.conectChart(irisChart2);
*/	
/*	
	setInterval(function () {
//	  var pInnerRadius = irisChart.pOuterRadius();
//	  pInnerRadius -= 0.01;
//	  irisChart.pOuterRadius(pInnerRadius)
      irisChart.data(databaseUFRGS.getDataIris(112));
    }, 3000);
*/
	
/*
		dados.forEach( 
			function (d,i) {
			    console.log(d.labels[0])
			}			
	);
*/
	
});