"use strict";

const d3 = require('d3');
const _ = require('lodash');

const drawSlate = function(selection) {
    let height = '100%';
    let width = '100%';
    const svg = selection.append('svg').attr('height', height).attr('width', width).attr('id', 'slate-chart').attr('class', 'slate');
    let svgH = parseInt(svg.style('height').substr(0, svg.style('height').length - 2));
    let svgW = parseInt(svg.style('width').substr(0, svg.style('width').length - 2));


    // Drawing line
    let newline = d3.line()
                    .x( d => { return d.x })
                    .y( d => { return d.y; })
                    // .defined(d => { return d.x < 50 || d.y > 70; })
                    .curve(d3.curveBasisClosed);

    // let newradialLine = d3.lineRadial()
    //                       .radius( d => {return d.y;} )
    //                       .angle( d => {return d.x;})
    //                       .curve(d3.curveLinear);

    
    let linedata = []
    // let xVals = _.range(1000)
    // let data = _.map(xVals, x => { return {'x': 40*x, 'y': x*x*x}; });
    // let data2 = _.map(xVals, function(x, i) {return {'x': Math.PI*0.05*(i+1), 'y': Math.sqrt(i+1)*10}})
    // svg.append('g')
    //    .attr('transform', 'translate(600,200)')
    //    .append('path').datum(data2).attr('d', newradialLine)
    //    .attr('fill', 'none')
    //    .attr('stroke', 'black')
    //    .attr('stroke-width', '2px');
    
    // svg.append()
    
    // svg.selectAll('.line-dot')
    //    .data(data).enter()
    //    .append('circle')
    //    .attr('class', 'line-dot')
    //    .attr('fill', 'white')
    //    .attr('stroke-width', '2px')
    //    .attr('stroke', 'black')
    //    .attr('cx', d => {return d.x;})
    //    .attr('cy', d => {return d.y;})
    //    .attr('r', 4);
    
    
    // Draggable circles    
    let arc = d3.arc()
                .innerRadius(0)
                .outerRadius(100)
                .startAngle(0)
                .endAngle(2 * Math.PI);
    
    let arcCircle = svg.append('g')
                        .attr('transform', `translate(${svgW/2}, ${svgH/2})`)
                        .append('path')
                        .attr('class', 'arc-circle')
                        .attr('d', arc).style('fill', 'blue');

    let arcDrag = d3.drag()
                    .on('start', function(d){
                        console.log('Drag started!');
                        let subject = d3.event.subject;
                        d3.select('.arc-circle').style('fill', 'blue');
                    })
                    .on('drag', function(d){
                        // d3.select('.arc-circle').attr('transform', `translate(${ d3.event.x }, ${ d3.event.y })`);
                        linedata.push({'x': d3.event.x, 'y': d3.event.y});
                        svg.selectAll('.line-dot').remove();
                        svg.selectAll('.line-dot')
                           .data(linedata).enter()
                           .append('circle')
                           .attr('class', 'line-dot')
                           .attr('fill', 'white')
                           .attr('stroke-width', '2px')
                           .attr('stroke', 'black')
                           .attr('cx', d => {return d.x;})
                           .attr('cy', d => {return d.y;})
                           .attr('r', 4);

                        svg.select('.lasso').datum(linedata)
                            .attr('d', newline)
                            .attr('fill', '#eaeaea')
                            .attr('fill-opacity', 0.5)
                            .attr('stroke', 'black')
                            .attr('stroke-width', '4px');
                        // svg.append('circle').attr('cx', d3.event.x).attr('cy', d3.event.y).attr('r', 4);
                    })
                    .on('end', function(){
                        console.log('Drag ended!');
                        let check = 0
                        console.log(linedata);
                        for (let p = 0; p < 1; p++) {
                            let P = linedata[p];
                            for(let q = 0; q < linedata.length; q++) {
                                let Q = linedata[q];
                                let maxX = Math.max(P.x, Q.x);
                                let maxY = Math.max(P.y, Q.y);
                                let minX = Math.min(P.x, Q.x);
                                let minY = Math.min(P.y, Q.y);
                                console.log(minX <= svgW/2, svgW/2 <= maxX, minY <= svgH/2, svgH/2 <= maxY );
                                if ( minX <= svgW/2 && svgW/2 <= maxX && minY <= svgH/2 && svgH/2 <= maxY ) { check = 1 }
                            }
                        }
                        console.log(`Check is ${check}`)
                        if (check) { console.log(check); d3.select('.arc-circle').style('fill', 'red'); }
                        linedata = [];
                    })
    
    svg.call(arcDrag);
    let chalkLine = svg.append('path').attr('class', 'lasso')
                       .datum(linedata).attr('d', newline)
                       .attr('fill', 'none').attr('stroke', 'black')
                       .attr('stroke-width', '4px');
    
    // let mx;
    // let my;
    // let cx;
    // let cy;
    // let theCircle = svg.append('g')
    //                     .append('circle')
    //                     .attr('class', 'the-circle')
    //                     .attr('cx', 200)
    //                     .attr('cy', 200)
    //                     .attr('r', 50)
    //                     .attr('fill', 'maroon');

    // let circleDrag = d3.drag()
    //                 .on('start', function(d){
    //                     console.log('Drag started!');
    //                     mx = d3.event.x;
    //                     my = d3.event.y;
    //                     cx = parseInt(d3.select(this).attr('cx'));
    //                     cy = parseInt(d3.select(this).attr('cy'));
    //                 })
    //                 .on('drag', function(d){
    //                     console.log('Dragging');
    //                     d3.select(this).attr('cx', d3.event.x - mx + cx).attr('cy', d3.event.y - my + cy);
    //                 })
    //                 .on('end', function(){
    //                     console.log('Drag ended!');
    //                 })
    // theCircle.call(circleDrag);
    
}

export { drawSlate }