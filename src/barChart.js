'use strict';

const d3 = require('d3');
import { scale, axis, axislabel, rotateXticks } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"

/*-- 1. Data format
     data type: list of objects
     sub : Each object has a three (key, value pairs)
        (i) The name (name, value)
        (ii) The numerical Value (value, value)
        (iv)  Group value (group, value) #optional
    --*/
const barChart = function() {

    // Customizable chart properties
    const data = [];
    let width = '80vw';
    let height = '80vh';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };

    let color = "Teal";
    let xLabel;
    let yLabel;
    const margin = { top: 40, right: 20, bottom: 40, left: 40 };

    let chart = function(selection) {

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'bar-chart').attr('class', 'bar');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        data = _.map(data, d => { d.view = 1; return d; })

        let yMax = _.max(_.map(data, o => { return d3.value }));
        let yMin = _.min(_.map(data, o => { return d3.value }));
        let xticks = _.map(data, o => { return o.name });

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

        /* -- Defining X-axis -------------------------------------- */
        let xAxis = axis({
            scale: xScale,
            orient: 'bottom'
        });

        let xAxisElement = svg.append('g')
            .attr('class', 'bar x axis')
            .attr('transform', `translate(0, ${plotStarty + plotH})`);


        /* -- Defining the scale for Y-axis ----------------------------------------- */
        let yScale = scale({
            domain: [yMin, yMax],
            range: [plotH + plotStarty, plotStarty],
            scaleType: 'linear',
        });

        /* -- Defining Y-axis --------------------------------------- */
        let yAxis = axis({
            scale: yScale,
            ticks: 4,
            tickformat: 'thousands'
        });

        let yAxisElement = svg.append('g')
            .attr('class', 'bar y axis')
            .attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        const plotCanvas = svg.append('g').attr('id', 'bar-plotCanvas');

        const draw = function() {
            let currentPlotData = _.filter(plotData, o => { return o.view == 1; })

            svg.select('.bar.x.axis').call(xAxis);
            svg.select('.bar.y.axis').call(yAxis);
            svg.selectAll('.axislabel').remove();

            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                axislabel({
                    selector: '.bar.x.axis',
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
                    selector: '.bar.y.axis',
                    orient: 'left',
                    fontweight: 'regular',
                    size: '1em',
                    distance: labelDistance,
                    text: yLabel,
                    margin: margin
                });
            }

            let barWidth;
            if (xScale.bandwidth() <= 100) {
                barWidth = xScale.bandwidth();
            } else { barWidth = 100; }

            /* -- Plotting the BARS ------------------------------------------------- */

            const barFigure = plotCanvas.selectAll('rect').data(currentPlotData);

            barFigure.exit().transition().duration(100).remove();

            barFigure.attr('width', barWidth)
                .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - barWidth / 2; })
                .attr('y', function(d) { return yScale(0); })
                .attr('fill', color)
                .transition()
                .duration(duration)
                .attr('y', function(d) { return yScale(d.value); })
                .attr('height', function(d) { return yScale(0) - yScale(d.value); });

            barFigure.enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('width', barWidth)
                .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - barWidth / 2; })
                .attr('y', function(d) { return yScale(0); })
                .attr('fill', color)
                .transition()
                .duration(duration)
                .attr('y', function(d) { return yScale(d.value); })
                .attr('height', function(d) { return yScale(0) - yScale(d.value); });
        }

        const updateData = function() {

            duration = 1000;
            data = _.map(data, d => { d.view = 1; return d; });

            let yMax = _.max(_.map(data, o => { return d3.value }));
            let yMin = _.min(_.map(data, o => { return d3.value }));
            let xticks = _.map(data, o => { return o.name });

            xScale.domain(xticks);
            yScale.domain([yMin, yMax]);

            draw();
        }

        draw();

    }

    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') updateData();
        return chart;
    }
}


/* -- Defining Sort Bar Function --------------------------------------- */
const sortChange = function(time = 1000) {

    console.log('sortChange called!')
        // Copy-on-write since tweens are evaluated after a delay.
    const barsort = document.getElementById('bar-sort');
    var x0 = xScale.domain(data.sort(barsort.checked ?

                function(a, b) { return b.value - a.value; } :
                function(a, b) { return d3.ascending(a.key, b.key); })
            .map(function(d) { return d.key; }))
        .copy();

    svg.selectAll(".bar")
        .sort(function(a, b) { return x0(a.key) - x0(b.key); });

    let transition = svg.transition().duration(750);
    let delay = function(d, i) { return i * (time / data.length); };

    transition.selectAll(".bar")
        .delay(delay)
        .attr("x", function(d) { return x0(d.key) + x0.bandwidth() / 2 - barWidth / 2; });

    transition.select(".x.axis")
        .call(xAxis)
        .selectAll("g")
        .delay(delay);
}

export { barChart }