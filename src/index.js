const _ = require("lodash")
const d3 = require("d3")

import { stackData, stackChart } from './stackChart.js'
import { lineDatum, multilineChart } from './lineChart.js'
import { pieDatum, pieChart } from './pieChart.js'
import { scatterChart } from './scatterChart.js'
import { barChart } from './barChart.js'
import { getUniqueElements, getMatchingRows } from './utils.js'

/* Trial stack bar chart */
d3.tsv('../data/bar_data_2.tsv', function(data) {
    const barchartRoot = d3.select('#bar-main');
    const newBarChart = barChart()
                        .data(data)
                        .margin({ top: 40, bottom: 60, left: 80, right: 30 })
                        .xLabel('Repeats')
                        .yLabel('Abundance');
    
    barchartRoot.call(newBarChart);
});
                    
d3.tsv('../data/scatter_data.tsv', function(data){
    const scatterChartRoot = d3.select('#scatter-main');
    const newScatterChart = scatterChart()
                            .margin({top: 40, left: 80, right: 40, bottom: 80})
                            .data(data);
    
    scatterChartRoot.call(newScatterChart);
})

/* Trial Pie chart */
d3.tsv("../data/pie_data.tsv", function(data) {
    const pieRoot = d3.select('#pie-main');
    const newPieChart = pieChart().data(data).piePosition('center');
    pieRoot.call(newPieChart);
})
/* Trial line chart */
// d3.tsv('../data/repHFR.tsv', function(data) {

//     let repeats = _.uniq(_.map(data, 'repeat'));
//     let names = _.uniq(_.map(data, 'name'));
//     let xValues = _.range(1, 302);
//     let xLabels = _.range(-150, 151);

//     let plotdata = {};
//     for (let r in repeats) {
//         let rep = repeats[r];
//         let repData = _.filter(data, ['repeat', rep]);
//         console.log(rep);
//         plotdata[rep] = [];
//         for (let n in names) {
//             n = names[n];
//             let obj = { name: n, values: [] }
//             for (let x in xValues) {
//                 let win = xValues[x];
//                 let y = _.filter(repData, ['name', n])[0]['win_' + win]
//                 obj.values.push({ 'x': xLabels[x], 'y': parseFloat(y) })
//             }
//             plotdata[rep].push(obj);
//         }
//     }
//     let lineRoot = d3.select('#line-main');
//     let newLineChart = multilineChart().data(plotdata[repeats[0]]).margin({ top: 20, right: 20, bottom: 60, left: 80 }).xLabel('Window number').yLabel('Coverage');
//     lineRoot.call(newLineChart);

//     dropdown.on('change', function() {
//         lineRoot.select('svg').remove();
//         newLineChart = multilineChart().data(plotdata[this.value]).margin({ top: 20, right: 20, bottom: 60, left: 80 }).yLabel('Coverage').xLabel('Window number');
//         lineRoot.call(newLineChart);
//     })

// })

// d3.tsv('../data/BT.tsv', function(data) {

//     let names = _.map(_.uniqBy(data, 'repClass'), o => { return o.repClass; });
//     let units = (_.map(_.uniqBy(data, 'units'), o => { return parseInt(o.units); })).sort();
//     data = _.map(names, o => { let values = _.map(_.filter(data, { repClass: o }), p => { return { x: parseInt(p.units), y: parseInt(p.freq) } }); return { name: o, values: values } });
//     data = _.map(data, o => {
//         let values = o.values;
//         values = _.filter(values, d => { return d.x <= 50 && d.x >= 2; });
//         o.values = values;
//         return o;
//     })
//     console.log(data)
//     let lineRoot = d3.select('#line-main');
//     let newLineChart = multilineChart().data(data).margin({ top: 20, right: 20, bottom: 60, left: 80 }).xLabel('Repeat units').yLabel('Frequency');
//     lineRoot.call(newLineChart);
// })

/* Trial stack bar chart */
// d3.tsv('../data/data.tsv', function(data) {

//     let keys = _.uniq(_.map(data, d => { return d.repEnd; }));
//     data = _.map(data, o => {
//         o[o['repEnd']] = parseInt(o['freq']);
//         o['x'] = o['repLen'];
//         delete o['repEnd'];
//         delete o['freq'];
//         return o;
//     });
//     data = _.map(_.groupBy(data, o => { return o['repLen']; }), d => {
//         let obj = {};
//         for (let a in d) { a = d[a]; for (let b in a) { obj[b] = a[b]; } }
//         return obj;
//     });

//     const stackchartRoot = d3.select('#stacked-main');
//     const newStackedChart = stackChart().data(data).keys(keys)
//         .margin({ left: 60, top: 20, right: 20, bottom: 60 })
//         .xLabel('Repeat Length')
//         .yLabel('Frequency')
//         .labelDistance(20);

//     stackchartRoot.call(newStackedChart);
// })
