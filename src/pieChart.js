'use strict';

const d3 = require('d3');
const _ = require('lodash');
import { scale, axis, axislabel, rotateXticks } from "./chartUtils.js"
import { getUniqueElements } from "./utils.js"


const pieDatum = function(data) {
    const kmerLables = { 1: 'Monomer', 2: 'Dimer', 3: 'Trimer', 4: 'Tetramer', 5: 'Pentamer', 6: 'Hexamer' };
    let pieData = { 'Monomer': 0, 'Dimer': 0, 'Trimer': 0, 'Tetramer': 0, 'Pentamer': 0, 'Hexamer': 0 };
    for (let d in data) {
        d = data[d];
        let kmer = kmerLables[d.name.length];
        pieData[kmer] += parseInt(d.value);
    }
    const total = _.sum(Object.values(pieData));

    pieData = _.map(Object.keys(pieData), function(d) {
        return { name: d, value: pieData[d], percentage: Number(((pieData[d] * 100) / total).toFixed(2)), view: 1 }
    });
    return pieData;
}


/*-- The PIE CHART FUNCTION

    --*/
const pieChart = function(Obj) {

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

    /* Data format should be list of Objects
       With object containing a name attribute and a value attribute. */
    const data = Obj.data; // Data for the plot
    const color = (Obj.color) ? Obj.color : ["#3366cc", "#dc3912", "#ff9900", "#109618", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395"]; // Default color scale set to d3 color scale category 10
    const svgH = (Obj.height) ? Obj.height : document.getElementById(svgId).getBoundingClientRect().height; // Getting height of the svg
    const svgW = (Obj.width) ? Obj.width : document.getElementById(svgId).getBoundingClientRect().width; // Getting width of the svg
    const margin = (Obj.margin) ? Obj.margin : { top: 40, right: 40, bottom: 40, left: 40 }; // Margins for the plot
    // const title = (Obj.title) ? Obj.title : '';
    const legendWidth = (Obj.legendWidth) ? Obj.legendWidth : 80;
    const sliceLabels = _.map(data, 'name'); // Slice labels    
    const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
    const plotW = svgW - margin.left - margin.right - legendWidth; // Calculating the actual height of the plot
    const plotStartx = margin.left; // X-coordinate of the start of the plot
    const plotStarty = margin.top; // Y-coordinate of the start of the plot
    const radius = Math.min(plotW, plotH) / 2;

    /* -- Svg node selection ------------------------------------------------ */
    const svg = d3.select("#" + svgId);

    /* -- Clearing previous elements inside the svg ------------------------- */
    svg.selectAll('g').remove();
    d3.select(".pie.tooltip").remove();

    const colorObj = {};
    _.forEach(data, function(o, i) { colorObj[o.name] = color[i]; });

    /* -- Defining tooltip -------------------------------------------------- */
    const parentDiv = document.getElementById(svgId).parentElement;
    const tip = d3.select(parentDiv).append("div")
        .attr("class", "pie tooltip")
        .style("opacity", 0)
        .style("position", "fixed")
        .style("text-align", "center")
        .style("padding", "5px")
        .style("font", "bold 12px sans-serif")
        .style("border-radius", "5px")
        .style("color", "black")
        .style("pointer-events", "none")
        .style("max-height", "80px");

    const showToolTip = function(d) {
        let tooltip = d3.select('.pie.tooltip')
            .html(`
                <div>
                  <span style="font-size: 1.5em; color: ${ colorObj[d.data.name] }">&#x25CF;</span>
                  <span style="color: black"> ${ d.data.name } </span><br>
                  <span style="color: black"> Percentage: ${ d.data.percentage + "%" } </span><br>
                  <span style="color: black"> Frequency: ${ d.value } </span>
                </div>   `)
            .style("left", (d3.event.clientX + 20) + "px")
            .style("top", (d3.event.clientY - 40) + "px")
            .style("padding", "6px")
            .style("background-color", "#EEF1F6")
            .transition()
            .duration(200)
            .style("opacity", 0.9);
    }

    /* -- Adding Legend ----------------------------------------------------- */
    let legend = svg.append("g")
        .attr('class', 'pie legend')
        .attr('transform', `translate(${ plotStartx + Math.min(plotH, plotW) + 20}, ${ plotStarty + 40 })`);

    let legendLabel = legend.selectAll('.pie.legendLabel')
        .data(data)
        .enter().append("g")
        .attr("class", "pie legendLabel");

    legendLabel.append("circle")
        .attr("cx", 2.5)
        .attr("cy", function(d, i) { return i * 20; })
        .attr("r", '5px')
        .style("cursor", "pointer")
        .attr("fill", function(d) { return colorObj[d.name]; })
        .on("click", function(d, i) {
            data[i]['view'] = (data[i]['view'] == 0) ? 1 : 0;
            const fill = (data[i]['view'] == 0) ? "white" : colorObj[d.name];
            const stroke = (data[i]['view'] == 0) ? colorObj[d.name] : "none";
            d3.select(this).attr("fill", fill).attr("stroke", stroke).attr("stroke-width", 2);
            updatePieChart(data);
        });

    legendLabel.append("text")
        .attr("transform", function(d, i) { return `translate(10, ${i * 20})` })
        .attr("dy", "0.35em")
        .style("font-size", "0.8em")
        .text(function(d) { return d.name; });

    /* -- Plotting PIE ------------------------------------------------------ */
    const plotCanvas = svg.append('g').attr('id', 'pie-plotCanvas').attr('transform', `translate(${ plotStartx + (Math.min(plotW, plotH)/2) }, ${ plotStarty + (Math.min(plotW, plotH)/2) })`);


    const updatePieChart = function(data) {

        data = _.filter(data, function(d) { return d.view == 1; });
        console.log(data);

        let pie = d3.pie()
            .sort(null)
            .padAngle(0.02)
            .value(function(d) { return d.value; });

        const path = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(2);

        let plotArc = plotCanvas.selectAll(".arc")
            .data(pie(data));

        let plotArcGroup = plotArc.enter().append("g")
            .attr("class", "arc")
            .on("mouseover", function(d, i) {
                showToolTip(d);
                d3.select(this).transition().duration(100).style("transform", "scale(1.1, 1.1)")
                    .select("path").style("fill", d3.color(colorObj[d.data.name]).brighter(0.5).toString())
            })
            .on("mouseout", function(d, i) {
                d3.select('.pie.tooltip').transition().duration(200).style('opacity', 0);
                d3.select(this).transition().duration(100).style("transform", "scale(1, 1)")
                    .select("path").style("fill", colorObj[d.data.name])
            })
            .on("mousemove", function(d) { showToolTip(d); });

        plotArcGroup.append("path")
            .attr("fill", function(d, i) { return colorObj[d.data.name] })
            .transition()
            .delay(function(d, i) {
                return 250
            })
            .duration(function(d, i) {
                return 250
                    // return Math.floor((d.endAngle - d.startAngle) * 1000)
            })
            .attrTween('d', function(d) {
                const i = d3.interpolate(d.startAngle + 0, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return path(d);
                }
            });

        plotArc.select("path")
            .transition()
            .delay(function(d, i) {
                return 250
            })
            .duration(function(d, i) {
                return 250
                    // return Math.floor((d.endAngle - d.startAngle) * 1000)
            })
            .attrTween('d', function(d) {
                const i = d3.interpolate(d.startAngle + 0, d.endAngle);
                return function(t) {
                    d.endAngle = i(t);
                    return path(d);
                }
            })
            .attr("fill", function(d, i) { return colorObj[d.data.name] });


        plotArc.exit().transition().duration(200).remove();

    }

    updatePieChart(data);

    // arc.append("text")
    //     .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
    //     .attr("dy", "0.35em")
    //     .style("font-size", "0.7em")
    //     .style("text-anchor", "center")
    //     .text(function(d) { return d.data.percentage + "%"; })


}

export { pieDatum, pieChart }