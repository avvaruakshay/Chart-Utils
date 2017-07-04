"use strict";



const d3 = require('d3')
import { scale, axis, axislabel, rotateXticks } from "./chartUtils.js"
import { colorPalette } from "./chartUtils.js"


const stackData = function() {

}

const stackChart = function() {


    /* Data format
        basic : List of Objects
        sub : Each Object has [key: value] data pairs for all the keys being used for the stacks.
              If any of the keys is absent in any object the data for that key would be preseved as 0 in that particula object.
     */
    let data = [];
    let width = '80vw'; // Add to customizable options
    let height = '80vh'; // Add to customizable options
    let margin = { top: 20, right: 20, bottom: 40, left: 40 }; // Add to customizable options
    let xLabel = 'X-axis';
    let yLabel = 'Y-axis';



    let keys;
    let color = {}; // Add to customizable options
    let colors = [];

    // Functions to update the Chart --------------------------------------------------------------
    let updateData;


    let chart = function(selection) {

        // Data check for presence of all the keys in each Object.
        data = _.map(data, d => { for (let key in keys) { key = keys[key]; if (!(key in d)) { d[key] = 0; } } return d; })

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'stack-chart').attr('class', 'stack');
        let plotData = d3.stack().keys(keys)(data);

        let yMax = _.max(_.flattenDeep(plotData));
        let yMin = _.min(_.flattenDeep(plotData));
        let xticks = _.map(data, o => { return parseInt(o['repLen']); }).sort();

        plotData = _.flatMap(plotData, function(d) { d = _.map(d, function(o) { o.key = d.key; return o; }); return d });
        colors = colorPalette(keys.length, 700);
        for (let c in colors) { color[keys[c]] = colors[c] }


        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot

        /* --  Defining the scale for X-axis ------------------------------------ */
        let xScale = scale({
            domain: xticks,
            range: [plotStartx, plotStartx + plotW],
            scaleType: 'band',
            padding: 0,
            align: 0
        });

        /* -- Defining and Callling X-axis -------------------------------------- */
        let xAxis = axis({
            scale: xScale,
            orient: 'bottom'
        });

        let xAxisElement = svg.append('g')
            .attr('class', 'stack x axis')
            .attr('transform', 'translate(0,' + (plotStarty + plotH) + ')');


        /* -- Defining scale for Y-axis ----------------------------------------- */
        let yScale = scale({
            domain: [yMin, yMax],
            range: [plotH + plotStarty, plotStarty],
            scaleType: 'linear',
        });

        /* -- Defining and Calling Y-axis --------------------------------------- */
        let yAxis = axis({
            scale: yScale,
            ticks: 4,
            tickformat: 'thousands'
        });

        let yAxisElement = svg.append('g')
            .attr('class', 'stack y axis')
            .attr('transform', 'translate(' + margin.left + ', 0)');

        const plotCanvas = svg.append('g').attr('id', 'stack-plotCanvas');

        let transition = 1000;

        const draw = function() {

            svg.select('.stack.x.axis').call(xAxis);
            svg.select('.stack.y.axis').call(yAxis);

            let barWidth;
            if (xScale.bandwidth() <= 100) {
                barWidth = xScale.bandwidth();
            } else { barWidth = 100; }

            /* -- Plotting the BARS ------------------------------------------------- */

            const stackFigure = plotCanvas.selectAll('rect').data(plotData);

            stackFigure.exit().transition().duration(100).remove();

            stackFigure.attr('x', function(d) { return xScale(d.data.repLen) + xScale.bandwidth() / 2 - barWidth / 2; })
                .attr('height', 0)
                .attr('y', function(d) { return yScale(yMin); })
                .attr('fill', function(d) { return color[d.key] })
                .transition().duration(transition)
                .attr('y', function(d) { return yScale(d[1]); })
                .attr('height', function(d) { return yScale(d[0]) - yScale(d[1]); })
                .attr('width', xScale.bandwidth())

            stackFigure.enter()
                .append('rect')
                .attr('class', 'stack-bar')
                .attr('x', function(d) { return xScale(d.data.repLen) + xScale.bandwidth() / 2 - barWidth / 2; })
                .attr('y', function(d) { return yScale(yMin); })
                .attr('fill', function(d) { return color[d.key] })
                .transition().duration(transition)
                .attr('y', function(d) { return yScale(d[1]); })
                .attr('width', xScale.bandwidth())
                .attr('height', function(d) { return yScale(d[0]) - yScale(d[1]); })

        }

        updateData = function() {
            transition = 1000;
            // Data check for presence of all the keys in each Object.
            data = _.map(data, d => { for (let key in keys) { key = keys[key]; if (!(key in d)) { d[key] = 0; } } return d; })
            plotData = d3.stack().keys(keys)(data);
            yMax = _.max(_.flattenDeep(plotData));
            yMin = _.min(_.flattenDeep(plotData));
            xticks = _.map(data, o => { return parseInt(o['repLen']); }).sort();

            xScale.domain(xticks);
            yScale.domain([yMin, yMax]);

            plotData = _.flatMap(plotData, function(d) { d = _.map(d, function(o) { o.key = d.key; return o; }); return d });
            draw();

        }

        const updateResize = function() {
            transition = 0;
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

        window.onresize = _.debounce(updateResize, 300)

        draw();

    }


    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') updateData();
        return chart;
    }

    chart.keys = function(_) {
        if (!arguments.length) return keys;
        keys = _;
        return chart;
    }

    return chart

}

export { stackChart, stackData }