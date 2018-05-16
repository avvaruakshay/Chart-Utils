"use strict";

const _ = require("lodash")
const d3 = require("d3")

//styles
import '../node_modules/bulma-extensions/bulma-accordion/dist/bulma-accordion.min.css'
import '../node_modules/bulma/css/bulma.min.css'
import '../node_modules/bulma-extensions/bulma-checkradio/dist/bulma-checkradio.min.css'
import '../styles/main.css'

import '../node_modules/bulma-extensions/bulma-accordion/dist/bulma-accordion.min.js'
import { getUniqueElements, getMatchingRows } from './utils.js'
import { barChart } from './barChart.js'
import { scatterChart } from './scatterChart.js'
import { stackChart } from './stackChart.js'
import { multilineChart } from './lineChart.js'
import { pieDatum, pieChart } from './pieChart.js'
import { boxChart } from './boxChart.js'
import { drawSlate } from './drawSlate.js'
import { dataTypeof } from './datahandler.js'

// dataTypeof(['a', '1', 'b', function(){}, [1,2,3], 7, null]);
// dataTypeof(['1', '2', '3', '4']);
// dataTypeof([[1,2,4], [234,1234,123,46]]);
// dataTypeof([null, null, null]);

const populateTable = function(tableData) {
    d3.select('#data-table').selectAll('*').remove();
    d3.select('#data-table').append('thead').append('tr').html(function(){
        let html = '';
        html += '<th><input class="table-select all is-checkradio is-success" type="checkbox"></th>';
        html += '<th>ID</th>'
        for (let i=0; i < tableData[0].length; i++) { html += `<th title="${tableData[0][i]}">${tableData[0][i]}</th>`; }
        return html;
    })
    d3.select('#data-table').append('tbody').attr('id', 'data-tbody');
    const tableRows = d3.select('#data-tbody').selectAll('tr')
      .data(tableData.splice(1,tableData.length))
      .enter()
      .append('tr')
      .html(function(d,i){
          let html = '';
          html += '<td><div class="field"></div><input class="table-select is-checkradio is-success" type="checkbox"></div></td>';
          html += `<td>${i+1}</td>`;
          for (let i=0; i < d.length; i++) { html += `<td title="${d[i]}">${d[i]}</td>`; }
          return html;
      });
}

const parseFile = function(){
    let name = this.files[0].name;
    d3.select('.file-name').html(name)
    let reader = new FileReader()
    reader.onload = function(e) {
        let text = reader.result;
        const tableData = d3.tsvParseRows(text);
        console.log(tableData);
        populateTable(tableData);
    }
    reader.readAsText(this.files[0])
}
d3.select("#file-upload").on('change', parseFile);

let sepX;
let leftW;
let mouseX;
d3.select("#left-sep-right")
  .on('mousedown', function(d){
        sepX = d3.select(this).node().getBoundingClientRect().x;
        leftW = d3.select('#left-panel').node().getBoundingClientRect().width;
        mouseX = event.clientX;
        console.log(sepX, leftW, mouseX);
        d3.select('body').on('mousemove', function(){
            d3.select('#left-panel').style('width', `${leftW - mouseX + event.clientX}px`);
        })
  })
  .on('mouseup', function(){
    d3.select('body').on('mousemove', function(){})
  })

const plotChart = function(chartType){
    const chartRoot = d3.select('#chart-area');
    let chartFunc;

    if (chartType === "bar") {
        d3.tsv('./data/bar_data.tsv', function(data) {
            const newBarChart = barChart().margin({ top: 40, bottom: 60, left: 80, right: 30 });

            // .margin({ top: 40, bottom: 60, left: 80, right: 30 })
            // .xLabel('Repeats')
            // .yLabel('Abundance')
            // .yMax(15).yMin(-2);
            chartRoot.call(newBarChart);
            newBarChart.data({a: '1', b: '2', c: '3', d: '4', e: '-2'})

            // newBarChart.data({banana: 2, apple: 4, orange: 7});
            // chartRoot.call(newBarChart);            
        });
    }
    else if (chartType === "stack") {
        d3.tsv('./data/stack_data.tsv', function(data) {
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
        d3.tsv( './data/scatter_data.tsv', function(data) {
            const newScatterChart = scatterChart()
                                    .margin({top: 40, left: 80, right: 40, bottom: 80})
                                    .data(data)
                                    .xLabel('Genome size(MB)')
                                    .yLabel('SSR density');
            
            chartRoot.call(newScatterChart);
        })
    }
    else if (chartType === "line")  {
        d3.tsv('./data/line_data.tsv', function(data) {
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
        d3.tsv("./data/pie_data.tsv", function(data) {
            const newPieChart = pieChart().data(data).piePosition('center');
            chartRoot.call(newPieChart);
        })
    }
    else if (chartType === 'box') {
        d3.tsv('./data/iris_data.tsv', function(data){
            let values = _.map(_.filter(data, o => o.Class === "Iris-setosa"), d => d["Petal length"]);
            let plotData = [{name: "Petal length", 'values': values}];
            console.log('This is original data', plotData);
            const newBoxChart = boxChart().data(plotData);
            chartRoot.call(newBoxChart);

            d3.selectAll('.box.y.axis > .domain').remove();
            d3.select('.box.y.axis').selectAll(".tick line").attr("stroke", "#aeaeae").attr("stroke-dasharray", "2,2");
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
