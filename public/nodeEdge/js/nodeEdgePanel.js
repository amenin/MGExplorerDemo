/**
* nodeEdgePanel
*
*/

define([], function () {

	return function NodeEdgePanel(nodeEdgeChart) {
		var _nodeEdgeChart = nodeEdgeChart,
			_width = 180,

			_spanGravity = null,    // Exibe o valor do atributo gravity
			_spanCharge = null,     // Exibe o valor positivo do atributo charge
			_spanLinkDistance = null,   // Exibe o valor do atributo linkDisnce

			_spanNodes = null,    // Quantidade de nodos
			_spanEdges = null,    // Quantidade de arestas

			_sliderGravity = null,
			_sliderCharge = null,
			_sliderLinkDistance = null,

			_searchAutocomplete = null,

			_labelAttr = null,
			_selectAttr = null,
			_br1 = null,
			_br2 = null,

			_vAttrSizeSelecionaveis = [],

			_idPanel;     // Atribuido na fun��o create

		//-------------------------
		function _addStatistics(idDivPanel) {

			$(idDivPanel).append($("<br>")).append($("<button>").append("&times;").addClass("exitButton").on("click", (d) => {
				const parent = $(d.target.offsetParent);

				if (parent.css("display") === "none")
					parent.css({ "display": "block" });
				else
					parent.css({ "display": "none" });
			}));
			_spanNodes = $("<span>");
			_spanEdges = $("<span>");
			$(idDivPanel)
				.append($("<label>").append("&nbsp;Nodes:&nbsp;").append(_spanNodes));
			$(idDivPanel).append($("<br>"))
				.append($("<label>").append("&nbsp;Edges:&nbsp;").append(_spanEdges));
		}

		//-------------------------	
		function _addSliderGravity(idDivPanel) {
			_spanGravity = $("<span>");
			$(idDivPanel).append($("<br>")).append($("<br>"))
				.append($("<label>").append("&nbsp;Gravity: ").append(_spanGravity));

			var divGravity = $("<div>", {
				class: "gravity"
			}).css({ "width": 80, "height": 4 });

			$(idDivPanel).append(divGravity).append($("<br>"));

			_sliderGravity = $(idDivPanel + " .gravity");
			_sliderGravity.slider({
				min: 0,
				max: 3,
				value: 2,
				step: 0.1,
				slide: function (event, ui) {
					_spanGravity.text(ui.value);
				},
				stop: function (event, ui) {
					_nodeEdgeChart.acChangeGravity(ui.value);
				}
			});
		}

		//-------------------------
		function _addSliderCharge(idDivPanel) {
			_spanCharge = $("<span>");
			$(idDivPanel).append($("<br>"))
				.append($("<label>").append("&nbsp;Repulsion: ").append(_spanCharge));

			var divCharge = $("<div>", {
				class: "charge"
			}).css({ "width": 80, "height": 4 });

			$(idDivPanel).append(divCharge).append($("<br>"));

			_sliderCharge = $(idDivPanel + " .charge");
			_sliderCharge.slider({
				min: 50,
				max: 2000,
				value: 2,
				step: 50,
				slide: function (event, ui) {
					_spanCharge.text(ui.value);
				},
				stop: function (event, ui) {
					_nodeEdgeChart.acChangeCharge(ui.value);
				}
			});
		}

		//-------------------------
		function _addSliderLinkDistance(idDivPanel) {
			_spanLinkDistance = $("<span>");
			$(idDivPanel).append($("<br>"))
				.append($("<label>").append("&nbsp;Distance: ").append(_spanLinkDistance));

			var divLinkDistance = $("<div>", {
				class: "linkDistance"
			}).css({ "width": 80, "height": 4 });

			$(idDivPanel).append(divLinkDistance);

			_sliderLinkDistance = $(idDivPanel + " .linkDistance");
			_sliderLinkDistance.slider({
				min: 15,
				max: 300,
				value: 20,
				step: 5,
				slide: function (event, ui) {
					_spanLinkDistance.text(ui.value);
				},
				stop: function (event, ui) {
					_nodeEdgeChart.acChangeLinkDistance(ui.value);
				}
			});
		}

		//-------------------------
		function _addAutocomplete(idDivPanel) {
			_searchAutocomplete = $("<input>", { class: "NE-Autocomplete" }).attr("placeholder", "Search")

			_searchAutocomplete.on("input", (d) => {
				if (d.target.value === "") {
					_nodeEdgeChart.resetHighSearch();
				}
			});
			$(idDivPanel).append($("<br>")).append($("<br>"))
				.append(_searchAutocomplete);
		}

		//-----------------------------------	  

		function panel() { }

		//---------------------
		panel.create = function (idPanel) {

			_idPanel = idPanel;
			
			var divPanel = $("<div/>", {
				class: "NE-panel"
			}).css({ "width": _width });
			$("#" + _idPanel).append(divPanel);


			//------------- Quantidade de nodos e arestas
			_addStatistics("#" + _idPanel + " .NE-panel");

			//------------- Autocomplete
			_addAutocomplete("#" + _idPanel + " .NE-panel");

			//------------- Slider para altera��o do atributo gracity
			_addSliderGravity("#" + _idPanel + " .NE-panel");

			//------------- Slider para altera��o do atributo gracity
			_addSliderCharge("#" + _idPanel + " .NE-panel");

			//------------- Slider para altera��o do atributo gracity
			_addSliderLinkDistance("#" + _idPanel + " .NE-panel");



			return panel;
		}

		//---------------------
		panel.update = function () {

			upStatistics();
			upSliderGravity();
			upSliderCharge();
			upSliderLinkDistance();

			return panel;

			//--------------			
			function upStatistics() {
				_spanNodes.text(_nodeEdgeChart.getQtNodes());
				_spanEdges.text(_nodeEdgeChart.getQtEdges());
			}

			//--------------	
			function upSliderGravity() {
				var minGravity, maxGravity, stepGravity, dif;

				if (_nodeEdgeChart.getGravity() < 0.1) {
					minGravity = Math.round(_nodeEdgeChart.getGravity() * 50) / 100;
					maxGravity = Math.round(_nodeEdgeChart.getGravity() * 150) / 100;
				} else {
					minGravity = Math.round(_nodeEdgeChart.getGravity() * 5) / 10;
					maxGravity = Math.round(_nodeEdgeChart.getGravity() * 15) / 10;
				}
				dif = maxGravity - minGravity;
				if (dif <= 0.1)
					stepGravity = 0.01;
				else
					if (dif <= 0.5)
						stepGravity = 0.05;
					else
						stepGravity = 0.1;

				//console.log(	_nodeEdgeChart.getGravity());	   
				//console.log (minGravity + " " + _nodeEdgeChart.getGravity()+ " " + maxGravity + " " + stepGravity);

				_sliderGravity.slider("option", "min", minGravity);
				_sliderGravity.slider("option", "max", maxGravity);
				_sliderGravity.slider("option", "step", stepGravity);
				_sliderGravity.slider("option", "value", _nodeEdgeChart.getGravity());
				_spanGravity.text(_nodeEdgeChart.getGravity());
			}

			//--------------			
			function upSliderCharge() {
				_sliderCharge.slider("option", "value", _nodeEdgeChart.getCharge());
				_spanCharge.text(_nodeEdgeChart.getCharge());
			}

			//--------------			
			function upSliderLinkDistance() {
				_sliderLinkDistance.slider("option", "value", _nodeEdgeChart.getLinkDistance());
				_spanLinkDistance.text(_nodeEdgeChart.getLinkDistance());
			}

		}
		//---------------------
		// Inclui os select para todos os atributos	

		panel.includeSelectAttr = function (vAttrSizeSelecionaveis) {
			var i;
			for (i = 0; i < vAttrSizeSelecionaveis.length; i++)
				_vAttrSizeSelecionaveis[i] = vAttrSizeSelecionaveis[i];
			_selectAttr = $("<select>", { class: "NE-selAtributo" });
			_br1 = $("<br/>");
			_br2 = $("<br/>");
			_labelAttr = $("<label>").append("&nbsp;Size:");
			$("#" + _idPanel + " .NE-panel").append(_br1).append(_br2).append(_labelAttr).append(_selectAttr);

			for (i = 0; i < vAttrSizeSelecionaveis.length; i++) {
				if (vAttrSizeSelecionaveis[i] >= 1000)
					_selectAttr.append(new Option(_nodeEdgeChart.data().nodes.valueTitle[vAttrSizeSelecionaveis[i] - 1000], vAttrSizeSelecionaveis[i] - 1000));
			}

			_selectAttr.change(function () {
				var valor = +this.value;

				_nodeEdgeChart.acChangeAttrSize(valor);
			});

		}

		panel.removeSelectAttr = function () {
			_selectAttr.remove();
			_br1.remove();
			_br2.remove();
			_labelAttr.remove();
		}

		panel.atualizaAutocomplete = function () {
			var nomes = [], i, c;
			if (_nodeEdgeChart.data().isCluster) {
				console.log(_nodeEdgeChart.data());
				/*			c =0;  // Essa era a primeira implementa��o para buscar pelo nome do cluster
							for (i=_nodeEdgeChart.data().info.qtNodos; i<_nodeEdgeChart.data().nodes.dataNodes.length; i++) {
								nomes[c++] = _nodeEdgeChart.data().nodes.dataNodes[i].key;
							}
				*/
				for (i = 0; i < _nodeEdgeChart.data().info.qtNodos; i++) {
					nomes[i] = _nodeEdgeChart.data().nodes.dataNodes[i].labels[1];
				}

				_searchAutocomplete.autocomplete({
					source: nomes,
					select: function (event, ui) {
						var i, j, nomeCluster = " ";
						for (i = _nodeEdgeChart.data().info.qtNodos; i < _nodeEdgeChart.data().nodes.dataNodes.length; i++) {
							for (j = 0; j < _nodeEdgeChart.data().nodes.dataNodes[i].values.length; j++)
								if (ui.item.value == _nodeEdgeChart.data().nodes.dataNodes[i].values[j].labels[1]) {
									nomeCluster = _nodeEdgeChart.data().nodes.dataNodes[i].key;
									i = 1000;
									break;
								}
						}
						_nodeEdgeChart.acSelectByNameCluster(nomeCluster);
					}
				});
				$(".ui-autocomplete").css("z-index", 1000);
			} else {

				for (i = 0; i < _nodeEdgeChart.data().info.qtNodos; i++) {
					nomes[i] = _nodeEdgeChart.data().nodes.dataNodes[i].labels[1];
				}

				_searchAutocomplete.autocomplete({
					source: nomes,
					select: function (event, ui) {
						_nodeEdgeChart.acSelectByName(ui.item.value);
					}
				});
				$(".ui-autocomplete").css("z-index", 1000);
			}
		}

		//-------------	
		return panel;
	};


})
