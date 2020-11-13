/**
* matrixGlyph
*
*/

define(["model", "libCava", "numericGlyph"], function (Model, LibCava, NumericGlyph) {
	return function MatrixGlyph(idDiv) {

		var _matrixGlyphPanel = null,  // Representa o panel associado aao grafico
			_cellGlyph = NumericGlyph(0),         // objeto que representa o glifo associado a celula
			_grpMatrixGlyph = null,    // Grupo que representa todo o grafico

			_grpOverview = null,	   // Grupo que representa o overview da matriz			
			_grpLeftLegend = null,
			_grpTopLegend = null,
			_grpMatrix = null,

			_grpDragLL = null,
			_grpDragTL = null,
			_grpDragMT = null,

			_grpBarsLL = null,    // Sele��o com todos os grupos das barras da legenda esquerda
			_grpBarsTL = null,
			_grpLines = null,    // Cont�m as linhas com c�lulas em cada uma

			_legend = {              // Barra onde est�o os textos como os nomes dos nodos
				margin: 1,          // Dist�ncia do ret�ngulo da legenda at� a matrix 
				marginText: 1,      // Dist�ncia do texto at� o ret�ngulo
				width: 0,          // (Calculado)Largura da legenda      	
				totalWidth: 0,      // (Calculada) margin + width
				fontHeight: 0,        // (Calculada) altura da fonte da legenda
				coordMin: 0             // Coordenada minima. Limitador do deslocamento da legenda para cima. Igual para x e y
			},

			_overview = {
				rectBk: null,    // Fundo do overview
				rectCur: null     // Cursor
			},

			_cell = {
				height: 0,           // Altura/largura da c�lula (calculado)
				heightMin: 10       // Usada para definir qtVisibleLinesMax (inclui a margem de 1px)
			},

			_cellColorScaleDefault = d3.scale.category10(),
			_fCellColorMapDefault = function (d) {
				return _cellColorMap.colorScale(d);
			},

			_cellColorMap = {
				colorScale: _cellColorScaleDefault,     // Escala de cores usada no mapeamento da cor de fundo das c�lulas
				indexAttrColor: 0,                        // �ndice do atributo que ser� mapeado para cor
				fMap: _fCellColorMapDefault
			},

			_colors = {
				legendBk: "#F0D1B2",
				legendTxt: "black",
				overviewBk: "#F0D1B2",
				overviewCur: "#E6B280"
			},

			_lines = {
				qtVisible: 0,     // Quantidade de linhas/colunas visiveis da matriz (calculado)
				qtMaxVisible: 0,  // Quantidade m�xima de linhas visiveis (calculado)
				qtMinVisible: 0,  // Quantidade m�nima de linhas visiveis (calculado)
				qtTotal: 0        // Quantidade total de linhas da matriz (calculado)
			},

			_tooltips = {
				divTT: null, // Div onde o toolTip ser� inserido
				matrixCell: null,   // Objeto que gerencia o tooltip para a c�lula
				xCell: -1,    // Coluna da c�lula onde est� o tooltip. -1 Se n�o est� ativo
				yCell: -1    // Coluna da c�lula onde est� o tooltip. -1 Se n�o est� ativo			
			},

			_matrixWidth = 0,       // Largura da �rea da matriz (calculado)
			_matrixHeight = 0,      // Altura da �rea da matriz (calculado)

			_idClipLeft = idDiv + "l",    // Id da �rea de recorte da legenda esquerda
			_idClipTop = idDiv + "t",    // Id da �rea de recorte da legenda do topo
			_idClipMatrix = idDiv + "m",  // Id da �rea de recorte da matriz

			_indexAttrSort = 0,  // �ndice do atributo utilizado para o sort (0-primeiro labels[] 1000-primeiro values[])
			_indexAttrLegend = 0,  // �ndice do atributo que ser� impresso na legenda (nodo)
			_vOrder = null,      // Vetor indireto de ordenacao

			_cellCoordScale = d3.scale.ordinal(),    // Escala usada para definir as coordenadas das c�lulas e elementos da legenda
			_overviewScale = d3.scale.linear(),     // Escala usada para definir as coordenada do cursor do overview
			_dragListenerL = null,                   // Listener das legendas
			_dragListenerM = null;	                 // Listener da matriz	

		// ---------------- Modelo 
		var model = Model();
		var lcv = LibCava();

		// ---------------- Atributos geom�tricos do grafico	
		model.margin = { top: 2, right: 2, bottom: 2, left: 2 };
		model.box = { width: 150, height: 150 };

		model.pLegendWidth = 0.15;  // Percentual da largura em rela��o ao model.widthChart
		model.pFontHeight = 0.0225;   // Percentual da altura da fonte em rela�� ao model.widthChart

		model.redraw = 0;        // Quando alterado executa um redesenho	

		// ---------------- Acoes de inicializacao

		var _svg = d3.select("#" + idDiv).append("svg"),  // Cria o svg sem dimensoes	
			_grpChart = _svg.append("g"),               // Grupo que representa a �rea para o gr�fico,		
			_sort = lcv.sort();                        // Cria fun��o de ordena��o
        // Add zoom event
        let _zoomListener = d3.behavior.zoom().on("zoom", _chartZoom);
        _zoomListener.scaleExtent([_zoomListener.scale() * 0.9, _zoomListener.scale() * 1.1]);
        _svg.call(_zoomListener);

		_tooltips.divTT = d3.select("#" + idDiv).append("div")
			.style("display", "none")
			.classed("MG-Tooltip", true),  // Tooltip para o nodo normal	
			_dragListenerL = d3.behavior.drag()
				.on("drag", _chartDragLegend)
				.on("dragend", _chartDragendLegend);

		_dragListenerM = d3.behavior.drag()
			.on("drag", _chartDragMatrix)
			.on("dragend", _chartDragendMatrix);

		// ==========  <CLIPPATH>    
		_grpChart.append("clipPath").attr("id", _idClipTop).append("rect");  // ----- clipPath da legenda do topo	                           
		_grpChart.append("clipPath").attr("id", _idClipLeft).append("rect"); // ----- clipPath da legenda esquerda
		_grpChart.append("clipPath").attr("id", _idClipMatrix).append("rect");  // ----- clipPath da matrix                               

		_grpMatrixGlyph = _grpChart.append("g").attr("class", "MatrixGlyphChart");

		_grpOverview = _grpMatrixGlyph.append("g").attr("class", "MG-Overview");

		_overview.rectBk = _grpOverview.append("rect").style("fill", _colors.overviewBk);
		_overview.rectCur = _grpOverview.append("rect").style("fill", _colors.overviewCur);

		_grpTopLegend = _grpMatrixGlyph.append("g")         // Grupo da legenda superior
			.attr("class", "MG-TopLegend")
			.attr("clip-path", "url(#" + _idClipTop + ")");
		_grpDragTL = _grpTopLegend.selectAll("g")
			.data([{ x: 0, y: 0, cellsInv: 0, t: 0 }])
			.enter()
			.append("g").call(_dragListenerL);

		_grpLeftLegend = _grpMatrixGlyph.append("g")       // Grupo da legenda esquerda
			.attr("class", "MG-LeftLegend")
			.attr("clip-path", "url(#" + _idClipLeft + ")");
		_grpDragLL = _grpLeftLegend.selectAll("g")
			.data([{ x: 0, y: 0, cellsInv: 0, t: 1 }])
			.enter()
			.append("g").call(_dragListenerL);

		_grpMatrix = _grpMatrixGlyph.append("g")           // Grupo da matriz
			.attr("class", "MG-Matrix")
			.attr("clip-path", "url(#" + _idClipMatrix + ")");
		_grpDragMT = _grpMatrix.selectAll("g")
			.data([{ x: 0, y: 0, cellsInvX: 0, cellsInvY: 0 }])
			.enter()
			.append("g").call(_dragListenerM);

		//===================================================

		model.when("box", function (box) {
			_svg.attr("width", box.width).attr("height", box.height);
		});

		//---------------------	
		model.when("margin", function (margin) {
			_grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
		});

		//---------------------		
		model.when(["box", "margin"], function (box, margin) {
			model.widthChart = box.width - margin.left - margin.right,
				model.heightChart = box.height - margin.top - margin.bottom;
		});

		//---------------------
		model.when(["widthChart", "pLegendWidth"], function (widthChart, pLegendWidth) {
			_legend.width = Math.round(model.widthChart * pLegendWidth);
			_legend.totalWidth = _legend.margin + _legend.width;
			_overviewScale.range([0, _legend.totalWidth - 1]);

			_matrixWidth = model.widthChart - _legend.totalWidth;
			_matrixHeight = model.heightChart - _legend.totalWidth;
			_calcVisibleLines();

			_grpChart.select("#" + _idClipMatrix + " rect")
				.attr("width", _matrixWidth)
				.attr("height", _matrixHeight);

			_grpChart.select("#" + _idClipLeft + " rect")
				.attr("width", _legend.totalWidth)
				.attr("height", _matrixHeight);

			_grpChart.select("#" + _idClipTop + " rect")
				.attr("width", _legend.totalWidth)

				.attr("height", _matrixWidth);
			model.redraw += 1;    // Para for�ar o redesenho			
		});

		//---------------------
		model.when(["widthChart", "pFontHeight"], function (widthChart, pFontHeight) {
			_legend.fontHeight = widthChart * pFontHeight;
			model.redraw += 1;    // Para for�ar o redesenho			
		});
		//--------------------- 
		model.when(["data", "widthChart", "heightChart", "redraw"], function (data, widthChart, heightChart, redraw) {

			_matrixGlyphPanel.update();  // Atualiza informa��es no painel associado a t�cnica	  

			_cellCoordScale.rangeBands([0, _matrixWidth * _lines.qtTotal / _lines.qtVisible])
				.domain(_vOrder);

			_cell.height = _calcHeightCell();
			_legend.coordMin = _matrixWidth - _matrixWidth * _lines.qtTotal / _lines.qtVisible;

			_overview.rectBk
				.attr("width", _legend.totalWidth - 1)
				.attr("height", _legend.totalWidth - 1);

			_overview.rectCur
				.attr("x", _overviewScale(-_grpDragMT.datum().cellsInvX))
				.attr("y", _overviewScale(-_grpDragMT.datum().cellsInvY))
				.attr("width", _overviewScale(_lines.qtVisible))
				.attr("height", _overviewScale(_lines.qtVisible));

			_grpLeftLegend.attr("transform", "translate(0," + _legend.totalWidth + ")");
			_grpDragLL.attr("transform", function (d) {
				d.y = d.cellsInv * _cellCoordScale.rangeBand();
				return "translate(0," + d.y + ")";
			});

			_grpTopLegend.attr("transform", "translate(" + _legend.totalWidth + "," + _legend.width + ") rotate(-90)");
			_grpDragTL.attr("transform", function (d) {
				d.y = d.cellsInv * _cellCoordScale.rangeBand();
				return "translate(0," + d.y + ")";
			});

			_grpMatrix.attr("transform", "translate(" + _legend.totalWidth + "," + _legend.totalWidth + ")");
			_grpDragMT.attr("transform", function (d) {
				d.x = d.cellsInvX * _cellCoordScale.rangeBand();
				d.y = d.cellsInvY * _cellCoordScale.rangeBand();
				return "translate(" + d.x + "," + d.y + ")";
			});
			_appendLeftLegend(data);
			_appendTopLegend(data);
			_appendMatrix(data);
		});
		//--------------------------------- Funcoes privadas

		function _appendLeftLegend(data) {

			if (_grpBarsLL != null)
				_grpBarsLL.remove();

			_grpBarsLL = _grpDragLL.selectAll("g")
				.data(data.nodes.dataNodes)
				.enter()
				.append("g")
				.attr("transform", function (d, i) { return "translate(0," + _cellCoordScale(i) + ")"; });

			_grpBarsLL.append("rect")
				.attr("class", "GM-node")
				.attr("width", _legend.width)
				.attr("height", _cell.height)
				.style("fill", _colors.legendBk);

			_grpBarsLL.append("text")
				.attr("class", "GM-node")
				.attr("x", _legend.marginText)       // -3 margem do texto em rela��o ao ret�ngulo onde ele est� inserido            
				.attr("y", _cellCoordScale.rangeBand() / 2) // Foi usado para centralizar o texto na linha da matriz
				.attr("dy", ".2em")
				.attr("text-anchor", "start")
				.style("font", _legend.fontHeight + "px sans-serif")
				.style("fill", _colors.legendTxt)
				.text(function (d, i) { return _adjustLengthText(d.labels[1], 12); })
				.append("title")
				.text(d=> d.labels[1]);
		}

		/**
         * _textCentroid
         *
         * Adjusts the size of the text that will be printed in the centroid title
         */
		function _adjustLengthText(stText, limit) {
			if (stText.length > limit)
				return stText.slice(0, limit) + "...";
			else
				return stText;
		}

		//---------------------		
		function _appendTopLegend(data) {
			if (_grpBarsTL != null)
				_grpBarsTL.remove();

			_grpBarsTL = _grpDragTL.selectAll("g")
				.data(data.nodes.dataNodes)
				.enter()
				.append("g")
				.attr("transform", function (d, i) { return "translate(0," + _cellCoordScale(i) + ")"; });

			_grpBarsTL.append("rect")
				.attr("class", "GM-node")
				.attr("width", _legend.width)
				.attr("height", _cell.height)
				.style("fill", _colors.legendBk);

			_grpBarsTL.append("text")
				.attr("class", "GM-node")
				.attr("x", _legend.marginText)       // -3 margem do texto em rela��o ao ret�ngulo onde ele est� inserido            
				.attr("y", _cellCoordScale.rangeBand() / 2) // Foi usado para centralizar o texto na linha da matriz
				.attr("dy", ".2em")
				.attr("text-anchor", "start")
				.style("font", _legend.fontHeight + "px sans-serif")
				.style("fill", _colors.legendTxt)
				.text(function (d, i) { return _adjustLengthText(d.labels[1], 12); })
				.append("title")
				.text(d=> d.labels[1]);
		}

		//---------------------		
		function _appendMatrix(data) {
			if (_grpLines != null)
				_grpLines.remove();

			_cellGlyph.calcScale(_cellCoordScale.rangeBand());
			_grpLines = _grpDragMT.selectAll("g")
				.data(data.matrix)
				.enter()
				.append("g")
				.attr("class", "MG-Line")
				.attr("transform", function (d, i) { return "translate(0," + _cellCoordScale(i) + ")"; })
				.each(function (d, i) {          // this � a refer�ncia para cada elemento da sele��o .line
					drawCells(d, this);    // Desenha cada c�lula da matriz
				});

			function drawCells(d, elemThis) {
				var cells = d3.select(elemThis).selectAll(".MG-Cell")
					.data(d.filter(function (d) { return d.exist; }))  // Seleciona as c�lulas que possuem dados
					.enter()
					.append("g")
					.attr("class", "MG-Cell")
					.attr("transform", function (d, i) { return "translate(" + _cellCoordScale(d.x) + ",0)"; }) // Inclui grupos de cada c�lula da linha
					.on("mouseenter", _onMouseEnterNode)
					.on("mouseleave", _onMouseLeaveNode);

				cells.append("rect")
					.attr("width", _calcHeightCell())
					.attr("height", _calcHeightCell())
					.style("fill", function (d) {
						if (_cellColorMap.indexAttrColor >= 1000) {
							return _cellColorMap.fMap(d.values[_cellColorMap.indexAttrColor - 1000]);
						}
						else
							return _cellColorMap.fMap(d.labels[_cellColorMap.indexAttrColor]);
					});
				_cellGlyph.draw(cells);
			}
		}

        /**
         * Zoom event
         */
        function _chartZoom() {
            _zoomListener.scaleExtent([_zoomListener.scale() * 0.9, _zoomListener.scale() * 1.1]);
            _grpChart.attr("transform", "translate(" + d3.event.translate + ")" + " scale(" + d3.event.scale + ")")
        }

		/**
		 * _onMouseOverNode
		 */
		function _onMouseEnterNode(d) {
			if (_tooltips.matrixCell != null)
				_tooltips.matrixCell.create(_tooltips.divTT, d);
			//		console.log("Mouse over:" + d.x + "," + d.y);	
			//		if (_tooltips.xCell == -1) {
			//			_tooltips.xCell = d.x;
			//			_tooltips.yCell = d.y;
			//			console.log("Mouse over");		
			//		}			
		}

		/**
		 * _onMouseOutNode
		 */
		function _onMouseLeaveNode(d) {
			if (_tooltips.matrixCell != null)
				_tooltips.matrixCell.remove();
			//		if (_tooltips.xCell != d.x || _tooltips.yCell != d.y) {
			//			_tooltips.xCell = _tooltips.yCell	= -1;
			//				console.log(this);

			//		}

		}

		/**
		 * _calcVisibleLines
		 * 
		 * Determina os limites para as linhas visiveis
		 */
		function _calcVisibleLines() {
			_lines.qtMaxVisible = Math.floor(_matrixHeight / _cell.heightMin);

			if (_lines.qtMaxVisible > 3)
				_lines.qtMinVisible = 3;
			else
				_lines.qtMinVisible = 1;

			if (_lines.qtMaxVisible > _lines.qtTotal)
				_lines.qtMaxVisible = _lines.qtTotal;

			if (_lines.qtMaxVisible < _lines.qtVisible)
				_lines.qtVisible = _lines.qtMaxVisible;
		};

		/**
		 * _calcHeightCell
		 * 
		 * Calcula a altura/largura da c�lula. � a mesma para as barras da legenda
		 */
		function _calcHeightCell() {
			var h = _cellCoordScale.rangeBand();
			if (h > 2)
				h -= 1;  // Ajusta para margem de 1 px entre c�lulas
			return h;
		};

		/**
		 * _limCoord
		 * 
		 * Limita o valor da coordenada
		 */
		function _limCoord(coord) {
			if (coord < _legend.coordMin)
				return _legend.coordMin;
			else
				if (coord > 0)
					return 0;
				else
					return coord;
		};

		function _chartDragLegend(d) {
			var temp;

			d.y += d3.event.dy;
			d.y = _limCoord(d.y);

			d3.select(this).attr("transform", "translate(0," + d.y + ")");
			temp = _grpDragMT.datum();
			if (d.t == 0) {
				temp.x = d.y;
				_overview.rectCur.attr("x", _overviewScale(-Math.round(d.y / _cellCoordScale.rangeBand())));
			} else {
				temp.y = d.y;
				_overview.rectCur.attr("y", _overviewScale(-Math.round(d.y / _cellCoordScale.rangeBand())));
			}
			_grpDragMT.attr("transform", "translate(" + temp.x + "," + temp.y + ")");
		}

		function _chartDragendLegend(d) {
			var temp;
			d.cellsInv = Math.round(d.y / _cellCoordScale.rangeBand());
			d.y = d.cellsInv * _cellCoordScale.rangeBand();
			d3.select(this).attr("transform", "translate(0," + d.y + ")");
			temp = _grpDragMT.datum();
			if (d.t == 0) {
				temp.x = d.y;
				temp.cellsInvX = d.cellsInv;
			} else {
				temp.y = d.y;
				temp.cellsInvY = d.cellsInv;
			}
			_grpDragMT.attr("transform", "translate(" + temp.x + "," + temp.y + ")");
		}

		function _chartDragMatrix(d) {
			var tempL, tempT;

			d.x += d3.event.dx;
			d.x = _limCoord(d.x);

			d.y += d3.event.dy;
			d.y = _limCoord(d.y);

			_grpDragMT.attr("transform", "translate(" + d.x + "," + d.y + ")");
			_grpDragLL.datum().y = d.y;
			_grpDragTL.datum().y = d.x;

			_overview.rectCur
				.attr("x", _overviewScale(-Math.round(d.x / _cellCoordScale.rangeBand())))
				.attr("y", _overviewScale(-Math.round(d.y / _cellCoordScale.rangeBand())));
			_grpDragLL.attr("transform", "translate(0," + d.y + ")");
			_grpDragTL.attr("transform", "translate(0," + d.x + ")");
		}

		function _chartDragendMatrix(d) {
			var temp;
			d.cellsInvX = Math.round(d.x / _cellCoordScale.rangeBand());
			d.cellsInvY = Math.round(d.y / _cellCoordScale.rangeBand());

			d.x = d.cellsInvX * _cellCoordScale.rangeBand();
			d.y = d.cellsInvY * _cellCoordScale.rangeBand();

			_grpDragMT.attr("transform", "translate(" + d.x + "," + d.y + ")");
			_grpDragLL.attr("transform", "translate(0," + d.y + ")");
			_grpDragTL.attr("transform", "translate(0," + d.x + ")");
		}

		//--------------------------------- Funcoes publicas	  

		function chart() { }

		//---------------------	 
		chart.box = function (_) {
			if (!arguments.length)
				return model.box;
			model.box = _;

			return chart;
		}

		//---------------------
		// Essa fun��o � necess�rio em todas as t�cnicas
		// � chamada internamente na conectChart	
		chart.panel = function (_) {
			if (!arguments.length)
				return _matrixGlyphPanel;
			_matrixGlyphPanel = _;

			return chart;
		}

		//---------------------	 
		chart.data = function (_) {
			var qtLabel = 0, qtValue = 0;
			if (!arguments.length)
				return model.data;
			model.data = _;
			if (model.data.nodes.labelTitle != null)
				qtLabel = model.data.nodes.labelTitle.length;

			if (model.data.nodes.valueTitle != null)
				qtValue = model.data.nodes.valueTitle.length;

			_sort.inic(qtLabel, qtValue).data(model.data.nodes.dataNodes);
			_sort.exec(_indexAttrSort);
			_vOrder = _sort.getVetOrder();

			_lines.qtTotal = model.data.nodes.dataNodes.length;
			_lines.qtVisible = model.data.nodes.dataNodes.length;

			_overviewScale.domain([0, _lines.qtTotal]);

			_calcVisibleLines();

			_grpDragTL.datum({ x: 0, y: 0, cellsInv: 0, t: 0 });
			_grpDragLL.datum({ x: 0, y: 0, cellsInv: 0, t: 1 });
			_grpDragMT.datum({ x: 0, y: 0, cellsInvX: 0, cellsInvY: 0 });

			_cellGlyph.data(_);
			if (_matrixGlyphPanel != null)
				_matrixGlyphPanel.updateSelect();
			return chart;
		}

		//---------------------	 
		chart.indexAttrSort = function (_) {
			if (!arguments.length)
				return _indexAttrSort;
			_indexAttrSort = _;

			return chart;
		}

		//---------------------	 
		chart.indexAttrLegend = function (_) {
			if (!arguments.length)
				return _indexAttrLegend;
			_indexAttrLegend = _;

			return chart;
		}

		//---------------------	 
		chart.indexAttrCellColor = function (_) {
			if (!arguments.length)
				return _cellColorMap.indexAttrColor;
			_cellColorMap.indexAttrColor = _;

			return chart;
		}

		//---------------------	 
		chart.pLegendWidth = function (_) {
			if (!arguments.length)
				return model.pLegendWidth;
			model.pLegendWidth = _;

			return chart;
		}

		//---------------------	 
		chart.cellColorsMap = function (colors) {

			if (!arguments.length) {
				_cellColorMap.colorScale = _cellColorScaleDefault;
				_cellColorMap.fMap = _fCellColorMapDefault;
			}
			else
				if (typeof colors === "function")
					_cellColorMap.fMap = colors;
				else
					_cellColorMap.colorScale = d3.scale.ordinal().domain(d3.range(colors.length)).range(colors);
			return chart;
		}

		//---------------------	 
		chart.setTTMatrixCell = function (_) {
			_tooltips.matrixCell = _;

			return chart;
		}
		//---------------------	 
		chart.getMaxVisibleLines = function () {
			return _lines.qtMaxVisible;
		}

		//---------------------	 
		chart.getMinVisibleLines = function () {
			return _lines.qtMinVisible;
		}

		//---------------------	 
		chart.getVisibleLines = function () {
			return _lines.qtVisible;
		}

		chart.debug = function () {
			console.log(">>>>>DEBUG");
			console.log(_lines);
			console.log(_matrixHeight);
			console.log(_legend);
			console.log(model.heightChart);
		}

		//---------------------	 
		chart.pFontHeight = function (_) {
			if (!arguments.length)
				return model.pFontHeight;
			model.pFontHeight = _;

			return chart;
		}

		//---------------------	 
		chart.glyph = function (_) {
			if (!arguments.length)
				return _cellGlyph;
			_cellGlyph = _;

			return chart;
		}
		/*	
			  //---------------------	 
			chart.setGlyph = function(idGlyph) {
			  _cellGlyph = NumericGlyph(idGlyph);
			  return chart;
			}
		
			
			  //---------------------	 
			chart.glyphIndexMapAttr = function(vet) {
			  _cellGlyph.indexMapAttr(vet);
			  return chart;
			}
		*/
		//======== Fun�oes de a��es	 
		chart.acSortExec = function (_) {
			_indexAttrSort = _;
			_sort.exec(_indexAttrSort);
			_vOrder = _sort.getVetOrder();

			_cellCoordScale.domain(_vOrder);

			_grpBarsLL.transition().duration(800)
				.attr("transform", function (d, i) { return "translate(0," + _cellCoordScale(i) + ")"; });
			_grpBarsTL.transition().duration(800)
				.attr("transform", function (d, i) { return "translate(0," + _cellCoordScale(i) + ")"; });

			_grpLines.transition().duration(800)
				.attr("transform", function (d, i) { return "translate(0," + _cellCoordScale(i) + ")"; })
				.selectAll(".MG-Cell")
				.attr("transform", function (d, i) { return "translate(" + _cellCoordScale(d.x) + ",0)"; });


			return chart;
		}

		//---------------------	 	
		chart.acChangeAttrLegend = function (_) {
			_indexAttrLegend = _;

			_grpBarsLL.selectAll("text")
				.text(function (d, i) { return d.labels[_indexAttrLegend]; });

			_grpBarsTL
				.selectAll("text")
				.text(function (d, i) { return d.labels[_indexAttrLegend]; });
		}

		//---------------------	 
		chart.acChangeVisibleLines = function (qtLines) {
			var tempTL = _grpDragTL.datum(),
				tempLL = _grpDragLL.datum(),
				tempMT = _grpDragMT.datum(),
				dLines = qtLines - _lines.qtVisible;

			tempTL.cellsInv = calcCellsInv(dLines, tempTL.cellsInv);
			tempLL.cellsInv = calcCellsInv(dLines, tempLL.cellsInv);
			tempMT.cellsInvX = tempTL.cellsInv;
			tempMT.cellsInvY = tempLL.cellsInv;
			_lines.qtVisible = qtLines;

			model.redraw += 1;

			function calcCellsInv(dLines, cellsInv) {
				if (dLines > _lines.qtTotal - _lines.qtVisible + cellsInv)
					return (qtLines - _lines.qtTotal); // cellsInv possui valor negativo  
				return cellsInv;
			}

		}

		return chart;
	};


});