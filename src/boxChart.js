'use strict';


/* -------------------  Convert data readable for the bar chart function  -----------------------*/
const boxDatum = function(data, level, vector) {
	let dataOut = [];

	const uniqueKeys = getUniqueElements(data, level).sort();

  for (let a in uniqueKeys){
	let valueObj = {};
    let slice;

	const key = uniqueKeys[a];
    const keyData = getMatchingRows(data, level, key);
    let keyVectorData = getMatchingColumn(keyData, vector).map(function(d){return parseFloat(d);});

    const boxZeros = document.getElementById('box-zeros');
    if (!(boxZeros.checked)){
        keyVectorData = keyVectorData.filter(function(val){ return val > 0;})
    }

    keyVectorData = (keyVectorData.length > 1) ? keyVectorData.sort(function(a, b){return a-b}) : keyVectorData;

    if (keyVectorData.length > 0){
      valueObj.key = key;
  	  valueObj.max = parseFloat(d3.max(keyVectorData).toFixed(2));
      valueObj.min = parseFloat(d3.min(keyVectorData).toFixed(2));
      valueObj.median = parseFloat(d3.median(keyVectorData).toFixed(2));
      const keyVectorDataLength = keyVectorData.length;
      if (keyVectorDataLength%2==0){ slice = keyVectorDataLength/2;}
  		else{ slice = (keyVectorDataLength/2) + 0.5;}
      valueObj.quartile1 = parseFloat(d3.median(keyVectorData.slice(0, slice)).toFixed(2));
      valueObj.quartile3 = (keyVectorDataLength > 1) ? parseFloat(d3.median(keyVectorData.slice(slice, keyVectorDataLength)).toFixed(2)) : keyVectorData[0];
      valueObj.genomes = keyVectorData.length;

      dataOut.push(valueObj);
    }
	}

    let rotateXtick;
    let maxStringLength;
    if (uniqueKeys.length < 9){
        rotateXtick = 0;
        maxStringLength = 0;
    }
    else {
        rotateXtick= 45;
        maxStringLength = d3.max(uniqueKeys.map(function(d){return d.length;}));
    }


    const boxsort = document.getElementById('box-sort');
    if (boxsort.checked) {
        dataOut = _.sortBy(dataOut, function(d){ return 1/d.max;})
    }

    return  {
        data : dataOut,
        xLabel : level,
        yLabel : tipNames[vector],
        svgid: "graph-svg",
        margin: { top: 20, right: 10, bottom: 50 + (2.5)*maxStringLength, left: 70},
        rotateXtick: rotateXtick
    }

}


const boxChart = function(Obj){

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
    const xticks = getUniqueElements(data, 'key'); // The x-axis ticks
    const yMax = get_maxcod(d3.max(getUniqueElements(data, 'max'))); // Max value of the y-axis

    /* ---------------  Svg node selection ------------------ */
    const svg = d3.select("#"+svgId);

    /* -- Clearing previous elements inside the svg --------------------------- */
    svg.selectAll('g').remove();

    /* ---------------  Defining the scale for X-axis ------------------- */
    const xScale = scale({
    domain: xticks,
    range: [plotStartx, plotStartx+plotW],
    scaleType: 'band',
    padding: 0.7
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
    domain: [0, yMax],
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
                    const head = "<span style='font-size: 12px; font-weight: bold'>" + d.key + "</span><br>";
                    const genomes = "<span style='font-size: 12px; font-weight: bold'>" + d.genomes + " genomes </span><br>";
                    const foot = "<strong  style='font-size: 12px'>Max: </strong> <span style='color:yellow; font-size: 10px'><b>" + d.max + "</b></span><strong  style='font-size: 10px'> Median: </strong> <span style='color:yellow; font-size: 10px'><b>" + d.median + "</b></span><strong  style='font-size: 10px'> Min: </strong> <span style='color:yellow; font-size: 10px'><b>" + d.min + "</b></span>";
                    return head + genomes + foot;
                });

    /* --------------- Plotting the bars ------------------- */
    const plotCanvas = svg.append('g').attr('id', 'plotCanvas');
    plotCanvas.call(tip);

    const box = plotCanvas.selectAll('g.boxElement')
                        .data(data)
                        .enter()
                        .append('g')
                        .attr('class', 'boxElement')
                        .attr('id', function(d){ return d.key.replace(/\s/g, '_');})
                        .on('mouseover', tip.show)
                        .on('mouseout', tip.hide);

    box.append('rect')
       .attr('class', 'bgr')
    	 .attr("x", function(d){return xScale(d.key);})
    	 .attr("y", function(d){return yScale(d.max);})
    	 .attr("width", xScale.bandwidth())
       .attr('height', function(d){return yScale(d.min) - yScale(d.max);})
       .attr('fill', 'white');

    box.append('line')
       .attr('class', 'rangeLine')
       .attr('x1', function(d){return xScale(d.key) + (xScale.bandwidth())/2;})
       .attr('x2', function(d){return xScale(d.key) + (xScale.bandwidth())/2;})
       .attr('y1', function(d){return yScale(d.min);})
       .attr('y2', function(d){return yScale(d.min);})
       .transition()
       .duration(1000)
       .attr('y2', function(d){return yScale(d.max);})
       .style('stroke', 'black')
       .style('stroke-width', '1px');

    box.append("rect")
    	 .attr("class","minimum")
    	 .attr("x", function(d){return xScale(d.key);})
    	 .attr("y", function(d){return yScale(d.min);})
    	 .attr("width", xScale.bandwidth())
    	 .attr("height", 1);

    box.append("rect")
    	 .attr("class","maximum")
    	 .attr("x", function(d){return xScale(d.key);})
    	 .attr("y", function(d){return yScale(d.min);})
    	 .attr("width", xScale.bandwidth())
       .transition()
       .duration(1000)
       .attr("y", function(d){return yScale(d.max);})
    	 .attr("height", 1);

    box.append("rect")
    	 .attr("class","midrange")
    	 .attr("x", function(d){return xScale(d.key);})
    	 .attr("y", function(d){return yScale(d.quartile3);})
    	 .attr("width", xScale.bandwidth())
       .transition()
       .duration(1000)
    	 .attr("height", function(d){return yScale(d.quartile1) - yScale(d.quartile3);})
    	 .attr("fill", function(d){return barPalette[d.key];});

    box.append("rect")
    	 .attr("class","median")
    	 .attr("x", function(d){return xScale(d.key);})
    	 .attr("y", function(d){return yScale(d.min);})
    	 .attr("width", xScale.bandwidth())
         .transition()
         .duration(1000)
         .attr("y", function(d){return yScale(d.median);})
    	 .attr("height", 1);

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
    distance: 50,
    text: yLabel,});



    /* -- Rotating labels X-label --------------------------------------------- */
    rotateXticks({
        axisSelector: '.x',
        angle: rotateXtick
    });

    /* -- Returning Sort Bar Function ----------------------------------------- */
    const sortChange = function() {

        console.log('sortChange called!')
        // Copy-on-write since tweens are evaluated after a delay.
        var x0 = xScale.domain(data.sort(this.checked
            ? function(a, b) { return b.max - a.max; }
            : function(a, b) { return d3.ascending(a.key, b.key); })
            .map(function(d) { return d.key; }))
            .copy();

        svg.selectAll(".box")
            .sort(function(a, b) { return x0(a.key) - x0(b.key); });

        var transition = svg.transition().duration(750),
            delay = function(d, i) { return i * 50; };

        transition.selectAll('.bgr')
            	    .attr("x", function(d){return x0(d.key);});

        transition.selectAll('.rangeLine')
                  .attr('x1', function(d){return x0(d.key) + (x0.bandwidth())/2;})
                  .attr('x2', function(d){return x0(d.key) + (x0.bandwidth())/2;});

        transition.selectAll('.minimum')
                  .attr("x", function(d){return x0(d.key);});

        transition.selectAll('.maximum')
                  .attr("x", function(d){return x0(d.key);});

        transition.selectAll('.midrange')
            	    .attr("x", function(d){return x0(d.key);});

        transition.selectAll('.median')
            	    .attr("x", function(d){return x0(d.key);});

        transition.select(".x.axis")
                  .call(xAxis)
                  .selectAll("g")
                  .delay(delay);
    }

    // $("#bar-sort").checkbox();
    d3.select("#box-sort").on("change", sortChange);

    /* -- End of barChart() function -----------------------------------------*/

}
