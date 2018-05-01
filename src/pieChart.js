'use strict';

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks, colorPalette } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"
// import { tooltip } from "./tooltip.js"


/*-- 1. Data format
     data type: List of Objects
     Each object has atleast two keys:
     (i) Name
     (ii) Value

    --*/
const pieChart = function() {

    // Customisable chart properties
    let data = [];
    let height = '80vh';
    let width = '80vw';
    let piePosition = 'center'; //['left', 'right', 'center']
    let color = colorPalette(19, 700);

    let colorObj = {};
    let windowResize = true;
    let pieRadius;
    let radius;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const legendWidth = 20;
    const sliceLabels = _.map(data, 'name'); // Slice labels    

    const chart = function(selection) {

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'pie-chart').attr('class', 'pie');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));
        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right - legendWidth; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot
        radius = (pieRadius) ? pieRadius : Math.min(plotH, plotW) / 2;

        const colorObj = {};
        _.forEach(data, function(o, i) { colorObj[o.name] = color[i]; });

        data = _.map(data, d => { d.view = 1; return d; })
        let pie = d3.pie().sort(null).padAngle(0.02).value(function(d) { return d.value; });
        let plotData;
        let currentData;

        const plotCenterXobj = { center: plotStartx + (plotW) / 2, left: plotStartx + radius, right: plotStartx + plotW - radius };
        let plotCenterX = plotCenterXobj[piePosition];
        let plotCenterY = plotStarty + (plotH) / 2;
        let plotCanvas = svg.append('g').attr('id', 'pie-plotCanvas').attr('transform', `translate(${ plotCenterX }, ${ plotCenterY })`);

        const draw = function() {
            plotcurrentData();
            addLegend();
        }

        const plotcurrentData = function() {

            currentData = _.filter(data, function(d) { return d.view == 1; });
            let totalValue = _.sumBy(currentData, d => { return parseFloat(d.value) });
            currentData = _.map(currentData, d => { d.percentage = parseFloat(((d.value / totalValue) * 100).toFixed(2)); return d; });

            plotData = pie(currentData);

            const path = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(2);

            // let pieTooltip = tooltip().header({ datum: function(d) { return d.data.name; } }).prop({
            //     datum: function(d) { return `<div style="margin-bottom: 3px">Frequency: ${d.data.value}</div> <div> Percentage: ${d.data.percentage}%</div>`; }
            // });

            let plotArc = plotCanvas.selectAll(".arc").data(plotData);
            let plotArcGroup = plotArc.enter().append("g").attr("class", "arc");

            plotArc.exit().remove();

            plotArcGroup.append("path")
                .attr("fill", function(d, i) { return colorObj[d.data.name] })
                // .call(pieTooltip)
                .transition()
                .duration(250)
                .attrTween('d', function(d) {
                    const i = d3.interpolate(d.startAngle + 0, d.endAngle);
                    return function(t) { d.endAngle = i(t); return path(d); }
                });

            plotArcGroup.append('line').attr('class', 'labelLine1').transition()
                .delay(250)
                .duration(250)
                .attr('x1', function(d) { return path.centroid(d)[0]; })
                .attr('y1', function(d) { return path.centroid(d)[1]; })
                .attr('x2', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x2 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return x2;
                })
                .attr('y2', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x2 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return m * x2;
                })
                .style('stroke', function(d, i) { return colorObj[d.data.name] });

            plotArcGroup.append('line').attr('class', 'labelLine2').transition()
                .delay(250)
                .duration(250)
                .attr('x1', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x1 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return x1;
                })
                .attr('y1', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x1 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return m * x1;
                })
                .attr('x2', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x1 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return x1 + (mod * 20);
                })
                .attr('y2', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x1 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return m * x1;
                })
                .style('stroke', function(d, i) { return colorObj[d.data.name] });

            plotArcGroup.append('text').attr('class', 'labelText').transition()
                .attr("dy", "0.35em")
                .style("font-size", "0.7em")
                .delay(250)
                .duration(250)
                .attr('transform', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return `translate(${ x + (mod * 25) }, ${ m * x })`;
                })
                .style('text-anchor', function(d) {
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let ta = (mod < 0) ? 'end' : 'start';
                    return ta
                })
                .style('margin', '4px')
                .text(function(d) { return `${d.data.percentage}%`; });

            // plotArcGroup.append("text")
            //     .attr("transform", function(d) { return `translate(${path.centroid(d)})`; })
            //     .attr("dy", "0.35em")
            //     .style("font-size", "0.7em")
            //     .style("text-anchor", "center")
            //     .text(function(d) { return `${d.data.name} ${d.data.percentage}%`; });

            plotArc.select("path")
                // .call(pieTooltip)
                .transition()
                .duration(250)
                .attrTween('d', function(d) {
                    const i = d3.interpolate(d.startAngle + 0, d.endAngle);
                    return function(t) { d.endAngle = i(t); return path(d); }
                })
                .attr("fill", function(d, i) { return colorObj[d.data.name] });

            plotArc.select('line.labelLine1').attr('class', 'labelLine1').transition()
                .delay(250)
                .duration(250)
                .attr('x1', function(d) { return path.centroid(d)[0]; })
                .attr('y1', function(d) { return path.centroid(d)[1]; })
                .attr('x2', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x2 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return x2;
                })
                .attr('y2', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x2 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return m * x2;
                })
                .style('stroke', function(d, i) { return colorObj[d.data.name] });

            plotArc.select('line.labelLine2').attr('class', 'labelLine2').transition()
                .delay(250)
                .duration(250)
                .attr('x1', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x1 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return x1;
                })
                .attr('y1', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x1 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return m * x1;
                })
                .attr('x2', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x1 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return x1 + (mod * 20);
                })
                .attr('y2', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x1 = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return m * x1;
                })
                .style('stroke', function(d, i) { return colorObj[d.data.name] });

            plotArc.select('text.labelText').attr('class', 'labelText').transition()
                .attr("dy", "0.35em")
                .style("font-size", "0.7em")
                .delay(250)
                .duration(250)
                .attr('transform', function(d) {
                    let m = (path.centroid(d)[1] / path.centroid(d)[0]).toFixed(2);
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let x = (mod * ((radius + 10) / (Math.sqrt(1 + (m * m)))));
                    return `translate(${ x + (mod * 25) }, ${ m * x })`;
                })
                .style('text-anchor', function(d) {
                    let mod = path.centroid(d)[0] / Math.abs(path.centroid(d)[0]);
                    let ta = (mod < 0) ? 'end' : 'start';
                    return ta
                })
                .style('margin', '4px')
                .text(function(d) { return `${d.data.percentage}%`; });

            // plotArc.select("text").transition()
            //     .delay(250)
            //     .duration(250)
            //     .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
            //     .attr("dy", "0.35em")
            //     .style("font-size", "0.7em")
            //     .style("text-anchor", "center")
            //     .text(function(d) { return `${d.data.percentage}%`; });

        }

        const addLegend = function() {

            /* -- Adding Legend ----------------------------------------------------- */
            svg.select('.pie.legend').remove();

            let legend = svg.append("g")
                .attr('class', 'pie legend')
                .attr('transform', `translate(${ plotStartx + (plotW)/2 + radius + 60}, ${ plotStarty + 40 })`);

            let legendLabel = legend.selectAll('.pie.legendLabel')
                .data(plotData)
                .enter().append("g")
                .attr("class", "pie legendLabel");

            legendLabel.append("circle")
                .attr("cx", 2.5)
                .attr("cy", function(d, i) { return i * 20; })
                .attr("r", '5px')
                .style("cursor", "pointer")
                .attr("fill", function(d) { return colorObj[d.data.name]; })
                .on("click", function(d, i) {
                    data[i]['view'] = (data[i]['view'] == 0) ? 1 : 0;
                    const fill = (data[i]['view'] == 0) ? "white" : colorObj[d.data.name];
                    const stroke = (data[i]['view'] == 0) ? colorObj[d.data.name] : "none";
                    d3.select(this).attr("fill", fill).attr("stroke", stroke).attr("stroke-width", 2);
                    plotcurrentData();
                });

            legendLabel.append("text")
                .attr("transform", function(d, i) { return `translate(10, ${i * 20})` })
                .attr("dy", "0.35em")
                .style("font-size", "0.8em")
                .text(function(d) { return d.data.name; });

        }

        const updateResize = function() {
            svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
            svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));
            plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
            plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
            plotCenterX = plotCenterXobj[piePosition];
            plotCenterY = plotStarty + (plotH) / 2;
            radius = (pieRadius) ? pieRadius : Math.min(plotH, plotW) / 2;
            plotCanvas.attr('transform', `translate(${ plotCenterX }, ${ plotCenterY })`);

            draw();
        }

        // if (windowResize) { window.onresize = _.debounce(updateResize, 300); }

        draw();
    }

    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        return chart;
    }

    chart.radius = function(_) {
        if (!arguments.length) return radius;
        radius = _;
        return chart;
    }

    chart.piePosition = function(_) {
        if (!arguments.length) return piePosition;
        piePosition = _;
        return chart;
    }

    chart.windowResize = function(_) {
        if (!arguments.length) return windowResize;
        windowResize = _;
        return chart;
    }

    return chart;

}

export { pieChart }