const _ = require("lodash")
const d3 = require("d3")

import { stackData, stackChart } from './stackChart.js'

const chartRoot = d3.select('#main').append('svg').attr('height', '80vh').attr('width', '80vw').attr('id', 'chartRoot');
stackChart()