"use strict";

const _ = require("lodash")
const d3 = require("d3")

//styles
import '../node_modules/bulma/css/bulma.min.css'
import '../styles/main.css'

import { stackData, stackChart } from './stackChart.js'
import { lineDatum, multilineChart } from './lineChart.js'
import { pieDatum, pieChart } from './pieChart.js'
import { scatterChart } from './scatterChart.js'
import { barChart } from './barChart.js'
import { getUniqueElements, getMatchingRows } from './utils.js'
import { drawSlate } from './drawSlate.js'


let sepY;
let dataH;
let chartH;
let mouseY;
d3.select('#data-sep-chart')
  .on('mousedown', function(d){
        sepY = d3.select(this).node().getBoundingClientRect().y;
        dataH = d3.select('#data-box').node().getBoundingClientRect().height;
        chartH = d3.select('#chart-area').node().getBoundingClientRect().height;
        mouseY = event.clientY;
        console.log(sepY, dataH, mouseY);
        d3.select('body').on('mousemove', function(){
            d3.select('#data-box').style('height', `${dataH - mouseY + event.clientY}px`);
            d3.select('#chart-area').style('height', `${chartH + mouseY - event.clientY}px`);
        })
  })
  .on('mouseup', function(){
    d3.select('body').on('mousemove', function(){})
  })

let sepX;
let leftW;
let mouseX;
d3.select("#left-sep-right")
  .on('mousedown', function(d){
        sepX = d3.select(this).node().getBoundingClientRect().x;
        leftW = d3.select('#left-panel').node().getBoundingClientRect().width;
        // chartH = d3.select('#chart-area').node().getBoundingClientRect().height;
        mouseX = event.clientX;
        console.log(sepX, leftW, mouseX);
        d3.select('body').on('mousemove', function(){
            d3.select('#left-panel').style('width', `${leftW - mouseX + event.clientX}px`);
            // d3.select('#chart-area').style('height', `${chartH + mouseY - event.clientY}px`);
        })
  })
  .on('mouseup', function(){
    d3.select('body').on('mousemove', function(){})
  })

const plotChart = function(chartType){
    const chartRoot = d3.select('#chart-area');
    let chartFunc;

    if (chartType === "bar") {
        d3.tsv('../data/bar_data_2.tsv', function(data) {
            const newBarChart = barChart()
                                .data(data)
                                .margin({ top: 40, bottom: 60, left: 80, right: 30 })
                                .xLabel('Repeats')
                                .yLabel('Abundance');
            chartRoot.call(newBarChart);
        });
    }
    else if (chartType === "stack") {
        d3.tsv('../data/stack_data.tsv', function(data) {
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

            const newStackedChart = stackChart().data(data).keys(keys)
                                                .margin({ left: 60, top: 20, right: 20, bottom: 60 })
                                                .xLabel('Repeat Length')
                                                .yLabel('Frequency')
                                                .labelDistance(20);

            chartRoot.call(newStackedChart);
        })
    }
    else if (chartType === "scatter")  {
        d3.tsv( '../data/scatter_data.tsv', function(data) {
            const newScatterChart = scatterChart()
                                    .margin({top: 40, left: 80, right: 40, bottom: 80})
                                    .data(data)
                                    .xLabel('Genome size(MB)')
                                    .yLabel('SSR density');
            
            chartRoot.call(newScatterChart);
        })
    }
    else if (chartType === "line")  {
        d3.tsv('../data/line_data.tsv', function(data) {
            console.log(data);
            let names = _.map(_.uniqBy(data, 'repClass'), o => { return o.repClass; });
            let units = (_.map(_.uniqBy(data, 'units'), o => { return parseInt(o.units); })).sort();
            data = _.map(names, o => { let values = _.map(_.filter(data, { repClass: o }), p => { return { x: parseInt(p.units), y: parseInt(p.freq) } }); return { name: o, values: values } });
            data = _.map(data, o => {
                let values = o.values;
                values = _.filter(values, d => { return d.x <= 50 && d.x >= 2; });
                o.values = values;
                return o;
            })
            let newLineChart = multilineChart().data(data)
                                .margin({ top: 20, right: 20, bottom: 60, left: 80 })
                                .xLabel('Repeat units')
                                .yLabel('Frequency');
            chartRoot.call(newLineChart);
    })
    }
    else if (chartType === 'pie')  {
        d3.tsv("../data/pie_data.tsv", function(data) {
            const newPieChart = pieChart().data(data).piePosition('center');
            chartRoot.call(newPieChart);
        })
    }
    else if (chartType === 'slate') {
        console.log('Slate is activated!')
        drawSlate(chartRoot);
    }
}

d3.selectAll('.tab').on('click', function(){
    d3.select('.tab.is-active').attr('class', 'tab');
    this.classList.add('is-active');
    let chartType = this.id;
    d3.select('svg').remove();
    plotChart(chartType);
})

document.getElementById('bar').click();






















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
