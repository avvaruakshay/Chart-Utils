"use strict";

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"

/* -------------------  Convert data readable for the bar chart function  -----------------------*/
const lineDatum = function(data) {
    let lineData = { name: data['name'], values: [], view: 1 };
    let lMin = _.min(data['repLengths']);
    let lMax = _.max(data['repLengths']);
    let extent = _.range(lMin, lMax + 1);
    for (let l in extent) {
        const repLen = extent[l];
        let tempObj = {};
        tempObj.x = repLen;
        let t = data['repLengths'].indexOf(repLen);
        tempObj.y = (t != -1) ? data['repFreqs'][t] : 0;
        lineData['values'].push(tempObj);
    }
    return lineData;
}

/*-- The LINE CHART FUNCTION

    --*/
const lineChart = function(Obj) {
    let svgId;
    /*     Error handling for invalid SVGID
    Checks if the id exists
    And if yes Checks if it is attributed to SVG tag      */
    if (!(Obj.hasOwnProperty("svgid") && document.getElementById(Obj.svgid).tagName === "svg")) {
        try {
            const svgIdError = new UnImplementedError("SvgIdError", "Invalid SVG id given!");
            throw svgIdError;
        } catch (svgIdError) {
            console.log(svgIdError.name, ":", svgIdError.message);
        }
    } else {
        svgId = Obj.svgid;
    }
    /* Defining defaults for different plotting parameters. */

    /* Data format should be a list of Objects
       With objects containing a x attribute, y attribute and name attribute*/
    const data = Obj.data; // Data for the plot
    const xKey = (Obj.xKey) ? Obj.xKey : 'x';
    const yKey = (Obj.yKey) ? Obj.yKey : 'y';
    const color = (Obj.color) ? Obj.color : ["#3366cc", "#dc3912", "#ff9900", "#109618", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395"]; // Default color of the bar set to "Teal"
    const svgH = (Obj.height) ? Obj.height : document.getElementById(svgId).getBoundingClientRect().height; // Getting height of the svg
    const svgW = (Obj.width) ? Obj.width : document.getElementById(svgId).getBoundingClientRect().width; // Getting width of the svg

    let margin = (Obj.margin) ? Obj.margin : { top: 40, right: 20, bottom: 40, left: 40 }; // Margins for the plot
    const legendLabelWidth = 80;
    const labelsinLine = Math.floor((svgW - 40 - margin.left) / 70);
    const legendLines = Math.ceil(data.length / labelsinLine);
    const legendHeight = legendLines * 20;
    margin.top += legendHeight;

    const rotateXtick = (Obj.rotateXtick) ? Obj.rotateXtick : 0; // Rotating the X-ticks
    const xLabel = (Obj.xLabel) ? Obj.xLabel : 'X-Axis'; // X-label value
    const yLabel = (Obj.yLabel) ? Obj.yLabel : 'Y-Axis'; // Y-label value
    const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
    const plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
    const plotStartx = margin.left; // X-coordinate of the start of the plot
    const plotStarty = margin.top; // Y-coordinate of the start of the plot
    let xMax = _.max(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.x; })); // Max value of the x-axis
    let yMax = _.max(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.y; })); // Max value of the y-axis
    let xMin = _.min(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.x; })) - 2; // Min value of the x-axis
    let yMin = _.min(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.y; })); // Min value of the y-axis
    let labels;
    if (Obj.hasOwnProperty('labels')) { labels = Obj.labels; } else { labels = true; }

    /* ---------------  Svg node selection ------------------ */
    const svg = d3.select("#" + svgId);

    /* -- Clearing previous elements inside the svg --------------------------- */
    // svg.selectAll('g').remove();

    const colorObj = {};
    _.forEach(data, function(o, i) { colorObj[o.name] = color[i]; });

    /* -- Adding Legend ----------------------------------------------------- */
    let legend = svg.append("g")
        .attr('class', 'line legend')
        .attr('transform', "translate(40,20)");

    let legendLabel = legend.selectAll('.line.legendLabel')
        .data(data)
        .enter().append("g")
        .attr("class", "line legendLabel");

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
            updateLineChart(data);
        })
        .on("dbclick", function(d, i) { console.log("double clicked!"); });

    legendLabel.append("text")
        .attr("transform", function(d, i) { return `translate(${ legendLabelWidth * (i % labelsinLine) + 10 }, ${ (Math.ceil((i + 1) / labelsinLine) - 1) * 20 })` })
        .attr("dy", "0.35em")
        .style("font-size", "0.8em")
        .text(function(d) { return d.name; });

    /* ---------------  Defining the scale for X-axis ------------------- */
    const xScale = scale({
        domain: [xMin, xMax],
        range: [plotStartx, plotStartx + plotW],
        scaleType: 'linear'
    });

    /* --------------  Defining X-axis  --------------------- */
    const xAxis = axis({
        scale: xScale,
        orient: 'bottom'
    });

    const xAxisElement = svg.append('g')
        .attr('class', 'line x axis')
        .attr('transform', 'translate(0,' + (plotStarty + plotH) + ')')
        .call(xAxis);

    /* ---------------  Defining scale Y-axis ------------------- */
    const yScale = scale({
        domain: [yMin, yMax],
        range: [plotH + plotStarty, plotStarty],
        scaleType: 'linear',
    });

    /* ---------------  Defining Y-axis ------------------- */
    const yAxis = axis({
        scale: yScale,
        ticks: 6,
        tickformat: 'thousands'
    });

    const yAxisElement = svg.append('g')
        .attr('class', 'line y axis')
        .attr('transform', 'translate(' + margin.left + ', 0)')
        .transition()
        .duration(1000)
        .call(yAxis);

    /* --------------- Plotting line ------------------- */
    const plotCanvas = svg.append('g')
        .attr('id', 'plotCanvas');

    const line = d3.line()
        .x(function(d) { return xScale(d['x']); })
        .y(function(d) { return yScale(d['y']); });

    const updateLineChart = function(data) {

        data = _.filter(data, o => { return o['view'] == 1; });

        xMax = _.max(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.x; })); // Max value of the x-axis
        yMax = _.max(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.y; })); // Max value of the y-axis
        xMin = _.min(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.x; })) - 2; // Min value of the x-axis
        yMin = _.min(_.map(_.flatten(_.map(data, o => { return o['values'] })), o => { return o.y; })); // Min value of the y-axis

        xScale.domain([xMin, xMax]);
        svg.select(".x.axis").transition().duration(500).call(xAxis);
        yScale.domain([yMin, yMax]);
        svg.select(".y.axis").transition().duration(500).call(yAxis);

        let plotGraph = plotCanvas.selectAll(".line.graph")
            .data(data);

        plotGraph.exit().remove();

        plotGraph.enter()
            .append("path")
            .attr("class", "line graph")
            .attr("fill", "none")
            .attr("stroke", function(d) { return colorObj[d.name]; })
            .attr("stroke-width", 1)
            .attr("d", function(d) { return line(d['values']); });

        plotGraph.transition().duration(750)
            .attr("stroke", function(d) { return colorObj[d.name]; })
            .attr("d", function(d) { return line(d['values']); });

        if (labels) {

            /* -- Adding X-axis label ----------------------------------------------- */
            axislabel({
                selector: '.line.x.axis',
                orient: 'bottom',
                fontweight: 'regular',
                size: '0.8em',
                distance: margin.bottom - 40,
                text: xLabel,
                margin: margin
            });

            /* -- Adding Y-axis label ----------------------------------------------- */
            axislabel({
                selector: '.line.y.axis',
                orient: 'left',
                fontweight: 'regular',
                size: '0.8em',
                distance: 10,
                text: yLabel,
                margin: margin
            });

        }

        /* -- Draw and handle tooltip ---------------------------------------------- */
        svg.select(".focus").remove();
        let focus = svg.append("g")
            .attr("class", "focus")
            .style("opacity", 0);

        //Focus points
        let hoverPoints = focus.append('g');
        hoverPoints.selectAll('circle')
            .data(data)
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
            .text("Repeat length");

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

        const hoverlegendHeight = (data.length - 1) * 15;
        const yHoverTextStart = yScale((yMax + yMin) / 2) - (hoverlegendHeight / 2);
        yHoverText.selectAll('text')
            .data(data)
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
            .text("Frequency");

        // Handling tooltip while moving the cursor on plot
        const mousemove = function() {
            let hoverX = Math.round(xScale.invert(plotStartx + d3.mouse(this)[0]));
            d3.select(".focus.line")
                .attr("x1", xScale(hoverX))
                .attr("x2", xScale(hoverX));
            let pointOpacity = Array(data.length).fill(1); //_.map(data, function() { return 1 });
            let toolTipDist = 0.02 * (xScale(xMax) - xScale(xMin));

            // Handling the text for showing x-coordinate
            focus.select(".focus.xtext").select("text")
                .attr("x", function() { let out = (toolTipDist <= 10) ? xScale(hoverX) - toolTipDist : xScale(hoverX) - 10; return out; })
                .text(hoverX + "bp");
            focus.select(".focus.xhead").select("text")
                .attr("x", function() { let out = (toolTipDist <= 10) ? xScale(hoverX) - toolTipDist : xScale(hoverX) - 10; return out; });

            // Handling the positions of the hover points
            hoverPoints.selectAll("circle")
                .data(data)
                .attr("cx", xScale(hoverX))
                .attr("cy", function(d, i) {
                    const xIndex = _.findIndex(d['values'], function(o) { return o['x'] == hoverX; });
                    let yOut;
                    if (xIndex != -1) { yOut = yScale(d['values'][xIndex]['y']) } else {
                        pointOpacity[i] = 0;
                        yOut = 0;
                    }
                    return yOut;
                })
                .style("opacity", function(d, i) { return pointOpacity[i]; });

            // Handling the text for showing y-coordinate
            focus.select(".focus.ytext")
                .selectAll("text")
                .data(data)
                .attr("x", function() { let out = (toolTipDist <= 10) ? xScale(hoverX) + toolTipDist : xScale(hoverX) + 10; return out; })
                .text(function(d, i) {
                    const xIndex = _.findIndex(d['values'], function(o) { return o['x'] == hoverX; });
                    const Val = (xIndex != -1) ? d['values'][xIndex]['y'] : 0;
                    if (hoverX >= 12) { return `${ d['name'] }:  ${ Val }`; }

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

        /* -- Rotating labels X-label --------------------------------------------- */
        rotateXticks({
            axisSelector: '.line.x',
            angle: rotateXtick
        });
    }

    updateLineChart(data);

    /* -- Custom Styling Axes ------------------------------------------------- */
    d3.select('.line.x')
        .select('.domain')
        .style("stroke", "#999999");
    d3.selectAll('.line.x > .tick > line').style("stroke", "#999999");

    d3.select('.line.y')
        .select('.domain')
        .style("stroke", "#999999");
    d3.selectAll('.line.y > .tick > line').style("stroke", "#999999");



    /* -- End of scatterChart() function -----------------------------------------*/
}

export { lineChart, lineDatum }