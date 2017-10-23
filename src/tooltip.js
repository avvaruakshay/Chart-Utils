const d3 = require('d3');


/*
  A function that can be called on svg elements to assign a tooltip
  initialisation: create a div element just outside the svg and giv it a id  "tooltip"
  usage : element.call(tooltip)
  define : (header, prop|props) 
 */
const tooltip = function() {

    let tipstyle = 'default'; //(pointer|default)
    let xOffset = 10;
    let yOffset = 10;
    let position;
    /* header = {
       datum: (html|string|function),
       icon: (null|circle|square|rounded-square), 
       iconColor: (color|function)
     } */
    let header, headerDiv, headerIcon, headerDatum;

    /* 
      Basic data type of a property is (key, value) pair.
      The function specified for "prop" should return a string which get embedded as html.
      The function specified for "props" should return a list of Objects [{name: n, value: v, color: c}].
      prop = {                                      | props = {
      datum: (html|string|function),                |   data: (List of Objs(name, value)|Object|function),
                                                    |   keys: (list),
      icon: (null|circle|square|rounded-square),    |   icon: (null|circle|square|rounded-square|list|function),
      iconColor: (color|function),                  |   iconColor: (color|function),
    }                                               |}                                                          */
    let prop, props, propDiv, propIcon, propDatum;

    let tipDiv = d3.select('.tooltip');

    let tip = function(selection) {
        tipDiv.attr('class', `tooltip ${tipstyle}`);
        tipDiv.selectAll('*').remove();

        if (header) {
            headerDiv = tipDiv.append('div').attr('class', 'tip header');
            if (header.icon) { headerIcon = headerDiv.append('span').attr('class', `tip icon ${header.icon}`); }
            headerDatum = headerDiv.append('span').attr('class', 'tip headerDatum');
            if (prop || props) { tipDiv.append('hr').attr('class', 'tip divider').attr('size', 1); }
        }

        if (prop) {
            propDiv = tipDiv.append('div').attr('class', 'tip prop');
            if (prop.icon) { propIcon = propDiv.append('span').attr('class', `tip icon ${prop.icon}`); }
            propDatum = propDiv.append('span').attr('class', 'tip propDatum');
        }

        selection.on('mouseover', function(d, i) {
                let datum = d;
                let index = i;
                let x = event.clientX;
                let y = event.clientY;

                if (header) {
                    if (typeof header.datum === 'function') { headerDatum.html(header.datum(d)); } else if (typeof header.datum === 'string') { headerDatum.html(header.datum); }
                    if (header.icon && header.iconColor) {
                        if (typeof header.iconColor === 'function') { headerIcon.style('background-color', header.iconColor(d)); } else if (typeof header.iconColor === 'string') { headerIcon.style('background-color', d[iconColor]); }
                    }
                }

                if (prop) {
                    if (typeof prop.datum === 'function') { propDatum.html(prop.datum(d)); } else if (typeof propDatum === 'string') { propDatum.html(prop.datum); }
                    if (prop.icon && prop.iconColor) {
                        if (typeof prop.iconColor === 'function') { propIcon.style('background-color', prop.iconColor(d)); } else if (typeof prop.iconColor === 'string') { propIcon.style('background-color', d[iconColor]); }
                    }
                } else if (props) {
                    let propsData = [];
                    if (typeof props.data === 'object') { for (let d in props.data) { propsData.push({ name: d, value: props.data[d] }) } } else if (props.data.constructor === Array) { propsData = props.data; } else if (typeof props.data === 'function') { propsData = props.data(datum); }

                    propDiv = tipDiv.selectAll('.prop').data(propsData).enter().append('div').attr('class', 'tip prop');
                    if (props.icon) {
                        propIcon = propDiv.append('span').attr('class', `tip icon ${props.icon}`).style('background-color', function(d) { return d.color; });
                    }
                    propDatum = propDiv.append('span').attr('class', 'tip propDatum').html(function(d) { return `${d.name}: ${d.value}`; });
                }
            })
            .on('mousemove', function() {
                let x = event.clientX;
                let y = event.clientY;
                tipDiv.style('display', 'inline')
                    .style('left', `${x + xOffset}px`)
                    .style('top', `${y + yOffset}px`);
            })
            .on('mouseout', function() {
                tipDiv.style('display', 'none');
            });
    }

    tip.prop = function(_) {
        if (!arguments.length) return prop;
        prop = _;
        return tip;
    }

    tip.header = function(_) {
        if (!arguments.length) return header;
        header = _;
        return tip;
    }

    tip.props = function(_) {
        if (!arguments.length) return props;
        props = _;
        return tip;
    }

    tip.tipstyle = function(_) {
        if (!arguments.length) return tipstyle;
        tipstyle = _;
        return tip;
    }

    tip.xOffset = function(_) {
        if (!arguments.length) return xOffset;
        xOffset = _;
        return tip;
    }

    tip.yOffset = function(_) {
        if (!arguments.length) return yOffset;
        yOffset = _;
        return tip;
    }

    return tip;
}

export { tooltip }