'use strict';


/* -------------------  Convert data readable for the bar chart function  -----------------------*/
const histogramDatum = function(data, vector, thresholds, domain) {
    let dataOut = {};

    let listData = getMatchingColumn(data, vector).map(function(d) {
        return parseFloat(d);
    })
    listData = listData.sort(function(a, b) {
        return a - b;
    });

    const histZeros = document.getElementById('hist-zeros');
    if (!(histZeros.checked)){
        listData = listData.filter(function(val){ return val > 0;})
    }

    if (!domain) {
        domain = [d3.min(listData), d3.max(listData)];
    }


    if (typeof thresholds === 'number') {
        const range = domain[1] - domain[0];
        const binSize = range / thresholds;
        thresholds = d3.range(domain[0], domain[1] + 1, binSize);
    }

    else {
        thresholds.push(domain[1]);
        thresholds.splice(0, 0, domain[0]);
        console.log(thresholds);
    }

    dataOut.values = listData;
    dataOut.thresholds = thresholds.map(function(d){return d.toFixed(1)});
    dataOut.domain = domain;

    const histObj = {
        data: dataOut,
        xLabel: tipNames[vector],
        yLabel: 'Frequency',
        svgid: "graph-svg",
        margin: {
            top: 20,
            right: 10,
            bottom: 50,
            left: 60
        }
    }

    return histObj;

}


const histogramChart = function(Obj) {

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
    const margin = (Obj.margin) ? Obj.margin : {
        top: 40,
        right: 20,
        bottom: 40,
        left: 40
    }; // Margins for the plot
    const rotateXtick = (Obj.rotateXtick) ? Obj.rotateXtick : 0; // Rotating the X-ticks
    const xLabel = (Obj.xLabel) ? Obj.xLabel : 'X-Axis'; // X-label value
    const yLabel = (Obj.yLabel) ? Obj.yLabel : 'Y-Axis'; // Y-label value

    const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
    const plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
    const plotStartx = margin.left; // X-coordinate of the start of the plot
    const plotStarty = margin.top; // Y-coordinate of the start of the plot

    const xDomain = data.domain;
    const thresholds = data.thresholds;

    /* -- Svg node selection ------------------------------------------------ */
    const svg = d3.select("#" + svgId);

    /* -- Clearing previous elements inside the svg ------------------------- */
    svg.selectAll('g').remove();

    /* -- Calculating data for histogram ------------------------------------ */
    const histogram = d3.histogram()
        .thresholds(data.thresholds);

    const histdata = histogram(data.values);
    const yMax = get_maxcod(d3.max(histdata.map(function(d) {
        return d.length
    })));

    /* -- Defining the scale for X-axis ------------------------------------- */
    const xScale = scale({
        domain: thresholds,
        range: [plotStartx, plotStartx + plotW],
        scaleType: 'ordinal',
    });

    /* -- Defining X-axis --------------------------------------------------- */
    const xAxis = axis({
        scale: xScale,
        orient: 'bottom',
        ticks: thresholds
    });
    const xAxisElement = svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + (plotStarty + plotH) + ')')
        .call(xAxis);

    /* -- Defining scale Y-axis --------------------------------------------- */
    const yScale = scale({
        domain: [0, yMax],
        range: [plotH + plotStarty, plotStarty],
        scaleType: 'linear',
    });

    /* -- Defining Y-axis --------------------------------------------------- */
    const yAxis = axis({
        scale: yScale,
        ticks: 6
    });
    const yAxisElement = svg.append('g')
        .attr('class', 'y axis')
        .attr('transform', 'translate(' + margin.left + ', 0)')
        .call(yAxis);

    /* -- Defining tooltip -------------------------------------------------- */
    const tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
            const head = '<span><b style="color: red; font-size: 12px">' + xLabel + '</b>: <span style="color: yellow; font-size: 12px">' + parseFloat(d.x0).toFixed(2) + ' - ' + parseFloat(d.x1).toFixed(2) + '</span>';
            const genomes = '<br><div style="font-size: 12px; margin-top: 4px">' + d.length + ' genomes</div>';
            return head + genomes;
        });

    /* -- Plotting the Histogram -------------------------------------------- */
    const plotCanvas = svg.append('g').attr('id', 'plotCanvas');
    plotCanvas.call(tip);

    plotCanvas.selectAll('rect.bar')
        .data(histdata)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('width', function(d, i) {
            if(i != histdata.length - 1){
                return xScale(d.x1) - xScale(d.x0) - 1;}
            else {
                return xScale(d.x1) - xScale(d.x0);
            }
        })
        .attr('x', function(d) {
            return xScale(d.x0) ;
        })
        .attr('y', function(d) {
            return yScale(0);
        })
        .on('mouseover', tip.show)
        .on('mouseout', tip.hide)
        .transition()
        .duration(1000)
        .attr('y', function(d) {
            return yScale(d.length);
        })
        .attr('height', function(d) {
            console.log(yScale(0) - yScale(d.length));
            return yScale(0) - yScale(d.length);
        })
        .attr('fill', baseColor);

    /* ---------------  Adding X-axis label ------------------- */
    axislabel({
        selector: '.x.axis',
        orient: 'bottom',
        fontweight: 'bold',
        size: 12,
        distance: 20,
        text: xLabel,
    });

    /* ---------------  Adding Y-axis label ------------------- */
    axislabel({
        selector: '.y.axis',
        orient: 'left',
        fontweight: 'bold',
        size: 12,
        distance: 10,
        text: yLabel,
    });

}
