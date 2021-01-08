/**
* nodeEdgePanel
*
*/

define(["model"], function (Model) {

	return function NodeEdgeLegend(nodeEdgeChart) {
		var _nodeEdgeChart = nodeEdgeChart,
			_width = 120,

			_idLegend,
			_idDiv,
			_colorLabels = ['CNRS', 'CNRS + Inria', 'Inria'],
			_model = Model();     // Atribuido na fun��o create

		//-------------------------
		function _addLegend() {

			$(_idDiv).append($("<br>")).append($("<button>").append("&times;").addClass("exitButton").on("click", (d) => {
				const parent = $(d.target.offsetParent);

				if (parent.css("display") === "none")
					parent.css({ "display": "block" });
				else
					parent.css({ "display": "none" });
			}));

			

		}


		//-----------------------------------	  

		function legend() { }

			//---------------------
			legend.create = function (idPanel) {

				_idLegend = idPanel;
				_idDiv = "#" + _idLegend + " .NE-panel";

				
				var divPanel = $("<div/>", {
					class: "NE-panel"
				}).css({ "width": _width });
				
				$("#" + _idLegend).append(divPanel);

				//------------- Quantidade de nodos e arestas
				_addLegend();

				return legend;
			}

			legend.update = function() {
				let top = 15,
					left = 10;

				const colorScale = _nodeEdgeChart.getColorScale()

				const svg = d3.select(_idDiv)
					.append('svg')
					.attr('width', '100%')
					.attr('height', '100px')

				svg.append('text')
					.attr('y', top)
					.text("Research Institution")

				top += 20
				const group = svg.selectAll('g')
					.data(_nodeEdgeChart.getColorBreaks())
					.enter()
						.append('g')

				
				group.append('circle')
					.attr('r', '5')
					.attr('cx', left)
					.attr('cy', (_,i) => top + (15 * i))
					.style('fill', d => colorScale(d))

				group.append('text')
					.attr('x', left + 10)
					.attr('y', (_,i) => top + 5 + (15 * i))
					.text(d => _colorLabels[d-1])
				
				
			}

		//-------------	
		return legend;
	};


})
