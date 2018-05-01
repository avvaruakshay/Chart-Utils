"use strict";

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks, colorPalette } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"

const lineDatum = function(data) {

}

/*-- 1. Data format
     data type: list of objects
     sub : Each object has a three (key, value pairs)
        (i) The name of the line (name, value)
        (ii) The list of xValues  (x, [values])
        (iii) The list of yValues (y, [values])

    --*/
const multilineChart = function() {

    // Customisable chart properties
    let data = [];
    let x = 'x';
    let y = 'y';
    let width = '80vw';
    let height = '80vh';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };

    let xLabel = 'X-axis';
    let yLabel = 'Y-axis';
    let color = colorPalette(19, 700);
    let colorObj = {};
    let labelDistance = 20;
    let windowResize = true;

    let xMax, xMin, yMax, yMin;

    let chart = function(selection) {
        // Data check
        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'multiline-chart').attr('class', 'multiline');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        data = _.map(data, d => { d.view = 1; return d; });
        _.forEach(data, function(o, i) { colorObj[o.name] = color[i]; });

        const legendLabelWidth = 80;
        const labelsinLine = Math.floor((svgW - 40 - margin.left) / 70);
        const legendLines = Math.ceil(data.length / labelsinLine);
        const legendHeight = legendLines * 20;
        margin.top += legendHeight;

        let plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
        let plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
        let plotStartx = margin.left; // X-coordinate of the start of the plot
        let plotStarty = margin.top; // Y-coordinate of the start of the plot

        xMax = _.max(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.x; })); // Max value of the x-axis
        yMax = _.max(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.y; })); // Max value of the y-axis
        xMin = _.min(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.x; })) - 2; // Min value of the x-axis
        yMin = _.min(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.y; })); // Min value of the y-axis

        /* ---------------  Defining X-axis ------------------- */
        const xScale = scale({ domain: [xMin, xMax], range: [plotStartx, plotStartx + plotW], scaleType: 'linear' });
        const xAxis = axis({ scale: xScale, orient: 'bottom' });
        const xAxisElement = svg.append('g').attr('class', 'multiline x axis').attr('transform', `translate(0, ${plotStarty + plotH})`);

        /* ---------------  Defining Y-axis ------------------- */
        const yScale = scale({ domain: [yMin, yMax], range: [plotH + plotStarty, plotStarty], scaleType: 'linear', });
        const yAxis = axis({ scale: yScale, ticks: 6, tickformat: 'thousands' });
        const yAxisElement = svg.append('g').attr('class', 'multiline y axis').attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        let line = d3.line().x(function(d) { return xScale(d.x); })
            .y(function(d) { return yScale(d.y); });
        const plotCanvas = svg.append('g').attr('id', 'multiline-plotCanvas');

        const draw = function() {

            svg.select('.multiline.x.axis').call(xAxis);
            svg.select('.multiline.y.axis').call(yAxis);

            svg.selectAll('.axislabel').remove();
            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                axislabel({
                    selector: '.multiline.x.axis',
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
                    selector: '.multiline.y.axis',
                    orient: 'left',
                    fontweight: 'regular',
                    size: '1em',
                    distance: labelDistance,
                    text: yLabel,
                    margin: margin
                });
            }

            addLegend();
            plotCurrentData();

        }

        const plotCurrentData = function() {

            let currentData = _.filter(data, o => { return o.view == 1; });

            xMax = _.max(_.map(_.flatten(_.map(currentData, o => { return o['values'] })), o => { return o.x; }));
            yMax = _.max(_.map(_.flatten(_.map(currentData, o => { return o['values'] })), o => { return o.y; }));
            xMin = _.min(_.map(_.flatten(_.map(currentData, o => { return o['values'] })), o => { return o.x; })) - 2;
            yMin = _.min(_.map(_.flatten(_.map(currentData, o => { return o['values'] })), o => { return o.y; }));
            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);
            svg.select('.multiline.x.axis').call(xAxis);
            svg.select('.multiline.y.axis').call(yAxis);

            let multilineFigure = plotCanvas.selectAll(".line.graph")
                .data(currentData);

            multilineFigure.exit().remove();

            multilineFigure.enter()
                .append("path")
                .attr("class", "line graph")
                .attr("fill", "none")
                .attr("stroke", function(d) { return colorObj[d.name]; })
                .attr("stroke-width", 3)
                .attr("d", function(d) { return line(d['values']); });

            multilineFigure.transition().duration(750)
                .attr("stroke", function(d) { return colorObj[d.name]; })
                .attr("d", function(d) { return line(d['values']); });

            const multilineFocus = function() {
                /* -- Draw and handle tooltip ---------------------------------------------- */
                svg.select(".focus").remove();

                let focus = svg.append("g").attr("class", "focus").style("opacity", 0);

                //Focus points
                let hoverPoints = focus.append('g');
                hoverPoints.selectAll('circle')
                    .data(currentData)
                    .enter()
                    .append('circle')
                    .attr("class", "focus circle")
                    .attr("r", 2.5)
                    .attr("fill", function(d) { return colorObj[d.name]; });

                // Focus line
                focus.append("g")
                    .attr("stroke", "black")
                    .attr("stroke-dasharray", "0.5, 3")
                    .append("line")
                    .attr("class", "focus line")
                    .attr("y1", yScale(yMin))
                    .attr("y2", yScale(yMax))
                    .attr("stroke-width", 1);

                // Focus x-axis label
                focus.append("g")
                    .attr("class", "focus xhead")
                    .append("text")
                    .attr("y", yScale((yMin + yMax) / 2) - 20)
                    .attr("x", xScale(xMin) + 0.01 * (xScale(xMax) - xScale(xMin)))
                    .style("font-size", "0.8em")
                    .style("text-anchor", "end")
                    .attr("dy", "0.35em")
                    .text("Repeat Units"); //("Repeat length");

                // Focus x-axis text
                focus.append("g")
                    .attr("class", "focus xtext")
                    .append("text")
                    .attr("y", yScale((yMin + yMax) / 2))
                    .attr("x", xScale(xMin) + 0.01 * (xScale(xMax) - xScale(xMin)))
                    .style("font-size", "0.8em")
                    .style("text-anchor", "end")
                    .attr("dy", "0.35em");

                // Focus y-axis text
                let yHoverText = focus.append("g")
                    .attr("class", "focus ytext");

                const hoverlegendHeight = (currentData.length - 1) * 15;
                const yHoverTextStart = yScale((yMax + yMin) / 2) - (hoverlegendHeight / 2);
                yHoverText.selectAll('text')
                    .data(currentData)
                    .enter()
                    .append("text")
                    .style("font-size", "0.8em")
                    .attr("y", function(d, i) {
                        return yHoverTextStart + 15 * i;
                    })
                    .attr("dy", "0.35em");

                // Focus y-axis label
                focus.append("g")
                    .attr("class", "focus yhead")
                    .append('text')
                    .style("font-size", "0.8em")
                    .attr("dy", "0.35em")
                    .attr("y", yHoverTextStart - 20)
                    .text("Frequency"); //("Frequency");

                const mousemove = function() {
                    let hoverX = Math.round(xScale.invert(plotStartx + d3.mouse(this)[0]));
                    d3.select(".focus.line")
                        .attr("x1", xScale(hoverX))
                        .attr("x2", xScale(hoverX));
                    let pointOpacity = Array(currentData.length).fill(1);
                    let toolTipDist = 0.02 * (xScale(xMax) - xScale(xMin));

                    // Handling the text for showing x-coordinate
                    focus.select(".focus.xtext").select("text")
                        .attr("x", function() { let out = (toolTipDist <= 10) ? xScale(hoverX) - toolTipDist : xScale(hoverX) - 10; return out; })
                        .text(hoverX + "");
                    focus.select(".focus.xhead").select("text")
                        .attr("x", function() { let out = (toolTipDist <= 10) ? xScale(hoverX) - toolTipDist : xScale(hoverX) - 10; return out; });

                    // Handling the positions of the hover points
                    hoverPoints.selectAll("circle")
                        .data(currentData)
                        .attr("cx", xScale(hoverX))
                        .attr("cy", function(d, i) {
                            const xIndex = _.findIndex(d['values'], function(o) { return o[x] == hoverX; });
                            let yOut;
                            if (xIndex != -1) { yOut = yScale(d['values'][xIndex][y]) } else {
                                pointOpacity[i] = 0;
                                yOut = 0;
                            }
                            return yOut;
                        })
                        .style("opacity", function(d, i) { return pointOpacity[i]; });

                    // Handling the text for showing y-coordinate
                    focus.select(".focus.ytext")
                        .selectAll("text")
                        .data(currentData)
                        .attr("x", function() { let out = (toolTipDist <= 10) ? xScale(hoverX) + toolTipDist : xScale(hoverX) + 10; return out; })
                        .text(function(d, i) {
                            const xIndex = _.findIndex(d['values'], function(o) { return o[x] == hoverX; });
                            const Val = (xIndex != -1) ? d['values'][xIndex][y] : 0;
                            if (hoverX >= -3000) { return `${ d['name'] }:  ${ Val }`; }

                        })

                    focus.select(".focus.yhead").select("text")
                        .attr("x", function() { let out = (toolTipDist <= 10) ? xScale(hoverX) + toolTipDist : xScale(hoverX) + 10; return out; });

                    focus.style("opacity", 1);
                }

                //Overlay for catching the mouse events
                svg.append("rect")
                    .attr("class", "overlay")
                    .attr("width", plotW)
                    .attr("height", plotH)
                    .attr("transform", `translate( ${ plotStartx }, ${ plotStarty })`)
                    .style("opacity", 0)
                    .on("mouseover", function() {
                        focus.style("opacity", 1);
                    })
                    .on("mouseout", function() {
                        focus.style("opacity", 0);
                    })
                    .on("mousemove", mousemove);
            }

            multilineFocus();
        }

        const addLegend = function() {
            svg.selectAll('.legend').remove();
            let legend = svg.append("g")
                .attr('class', 'line legend')
                .attr('transform', "translate(40,20)");

            let legendLabel = legend.selectAll('.multiline.legendLabel')
                .data(data)
                .enter().append("g")
                .attr("class", "multiline legendLabel");

            legendLabel.append("circle")
                .attr("cx", function(d, i) { return legendLabelWidth * (i % labelsinLine); })
                .attr("cy", function(d, i) { return (Math.ceil((i + 1) / labelsinLine) - 1) * 20; })
                .attr("r", '5px')
                .attr("fill", function(d) { return colorObj[d.name]; })
                .style("cursor", "pointer")
                .on("click", function(d, i) {
                    data[i]['view'] = (data[i]['view'] == 0) ? 1 : 0;
                    const fill = (data[i]['view'] == 0) ? "white" : colorObj[d.name];
                    const stroke = (data[i]['view'] == 0) ? colorObj[d.name] : "none";
                    d3.select(this).attr("fill", fill).attr("stroke", stroke).attr("stroke-width", 2);
                    plotCurrentData();
                })
                .on("dbclick", function(d, i) { console.log("double clicked!"); });

            legendLabel.append("text")
                .attr("transform", function(d, i) { return `translate(${ legendLabelWidth * (i % labelsinLine) + 10 }, ${ (Math.ceil((i + 1) / labelsinLine) - 1) * 20 })` })
                .attr("dy", "0.35em")
                .style("font-size", "0.8em")
                .text(function(d) { return d.name; });
        }

        const updateData = function() {
            console.log('Data  changed!')
            duration = 1000;
            xMax = _.max(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.x; })); // Max value of the x-axis
            yMax = _.max(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.y; })); // Max value of the y-axis
            xMin = _.min(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.x; })) - 2; // Min value of the x-axis
            yMin = _.min(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.y; })); // Min value of the y-axis

            xScale.domain([xMin, xMax]);
            yScale.domain([yMin, yMax]);
            data = _.map(data, d => { d.view = 1; return d; });
            colorObj = {};
            _.forEach(data, function(o, i) { colorObj[o.name] = color[i]; });
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

        if (windowResize) { window.onresize = _.debounce(updateResize, 300); }

        draw();
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

export { multilineChart, lineDatum }