'use strict';

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks, colorPalette } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"
// import { tooltip } from "./tooltip.js"

/*-- 1. Data format
     data type: list of objects
     sub : Each object has a three (key, value pairs)
        (i) The name (name, value)
        (ii) The numerical Value (value, value)
        (iv)  Group value (group, value) #optional
    --*/
const barChart = function() {

    // Customizable chart properties
    let data = [];
    let width = '95%';
    let height = '95%';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };

    let color = {};
    let xLabel = "X-axis";
    let yLabel = "Y-axis";
    let windowResize = true;
    let xlabelDistance = 40;
    let ylabelDistance = 40;

    let chart = function(selection) {

        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'bar-chart').attr('class', 'bar');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        //Handles the grouping and creates color object accordingly.
        //If groups are specified colors are 
        let groups = _.uniq(_.map(data, 'group'));
        if (groups.length == 0) {
            data = _.map(data, d => { d.group = 'default'; return d; });
            color = { 'default': colorPalette(1, 700) };
        } else {
            let colors = colorPalette(groups.length, 500);
            for (let i in groups) { color[groups[i]] = colors[i]; }
        }
        data = _.map(data, d => { d.view = 1; return d; });

        let yMax = _.max(_.map(data, d => { return d.value }));
        let yMin = _.min(_.map(data, d => { return d.value }));
        let xticks = _.map(data, o => { return o.name });

        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot
        const toolTipdiv = selection.append('div').attr('class', 'bartip')
                                    .style('position', 'absolute');

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
            tickformat: 'thousands',
            tickSize: -(plotW)
        });

        let yAxisElement = svg.append('g')
            .attr('class', 'bar y axis')
            .attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        const plotCanvas = svg.append('g').attr('id', 'bar-plotCanvas');

        const draw = function() {
            duration = 1000;

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
                    distance: xlabelDistance,
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
                    distance: ylabelDistance,
                    text: yLabel,
                    margin: margin
                });
            }

            const plotCurrentData = function() {
                let currentData = _.filter(data, o => { return o.view = 1 });

                let yMax = _.max(_.map(currentData, d => { return d.value }));
                let yMin = _.min(_.map(currentData, d => { return d.value }));
                xticks = _.map(currentData, o => { return o.name });
                xScale.domain(xticks);
                yScale.domain([yMin, yMax]);
                svg.select('.bar.x.axis').call(xAxis)
                svg.select('.bar.y.axis').call(yAxis);

                let barWidth;
                if (xScale.bandwidth() <= 100) {
                    barWidth = xScale.bandwidth();
                } else { barWidth = 100; }
    
                /* -- Plotting the BARS ------------------------------------------------- */
    
                const barFigure = plotCanvas.selectAll('rect').data(currentData);
    
                barFigure.exit().transition().duration(100).remove();
    
                barFigure.attr('width', barWidth)
                    .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - barWidth / 2; })
                    .attr('y', function(d) { return yScale(yMin); })
                    .attr('fill', d => { return color[d.group]; })
                    .transition()
                    .duration(duration)
                    .attr('y', function(d) { return yScale(d.value); })
                    .attr('height', function(d) { return yScale(yMin) - yScale(d.value); });
    
                barFigure.enter()
                    .append('rect')
                    .attr('class', 'bar')
                    .attr('width', barWidth)
                    .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - barWidth / 2; })
                    .attr('y', function(d) { return yScale(yMin); })
                    .attr('fill', d => { return color[d.group]; })
                    .style('opacity', 0.7)
                    .on('mouseover', function(d){
                        d3.select(this).style('opacity', 1);
                        toolTipdiv.style('display', 'block')
                                  .style('left', 0 + 'px')
                                  .style('top', 0 + 'px')
                                  .attr('class', 'the-tip')
                                  .html(`<span><div class="square-tip" style="background: ${color[d.group]}"></div><b>${d.name}</b></span><br><span>${yLabel}: ${d.value}</span>`);
                        let tipHeight = toolTipdiv.node().getBoundingClientRect().height;
                        let tipWidth = toolTipdiv.node().getBoundingClientRect().width;
                        let tipX = toolTipdiv.node().getBoundingClientRect().x;
                        let tipY = toolTipdiv.node().getBoundingClientRect().y;
                        let barX = d3.select(this).node().getBoundingClientRect().x;
                        let barY = d3.select(this).node().getBoundingClientRect().y;
                        let barW = d3.select(this).node().getBoundingClientRect().width;
                        toolTipdiv.style('left', `${barX-(tipX)-(tipWidth/4)-5}px`).style('top', `${barY-tipY-tipHeight-15}px`)
    
                    })
                    .on('mouseout', function(){
                        d3.select(this).style('opacity', 0.7);
                        toolTipdiv.style('display', 'none');
                        toolTipdiv.selectAll('div').remove();
                    })
                    .transition()
                    .duration(duration)
                    .attr('y', function(d) { return yScale(d.value); })
                    .attr('height', function(d) { return yScale(yMin) - yScale(d.value); });
            }

            plotCurrentData();
        }

        const updateData = function() {

            duration = 1000;
            data = _.map(data, d => { d.view = 1; return d; });

            yMax = _.max(_.map(data, d => { return d.value }));
            yMin = _.min(_.map(data, d => { return d.value }));
            xticks = _.map(data, o => { return o.name });

            xScale.domain(xticks);
            yScale.domain([yMin, yMax]);

            draw();
        }

        const updateResize = function() {

            svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
            svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

            plotH = svgH - margin.top - margin.bottom;
            plotW = svgW - margin.left - margin.right;
            plotStartx = margin.left;
            plotStarty = margin.top;
            xScale.range([plotStartx, plotStartx + plotW]);
            yScale.range([plotH + plotStarty, plotStarty]);

            yAxisElement.attr('transform', `translate(${margin.left},0)`);
            xAxisElement.attr('transform', `translate(0,' ${plotStarty + plotH})`);

            draw();
        }

        if (windowResize) { window.onresize = _.debounce(updateResize, 300); }

        draw();
    }

    chart.data = function(_) {
        if (!arguments.length) return data;
        data = _;
        if (typeof updateData === 'function') updateData();
        return chart;
    }

    chart.width = function(_) {
        if (!arguments.length) return width;
        width = _;
        return chart;
    }

    chart.height = function(_) {
        if (!arguments.length) return height;
        height = _;
        return chart;
    }

    chart.color = function(_) {
        if (!arguments.length) return color;
        color = _;
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

    chart.xlabelDistance = function(_) {
        if (!arguments.length) return xlabelDistance;
        xlabelDistance = _;
        return chart;
    }
    
    chart.ylabelDistance = function(_) {
        if (!arguments.length) return ylabelDistance;
        ylabelDistance = _;
        return chart;
    }

    chart.yLabel = function(_) {
        if (!arguments.length) return yLabel;
        yLabel = _;
        return chart;
    }

    chart.windowResize = function(_) {
        if (!arguments.length) return windowResize;
        windowResize = _;
        return chart;
    }

    return chart;
}


/* -- Defining Sort Bar Function --------------------------------------- */
// const sortChange = function(time = 1000) {

//     console.log('sortChange called!')
//         // Copy-on-write since tweens are evaluated after a delay.
//     const barsort = document.getElementById('bar-sort');
//     var x0 = xScale.domain(data.sort(barsort.checked ?

//                 function(a, b) { return b.value - a.value; } :
//                 function(a, b) { return d3.ascending(a.key, b.key); })
//             .map(function(d) { return d.key; }))
//         .copy();

//     svg.selectAll(".bar")
//         .sort(function(a, b) { return x0(a.key) - x0(b.key); });

//     let transition = svg.transition().duration(750);
//     let delay = function(d, i) { return i * (time / data.length); };

//     transition.selectAll(".bar")
//         .delay(delay)
//         .attr("x", function(d) { return x0(d.key) + x0.bandwidth() / 2 - barWidth / 2; });

//     transition.select(".x.axis")
//         .call(xAxis)
//         .selectAll("g")
//         .delay(delay);
// }

export { barChart }