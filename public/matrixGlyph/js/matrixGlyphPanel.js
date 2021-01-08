/**
* matrixGlyphPanel
*
*/

define([], function () {

	return function MatrixGlyphPanel(matrixGlyphChart) {
		var _matrixGlyphChart = matrixGlyphChart,
			_width = 180,
			_spanVisibleLines = null,  // Exibe o n�mero de linhas visiveis no painel
			_divSlider = null,
			_selectLegend = null,
			_selectOrder = null,
			_idPanel;     // Atribuido na fun��o create

		function _addItemsSelectLegend() {
			var selOption, sizeLabelTitle, i;

			if (_matrixGlyphChart.data() != null) {
				selOption = d3.select("#" + _idPanel + " .MG-selLegend").selectAll("option");
				if (!selOption.empty())
					selOption.remove();

				sizeLabelTitle = _matrixGlyphChart.data().nodes.labelTitle.length;
				for (i = 0; i < sizeLabelTitle; i++)
					_selectLegend.append(new Option(_matrixGlyphChart.data().nodes.labelTitle[i], i));

				_selectLegend[0].selectedIndex = _matrixGlyphChart.indexAttrLegend();

				_selectLegend.change(function () {
					_matrixGlyphChart.acChangeAttrLegend(parseInt(this.value));
				});
			}
		}

		function _addItemsSelectOrder() {
			var selOption, sizeLabelTitle, i, sizeValueTitle;

			if (_matrixGlyphChart.data() != null) {
				selOption = d3.select("#" + _idPanel + " .MG-selOrder").selectAll("option");
				if (!selOption.empty())
					selOption.remove();

				sizeLabelTitle = _matrixGlyphChart.data().nodes.labelTitle.length;
				for (i = 0; i < sizeLabelTitle; i++)
					_selectOrder.append(new Option(_matrixGlyphChart.data().nodes.labelTitle[i], i));

				sizeValueTitle = _matrixGlyphChart.data().nodes.valueTitle.length;
				for (i = 0; i < sizeValueTitle; i++)
					_selectOrder.append(new Option(_matrixGlyphChart.data().nodes.valueTitle[i], i + 1000));  // 100 come�a �ndice num�ricos	  
				// S� funciona quando todos os atributos forem incluidos no <select>			   
				// Seta o item selecionado
				if (_matrixGlyphChart.indexAttrSort() < 1000)
					_selectOrder[0].selectedIndex = _matrixGlyphChart.indexAttrSort();
				else
					_selectOrder[0].selectedIndex = _matrixGlyphChart.indexAttrSort() - 1000 + sizeLabelTitle;

				_selectOrder.change(function () {
					_matrixGlyphChart.acSortExec(this.value);
				});
			}
		}

		//-------------------------
		function _addSelectLegend(idDivPanel) {
			$(idDivPanel).append($("<button>").append("X").addClass("exitButton").on("click", (d) => {
				const parent = $(d.target.offsetParent);

				if (parent.css("display") === "none")
					parent.css({ "display": "block" });
				else
					parent.css({ "display": "none" });
			}));
			_selectLegend = $("<select>", { class: "MG-selLegend" });
			$(idDivPanel).append($("<br/>")).append($("<label>").append("&nbsp;Node:")).append(_selectLegend);
			_addItemsSelectLegend();
		}

		//-------------------------
		function _addSelectOrder(idDivPanel) {
			_selectOrder = $("<select>", { class: "MG-selOrder" });
			$(idDivPanel).append($("<br/>")).append($("<label>").append("&nbsp;Order by:")).append(_selectOrder);
			_addItemsSelectOrder();
		}

		//-------------------------
		function _addSliderLines(idDivPanel) {
			_spanVisibleLines = $("<span/>");

			$(idDivPanel).append($("<br>")).append($("<br>"))
				.append($("<label>").append("&nbsp;Visible lines: ").append(_spanVisibleLines));

			//	   $(idDivPanel).append( $("<label/>").append("&nbsp;Visible lines:").append(_spanVisibleLines));
			_spanVisibleLines.text(2);

			var divLinesVisible = $("<div/>", {
				class: "MG-visible-lines"
			}).css({ "width": 80, "height": 4 });

			$(idDivPanel).append(divLinesVisible);

			_divSlider = $(idDivPanel + " .MG-visible-lines");
			_divSlider.slider({
				min: 1,
				max: 3,
				value: 2,
				slide: function (event, ui) {
					//				     matrixPaneltThis.obj.matrixChart.acChangeVisibleLines( ui.value);
					_spanVisibleLines.text(ui.value);
				},
				stop: function (event, ui) {
					_matrixGlyphChart.acChangeVisibleLines(ui.value);
				}
			});
		}

		//-----------------------------------	  

		function panel() { }

		//---------------------
		panel.create = function (idPanel) {
			_idPanel = idPanel;
			var divPanel = $("<div/>", {
				class: "MG-panel"
			})
			$("#" + _idPanel).append(divPanel);

			//------------- Select para a sele��o da legenda
			_addSelectLegend("#" + _idPanel + " .MG-panel");

			//------------- Select para a ordem de classifica��o
			_addSelectOrder("#" + _idPanel + " .MG-panel");

			//------------- Slider para altera��o do n�mero de linhas visiveis
			_addSliderLines("#" + _idPanel + " .MG-panel");
			return panel;
		}

		//---------------------
		panel.update = function () {
			_divSlider.slider("option", "min", _matrixGlyphChart.getMinVisibleLines());
			_divSlider.slider("option", "max", _matrixGlyphChart.getMaxVisibleLines());
			_divSlider.slider("option", "value", _matrixGlyphChart.getVisibleLines());
			_spanVisibleLines.text(_matrixGlyphChart.getVisibleLines());
			return panel;
		}

		// Criado para ser chamado somente quando os dados foram atualizados 
		panel.updateSelect = function () {
			_addItemsSelectLegend();
			_addItemsSelectOrder();

			return panel;
		}

		return panel;
	};


})
