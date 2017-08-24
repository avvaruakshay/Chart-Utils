const d3 = require('d3');

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
        .text("Frequency");

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

    // Handling tooltip while moving the cursor on plot
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
            .text(hoverX + "bp");
        focus.select(".focus.xhead").select("text")
            .attr("x", function() { let out = (toolTipDist <= 10) ? xScale(hoverX) - toolTipDist : xScale(hoverX) - 10; return out; });

        // Handling the positions of the hover points
        hoverPoints.selectAll("circle")
            .data(currentData)
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
            .data(currentData)
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
}