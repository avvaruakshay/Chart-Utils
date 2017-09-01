const _ = require("lodash")
const d3 = require("d3")

import { stackData, stackChart } from './stackChart.js'
import { lineDatum, multilineChart } from './lineChart.js'
import { pieDatum, pieChart } from './pieChart.js'

d3.tsv('../data/data.tsv', function(data) {

    /* Trial pie chart */
    data = _.map(Object.keys(_.countBy(data, 'repEnd')), o => { return { name: o, value: 39 } });

    const chartRoot = d3.select('#main');
    const newPieChart = pieChart().data(data).piePosition('center');

    chartRoot.call(newPieChart);

    /* Trial multi line chart */
    // let names = _.map(_.uniqBy(data, 'repEnd'), o => { return o.repEnd; });
    // let lengths = (_.map(_.uniqBy(data, 'repLen'), o => { return parseInt(o.repLen); })).sort();

    // data = _.map(names, o => { let values = _.map(_.filter(data, { repEnd: o }), p => { return { x: parseInt(p.repLen), y: parseInt(p.freq) } }); return { name: o, values: values } });

    // const chartRoot = d3.select('#main');

    // const newLineChart = multilineChart().data(data).margin({ top: 20, right: 20, bottom: 40, left: 80 });
    // chartRoot.call(newLineChart);

    /* Trial stack bar chart */
    // let keys = _.uniq(_.map(data, d => { return d.repEnd; }));
    // data = _.map(data, o => {
    //     o[o['repEnd']] = parseInt(o['freq']);
    //     o['x'] = o['repLen'];
    //     delete o['repEnd'];
    //     delete o['freq'];
    //     return o;
    // });
    // data = _.map(_.groupBy(data, o => { return o['repLen']; }), d => {
    //     let obj = {};
    //     for (let a in d) { a = d[a]; for (let b in a) { obj[b] = a[b]; } }
    //     return obj;
    // });

    // const chartRoot = d3.select('#main');
    // const newStackedChart = stackChart().data(data).keys(keys)
    //     .margin({ left: 60, top: 20, right: 20, bottom: 60 })
    //     .xLabel('Repeat Length')
    //     .yLabel('Frequency')
    //     .labelDistance(20);

    // chartRoot.call(newStackedChart);
})