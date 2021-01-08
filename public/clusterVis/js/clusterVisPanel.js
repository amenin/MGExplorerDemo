/**
* clusterVisPanel
*
*/

define([], function () {

	return function ClusterVisPanel(clusterVisChart) {
		let _clusterVisChart = clusterVisChart,
			_width = 170,
			_selectOrder = null,
			_vSelectAneis = [],
			_vDivAneis = [],
			_vAttrSelecionaveis = [],
			_idPanel;     // Assigned in create

		//-----------------------------------
		function _addSelectOrder(idDivPanel) {

			$(idDivPanel).append($("<br>")).append($("<button>").append("X").addClass("exitButton").on("click", (d) => {
				const parent = $(d.target.offsetParent);

				if (parent.css("display") === "none")
					parent.css({ "display": "block" });
				else
					parent.css({ "display": "none" });
			}));

			_selectOrder = $("<select>", { class: "CV-selOrderBy" });
			$(idDivPanel).append($("<br/>")).append($("<label>").append("&nbsp;Order by:")).append(_selectOrder);
			_addItemsSelectOrder();
		}

		//-----------------------------------
		function _addCheckBoxScale(idDivPanel) {
			let div, checkbox;
			checkbox = $("<input>", {
				type: "checkbox"
			}).click(function () {
				_clusterVisChart.acSameScale(this.checked);
			});

			div = $("<div>");
			div.append($("<br/>"));
			div.append(checkbox); //.append( $("<label>").append("Same scale"));
			div.append("Same scale");

			$(idDivPanel).append(div);
			//	  checkbox = $("<input>", { type: "checkbox"}).append("Same scale");
			//	  $(idDivPanel).append( checkbox);	
		}

		//-----------------------------------
		function _addBotoesSelect(idDivPanel) {
			let idDiv = $("<div>", { class: "CV-aneis" });
			$(idDivPanel).append($("<label>").append("&nbsp;"));
			$(idDivPanel).append(idDiv);
			$(idDivPanel + " .CV-aneis").append($("<label>").append("&nbsp;Rings:"));
			$(idDivPanel + " .CV-aneis").append($("<button>", { class: "CV-BtMais" }));
			$(idDivPanel + " .CV-aneis").append($("<button>", { class: "CV-BtMenos" }));

			//------- More button
			$(idDivPanel + " .CV-BtMais").button({
				label: "+"
			}).click(function () {   //------------- Click the plus button
				let vRings, indexUltimo, divAneis, i, indexProcurado;

				vRings = _clusterVisChart.obtemRings();
				indexUltimo = vRings.length - 1;
				if (indexUltimo <= 5) {
					if (vRings[indexUltimo].typeAttr === "V")
						_clusterVisChart.addAttribute(vRings[indexUltimo].indexAttr, "V");
					else
						_clusterVisChart.addAttribute(vRings[indexUltimo].indexAttr, "L");
					divAneis = "#" + _idPanel + " .CV-aneis";

					vRings = _clusterVisChart.obtemRings();   // Updates the ring data
					indexUltimo = vRings.length - 1;

					_vSelectAneis[indexUltimo] = $("<select>", { class: "CV-selAneis" });
					_vDivAneis[indexUltimo] = $("<div>");
					$(_vDivAneis[indexUltimo]).append($("<label>").append("&nbsp;" + (indexUltimo + 1) + ":&nbsp;")).append(_vSelectAneis[indexUltimo]);
					$(divAneis).append(_vDivAneis[indexUltimo]);
					//				$(divAneis).append( $("<br/>") ).append( $("<label>").append("&nbsp;" + (indexUltimo+1) + ":&nbsp;"))
					//						.append(_vSelectAneis[indexUltimo]);

					$("#" + _idPanel + " .CV-panel")

					for (i = 0; i < _vAttrSelecionaveis.length; i++) {
						if (_vAttrSelecionaveis[i] >= 1000)
							_vSelectAneis[indexUltimo].append(new Option(_clusterVisChart.data().nodes.valueTitle[_vAttrSelecionaveis[i] - 1000], _vAttrSelecionaveis[i]));
						else
							_vSelectAneis[indexUltimo].append(new Option(_clusterVisChart.data().nodes.labelTitle[_vAttrSelecionaveis[i]], _vAttrSelecionaveis[i]));
					}


					if (vRings[indexUltimo].typeAttr === "V")
						indexProcurado = vRings[indexUltimo].indexAttr + 1000;
					else
						indexProcurado = vRings[indexUltimo].indexAttr;

					for (i = 0; i < _vAttrSelecionaveis.length; i++) {
						if (_vAttrSelecionaveis[i] === indexProcurado) {
							_vSelectAneis[indexUltimo][0].selectedIndex = i;
							break;
						}
					}

					_addChangeSelectAnel(indexUltimo);
				}

			});

			//------- Button less
			$(idDivPanel + " .CV-BtMenos").button({
				label: "-"
			}).click(function () {
				let vRings;
				vRings = _clusterVisChart.obtemRings();

				if (vRings.length > 1) {
					_vSelectAneis.pop();
					_vDivAneis[_vDivAneis.length - 1].remove();
					_vDivAneis.pop();
					_clusterVisChart.removeAnelExterno();
					$("#" + _idPanel + " .CV-panel")
				}
			}); //.css({"width":25,"text-align": "center"});
		}

		//-----------------------------------	
		function _addItemsSelectOrder() {
			let selOption, sizeLabelTitle, i, sizeValueTitle;

			if (_clusterVisChart.data() != null) {
				selOption = d3.select("#" + _idPanel + " .CV-selOrderBy").selectAll("option");
				if (!selOption.empty())
					selOption.remove();
				sizeLabelTitle = _clusterVisChart.data().nodes.labelTitle.length;
				for (i = 0; i < sizeLabelTitle; i++)
					_selectOrder.append(new Option(_clusterVisChart.data().nodes.labelTitle[i], i));

				sizeValueTitle = _clusterVisChart.data().nodes.valueTitle.length;
				for (i = 0; i < sizeValueTitle; i++)
					_selectOrder.append(new Option(_clusterVisChart.data().nodes.valueTitle[i], i + 1000));  // 100 starts numerical index

				if (_clusterVisChart.indexAttrSort() < 1000)
					_selectOrder[0].selectedIndex = _clusterVisChart.indexAttrSort();
				else
					_selectOrder[0].selectedIndex = _clusterVisChart.indexAttrSort() - 1000 + sizeLabelTitle;

				_selectOrder.change(function () {
					_clusterVisChart.acSortExec(this.value);
				});
			}
		}

		//-----------------------------------		
		function _addChangeSelectAnel(indice) {
			if (indice === 0) {
				_vSelectAneis[indice].change(function () {
					_clusterVisChart.acAlteraAnel(0, this.value); // Trigger the change of the ring attribute
				});
			} else if (indice === 1) {
				_vSelectAneis[indice].change(function () {
					_clusterVisChart.acAlteraAnel(1, this.value); // Trigger the change of the ring attribute
				});
			} else if (indice === 2) {
				_vSelectAneis[indice].change(function () {
					_clusterVisChart.acAlteraAnel(2, this.value); // Trigger the change of the ring attribute
				});
			} else if (indice === 3) {
				_vSelectAneis[indice].change(function () {
					_clusterVisChart.acAlteraAnel(3, this.value); // Trigger the change of the ring attribute
				});
			} else if (indice === 4) {
				_vSelectAneis[indice].change(function () {
					_clusterVisChart.acAlteraAnel(4, this.value); // Trigger the change of the ring attribute
				});
			} else if (indice === 5) {
				_vSelectAneis[indice].change(function () {
					_clusterVisChart.acAlteraAnel(5, this.value); // Trigger the change of the ring attribute
				});
			} else if (indice === 6) {
				_vSelectAneis[indice].change(function () {
					_clusterVisChart.acAlteraAnel(6, this.value); // Trigger the change of the ring attribute
				});
			}
		}

		//-----------------------------------
		function panel() { }

		panel.create = function (idPanel) {
			_idPanel = idPanel;
			let divPanel = $("<div/>", {
				class: "CV-panel"
			}).css({ "width": _width });
			$("#" + _idPanel).append(divPanel);

			//------------- Select for sort order
			_addSelectOrder("#" + _idPanel + " .CV-panel");
			_addCheckBoxScale("#" + _idPanel + " .CV-panel");
			_addBotoesSelect("#" + _idPanel + " .CV-panel");

			return panel;
		};

		//---------------------
		panel.update = function () {
			_addItemsSelectOrder();
		};

		//---------------------
		// Remove all items that have been placed and leave only those that are part of the Ring
		panel.alteraSelectOrder = function () {
			let selOption, i, vRings, indiceAttrSort;

			if (_clusterVisChart.data() != null) {
				vRings = _clusterVisChart.obtemRings();
				selOption = d3.select("#" + _idPanel + " .CV-selOrderBy").selectAll("option");

				if (!selOption.empty())
					selOption.remove();

				for (i = 0; i < vRings.length; i++) {
					if (vRings[i].typeAttr === "V")
						_selectOrder.append(new Option(_clusterVisChart.data().nodes.valueTitle[vRings[i].indexAttr], vRings[i].indexAttr + 1000));
					else
						_selectOrder.append(new Option(_clusterVisChart.data().nodes.labelTitle[vRings[i].indexAttr], vRings[i].indexAttr));
				}

				indiceAttrSort = _clusterVisChart.indexAttrSort();
				if (indiceAttrSort < 1000)
					for (i = 0; i < vRings.length; i++) {
						if (indiceAttrSort === vRings[i].indexAttr) {
							_selectOrder[0].selectedIndex = i;
							break;
						}
					}
				else
					for (i = 0; i < vRings.length; i++) {
						if (indiceAttrSort === vRings[i].indexAttr + 1000) {
							_selectOrder[0].selectedIndex = i;
							break;
						}
					}

			}
		};

		//---------------------
		// Includes select for all added rings
		// It is called clusterVisChart, since it has to be after addAttribute
		panel.incluiSelectAneis = function (vAttrSelecionaveis) {
			let i, j, indexProcurado;
			let vRings = _clusterVisChart.obtemRings();
			let divAneis = "#" + _idPanel + " .CV-aneis";

			for (i = 0; i < vAttrSelecionaveis.length; i++)
				_vAttrSelecionaveis[i] = vAttrSelecionaveis[i];

			$("#" + _idPanel + " .CV-panel")

			for (i = 0; i < vRings.length; i++) {
				_vDivAneis[i] = $("<div>");
				_vSelectAneis[i] = $("<select>", { class: "CV-selAneis" });
				_vDivAneis[i].append($("<label>").append("&nbsp;" + (i + 1) + ":&nbsp;")).append(_vSelectAneis[i]);
				$(divAneis).append(_vDivAneis[i]);
			}

			// Fill in the selects
			for (j = 0; j < vRings.length; j++)
				for (i = 0; i < vAttrSelecionaveis.length; i++) {
					if (vAttrSelecionaveis[i] >= 1000)
						_vSelectAneis[j].append(new Option(_clusterVisChart.data().nodes.valueTitle[vAttrSelecionaveis[i] - 1000], vAttrSelecionaveis[i]));
					else
						_vSelectAneis[j].append(new Option(_clusterVisChart.data().nodes.labelTitle[vAttrSelecionaveis[i]], vAttrSelecionaveis[i]));
				}


			// Assigns initial value to selects
			for (i = 0; i < vRings.length; i++) {
				if (vRings[i].typeAttr === "V")
					indexProcurado = vRings[i].indexAttr + 1000;
				else
					indexProcurado = vRings[i].indexAttr;

				for (j = 0; j < vAttrSelecionaveis.length; j++) {
					if (vAttrSelecionaveis[j] === indexProcurado) {
						_vSelectAneis[i][0].selectedIndex = j;
						break;
					}
				}
			}

			// Attach event change
			for (i = 0; i < vRings.length; i++) {
				if (i === 0) {
					_vSelectAneis[i].change(function () {
						_clusterVisChart.acAlteraAnel(0, this.value); // Trigger the change of the ring attribute
					});
				} else if (i === 1) {
					_vSelectAneis[i].change(function () {
						_clusterVisChart.acAlteraAnel(1, this.value); // Trigger the change of the ring attribute
					});
				} else if (i === 2) {
					_vSelectAneis[i].change(function () {
						_clusterVisChart.acAlteraAnel(2, this.value); // Trigger the change of the ring attribute
					});
				} else if (i === 3) {
					_vSelectAneis[i].change(function () {
						_clusterVisChart.acAlteraAnel(3, this.value); // Trigger the change of the ring attribute
					});
				} else if (i === 4) {
					_vSelectAneis[i].change(function () {
						_clusterVisChart.acAlteraAnel(4, this.value); // Trigger the change of the ring attribute
					});
				} else if (i === 5) {
					_vSelectAneis[i].change(function () {
						_clusterVisChart.acAlteraAnel(5, this.value); // Trigger the change of the ring attribute
					});
				} else if (i === 6) {
					_vSelectAneis[i].change(function () {
						_clusterVisChart.acAlteraAnel(6, this.value); // Trigger the change of the ring attribute
					});
				}
			}
		};

		return panel;
	};

});
