'use strict';

const d3 = require('d3');
import { getTranslateValue } from "./utils.js"

const scale = function(Obj) {
    let scale;

    const domain = Obj.domain;
    const range = Obj.range;
    const type = (Obj.scaleType) ? Obj.scaleType : 'linear';
    const padding = (Obj.padding) ? Obj.padding : 0.25;
    const align = (Obj.align) ? Obj.align : 0.5;

    // Type of the scale is Linear
    if (type === 'linear') {
        scale = d3.scaleLinear()
            .domain(domain)
            .range(range);
    }

    // Type of the scale is Ordinal
    else if (type === 'ordinal') {
        const ordinalrange = _.range(range[0], range[1] + 1, (range[1] - range[0]) / (domain.length - 1));
        scale = d3.scaleOrdinal()
            .domain(domain)
            .range(ordinalrange);
    }

    // Type of scale is Band scale
    else if (type === 'band') {
        scale = d3.scaleBand()
            .domain(domain)
            .range(range)
            .padding([padding])
            .align([align]);
    }

    return scale;

}

const axis = function(Obj) {

    let axis;
    let ticks;
    const scale = Obj.scale;
    const orient = (Obj.orient) ? Obj.orient : 'left';

    // Orientation of axis
    if (orient === 'bottom') { axis = d3.axisBottom(scale); } else if (orient === 'top') { axis = d3.axisTop(scale); } else if (orient === 'left') { axis = d3.axisLeft(scale); } else if (orient === 'right') { axis = d3.axisRight(scale); }

    // Customising for number of ticks or the Tick values
    if (Obj.hasOwnProperty('ticks')) {
        ticks = Obj.ticks;
        if (typeof ticks === 'number') { axis = axis.ticks(ticks); } else if (ticks instanceof Array) { axis = axis.tickValues(ticks); }
    }

    // Specifying the tickFormat
    if (Obj.hasOwnProperty('tickformat')) {
        let tickFormat = Obj.tickformat;
        if (tickFormat === 'percent' || tickFormat === 'percentage') {
            axis = axis.tickFormat('0.1%')
        }

        if (tickFormat == 'thousands') {
            axis = axis.tickFormat(function(d) {
                d = d / 1000 + "K";
                return d;
            })

        }
    }

    return axis;
}

const axiStyle = function(Obj) {

    const rotate = (Obj.rotate) ? Obj.rotate : 0;

}

const axislabel = function(Obj) {
    let padding;
    let translateX;
    let translateY;
    let rotate;
    const axisSelector = Obj.selector;
    const axisOrient = Obj.orient;
    const text = Obj.text;
    // const side = (Obj.side) ? Obj.side : 'outside';
    const position = (Obj.position) ? Obj.position : 'center';
    const distance = (Obj.distance) ? Obj.distance : 8;
    const size = (Obj.size) ? Obj.size : 10;
    const fontweight = (Obj.fontweight) ? Obj.fontweight : 'light';
    const margin = Obj.margin;

    const axisNode = document.querySelector(axisSelector);
    const translateString = axisNode.getAttribute('transform');
    const axisbox = axisNode.getBBox();
    const translate = getTranslateValue(translateString);
    console.log(translate[1]);
    // if (side === 'outside') {padding = distance;}
    // else if (side === 'inside') {padding = -distance;}

    if (axisOrient === 'left') {
        translateX = translate[0] - axisbox.width - distance;
        translateY = translate[1] + axisbox.height / 2;
        rotate = -90;
    } else if (axisOrient === 'right') {
        translateX = translate[0] + axisbox.width + distance;
        translateY = translate[1] + axisbox.height / 2;
        rotate = -90;
    } else if (axisOrient === 'top') {
        translateX = translate[0] + axisbox.width / 2;
        translateY = translate[1] - axisbox.height - distance;
        rotate = 0;
    } else if (axisOrient === 'bottom') {
        translateX = translate[0] + axisbox.width / 2;
        translateY = translate[1] + axisbox.height + distance;
        rotate = 0;
    }

    const parentNode = axisNode.parentElement.id;
    d3.select("#" + parentNode)
        .append('g')
        .attr('class', 'axislabel')
        .append('text')
        .attr('class', 'labelText')
        .attr('transform', 'translate(' + translateX + ', ' + translateY + ') rotate(' + rotate + ')')
        .style('font-size', size)
        .style('font-weight', fontweight)
        .style('text-anchor', 'center')
        .text(text);
}

const rotateXticks = function(Obj) {
    const axisSelector = Obj.axisSelector;
    const tick = axisSelector + ' > .tick > text';
    const angle = Obj.angle; //Currently Allowed angles are 45 and 90

    if (angle === 90) {
        d3.selectAll(tick)
            .attr('x', -12)
            .attr('y', 0)
            .attr('dy', '0.35em')
            .style('text-anchor', 'center')
            .attr('transform', 'rotate(-90)');
    } else if (angle != 0) {
        d3.selectAll(tick)
            .attr('x', -6)
            .attr('y', 6)
            .style('text-anchor', 'end')
            .attr('transform', 'rotate(-45)');
    }


}

const zoombehavior = function(Obj) {

}

export { scale, axis, axislabel, rotateXticks }