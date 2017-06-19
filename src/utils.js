"use strict"

// let colorPalette = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#0099c6", "#dd4477", "#66aa00", "#b82e2e"].concat(colorbrewer.Paired[12]);
let colorPalette = ["#3366cc", "#dc3912", "#ff9900", "#109618", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac", "#990099"];
let baseColor = colorPalette[4];
const _ = require('lodash');

const getParent = function(level) {
    let parent;
    if (level == 'Kingdom' || level == 'Group') { parent = 'Kingdom' } else if (level == 'SubGroup') { parent = 'Group' } else if (level == 'Organism') { parent = 'SubGroup' }
    return parent;
}

const getSubLevel = function(level) {
    let sublevel;
    if (level == 'GOD') { sublevel = 'Kingdom' } else if (level == 'Kingdom') { sublevel = 'Group'; } else if (level == 'Group') { sublevel = 'SubGroup'; } else if (level == 'SubGroup') { sublevel = 'Organism'; }
    return sublevel;
}

/*-- Defining Custom Errors ---------------------------------------*/
const UnImplementedError = function(name = "ImplementationError", message = "") {
    // Error.apply(this, arguments);
    this.name = name;
    this.message = message;
}
UnImplementedError.prototype = Object.create(Error.prototype);

/*-- Getting Translate vector parameters from the TranslateString ------------*/
const getTranslateValue = function(translateString) {

    const x1 = translateString.indexOf("(");
    const x2 = translateString.indexOf(",");
    const resx = parseInt(translateString.slice(x1 + 1, x2));

    const y1 = translateString.indexOf(",");
    const y2 = translateString.indexOf(")");

    const resy = parseInt(translateString.slice(y1 + 1, y2));

    return [resx, resy];
}

/*-- Getting Maximum Limit for axis ------------------------------------------*/
const get_maxcod = function(ymax) {

    if (ymax < 10) { ymax = Math.ceil(ymax); } else if (ymax <= 100) { ymax = (Math.ceil(ymax / 10)) * 10 + 30; } else if (ymax <= 1000) { ymax = (Math.ceil(ymax / 100)) * 100 + 100; } else if (ymax <= 10000) { ymax = (Math.ceil(ymax / 100)) * 100 + 500; } else if (ymax <= 100000) { ymax = (Math.ceil(ymax / 1000)) * 1000 + 1000; } else if (100000 < ymax) { ymax = ((Math.ceil(ymax / 10000)) * 10000) + 5000; }
    return ymax;

}

/*-- Getting Unique Elements of a column -------------------------------------*/
const getUniqueElements = function(data, level) {
    return _.chain(data).pluck(level).unique().compact().value();
}

/*-- Getting Matching Rows based on a Column Value ---------------------------*/
const getMatchingRows = function(data, level, target) {
    var matching_data = _.map(data, function(d) {
        if (d[level] == target) {
            return d;
        }
    });
    return matching_data.filter(Boolean);
}

/*-- Get the matching column -------------------------------------------------*/
const getMatchingColumn = function(data, column) {
    var matcing_data = _.map(data, function(d) {
        return d[column];
    });

    return matcing_data;
}

/* -- Sort data by Column --------------------------------------------------- */
const sortByColumn = function(data, column, reverse) {
    const result = (reverse) ? _.sortBy(data, function(d) { return d.column }) : _.sortBy(data, function(d) { return d.column }).reverse();
}

/*-- Populating Data Table ---------------------------------------------------*/
const populateDataTable = function(data) {

    dataTable.destroy();

    d3.select('#data-table')
        .select('tbody')
        .selectAll('tr')
        .remove();

    const columns = ['Organism', 'Kingdom', 'Group', 'SubGroup', 'Size(Mb)', 'GC%', 'Genes', 'Proteins'];
    const dataRow = d3.select('#data-table')
        .select('tbody')
        .selectAll('tr')
        .data(data)
        .enter()
        .append('tr');

    for (let c in columns) {
        let column = columns[c];
        dataRow.append('td')
            .append('text')
            .text(function(d) { return d[column] });
    }

    dataTable = $('#data-table').DataTable();

}

/* -- Creating Color based on Data ------------------------------------------ */
const setCurrentPalette = function(data, val, level) {
    let barPalette = {};
    let scatterPalette = {};
    const levelElements = getUniqueElements(data, level)
    const parentElements = getUniqueElements(data, getParent(level));
    if (level === 'Kingdom') {
        labels = levelElements;
        for (let c in labels) {
            let label = labels[c];
            barPalette[label] = baseColor;
            scatterPalette[label] = colorPalette[c % colorPalette.length];
        }
    } else {
        if (parentElements.length === 1) {
            labels = levelElements;
            for (let a in labels) {
                let label = labels[a];
                barPalette[label] = baseColor;
                scatterPalette[label] = colorPalette[a % colorPalette.length];
            }
        } else {
            labels = parentElements;
            for (let b in labels) {
                let label = labels[b];
                const subElements = getUniqueElements(getMatchingRows(data, getParent(level), label), level);
                for (let c in subElements) {
                    c = subElements[c];
                    scatterPalette[c] = colorPalette[b % colorPalette.length];
                    barPalette[c] = colorPalette[b % colorPalette.length];
                }
            }
        }
    }

    // console.log(barPalette, scatterPalette);
    return [barPalette, scatterPalette];
}

export { getTranslateValue }