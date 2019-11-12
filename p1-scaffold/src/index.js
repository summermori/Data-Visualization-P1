import {select} from 'd3-selection';
import {csv} from 'd3-fetch';
import {min, max} from 'd3-array';
import {scaleLinear, scaleTime} from 'd3-scale';
import {axisLeft, axisBottom} from 'd3-axis';
import {stack, stackOffsetWiggle, area, line, curveMonotoneX, curveStep} from 'd3-shape';
import {range, processData} from './utils'
import {hsv} from 'd3-hsv';
// if the data you are going to import is small, then you can import it using es6 import
// import MY_DATA from './app/data/example.json'
// (I tend to think it's best to use screaming snake case for imported json)
const domReady = require('domready');

domReady(() => {
  // this is just one example of how to import data. there are lots of ways to do it!
  //fetch('./data/example.json')

  // array of csv strings
  const fileList = ['./data/main.csv', './data/world_data.csv'];
  Promise.all(fileList.map(f => csv(f)))
    .then(results => myVis(results));
});

function myVis(all_data) {
  // The posters will all be 24 inches by 36 inches
  // Your graphic can either be portrait or landscape, up to you
  // the important thing is to make sure the aspect ratio is correct.
  const [data, gdp_data] = all_data;
  // portrait
  //const width = 5000;
  //const height = 36 / 24 * width;
  const height = 5000; // TODO replace w/ 5000 for proper final size
  const width = 36 / 24 * height;

  // OUR CONSTANTS
  const margin = {left: width/100, right: width/100, top: height/25, bottom: height/100}; // TODO scale based on height/width
  const specs = {
    height: (height - margin.top - margin.bottom) / 2.5,
    width: 2 / 3 * (width - margin.left - margin.right) / 2,
    font: `${height/70}`
  }
  console.log(margin, specs)
  const normJapanData = processData(
    data.filter(d => d.country === 'Japan'),
    data.columns.slice(2, 8),
    stackOffsetWiggle);
  const rawJapanData = processData(
    data.filter(d => d.country === 'Japan'),
    data.columns.slice(8, 14));
  const normKoreaData = processData(
    data.filter(d => d.country === 'Republic of Korea'),
    data.columns.slice(2, 8),
    stackOffsetWiggle);
  const rawKoreaData = processData(
    data.filter(d => d.country === 'Republic of Korea'),
    data.columns.slice(8, 14));

  const yearAxisScale = scaleTime()
    .domain([new Date(min(data.map(d => d.year)), 0, 1), new Date(max(data.map(d => d.year)), 0, 1)])
    .range([margin.left, specs.width]);

  const yearScale = scaleLinear()
    .domain([min(data.map(d => d.year)), max(data.map(d => d.year))])
    .range([margin.left, specs.width]);

  const ages = ['5-14 years', '15-24 years', '25-34 years', '35-54 years', '55-74 years', '75+ years'];

  const colors = {
    '5-14 years': [hsv(0,  1, 1), hsv(0,  1, 1)],
    '15-24 years': [hsv(120, 0.9, 1), hsv(120, 1, 1)],
    '25-34 years': [hsv(39, 0.9, 1), hsv(39, 1, 1)],
    '35-54 years': [hsv(300, 0.6, 0.5), hsv(300, 0.5, 0.5)],
    '55-74 years': [hsv(60, 0.7, 1.0), hsv(60,  0.6, 1)],
    '75+ years': [hsv(240, 0.6, 1), hsv(240, 0.75, 1)]
  };

  const normScale = scaleLinear()
    .domain([
      Math.round(min([min(rawJapanData[0], d => d[0]), min(rawKoreaData[0], d => d[0])])),
      Math.round(max([max(normJapanData[5], d => d[1]), max(normKoreaData[5], d => d[1])]))])
    .range([specs.height/1.8, margin.bottom]);

  const rawScale = scaleLinear()
    .domain([0, Math.round(max([max(rawJapanData[5], d => d[1]), max(rawKoreaData[5], d => d[1])]))])
    .range([specs.height, margin.bottom]);

  const vis = select('.vis-container')
    .attr('width', width)
    .attr('height', height)
    //viewBox for left side of viz
    //.attr('viewBox', '-1500 0 9500 5000');

  vis.append('text')
    .text('SUICIDE IN JAPAN AND SOUTH KOREA')
    .attr('font-size', specs.font*3)
    .attr('transform', `translate(${margin.left}, ${margin.top})`)

  vis.append('text')
    .text('NORMALIZED SUICIDE RATE PER 100K AGE GROUP POPULATION')
    .attr('font-size', specs.font)
    .attr('transform', `translate(${specs.width * 1}, ${2*margin.top})`)

  vis.append('text')
    .text('SUICIDES PER YEAR')
    .attr('font-size', specs.font)
    .attr('transform', `translate(${2.3 * specs.width}, ${1*margin.top})`)

  //Names
  vis.append('text')
  .text('Max Demers')
  .attr('font-size', specs.font / 2)
  .attr('transform', `translate(${margin.left}, ${1.75*margin.top})`)

  vis.append('text')
  .text('Ryan Li')
  .attr('font-size', specs.font / 2)
  .attr('transform', `translate(${margin.left}, ${2*margin.top})`)

  /*
  //Horizontal Country Labels for each plot
  vis.append('text')
  .text('Japan')
  .attr('font-size', specs.font)
  .attr('transform', `translate(${1.45 * specs.width}, ${3*margin.top})`)

  vis.append('text')
  .text('Japan')
  .attr('font-size', specs.font)
  .attr('transform', `translate(${2.3 * specs.width}, ${1.8*margin.top})`)

  vis.append('text')
  .text('South Korea')
  .attr('font-size', specs.font)
  .attr('transform', `translate(${2.3 * specs.width}, ${14*margin.top})`)

  vis.append('text')
  .text('South Korea')
  .attr('font-size', specs.font)
  .attr('transform', `translate(${1.45 * specs.width}, ${13*margin.top})`)
  */
  const areaFill = area()
    .curve(curveMonotoneX)
    .x(d => yearScale(d.data.year))
    .y0(d => normScale(d[0]))
    .y1((d, i) => normScale(d[1]))

  function newYearAxis(x, y, id) {
    vis.append('g')
        .attr('class', `yearAxis${id}`)
        .attr('transform', `translate(${x}, ${y})`)
        .call(axisBottom(yearScale)
          .ticks(30)
          .tickFormat((d, i) => {return i % 5 == 0? d : ''}))

    vis.selectAll(`g.yearAxis${id} g.tick line`)
      .attr('y2', (d, i) => i % 5 == 0? specs.font/2 : specs.font/4)
      .attr('stroke-width', 2)

    vis.selectAll(`g.yearAxis${id} g.tick text`)
      .attr('y', specs.font/2)
      .style('font-size', specs.font)

    vis.append('text')
      .text('Year')
      .style('text-anchor', 'middle')
      .attr('transform', `translate(${x + yearScale('2000')}, ${y + 2.5 * specs.font})`)
      .attr('font-size', specs.font)
  }

  console.log(normKoreaData)
  function plot_norm(vis, data, id, area) { // TODO EXPORT

    vis.append('g')
      .attr('id', id)
      .selectAll('data')
      .append('g')
      .data(data)
      .enter()
      .append('path')
        .attr('id', d => d.key)
        .attr('transform', `translate(${graphs[id].x}, ${graphs[id].y})`)
        .style('fill', d => colors[d.key][0])
        .attr('d', area)

    console.log(data[3][0])
    vis.append('text')
      .text(id)
      .attr('text-anchor', 'middle')
      .attr('font-size', specs.font)
      .attr('transform', `translate(${graphs[id].x}, ${graphs[id].y + normScale(data[4][0][0])}) rotate(-90)`)
  }


  function plot_raw(vis, data, id,  area, graph) {
    const g = vis.append('g')
      .attr('id', id);

    newYearAxis(graph[id].x2, graph[id].y2, id);
    g.append('g')
      .attr('id', `${id}Axis`)
      .attr('class', 'axis')
      .attr('transform', `translate(${graph[id].x2 + margin.left}, ${graph[id].y1})`)
      .call(axisLeft(rawScale)
        .ticks(30)
        .tickFormat((d, i) => {return i % 5 == 0? `${d/1000}k` : ''}));

    vis.selectAll(`#${id}Axis g.tick line`)
      .attr('x2', (d, i) => i % 5 == 0? -specs.font / 2 : -specs.font / 4)
      .attr('stroke-width', 2);

    vis.selectAll(`#${id}Axis g.tick text`)
        .attr('x', -specs.font/2)
        .style('font-size', specs.font);

    vis.append('text')
      .text('Number of Suicides')
      .style('text-anchor', 'middle')
      .attr('transform', `translate(${graph[id].x2 - 1.5 * specs.font}, ${graph[id].y1 + rawScale(16500)}) rotate(-90)`)
      .attr('font-size', specs.font)

    g.selectAll('data')
      .append('g')
      .data(data)
      .enter().append('path')
        .attr('id', d => d.key)
        .attr('transform', `translate(${graph[id].x2}, ${graph[id].y1})`)
        .style('fill', d => colors[d.key.slice(0, -4)][1])
        .attr('stroke', 'black')
        .attr('stroke-opacity', 0.9)
        .attr('stroke-width', 0.5)
        .attr('d', areaFill);
  }

  const graphs = {
    'Japan': {x: specs.width - margin.left * 5, y: margin.top * 2},
    'Korea': {x: specs.width - margin.left * 5, y: specs.height + margin.top * 4},
    'rawJapan': {x1: margin.left, x2: 2*specs.width, y1: margin.top * 2, y2: specs.height + margin.top * 2},
    'rawKorea': {x1: margin.left, x2: 2*specs.width, y1: specs.height + margin.top * 3, y2: specs.height * 2 + margin.top * 3}
  }

  plot_norm(vis, normJapanData, 'Japan', areaFill, graphs);
  plot_norm(vis, normKoreaData, 'Korea', areaFill, graphs);
  newYearAxis(specs.width - margin.left * 5, specs.height + margin.top * 2, 'normAxis');

  areaFill.curve(curveStep)
    .y0(d => rawScale(d[0]))
    .y1((d, i) => rawScale(d[1]));

  plot_raw(vis, rawJapanData, 'rawJapan', areaFill, graphs)
  plot_raw(vis, rawKoreaData, 'rawKorea', areaFill, graphs)

  vis.selectAll(`g.axis g.tick text`)
    .style('font-size', specs.font)

  const g = vis.append('g')
    .attr('id', 'constillation');

  const avgScale = scaleLinear()
    .domain([0, max(gdp_data.map(d => +d['suicides/100k pop']))])
    .range([specs.height, margin.bottom]);

  const gdpScale = scaleLinear()
    .domain([0, max(gdp_data.map(d => +d['gdp_per_capita ($)']))])
    .range([margin.left, specs.width/1.2]);

  g.append('g')
      .attr('class', 'axis')
      .attr('id', 'avgAxis')
      .attr('transform', `translate(${margin.left*3}, ${1.5 * specs.height})`)
      .call(axisLeft(avgScale))

  g.append('g')
      .attr('id', 'gdpAxis')
      .attr('class', 'axis')
      .attr('transform', `translate(${2*margin.left}, ${2.5*specs.height})`)
      .call(axisBottom(gdpScale)
        .ticks(16, 's'))

  vis.selectAll('#avgAxis g.tick line')
    .attr('x2', (d, i) => i % 5 == 0? -specs.font / 2 : -specs.font / 4)
    .attr('stroke-width', 2)

  vis.selectAll('#avgAxis g.tick text')
      .attr('x', -specs.font / 2)
      .style('font-size', specs.font)

  vis.selectAll('#gdpAxis g.tick line')
    .attr('y2', (d, i) => i % 5 == 0? specs.font / 2 : specs.font / 4)
    .attr('stroke-width', 2)

  vis.selectAll('#gdpAxis g.tick text')
      .attr('y', specs.font / 2)
      .style('font-size', specs.font)

  g.append('text')
    .text('GDP per Capita ($)')
    .style('text-anchor', 'middle')
    .attr('transform', `translate(${2 * margin.left + gdpScale(60000)}, ${2.5 * specs.height + 2.5 * specs.font})`)
    .attr('font-size', specs.font)

  g.append('text')
    .text('Suicides')
    .style('text-anchor', 'middle')
    .attr('transform', `translate(${3 * margin.left - 2 * specs.font}, ${1.5 * specs.height + avgScale(25)}) rotate(-90)`)
    .attr('font-size', specs.font)


  const cline = line()
    .curve(curveMonotoneX)
    .x(d => gdpScale(+d['gdp_per_capita ($)']))
    .y(d => avgScale(+d['suicides/100k pop']))

  function plot_parametric(data, key, r, col) {

    g.append('g')
      .attr('id', key)
      .selectAll('gpd_data')
      .data([data.filter(d => d.country === key)])
      .enter().append('path')
      .attr('transform', `translate(${2*margin.left}, ${1.5 * specs.height})`)
        .attr('fill', 'none')
        .attr('stroke', col)
        .attr('stroke-width', '0.5em')
        .attr('d', cline)
  }

  g.append('g')
    .attr('id', 'Other Countries')
    .selectAll('circle')
    .attr('class', 'markers')
    .data(gdp_data)
    .enter().append('circle')
      .attr('transform', `translate(${2*margin.left}, ${1.5*specs.height})`)
      .attr('r', specs.font/10)
      .attr('id', d => d.country + d.year)
      .attr('cx', d => gdpScale(+d['gdp_per_capita ($)']))
      .attr('cy', d => avgScale(+d['suicides/100k pop']))
      .attr('fill', hsv(0, 0, 0.4) )///'grey')

  plot_parametric(gdp_data, 'Japan', 2, 'red')
  plot_parametric(gdp_data, 'Republic of Korea', 2, 'blue')

  function annotation(vis, text, year, x, y1, y2, y3, offset, direction='Both') {
    let a = vis.append('g')
      .attr('class', 'annotation');

    a.append('text')
      .text(text)
      .attr('font-size', specs.font/1.5)
      .style('text-anchor', 'middle')
      .attr('x', yearScale(year) + x)
      .attr('y', y1)

    if (direction === 'Both' || direction === 'Japan') {
      a.append('line')
        .attr('stroke', 'black')
        .attr('stroke-width', 4)
        .style('stroke-dasharray', '4,10')
        .attr('x1', yearScale(year) + x)
        .attr('x2', yearScale(year) + x)
        .attr('y1', y1 - offset/1.4)
        .attr('y2', y2 + offset/0.6);
    }

    console.log(y1-offset/1.4, y1 + offset/4)
    if (direction === 'Both' || direction === 'Korea') {
      a.append('line')
        .attr('stroke', 'black')
        .attr('stroke-width', 4)
        .style('stroke-dasharray', '4,10')
        .attr('x1', yearScale(year) + x)
        .attr('x2', yearScale(year) + x)
        .attr('y1', y1 + offset/4)
        .attr('y2', y3 - offset);
    }
  }

  annotation(vis, 'Asia Financial Crisis', '1997',
    graphs['Japan'].x,
    specs.height + graphs['Japan'].y - specs.font,
    graphs['Japan'].y,
    graphs['rawKorea'].y2 - 1.25 * specs.font,
    specs.font)

  annotation(vis, 'Tsuname Hits Japan', '2011',
    graphs['Japan'].x,
    specs.height + graphs['Japan'].y - specs.font * 3,
    graphs['Japan'].y,
    graphs['rawKorea'].y2 - 2 * specs.font,
    specs.font,
    'Japan')

  annotation(vis, 'Paraquat Pesticide Ban', '2011',
    graphs['Japan'].x,
    specs.height + graphs['Japan'].y + specs.font*3,
    graphs['Japan'].y,
    graphs['rawKorea'].y2 - 1.25 * specs.font,
    specs.font,
    'Korea')

  annotation(vis, 'Global Financial Recession', '2007',
    graphs['Japan'].x,
    specs.height + graphs['Japan'].y - specs.font,
    graphs['Japan'].y,
    graphs['rawKorea'].y2 - 1.25 * specs.font,
    specs.font)


}
