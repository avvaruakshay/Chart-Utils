const d3 = require('d3');


/*
  A function that can be called on svg elements to assign a tooltip
  initialisation: create a div element just outside the svg and giv it a id  "tooltip"
  usage : element.call(tooltip)
  define : (label, prop) 
 */
const tooltip = function() {

    // label = {icon: [null|circle|square|rounded-square], iconColor: [color|function], datum:[key|function]}
    let label;
    // prop = {icon: [null|circle|square|rounded-square], iconColor: [color|function], datum:[key|function]}
    let prop;
    let iconColor;

    let tipDiv = d3.select('#tooltip');

    let tip = function(selection) {
        selection.on('mouseover', function(d, i) {
                console.log(d);
                let datum = d;
                let index = i;
                let x = event.clientX;
                let y = event.clientY;

                let labelDiv = tipDiv.append('div')
                    .attr('class', 'tip label');

                labelDiv.append('div')
                    .attr('class', 'tip icon')
                    .style('background-color', iconColor(d));

                labelDiv.append('span')
                    .html(label(d));

                tipDiv.append('hr')
                    .attr('class', 'tip divider')
                    .attr('size', 1);

                tipDiv.append('span')
                    .attr('class', 'tip prop')
                    .html(prop(d));

                tipDiv.style('display', 'inline')
                    .style('top', `${y - 20}px`)
                    .style('left', `${x + 20}px`);
            })
            .on('mousemove', function() {
                let x = event.clientX;
                let y = event.clientY;
                tipDiv.style('display', 'inline')
                    .style('top', `${y - 20}px`)
                    .style('left', `${x + 20}px`);
            })
            .on('mouseout', function() {
                tipDiv.selectAll('*').remove();
                tipDiv.style('display', 'none');
            });
    }

    tip.prop = function(_) {
        if (!arguments.length) return prop;
        prop = _;
        return tip;
    }

    tip.label = function(_) {
        if (!arguments.length) return label;
        label = _;
        return tip;
    }

    tip.iconColor = function(_) {
        if (!arguments.length) return iconColor;
        iconColor = _;
        return tip;
    }

    return tip;
}

export { tooltip }