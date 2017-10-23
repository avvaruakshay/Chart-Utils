const _ = require("lodash")
const d3 = require("d3")

import { stackData, stackChart } from './stackChart.js'
import { lineDatum, multilineChart } from './lineChart.js'
import { pieDatum, pieChart } from './pieChart.js'
import { scatterChart } from './scatterChart.js'

// d3.tsv('../data/BT.tsv', function(data) {

//     let names = _.map(_.uniqBy(data, 'repClass'), o => { return o.repClass; });
//     let units = (_.map(_.uniqBy(data, 'units'), o => { return parseInt(o.units); })).sort();
//     // names = ['AC', 'AG', 'AT', 'AAG'];
//     data = _.map(names, o => { let values = _.map(_.filter(data, { repClass: o }), p => { return { x: parseInt(p.units), y: parseInt(p.freq) } }); return { name: o, values: values } });
//     data = _.map(data, o => {
//             let values = o.values;
//             values = _.filter(values, d => { return d.x <= 50 && d.x >= 8; });
//             // console.log(values);
//             o.values = values;
//             return o;
//         })
//         // console.log(data);
//     const lineRoot = d3.select('#line-main');
//     const newLineChart = multilineChart().data(data).margin({ top: 20, right: 20, bottom: 40, left: 80 }).xLabel('Repeat Units').yLabel('Frequency');
//     lineRoot.call(newLineChart);

// })

/* Trial stack bar chart */
d3.tsv('../data/data.tsv', function(data) {

    console.log(data);

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

    const chartRoot = d3.select('#stacked-main');
    const newStackedChart = stackChart().data(data).keys(keys)
        .margin({ left: 60, top: 20, right: 20, bottom: 60 })
        .xLabel('Repeat Length')
        .yLabel('Frequency')
        .labelDistance(20);

    chartRoot.call(newStackedChart);
})

// d3.tsv("../data/pie_data.tsv", function(data) {
//     const pieRoot = d3.select('#pie-main');
//     const newPieChart = pieChart().data(data).piePosition('center');
//     pieRoot.call(newPieChart);
// })