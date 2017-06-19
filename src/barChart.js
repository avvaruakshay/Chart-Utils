'use strict';

const d3 = require('d3');
import { scale, axis, axislabel, rotateXticks } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"

/*-- The BAR CHART FUNCTION

    --*/
const barChart = function(Obj) {

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

    const data = Obj.data; // Data for the plot
    const color = (Obj.color) ? Obj.color : "Teal"; // Default color of the bar set to "Teal"
    const svgH = (Obj.height) ? Obj.height : document.getElementById(svgId).getBoundingClientRect().height; // Getting height of the svg
    const svgW = (Obj.width) ? Obj.width : document.getElementById(svgId).getBoundingClientRect().width; // Getting width of the svg
    const margin = (Obj.margin) ? Obj.margin : { top: 40, right: 20, bottom: 40, left: 40 }; // Margins for the plot
    const rotateXtick = (Obj.rotateXtick) ? Obj.rotateXtick : 0; // Rotating the X-ticks
    const xLabel = (Obj.xLabel) ? Obj.xLabel : 'X-Axis'; // X-label value
    const yLabel = (Obj.yLabel) ? Obj.yLabel : 'Y-Axis'; // Y-label value
    const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
    const plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
    const plotStartx = margin.left; // X-coordinate of the start of the plot
    const plotStarty = margin.top; // Y-coordinate of the start of the plot
    const xticks = _.map(data, 'name'); // The x-axis ticks
    const yMax = _.maxBy(data, 'value').value; // Max value of the y-axis
    // const update = Obj.update ? true : false;
    let labels;
    if (Obj.hasOwnProperty('labels')) { labels = Obj.labels; } else { labels = true; }


    /* -- Svg node selection ------------------------------------------------ */
    const svg = d3.select("#" + svgId);

    /* -- Clearing previous elements inside the svg ------------------------- */
    // svg.selectAll('g').remove();
    d3.select(".bar.tooltip").remove();

    /* --  Defining the scale for X-axis ------------------------------------ */
    const xScale = scale({
        domain: xticks,
        range: [plotStartx, plotStartx + plotW],
        scaleType: 'band',
        padding: 0,
        align: 0
    });

    let barWidth;
    if (xScale.bandwidth() <= 100) {
        barWidth = xScale.bandwidth();
    } else { barWidth = 100; }

    /* -- Defining and Callling X-axis -------------------------------------- */
    const xAxis = axis({
        scale: xScale,
        orient: 'bottom'
    });
    const xAxisElement = svg.append('g')
        .attr('class', 'bar x axis')
        .attr('transform', 'translate(0,' + (plotStarty + plotH) + ')')
        .call(xAxis);

    /* -- Defining scale for Y-axis ----------------------------------------- */
    const yScale = scale({
        domain: [0, yMax],
        range: [plotH + plotStarty, plotStarty],
        scaleType: 'linear',
    });

    /* -- Defining and Calling Y-axis --------------------------------------- */
    const yAxis = axis({
        scale: yScale,
        ticks: 4,
        tickformat: 'thousands'
    });
    const yAxisElement = svg.append('g')
        .attr('class', 'bar y axis')
        .attr('transform', 'translate(' + margin.left + ', 0)')
        .call(yAxis);

    /* -- Defining tooltip -------------------------------------------------- */
    const parentDiv = document.getElementById(svgId).parentElement;
    const t = document.createTextNode('HOVER TEXT');
    const tip = d3.select(parentDiv).append("div")
        .attr("class", "bar tooltip")
        .style("opacity", 0)
        .style("position", "fixed")
        .style("text-align", "center")
        .style("padding", "5px")
        .style("font", "bold 12px sans-serif")
        .style("border-radius", "5px")
        .style("color", "black")
        .style("pointer-events", "none")
        .style("max-height", "40px");

    const showToolTip = function(d) {
        let tooltip = d3.select('.bar.tooltip')
            .html(`
                ${ xLabel }: <span style="color: red"> ${ d.name } </span><br>
                ${ yLabel }: <span style="color: red"> ${ d.value } </span> `)
            .style("left", (d3.event.clientX + 10) + "px")
            .style("top", (d3.event.clientY - 40) + "px")
            .style("padding", "6px")
            .style("background-color", "white")
            .style("border", "1px black solid")
            .transition()
            .duration(200)
            .style("opacity", 0.9);
    }

    /* -- Plotting the BARS ------------------------------------------------- */
    const plotCanvas = svg.append('g').attr('id', 'bar-plotCanvas');

    plotCanvas.selectAll('rect .bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', barWidth)
        .attr('x', function(d) {
            return xScale(d.name) + xScale.bandwidth() / 2 - barWidth / 2;
        })
        .attr('y', function(d) {
            return yScale(0);
        })
        .attr('fill', color)
        .on("mouseover", function(d) { showToolTip(d); })
        .on("mouseout", function() {
            d3.select('.tooltip')
                .transition()
                .duration(200)
                .style('opacity', 0);
        })
        .on("mousemove", function(d) { showToolTip(d); })
        .transition()
        .duration(1000)
        .attr('y', function(d) {
            return yScale(d.value);
        })
        .attr('height', function(d) {
            return yScale(0) - yScale(d.value);
        });

    if (labels) {

        /* -- Adding X-axis label ----------------------------------------------- */
        axislabel({
            selector: '.bar.x.axis',
            orient: 'bottom',
            fontweight: 'regular',
            size: '0.8em',
            distance: margin.bottom - 40,
            text: xLabel,
            margin: margin
        });

        /* -- Adding Y-axis label ----------------------------------------------- */
        axislabel({
            selector: '.bar.y.axis',
            orient: 'left',
            fontweight: 'regular',
            size: '0.8em',
            distance: 10,
            text: yLabel,
            margin: margin
        });

    }

    /* -- Rotating labels X-label ------------------------------------------- */
    rotateXticks({
        axisSelector: '.x',
        angle: rotateXtick
    });


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

    /* -- Custom styling of axes -------------------------------------------- */
    d3.select('.bar.x')
        .select('.domain')
        .remove()

    d3.select('.bar.y')
        .select('.domain')
        .remove()

    // d3.select('.y')
    //     .selectAll('.tick')
    //     .select('line')
    //     .remove()

    /* -- End of barChart() function -----------------------------------------*/
};

export { barChart }