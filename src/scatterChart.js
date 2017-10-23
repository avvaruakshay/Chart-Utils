'use strict';

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks, colorPalette } from "./chartUtils.js"
import { getUniqueElements, getMatchingColumn } from "./utils.js"


/* -------------------  Convert data readable for the bar chart function  -----------------------*/
const scatterDatum = function(data, xVector, yVector, level) {
    let dataOut = [];

    for (let d in _.range(data.length)) {
        d = data[d];
        let dataObj = {};
        dataObj.x = parseFloat(d[xVector]).toFixed(2);
        dataObj.y = parseFloat(d[yVector]).toFixed(2);
        dataObj.key = d.Organism;
        dataObj.colorKey = d[level];
        dataOut.push(dataObj);
    }

    const scatterObj = {
        data: dataOut,
        xLabel: tipNames[xVector],
        yLabel: tipNames[yVector],
        svgid: "graph-svg",
        margin: { top: 20, right: 10, bottom: 50, left: 70 },
    }

    return scatterObj;
}

/*-- 1. Data format
     data type: list of objects
     sub : Each object has a three (key, value pairs)
        (i) The xValue  (x, value)
        (ii) The yValue (y, value)
        (iii) The name of the line (name, value) #optional
        (iv)  Group value (group, value) #optional
    --*/

const scatterChart = function(Obj) {

    /* Defining defaults for different plotting parameters. */

    let data = [];
    let margin = { top: 40, right: 20, bottom: 40, left: 40 };

    let xLabel = 'X-axis';
    let yLabel = 'Y-axis';
    let color = colorPalette(19, 700);
    let rotateXtick = (Obj.rotateXtick) ? Obj.rotateXtick : 0; // Rotating the X-ticks

    let xMax, xMin, yMax, yMin;

    let chart = function(selection) {

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'multiline-chart').attr('class', 'multiline');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        data = _.map(data, d => { d.view = 1; return d; });
        // _.forEach(data, function(o, i) { colorObj[o.name] = color[i]; });

        const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        const plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        const plotStartx = margin.left; // X-coordinate of the start of the plot
        const plotStarty = margin.top; // Y-coordinate of the start of the plot

        xMax = _.max(_.map(data, o => { return parseFloat(o['x']) }));
        yMax = _.max(_.map(data, o => { return parseFloat(o['y']) }));
        xMin = _.min(_.map(data, o => { return parseFloat(o['x']) }));
        yMin = _.min(_.map(data, o => { return parseFloat(o['y']) }));

        /* ---------------  Defining X-axis ------------------- */
        const xScale = scale({ domain: [xMin, xMax], range: [plotStartx, plotStartx + plotW], scaleType: 'linear' });
        const xAxis = axis({ scale: xScale, orient: 'bottom' });
        const xAxisElement = svg.append('g').attr('class', 'scatter x axis').attr('transform', `translate(0, ${plotStarty + plotH})`);

        /* ---------------  Defining Y-axis ------------------- */
        const yScale = scale({ domain: [yMin, yMax], range: [plotH + plotStarty, plotStarty], scaleType: 'linear', });
        const yAxis = axis({ scale: yScale, ticks: 6, tickformat: 'thousands' });
        const yAxisElement = svg.append('g').attr('class', 'scatter y axis').attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        const plotCanvas = svg.append('g').attr('id', 'scatter-plotCanvas');

        const draw = function() {
            svg.select('.multiline.x.axis').call(xAxis);
            svg.select('.multiline.y.axis').call(yAxis);

            svg.selectAll('.axislabel').remove();
            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                axislabel({
                    selector: '.scatter.x.axis',
                    orient: 'bottom',
                    fontweight: 'regular',
                    size: '1em',
                    distance: labelDistance,
                    text: xLabel,
                    margin: margin
                });
            }

            /* -- Adding Y-axis label ----------------------------------------------- */
            if (yLabel) {
                axislabel({
                    selector: '.scatter.y.axis',
                    orient: 'left',
                    fontweight: 'regular',
                    size: '1em',
                    distance: labelDistance,
                    text: yLabel,
                    margin: margin
                });
            }

            plotCurrentData();
        }

        const plotCurrentData = function() {

            let currentData = _.filter(data, o => { return o.view == 1; });

            xMax = _.max(_.map(currentData, o => { return parseFloat(o['x']) }));
            yMax = _.max(_.map(currentData, o => { return parseFloat(o['y']) }));
            xMin = _.min(_.map(currentData, o => { return parseFloat(o['x']) }));
            yMin = _.min(_.map(currentData, o => { return parseFloat(o['y']) }));
            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);
            svg.select('.scatter.x.axis').call(xAxis);
            svg.select('.scatter.y.axis').call(yAxis);

            let scatterFigure = plotCanvas.selectAll(".scatter.dot").data(currentData);

            scatterFigure.exit().remove();

            scatterFigure.enter()
                .append("circle")
                .attr("class", "scatter dot")
                .attr("fill", color[0])
                .attr("r", 6)
                .attr("cx", function(d) { return xScale(d.x); })
                .attr("cy", function(d) { return yScale(d.y); });

            scatterFigure.transition().duration(750)
                .attr("fill", color[0])
                .attr("r", 6)
                .attr("cx", function(d) { return xScale(d.x); })
                .attr("cy", function(d) { return yScale(d.y); });
        }

        const updateData = function() {
            xMax = _.max(_.map(data, o => { return parseFloat(o['x']) }));
            yMax = _.max(_.map(data, o => { return parseFloat(o['y']) }));
            xMin = _.min(_.map(data, o => { return parseFloat(o['x']) }));
            yMin = _.min(_.map(data, o => { return parseFloat(o['y']) }));
            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);

            data = _.map(data, d => { d.view = 1; return d; });
            draw();
        }

        const updateResize = function() {
            duration = 0;
            svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
            svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

            plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
            plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot

            xScale.range([plotStartx, plotStartx + plotW]);
            yScale.range([plotH + plotStarty, plotStarty]);

            yAxisElement.attr('transform', 'translate(' + margin.left + ', 0)');
            xAxisElement.attr('transform', 'translate(0,' + (plotStarty + plotH) + ')');

            draw();
        }

    }

    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') updateData();
        return chart;
    }

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    }

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    }

    chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
        return chart;
    }

    chart.y = function(_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    }

    chart.margin = function(_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    }

    chart.xLabel = function(_) {
        if (!arguments.length) return xLabel;
        xLabel = _;
        return chart;
    }

    chart.yLabel = function(_) {
        if (!arguments.length) return yLabel;
        yLabel = _;
        return chart;
    }

    return chart;

}

export { scatterChart };