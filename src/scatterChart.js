'use strict';


/* -------------------  Convert data readable for the bar chart function  -----------------------*/
const scatterDatum = function(data, xVector, yVector, level) {
	let dataOut = [];

    for (let d in _.range(data.length)){
        d = data[d];
        let dataObj = {};
        dataObj.x = parseFloat(d[xVector]).toFixed(2);
        dataObj.y = parseFloat(d[yVector]).toFixed(2);
        dataObj.key = d.Organism;
        dataObj.colorKey = d[level];
        dataOut.push(dataObj);
    }

    const scatterObj = {
        data: dataOut,
        xLabel: tipNames[xVector],
        yLabel: tipNames[yVector],
        svgid: "graph-svg",
        margin: { top: 20, right: 10, bottom: 50, left: 70},
    }

    return scatterObj;
}


const scatterChart = function(Obj){

    let svgId;
    /*     Error handling for invalid SVGID
    Checks if the id exists
    And if yes Checks if it is attributed to SVG tag      */
    if(!(Obj.hasOwnProperty("svgid") && document.getElementById(Obj.svgid).tagName === "svg") ) {
    try {
      const svgIdError = new UnImplementedError("SvgIdError", "Invalid SVG id given!");
      throw svgIdError;
    }
    catch(svgIdError){
      console.log(svgIdError.name, ":", svgIdError.message);
    }
    }
    else{
    svgId = Obj.svgid;
    }

    /* Defining defaults for different plotting parameters. */

    const data = Obj.data; // Data for the plot
    const color = (Obj.color)? Obj.color : "Teal"; // Default color of the bar set to "Teal"
    const svgH = (Obj.height)? Obj.height : document.getElementById(svgId).getBoundingClientRect().height; // Getting height of the svg
    const svgW = (Obj.width)? Obj.width : document.getElementById(svgId).getBoundingClientRect().width; // Getting width of the svg
    const margin = (Obj.margin) ? Obj.margin : {top: 40, right: 20, bottom: 40, left: 40}; // Margins for the plot
    const rotateXtick = (Obj.rotateXtick)? Obj.rotateXtick : 0; // Rotating the X-ticks
    const xLabel = (Obj.xLabel) ? Obj.xLabel : 'X-Axis'; // X-label value
    const yLabel = (Obj.yLabel) ? Obj.yLabel : 'Y-Axis'; // Y-label value
    const plotH = svgH - margin.top - margin.bottom; // Calculating the actual width of the plot
    const plotW = svgW - margin.left - margin.right; // Calculating the actual height of the plot
    const plotStartx = margin.left; // X-coordinate of the start of the plot
    const plotStarty = margin.top; // Y-coordinate of the start of the plot


    const xMax = d3.max(getMatchingColumn(data, 'x').map(parseFloat)); // Max value of the x-axis
    const yMax = d3.max(getMatchingColumn(data, 'y').map(parseFloat)); // Max value of the y-axis
    const xMin = d3.min(getMatchingColumn(data, 'x').map(parseFloat)); // Min value of the x-axis
    const yMin = d3.min(getMatchingColumn(data, 'y').map(parseFloat)); // Min value of the y-axis

    /* ---------------  Svg node selection ------------------ */
    const svg = d3.select("#"+svgId);

    /* -- Clearing previous elements inside the svg --------------------------- */
    svg.selectAll('g').remove();

    /* ---------------  Defining the scale for X-axis ------------------- */
    const xScale = scale({
        domain: [xMin, xMax],
        range: [plotStartx, plotStartx+plotW],
        scaleType: 'linear'
    });
    /* --------------  Defining X-axis  --------------------- */
    const xAxis = axis({
    scale: xScale,
    orient: 'bottom'});
    const xAxisElement = svg.append('g')
                          .attr('class', 'x axis')
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
    ticks: 6});
    const yAxisElement = svg.append('g')
                            .attr('class', 'y axis')
                            .attr('transform', 'translate(' + margin.left + ', 0)')
                            .transition()
                            .duration(1000)
                            .call(yAxis);

    /* --------------- Adding tooltip ------------------- */

    const tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([0, 10])
                .direction('e')
                .html(function(d) {
                    const head = "<center style='font-weight: bold; font-size: 12px ;color: red'>" + d.key + "</center>";
                    const xattr = "<center style='font-size: 12px; margin-top: 4px'><b style='color: yellow'>" + xLabel +": </b>" + d.x + "</center>";
                    const yattr = "<center style='font-size: 12px; margin-top: 4px'><b style='color: yellow'>" + yLabel + ": </b>" + d.y + "</center>";
                    return  head + xattr + yattr;
                });

    /* --------------- Plotting the bars ------------------- */
    const plotCanvas = svg.append('g')
                          .attr('id', 'plotCanvas');
    plotCanvas.call(tip);

    plotCanvas.selectAll('circle.scatter')
              .data(data)
              .enter()
              .append('circle')
              .attr('class', 'scatter')
              .attr('cx', function(d) { return xScale(Math.random() * (xMax - xMin) + xMin)})
              .attr('cy', function(d) { return yScale(Math.random() * (yMax - yMin) + yMin)})
              .attr('r', 6)
              .attr('fill', function(d) { return scatterPalette[d.colorKey];})
              .on('mouseover', tip.show)
              .on('mouseout', tip.hide)
              .style('fill-opacity', 0.5)
              .style('stroke', function(d) { return scatterPalette[d.colorKey];})
              .style('stroke-width', 0.7)
              .transition()
              .duration(function(d,i){return i*(1500/data.length);})
              .attr('cx', function(d) { return xScale(d.x)})
              .attr('cy', function(d) { return yScale(d.y)});


    /* ---------------  Adding X-axis label ------------------- */
    axislabel({
    selector: '.x.axis',
    orient: 'bottom',
    fontweight: 'bold',
    size: 12,
    distance: margin.bottom - 30,
    text: xLabel,});

    /* ---------------  Adding Y-axis label ------------------- */
    axislabel({
    selector: '.y.axis',
    orient: 'left',
    fontweight: 'bold',
    size: 12,
    distance: 10,
    text: yLabel,});


    /* -- Rotating labels X-label --------------------------------------------- */
    rotateXticks({
        axisSelector: '.x',
        angle: rotateXtick
    });

    /* -- End of scatterChart() function -----------------------------------------*/

}
