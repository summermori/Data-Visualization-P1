import {stack, stackOffsetWiggle} from 'd3-shape';

// example of how to export functions
// this particular util only doubles a value so it shouldn't be too useful
export function myExampleUtil(x) {
  return x * 2;
}

export function processData(data, cols, off) {
  // ASSUMES PIVOT dATA
  return stack()
    .keys(cols) // SLICE OUT COUNTRY + YEAR
    .offset(off)
    (data)
}

// BASED ON PYTHON range()
export function range(start, end, step) {
  return [... new Array(Math.floor((end - start) / step + 0.5))].map((d, i) => i*step);
}

function country_gen_iter(data) {
  // landscape
  //const height = 5000;
  //console.log(data); // TODO REMOVE
  const height = 700; // TODO replace w/ 5000 for proper final size
  const width = 36 / 24 * height;

  // OUR CONSTANTS
  const margin = {left: 20, right: 20, top: 10, bottom: 20}; // TODO scale based on height/width
  const maxRadius = width/35;
  console.log(height, width, margin); // TODO REMOVE

  data.forEach(d => {
    d.population = Number(d.population);
    d['suicides/100k pop'] = Number(d['suicides/100k pop']);
    d.suicides_no = Number(d.suicides_no);
  });

  const yearAxisScale = scaleTime()
    .domain([new Date(min(data.map(d => d.year)), 0, 1), new Date(max(data.map(d => d.year)), 0, 1)])
    .range([height - margin.top, margin.bottom*2]);

  // Year scale currently set up to be vertical
  const yearScale = scaleLinear()
    .domain([min(data.map(d => d.year)), max(data.map(d => d.year))])
    .range([height - margin.top, margin.bottom*2]);

  // TODO: Build Legend.

  // TODO: Pick better colors
  const colors = [
    '#dc322f', // red
    '#002b36', // gold
    '#859900', // green
    '#268bd2', // blue
    '#d33682', // magenta
    '#002b36', // gold
    '#cb4b16']; //orange

  const genScale = scaleOrdinal()
    .domain(data.map(d => d.generation))
    .range(schemeSet1);

  //console.log([maxRadius/20, maxRadius]);
  const sScale = scaleLinear()
    .domain([0, max(data.map(d => d.suicides_no / d.population * 100000))])
    .range([maxRadius/10, maxRadius]);

  // TODO: Make Dynamic
  const countryOffsets = [
    1 * width / 5 -  110,
    2 * width / 5 - 110,
    3 * width / 5 - 110,
    4 * width / 5 - 110,
    5 * width / 5 - 110];

  const countryScale = scaleOrdinal()
    .domain(new Set(data.map(d => d.country)))
    .range(countryOffsets);

  const vis = select('#vis')
    .attr('style', 'border: thin solid red')
    .attr('width', width)
    .attr('height', height)
    .attr('font-family', 'Helvetica');

  // Create One Axis Per Country
  countryOffsets.forEach(d => {
    vis.append('g')
      .attr('class', 'axis')
      .attr('transform', `translate(${d}, ${-margin.bottom})`)
      .attr('stroke-opacity', 0.5)
      .call(axisLeft(yearAxisScale).ticks(15))
  });

  const node = vis.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(data)
      .enter().append('circle')
        .attr('id', d => d.year + d.country + d.generation)
        .attr('r', d => sScale(d.suicides_no / d.population * 100000))
        .attr('fill', d => genScale(d.generation))
        .attr('fill-opacity', 0.6)
        .attr('stroke-opacity', 0.5)
        .attr('stroke', 'black')
        .attr('transform', `translate(0, ${-margin.bottom})`);

  // TODO: Figure out a way to have larger circles be oriented on the outside (left/right) of the year.
  const simulation = forceSimulation()
    .velocityDecay(0.9)
    .force('x', forceX((d, i) => countryScale(d.country)).strength(0.3))// + sScale(d['suicides/100k pop']) * (d.year % 2 == 0? 1: -1)))
    .force('y', forceY(d => yearScale(d.year)).strength(12)) // Absolute Y positioning
    .force('collide',
      forceCollide().radius(d => sScale(d['suicides/100k pop']) + 0.1))
    .force('manyBody', d => forceManyBody(countryScale(d.country)).strength(1))
    .nodes(data)
    .on('tick', v => {
      node.attr('cx', d => d.x)
        .attr('cy', d => d.y);
    });

  data.forEach((d, i) => {
    d.y = yearScale(d.year);
    d.x = countryScale(d.country) + sScale(d['suicides/100k pop']) * (d.year % 2 == 0? 1: -1)
  });

  simulation.on('end', () => console.log('END'));
}
/*
function createAnnotation(grouping, text, trans, text_off, arrow=false, aline={x1:0, y1:0, x2:0, y2:0}, size='1em') {
  let a = grouping.append('g')
    .attr('id', 'annotation')
    .attr('transform', `translate(${trans.x}, ${trans.y})`)

  a.append('text')
    .text(text)
    .attr('font-family', 'Trebuchet MS')
    .attr('font-size', size)
    .attr('x', yearScale(text_off.x))
    .attr('y', text_off.y)

  if (arrow) {
    a.append('line')
      .attr('y1', aline.y1)
      .attr('y2', aline.y2)
      .attr('x1', yearScale(aline.x1))
      .attr('x2', yearScale(aline.x2))
      //.style("stroke-dasharray", ("3, 3"))
      .attr('stroke', 'black')
  }
}
const  g1 = {x: specs.width - margin.left, y: -margin.top}
const  g2 = {x: specs.width - margin.left, y: specs.height - margin.top}
*/
  /*
  createAnnotation(g, "Ages 75+", g1, {x:"1986", y:110})//, true)
  createAnnotation(g, "Ages 55-74", g1, {x:"1986", y:165})//, true)
  createAnnotation(g, "Ages 35-54", g1, {x:"1986", y:198})//, true)
  createAnnotation(g, "Ages 25-34", g1, {x:"1990", y:250}, true, {x1: "1990", x2: "1986", y1: 245, y2:230})
  createAnnotation(g, "Ages 15-24", g1, {x:"1989", y:280}, true, {x1: "1989", x2: "1986", y1: 275, y2:245})
  createAnnotation(g, "Ages 5-14", g1, {x:"1988", y:310}, true, {x1: "1988", x2: "1986", y1: 305, y2:254.5})
  createAnnotation(g, "'97 Asia Financial Crisis", g1, {x:"1995", y:40}, true, {x1: "1998", x2: "1997", y1: 45, y2:80}, '0.5em')
  createAnnotation(g, "Tsuname Hits Japan", g1, {x:"2010", y:40}, true, {x1: "2013", x2: "2011", y1: 45, y2:100}, '0.5em')
  createAnnotation(g, "Paraquat Pesticide Ban", g2, {x:"1990", y:40}, true, {x1: "1997.5", x2: "2011", y1: 38, y2:45}, '0.5em')
  */
