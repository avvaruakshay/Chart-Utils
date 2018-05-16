'use strict';

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks, colorPalette } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"
import { typeOfElements, dataTypeof } from "./datahandler.js"
// import { tooltip } from "./tooltip.js"

const barDatum = function(data){
    const dtype = dataTypeof(data);
    if (dtype === "listOfNumbers") {
        data = _.map(data, function(d, i) { return {name: i, value: parseFloat(d)}; });
    }
    else if (dtype === "ObjectNumValues") {
        let out = [];
        Object.keys(data).forEach(d => { out.push({name:d, value: parseFloat(data[d])}) });
        console.log(out);
        data = out;
        // delete out; // Can't delete variable in strict mode
    }

    return data;
}

/*-- 1. Data format
     data type: list of objects
     sub : Each object has a three (key, value pairs)
        (i) The name (name, value)
        (ii) The numerical Value (value, value)
        (iv)  Group value (group, value) #optional
    --*/
const barChart = function() {

    // Customizable chart properties
    let svg, svgH, svgW;
    let plotCanvas, toolTipdiv;
    let data;
    let width = '95%';
    let height = '95%';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };
    let plotH, plotW, plotStartx, plotStarty;
    
    let color = {};
    let xticks;
    let yMin, yMax;
    let xScale, xAxis, xAxisElement;
    let yScale, yAxis, yAxisElement;
    let xLabel = "X-axis";
    let yLabel = "Y-axis";
    let xlabelDistance = 40;
    let ylabelDistance = 40;
    
    let windowResize = true;
    let duration = 1000;
    
    const plotCurrentData = function() {
        let currentData = _.filter(data, o => { return o.view = 1 });

        yMax = _.max(_.map(data, d => { return d.value }));
        yMin = _.min(_.map(data, d => { return d.value }));
        yMin = (yMin < 0) ? yMin : 0;
        yMax += 0.05*(yMax - yMin);
        yMin -= 0.05*(yMax - yMin);
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
            .attr('y', function(d) { return yScale(0); })
            .attr('fill', d => { return color[d.group]; })
            .transition()
            .duration(duration)
            .attr('y', function(d) { return yScale(d.value); })
            .attr('height', function(d) { 
                let h = yScale(0) - yScale(d.value); 
                return Math.sqrt(h*h);
            });

        barFigure.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('width', barWidth)
            .attr('x', function(d) { return xScale(d.name) + xScale.bandwidth() / 2 - barWidth / 2; })
            .attr('y', function(d) { return yScale(0); })
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
                toolTipdiv.style('left', `${barX-(tipX)-(tipWidth/2) + (barWidth/2)}px`).style('top', `${barY-tipY-tipHeight-15}px`)

            })
            .on('mouseout', function(){
                d3.select(this).style('opacity', 0.7);
                toolTipdiv.style('display', 'none');
                toolTipdiv.selectAll('div').remove();
            })
            .transition()
            .duration(duration)
            .attr('y', function(d) { 
                let t = ( d.value > 0 ) ? d.value : 0;
                return yScale(t);
            })
            .attr('height', function(d) {  
                let h = yScale(0) - yScale(d.value); 
                return Math.sqrt(h*h);
            });
    }

    const draw = function() {
        
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

        plotCurrentData();
        d3.selectAll('.bar.y.axis > .domain').remove();
        d3.select('.bar.y.axis').selectAll(".tick line")
                                .attr("stroke", "#aeaeae")
                                .attr("stroke-dasharray", "2, 2");
    }
    
    const updateData = function() {

        console.log('Update data called!');
        d3.select('.nodata-message').remove();
        data = barDatum(data);
        data = _.map(data, d => { d.view = 1; return d; });
        duration = 1000;
        draw();
    }
    
    const updateResize = function() {

        svgH = parseInt(svg.node().getBoundingClientRect().height);
        svgW = parseInt(svg.node().getBoundingClientRect().width);
        console.log(svgH, svgW);

        plotH = svgH - margin.top - margin.bottom;
        plotW = svgW - margin.left - margin.right;
        xScale.range([plotStartx, plotStartx + plotW]);
        yScale.range([plotH + plotStarty, plotStarty]);
        yAxis.tickSize(-plotW);

        xAxisElement.attr('transform', `translate(0, ${plotStarty + plotH})`);
        yAxisElement.attr('transform', `translate(${margin.left},0)`);

        duration = 0;
        draw();
    }

    const chart = function(selection) {

        /* - Initialisation of chart even if data is not provided - */

        svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'bar-chart').attr('class', 'bar');
        svgH = svg.node().getBoundingClientRect().height;
        svgW = svg.node().getBoundingClientRect().width;
        toolTipdiv = selection.append('div').attr('class', 'bartip')
                              .style('position', 'absolute');
        
        plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        plotStartx = margin.left; // X-coordinate of the start of the plot
        plotStarty = margin.top; // Y-coordinate of the start of the plot

        

        //Handles the grouping and creates color object accordingly.
        //If groups are specified colors are 
        // let groups = _.uniq(_.map(data, 'group'));
        // if (groups.length == 0) {
        //     data = _.map(data, d => { d.group = 'default'; return d; });
        //     color = { 'default': colorPalette(1, 700) };
        // } else {
        //     let colors = colorPalette(groups.length, 500);
        //     for (let i in groups) { color[groups[i]] = colors[i]; }
        // }

        /* -- Defining the scale for Y-axis ----------------------------------------- */
        yScale = scale({
            domain: [yMin, yMax],
            range: [plotH + plotStarty, plotStarty],
            scaleType: 'linear',
        });

        /* -- Defining Y-axis --------------------------------------- */
        yAxis = axis({
            scale: yScale,
            ticks: 6,
            tickSize: -(plotW)
        });

        yAxisElement = svg.append('g')
            .attr('class', 'bar y axis')
            .attr('transform', `translate( ${margin.left} , 0)`);

        /* --  Defining the scale for X-axis ------------------------------------ */
        xticks = [];
        xScale = scale({
            domain: xticks,
            range: [plotStartx, plotStartx + plotW],
            scaleType: 'band',
            padding: 0,
            align: 0
        });

        /* -- Defining X-axis -------------------------------------- */
        xAxis = axis({
            scale: xScale,
            orient: 'bottom'
        });

        xAxisElement = svg.append('g')
            .attr('class', 'bar x axis')
            .attr('transform', `translate(0, ${plotStarty + plotH})`);

        plotCanvas = svg.append('g').attr('id', 'bar-plotCanvas');
        if (!(data)) { 
            const noDataMessage = plotCanvas.append('g').attr('class', 'nodata-message')
                        .append('text').text('Please provide the data to be plotted').style('font-size', '24px');
            noDataMessage.attr('transform', `translate(${plotStartx + (plotW/2) - (noDataMessage.node().getBoundingClientRect().width/2)}, ${plotStarty + (plotH/2) - (noDataMessage.node().getBoundingClientRect().height/2)})`);
        }
        
        
        if (windowResize) { window.onresize = function() {
            console.log('Window resized!');
            setTimeout(updateResize, 300); }}
        // draw();
    }

    chart.data = function(_) {
        console.log('Data has been updated!');
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

    chart.yMin = function(_) {
        if (!arguments.length) return yMin;
        yMin = _;
        return chart;
    }
    
    chart.yMax = function(_) {
        if (!arguments.length) return yMax;
        yMax = _;
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