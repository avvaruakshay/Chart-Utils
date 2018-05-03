"use strict";

const d3 = require('d3')
import { scale, axis, axislabel, rotateXticks, colorPalette } from "./chartUtils.js"
import { tooltip } from "./tooltip.js"

/*  1. Data format
    data type : List of Objects
    sub : Each Object has [key: value] data pairs for all the keys being used for the stacks.
          If any of the keys is absent in any object the data for that key would be assigned as 0 in that particular object.
          Each Object should also have its corresponding xValue with the key 'x'
    2. Dimensions: If given in percentage or "(vw,vh)" format, the chart will be responsive to window resize.
    */

const stackChart = function() {

    // Customizable chart properties
    let data = [];
    let keys;
    let x = 'x';
    let width = '100%';
    let height = '100%';
    let margin = { top: 20, right: 20, bottom: 40, left: 40 };

    // Inplot customizable options
    let xLabel;
    let yLabel;
    let color = colorPalette(19, 700);
    let colorObj = {};
    let labelDistance = 20;
    let windowResize = true;

    // Functions to update the Chart --------------------------------------------------------------
    let updateData;

    let chart = function(selection) {
        // Data check for presence of all the keys in each Object.
        data = _.map(data, d => { for (let key in keys) { key = keys[key]; if (!(key in d)) { d[key] = 0; } } return d; })
        data = _.map(data, d => {
            d['y'] = {};
            for (let key in keys) {
                key = keys[key];
                d['y'][key] = d[key];
            }
            return d;
        })
        const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'stack-chart').attr('class', 'stack');
        let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
        let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));

        let plotData = d3.stack().keys(keys)(data);
        let yMax = _.max(_.flattenDeep(plotData));
        let yMin = _.min(_.flattenDeep(plotData));
        let xticks = _.map(data, o => { return parseInt(o[x]); });
        plotData = _.flatMap(plotData, function(d) {
            d = _.map(d, function(o) {
                o.key = d.key;
                o.view = 1;
                return o;
            });
            return d
        });
        _.forEach(keys, function(o, i) { colorObj[o] = color[i]; });

        const legendLabelWidth = 80;
        const labelsinLine = Math.floor((svgW - 40 - margin.left) / 70);
        const legendLines = Math.ceil(data.length / labelsinLine);
        const legendHeight = legendLines * 20;
        margin.top += legendHeight;

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
            .attr('class', 'stack x axis')
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
            .attr('class', 'stack y axis')
            .attr('transform', `translate( ${margin.left} , 0)`);

        let duration = 1000;
        const plotCanvas = svg.append('g').attr('id', 'stack-plotCanvas');

        let stackTooltip = tooltip()
            .tipstyle('pointer')
            .header({
                datum: 'Frequency',
            })
            .props({
                data: function(d) {
                    let output = [];
                    for (let k in d.data.y) { output.push({ name: k, value: d.data.y[k], color: colorObj[k] }) };
                    return output;
                },
                icon: 'circle',
            });
        // .prop({
        //     datum: function(d) { return `${d.key}: ${d.data[d.key]}<br>Repeat length: ${d.data.repLen}`; },
        //     icon: 'circle',
        //     iconColor: function(d) { return colorObj[d.key]; }
        // })


        const draw = function() {
            let currentPlotData = _.filter(plotData, o => { return o.view == 1; })

            svg.select('.stack.x.axis').call(xAxis);
            svg.select('.stack.y.axis').call(yAxis);
            svg.selectAll('.axislabel').remove();

            /* -- Adding X-axis label ----------------------------------------------- */
            if (xLabel) {
                axislabel({
                    selector: '.stack.x.axis',
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
                    selector: '.stack.y.axis',
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

            const stackFigure = plotCanvas.selectAll('rect').data(currentPlotData);

            stackFigure.exit().transition().duration(100).remove();

            stackFigure.attr('x', function(d) { return xScale(d.data.x) + xScale.bandwidth() / 2 - barWidth / 2; })
                .attr('height', 0)
                .attr('y', function(d) { return yScale(yMin); })
                .attr('fill', function(d) { return colorObj[d.key] })
                .call(stackTooltip)
                .transition().duration(duration)
                .attr('y', function(d) { return yScale(d[1]); })
                .attr('height', function(d) { return yScale(d[0]) - yScale(d[1]); })
                .attr('width', xScale.bandwidth());

            stackFigure.enter()
                .append('rect')
                .attr('class', 'stack-bar')
                .attr('x', function(d) { return xScale(d.data.x) + xScale.bandwidth() / 2 - barWidth / 2; })
                .attr('y', function(d) { return yScale(yMin); })
                .attr('fill', function(d) { return colorObj[d.key] })
                .call(stackTooltip)
                .transition().duration(duration)
                .attr('y', function(d) { return yScale(d[1]); })
                .attr('width', xScale.bandwidth())
                .attr('height', function(d) { return yScale(d[0]) - yScale(d[1]); })

            addLegend();
        }

        const addLegend = function() {

            /* -- Adding Legend ----------------------------------------------------- */
            svg.selectAll('.legend').remove();
            let legend = svg.append("g")
                .attr('class', 'stack legend')
                .attr('transform', "translate(40,20)");

            let legendLabel = legend.selectAll('.stack.legendLabel')
                .data(keys)
                .enter().append("g")
                .attr("class", "stack legendLabel");

            legendLabel.append("circle")
                .attr("cx", function(d, i) { return legendLabelWidth * (i % labelsinLine); })
                .attr("cy", function(d, i) { return (Math.ceil((i + 1) / labelsinLine) - 1) * 20; })
                .attr("r", '5px')
                .attr("fill", function(d) { return colorObj[d]; })
                .style("cursor", "pointer")
                .on("click", function(d, i) {
                    console.log(d);
                    // data[i]['view'] = (data[i]['view'] == 0) ? 1 : 0;
                    // const fill = (data[i]['view'] == 0) ? "white" : colorObj[d.name];
                    // const stroke = (data[i]['view'] == 0) ? colorObj[d.name] : "none";
                    // d3.select(this).attr("fill", fill).attr("stroke", stroke).attr("stroke-width", 2);
                    // updateLineChart(data);
                })
                // .on("dbclick", function(d, i) { console.log("double clicked!"); });

            legendLabel.append("text")
                .attr("transform", function(d, i) { return `translate(${ legendLabelWidth * (i % labelsinLine) + 10 }, ${ (Math.ceil((i + 1) / labelsinLine) - 1) * 20 })` })
                .attr("dy", "0.35em")
                .style("font-size", "0.8em")
                .text(function(d) { return d; });


        }

        updateData = function() {
            duration = 1000;
            // Data check for presence of all the keys in each Object.
            data = _.map(data, d => { for (let key in keys) { key = keys[key]; if (!(key in d)) { d[key] = 0; } } return d; })
            plotData = d3.stack().keys(keys)(data);
            yMax = _.max(_.flattenDeep(plotData));
            yMin = _.min(_.flattenDeep(plotData));
            xticks = _.map(data, o => { return parseInt(o[x]); }).sort();

            xScale.domain(xticks);
            yScale.domain([yMin, yMax]);

            plotData = _.flatMap(plotData, function(d) {
                d = _.map(d, o => {
                    o.key = d.key;
                    o.view = 1;
                    return o;
                });
                return d;
            });

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

    chart.keys = function(_) {
        if (!arguments.length) return keys;
        keys = _;
        return chart;
    }

    chart.x = function(_) {
        if (!arguments.length) return x;
        x = _;
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

    chart.yLabel = function(_) {
        if (!arguments.length) return yLabel;
        yLabel = _;
        return chart;
    }

    chart.labelDistance = function(_) {
        if (!arguments.length) return labelDistance;
        labelDistance = _;
        return chart;
    }

    chart.windowResize = function(_) {
        if (!arguments.length) return windowResize;
        windowResize = _;
        return chart;
    }

    return chart

}

export { stackChart, stackData }