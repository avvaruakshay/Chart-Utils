'use strict';

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks, colorPalette } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"

const boxDatum = function(data) {
    data = data.map(function(d){
        d.values = d.values.map(o => parseFloat(o));
        d.max = parseFloat(d3.max(d.values));
        d.min = parseFloat(d3.min(d.values));
        d.median = parseFloat(d3.median(d.values));
        const l = d.values.length;
        let s;
        if ( l%2 === 0 ) { s = parseInt(l/2);} else { s = parseInt((l/2) + 0.5);}
        d.values.sort();
        d.quartile1 = parseFloat(d3.median(d.values.slice(0, s)).toFixed(2));
        d.quartile3 = (l > 1) ? parseFloat(d3.median(d.values.slice(s, l)).toFixed(2)) : d.values[0];
        return d;
    });
    
    return data;
}


/*-- 1. Data format
    data type: list of objects
    sub : Each object has a three (key, value pairs)
        (i) The name (name, value)
        (ii) The numerical Value (values, list of values)
        (iv)  Group value (group, value) #optional
    --*/

const boxChart = function() {

    
    // Customizable chart properties
    let data = [];
    let width = '95%';
    let height = '95%';
    let margin = { top: 20, right: 20, bottom: 80, left: 80 };

    let color = {};
    let xLabel = "X-axis";
    let yLabel = "Y-axis";
    let windowResize = true;
    let xlabelDistance = 40;
    let ylabelDistance = 40;

    let xticks, yMax, yMin;

    const chart = function(selection) {
        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'box-chart').attr('class', 'box');
        const svgH = parseInt(d3.select('#box-chart').node().getBoundingClientRect().height);
        const svgW = parseInt(d3.select('#box-chart').node().getBoundingClientRect().width);

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
        data = boxDatum(data);
        data = _.map(data, d => { d.view = 1; return d; });
        
        const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        const plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        const plotStartx = margin.left; // X-coordinate of the start of the plot
        const plotStarty = margin.top; // Y-coordinate of the start of the plot
        const toolTipdiv = selection.append('div').attr('class', 'boxtip').style('position', 'absolute');

        yMax = _.max(_.map(data, d => { return d.max }));
        yMin = _.min(_.map(data, d => { return d.min }));
        yMax += 0.01*(yMax-yMin);
        yMin -= 0.01*(yMax-yMin);
        xticks = _.map(data, o => { return o.name });

        /* -- Defining X-axis -------------------------------------- */
        const xScale = scale({
            domain: xticks,
            range: [plotStartx, plotStartx + plotW],
            scaleType: 'band',
            padding: 0,
            align: 0
        });
        const xAxis = axis({ scale: xScale, orient: 'bottom' });
        const xAxisElement = svg.append('g').attr('class', 'box x axis')
                                .attr('transform', `translate(0, ${plotStarty + plotH})`);


        /* -- Defining Y-axis --------------------------------------- */
        const yScale = scale({
            domain: [yMin, yMax],
            range: [plotH + plotStarty, plotStarty],
            scaleType: 'linear',
        });
        const yAxis = axis({ scale: yScale, ticks: 5, tickSize: -(plotW), orient: 'left' });
        const yAxisElement = svg.append('g').attr('class', 'box y axis')
                              .attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        const plotCanvas = svg.append('g').attr('id', 'box-plotCanvas');

        const draw = function() {

            svg.select('.box.x.axis').call(xAxis);
            svg.select('.box.y.axis').call(yAxis);
            svg.selectAll('.axislabel').remove();

            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                axislabel({
                    selector: '.box.x.axis',
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
                    selector: '.box.y.axis',
                    orient: 'left',
                    fontweight: 'regular',
                    size: '1em',
                    distance: ylabelDistance,
                    text: yLabel,
                    margin: margin
                });
            }
            
            plotCurrentData();
        }


        const plotCurrentData = function() {
            let currentData = _.filter(data, o => { return o.view = 1 });

            yMax = _.max(_.map(data, d => { return d.max }));
            yMin = _.min(_.map(data, d => { return d.min }));
            yMax += 0.01*(yMax-yMin);
            yMin -= 0.01*(yMax-yMin);
            xticks = _.map(data, o => { return o.name });
            xScale.domain(xticks);
            yScale.domain([yMin, yMax]);
            svg.select('.box.x.axis').call(xAxis)
            svg.select('.box.y.axis').call(yAxis);

            let boxWidth;
            if (xScale.bandwidth() <= 80) {
                boxWidth = xScale.bandwidth();
            } else { boxWidth = 80; }

            console.log(xScale.bandwidth(), boxWidth);

            /* -- Plotting the BOX ------------------------------------------------- */

            const box = plotCanvas.selectAll('g.boxElement')
                                  .data(data)
                                  .enter()
                                  .append('g')
                                  .attr('class', 'boxElement')
                                  .attr('id', function(d){ return d.name.replace(/\s/g, '_');});

            box.append('line')
                .attr('class', 'box range-line')
                .attr('x1', function(d) { return xScale(d.name) + xScale.bandwidth() / 2; })
                .attr('x2', function(d) { return xScale(d.name) + xScale.bandwidth() / 2; })
                .attr('y1', function(d){return yScale((d.min + d.max)/2);})
                .attr('y2', function(d){return yScale((d.min + d.max)/2);})
                .attr('stroke-dasharray', "3, 3")
                .style('stroke-width', 1)
                .style('stroke', 'black')
                .transition()
                .duration(duration)
                .attr('y1', function(d){return yScale(d.min);})
                .attr('y2', function(d){return yScale(d.max);});

            box.append("rect")
                .attr("class","box minimum")
                .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - boxWidth / 4; })
                .attr("y", function(d){return yScale(d.min);})
                .attr("width", boxWidth*0.5)
                .attr("height", 1);

            box.append("rect")
                .attr("class","box maximum")
                .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - boxWidth / 4; })
                .attr("y", function(d){return yScale(d.min);})
                .attr("width", boxWidth*0.5)
                .transition()
                .duration(duration)
                .attr("y", function(d){return yScale(d.max);})
                .attr("height", 1);

            box.append("rect")
                .attr("class","box midrange")
                .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - boxWidth / 2; })
                .attr("y", function(d){return yScale(d.quartile3);})
                .attr("width", boxWidth)
                .style("opacity", 0.7)
                .transition()
                .duration(1000)
                .attr("height", function(d){return yScale(d.quartile1) - yScale(d.quartile3);})
                .attr("fill", function(d, i){return 'teal';});

            box.append("rect")
                .attr("class","box median")
                .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - boxWidth / 2; })
                .attr("y", function(d){return yScale(d.min);})
                .attr("width", boxWidth)
                .transition()
                .duration(1000)
                .attr("y", function(d){return yScale(d.median);})
                .attr("height", 1);

            box.append('rect')
                .attr('class', 'box bgr')
                .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - boxWidth / 2; })
                .attr("y", function(d){return yScale(d.max);})
                .attr("width", boxWidth)
                .attr('height', function(d){return yScale(d.min) - yScale(d.max);})
                .attr('fill', 'black')
                .style('opacity', 0);

    }

        const updateData = function() {

            console.log('UpdateData called!');
            duration = 1000;
            data = boxDatum(data);
            data = _.map(data, d => { d.view = 1; return d; });

            yMax = _.max(_.map(data, d => { return d.max }));
            yMin = _.min(_.map(data, d => { return d.min }));
            yMax += 0.01*(yMax-yMin);
            yMin -= 0.01*(yMax-yMin);
            xticks = _.map(data, o => { return o.name });

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

    return chart;
} 

export { boxChart }
