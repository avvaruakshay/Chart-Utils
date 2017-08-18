const _ = require("lodash")
const d3 = require("d3")

import { stackData, stackChart } from './stackChart.js'

d3.tsv('../data/data.tsv', function(data) {
    let keys = _.uniq(_.map(data, d => { return d.repEnd; }));

    data = _.map(data, o => {
        o[o['repEnd']] = parseInt(o['freq']);
        o['x'] = o['repLen'];
        delete o['repEnd'];
        delete o['freq'];
        return o;
    });
    data = _.map(_.groupBy(data, o => { return o['repLen']; }), d => {
        let obj = {};
        for (let a in d) { a = d[a]; for (let b in a) { obj[b] = a[b]; } }
        return obj;
    });

    const chartRoot = d3.select('#main');
    const newStackedChart = stackChart().data(data).keys(keys)
        .margin({ left: 60, top: 20, right: 20, bottom: 60 })
        .xLabel('Repeat Length')
        .yLabel('Frequency')
        .labelDistance(20);

    chartRoot.call(newStackedChart);

    // window.onclick = function() {
    //     data = data.slice(2, data.length);
    //     newStackedChart.data(data);
    // }
})