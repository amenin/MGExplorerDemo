require(["dashboard","databaseSoccer2013","matrixGlyphChart","matrixGlyphPanel","numericGlyph","databaseUFRGS2004"],
                     function (Dashboard,DatabaseSoccer2013,MatrixGlyphChart,MatrixGlyphPanel,NumericGlyph,DatabaseUFRGS2004) {

	var databaseSoccer = DatabaseSoccer2013();
	var databaseUFRGS = DatabaseUFRGS2004();
	
//	var dados = databaseSoccer.getDataGraph();
	var dados = databaseSoccer.getDataMatrix(20);

//	var dados_2 = databaseSoccer.getDataMatrix(20);
	var dados_2 = databaseUFRGS.getDataMatrix(10);	
	
	console.log(dados_2);
	var dashboard = Dashboard("viewArea");
	
	var v1 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(0,0);  
	var matrixGlyphChart = MatrixGlyphChart(v1.idChart());  
    var corScale =  d3.scale.category20();

	var glyphTwoCircle = NumericGlyph(2);
	glyphTwoCircle.indexMapAttr([1,8]);
	
	var glyphTwinBars = NumericGlyph(3);
	glyphTwinBars.indexMapAttr([2,9,3,10,5,11,6,12]);  // 2-9 Uma barra, 3-10 Outra barra, 5-11 Outra barra

	var glyphStar = NumericGlyph(4);
	glyphStar.indexMapAttr([2,3,4,5,9]);  
	
    matrixGlyphChart
	       .box ( {width:500, height:500})
           .indexAttrSort(0)     // Atributo 0 numérico. Deve estar antes de data()
           .indexAttrLegend(0)     //  Deve estar antes de data()
		   .indexAttrCellColor(1015)
		   .glyph(glyphStar)
		   .cellColorsMap(["#33ff33","#ffd636","#ff5959"])
//		   .cellColorsMap()		   
//		   .cellColorsMap( function(d) { return corScale(d); } )		   
		   .data(dados);
		   
		   v1.conectChart(matrixGlyphChart,MatrixGlyphPanel);
		   
//-------------------- Outro grafico Configuração para DataUFRGS
	var v2 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(600,0);
			   
	var matrixGlyphChart_2 = MatrixGlyphChart(v2.idChart());  
	var glyphCircle_2 = NumericGlyph(1);
	    glyphCircle_2.indexMapAttr([0])
		 .color("green");
	
    matrixGlyphChart_2
	       .box ( {width:200, height:200})
           .indexAttrSort(0)     // Atributo 0 numérico. Deve estar antes de data()
           .indexAttrLegend(0)     //  Deve estar antes de data()
		   .indexAttrCellColor(1001)
		   .glyph(glyphCircle_2)		   
		   .cellColorsMap(["#33ff33","#ffd636","#ff5959"])
//		   .cellColorsMap()		   
//		   .cellColorsMap( function(d) { return corScale(d); } )		   
		   .data(dados_2);

		   v2.conectChart(matrixGlyphChart_2,MatrixGlyphPanel);		   


// COnfiguração para DataSoccer
/*			   
	var matrixGlyphChart_2 = MatrixGlyphChart(v2.idChart());  
	var glyphCircle_2 = NumericGlyph(1);
	    glyphCircle_2.indexMapAttr([0])
		 .color("green");
	
    matrixGlyphChart_2
	       .box ( {width:200, height:200})
           .indexAttrSort(0)     // Atributo 0 numérico. Deve estar antes de data()
           .indexAttrLegend(1)     //  Deve estar antes de data()
		   .indexAttrCellColor(1015)
		   .glyph(glyphCircle_2)		   
		   .cellColorsMap(["#33ff33","#ffd636","#ff5959"])
//		   .cellColorsMap()		   
//		   .cellColorsMap( function(d) { return corScale(d); } )		   
		   .data(dados_2);

		   v2.conectChart(matrixGlyphChart_2,MatrixGlyphPanel);		   

*/

		   
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