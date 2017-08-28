'use strict';

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks, colorPalette } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"
import { tooltip } from "./tooltip.js"


const pieDatum = function(data) {
    const kmerLables = { 1: 'Monomer', 2: 'Dimer', 3: 'Trimer', 4: 'Tetramer', 5: 'Pentamer', 6: 'Hexamer' };
    let pieData = { 'Monomer': 0, 'Dimer': 0, 'Trimer': 0, 'Tetramer': 0, 'Pentamer': 0, 'Hexamer': 0 };
    for (let d in data) {
        d = data[d];
        let kmer = kmerLables[d.name.length];
        pieData[kmer] += parseInt(d.value);
    }
    const total = _.sum(Object.values(pieData));

    pieData = _.map(Object.keys(pieData), function(d) {
        return { name: d, value: pieData[d], percentage: Number(((pieData[d] * 100) / total).toFixed(2)), view: 1 }
    });
    return pieData;
}


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
    let color = colorPalette(19, 700);

    let colorObj = {};
    let windowResize = true;
    let radius;

    let updateData;
    const margin = { top: 40, right: 40, bottom: 40, left: 40 };

    const legendWidth = 20;
    const sliceLabels = _.map(data, 'name'); // Slice labels    

    const chart = function(selection) {

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'pie-chart').attr('class', 'pie');
        const svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        const svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));
        const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        const plotW = svgW - margin.left - margin.right - legendWidth; // Calculating the actual height of the plot
        const plotStartx = margin.left; // X-coordinate of the start of the plot
        const plotStarty = margin.top; // Y-coordinate of the start of the plot

        radius = _.min([plotH, plotW]) / 2;

        const colorObj = {};
        _.forEach(data, function(o, i) { colorObj[o.name] = color[i]; });
        let pie = d3.pie().sort(null).padAngle(0.02).value(function(d) { return d.value; });
        let plotData = pie(data);
        console.log(plotData);
        plotData = _.map(plotData, d => { d.view = 1; return d; });

        const plotCanvas = svg.append('g').attr('id', 'pie-plotCanvas').attr('transform', `translate(${ plotStartx + (Math.min(plotW, plotH)/2) }, ${ plotStarty + (Math.min(plotW, plotH)/2) })`);

        const draw = function() {

            let currentData = _.filter(plotData, function(d) { return d.view == 1; });

            addLegend();

            const path = d3.arc()
                .outerRadius(radius - 10)
                .innerRadius(2);

            let plotArc = plotCanvas.selectAll(".arc").data(currentData);
            let plotArcGroup = plotArc.enter().append("g")
                .attr("class", "arc");

            plotArcGroup.append("path")
                .attr("fill", function(d, i) { return colorObj[d.data.name] })
                .transition()
                .delay(250)
                .duration(250)
                .attrTween('d', function(d) {
                    const i = d3.interpolate(d.startAngle + 0, d.endAngle);
                    return function(t) {
                        d.endAngle = i(t);
                        return path(d);
                    }
                });

            plotArc.select("path")
                .transition()
                .delay(250)
                .duration(250)
                .attrTween('d', function(d) {
                    const i = d3.interpolate(d.startAngle + 0, d.endAngle);
                    return function(t) {
                        d.endAngle = i(t);
                        return path(d);
                    }
                })
                .attr("fill", function(d, i) { return colorObj[d.data.name] });

            plotArc.exit().transition().duration(200).remove();

        }

        const updateData = function() {
            duration = 1000;
            plotData = d3.pie().keys(keys)(data);
            plotData = _.map(plotData, d => { d.view = 1; return d; });
            addLegend();
            draw();
        }

        const addLegend = function() {
            /* -- Adding Legend ----------------------------------------------------- */
            let legend = svg.append("g")
                .attr('class', 'pie legend')
                .attr('transform', `translate(${ plotStartx + Math.min(plotH, plotW) + 20}, ${ plotStarty + 40 })`);

            let legendLabel = legend.selectAll('.pie.legendLabel')
                .data(data)
                .enter().append("g")
                .attr("class", "pie legendLabel");

            legendLabel.append("circle")
                .attr("cx", 2.5)
                .attr("cy", function(d, i) { return i * 20; })
                .attr("r", '5px')
                .style("cursor", "pointer")
                .attr("fill", function(d) { return colorObj[d.name]; })
                .on("click", function(d, i) {
                    data[i]['view'] = (data[i]['view'] == 0) ? 1 : 0;
                    const fill = (data[i]['view'] == 0) ? "white" : colorObj[d.name];
                    const stroke = (data[i]['view'] == 0) ? colorObj[d.name] : "none";
                    d3.select(this).attr("fill", fill).attr("stroke", stroke).attr("stroke-width", 2);
                    updatePieChart(data);
                });

            legendLabel.append("text")
                .attr("transform", function(d, i) { return `translate(10, ${i * 20})` })
                .attr("dy", "0.35em")
                .style("font-size", "0.8em")
                .text(function(d) { return d.name; });

        }

        draw();
    }

    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') updateData();
        return chart;
    }

    return chart;


    // arc.append("text")
    //     .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    //     .attr("dy", "0.35em")
    //     .style("font-size", "0.7em")
    //     .style("text-anchor", "center")
    //     .text(function(d) { return d.data.percentage + "%"; })

}

export { pieDatum, pieChart }