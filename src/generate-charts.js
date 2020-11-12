const fs = require("fs");
const path = require("path");
const fetch = require("node-fetch");
const d3 = require("d3");
const JSDOM = require("jsdom").JSDOM;

const WAKATIME_API_KEY = process.env.INPUT_WAKATIME_API_KEY;

const createGeneratedDirectory = () => {
  process.stdout.write("Creating generated directory...");
  fs.mkdirSync(path.join(__dirname, "generated"), { recursive: true });
  console.log("Done.");
};

const getStatsData = async () => {
  const raw_response = await fetch(
    `https://wakatime.com/api/v1/users/current/stats/last_7_days?api_key=${WAKATIME_API_KEY}`
  );
  const response = await raw_response.json();
  return response.data;
};

const generateLanguageStatsChart = (allData) => {
  const data = allData.languages.slice(0, 5);

  // Measurements
  const svgWidth = 540;
  const svgHeight = 175;
  const margin = 20;
  const namesWidth = 125;
  const durationsWidth = 125;

  const contentWidth = svgWidth - 2 * margin;
  const contentHeight = svgHeight - 2 * margin;

  const namesX = margin;
  const durationsX = namesX + namesWidth;
  const chartX = durationsX + durationsWidth;
  const chartWidth = contentWidth - chartX + margin;

  const headerY = margin;
  const headerHeight = 18 + margin / 2;
  const statsY = headerY + headerHeight;
  const statsHeight = contentHeight - headerHeight;

  // Document
  const document = new JSDOM("").window.document;
  const body = d3.select(document).select("body");

  const languageColors = JSON.parse(fs.readFileSync("colors.json", "utf-8"));

  // SVG
  const svg = body
    .append("svg")
    .attr("version", "1.1")
    .attr("xmlns", d3.namespaces.svg)
    .attr("xmlns:xlink", d3.namespaces.xlink)
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  // Card
  svg
    .append("rect")
    .attr("width", svgWidth - 2)
    .attr("height", svgHeight - 2)
    .attr("x", 1)
    .attr("y", 1)
    .attr("rx", 4.5)
    .attr("stroke", "rgb(228,226,226)")
    .attr("fill", "rgb(255,254,254)")
    .attr("stroke-opacity", 1);

  // Header
  svg
    .append("text")
    .attr("transform", `translate(${margin} ${headerY})`)
    .attr("class", "titleText")
    .attr("dominant-baseline", "hanging")
    .html("Weekly Language Stats");

  // Align Y axis
  const yScale = d3
    .scaleBand()
    .domain(data.map((datum) => datum.name))
    .range([0, statsHeight])
    .paddingInner(0.2);

  // Language names
  svg
    .append("g")
    .attr("transform", `translate(${namesX}, ${statsY})`)
    .attr("width", namesWidth)
    .selectAll()
    .data(data)
    .enter()
    .append("text")
    .attr("class", "nameText")
    .attr("y", (datum) => yScale.bandwidth() / 2 + yScale(datum.name))
    .attr("dominant-baseline", "middle")
    .attr("style", (_, i) => `animation-delay: ${500 + i * 250}ms`)
    .html((datum) => datum.name);

  // Langugage durations
  svg
    .append("g")
    .attr("transform", `translate(${durationsX}, ${statsY})`)
    .attr("width", durationsWidth)
    .selectAll()
    .data(data)
    .enter()
    .append("text")
    .attr("class", "durationText")
    .attr("y", (datum) => yScale.bandwidth() / 2 + yScale(datum.name))
    .attr("dominant-baseline", "middle")
    .attr("style", (_, i) => `animation-delay: ${600 + i * 250}ms`)
    .html((datum) => datum.text);

  // Chart
  const chart = svg
    .append("g")
    .attr("transform", `translate(${chartX}, ${statsY})`);

  const chartDomainLimit = data.reduce(
    (max, datum) => (datum.total_seconds > max ? datum.total_seconds : max),
    0
  );

  const chartXScale = d3
    .scaleLinear()
    .range([0, chartWidth])
    .domain([0, chartDomainLimit]);

  chart
    .selectAll()
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "durationBar")
    .attr("y", (datum) => yScale(datum.name))
    .attr("height", yScale.bandwidth())
    .attr("width", (datum) => chartXScale(datum.total_seconds))
    .attr("style", (_, i) => `animation-delay: ${700 + i * 250}ms;`)
    .attr("fill", (datum) =>
      languageColors[datum.name] ? languageColors[datum.name].color : "#333333"
    );

  // Styles
  svg.append("style").html(`
    text { font: 600 15px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333333 }
    .nameText, .durationText { opacity: 0; animation: fadeInAnimation 0.5s ease-in-out forwards; }
    .durationBar { transform: scaleX(0); animation: scaleXInAnimation 0.5s ease-in-out forwards; }
    .titleText { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2f80ed; animation: fadeInAnimation 0.8s ease-in-out forwards; }
    @keyframes fadeInAnimation {
      0%   { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes scaleXInAnimation {
      0%   { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
`);

  fs.writeFileSync(
    "generated/wakatime_weekly_language_stats.svg",
    body.node().innerHTML
  );
};

const generateProjectStatsChart = (allData) => {
  const data = allData.projects.slice(0, 5);

  // Measurements
  const svgWidth = 540;
  const svgHeight = 175;
  const margin = 20;
  const namesWidth = 125;
  const durationsWidth = 125;

  const contentWidth = svgWidth - 2 * margin;
  const contentHeight = svgHeight - 2 * margin;

  const namesX = margin;
  const durationsX = namesX + namesWidth;
  const chartX = durationsX + durationsWidth;
  const chartWidth = contentWidth - chartX + margin;

  const headerY = margin;
  const headerHeight = 18 + margin / 2;
  const statsY = headerY + headerHeight;
  const statsHeight = contentHeight - headerHeight;

  // Document
  const document = new JSDOM("").window.document;
  const body = d3.select(document).select("body");

  // SVG
  const svg = body
    .append("svg")
    .attr("version", "1.1")
    .attr("xmlns", d3.namespaces.svg)
    .attr("xmlns:xlink", d3.namespaces.xlink)
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .attr("viewBox", `0 0 ${svgWidth} ${svgHeight}`);

  // Card
  svg
    .append("rect")
    .attr("width", svgWidth - 2)
    .attr("height", svgHeight - 2)
    .attr("x", 1)
    .attr("y", 1)
    .attr("rx", 4.5)
    .attr("stroke", "rgb(228,226,226)")
    .attr("fill", "rgb(255,254,254)")
    .attr("stroke-opacity", 1);

  // Header
  svg
    .append("text")
    .attr("transform", `translate(${margin} ${headerY})`)
    .attr("class", "titleText")
    .attr("dominant-baseline", "hanging")
    .html("Weekly Project Stats");

  // Align Y axis
  const yScale = d3
    .scaleBand()
    .domain(data.map((datum) => datum.name))
    .range([0, statsHeight])
    .paddingInner(0.2);

  // Project names
  svg
    .append("g")
    .attr("transform", `translate(${namesX}, ${statsY})`)
    .attr("width", namesWidth)
    .selectAll()
    .data(data)
    .enter()
    .append("text")
    .attr("class", "nameText")
    .attr("y", (datum) => yScale.bandwidth() / 2 + yScale(datum.name))
    .attr("dominant-baseline", "middle")
    .attr("style", (_, i) => `animation-delay: ${500 + i * 250}ms`)
    .html((datum) => datum.name);

  // Project durations
  svg
    .append("g")
    .attr("transform", `translate(${durationsX}, ${statsY})`)
    .attr("width", durationsWidth)
    .selectAll()
    .data(data)
    .enter()
    .append("text")
    .attr("class", "durationText")
    .attr("y", (datum) => yScale.bandwidth() / 2 + yScale(datum.name))
    .attr("dominant-baseline", "middle")
    .attr("style", (_, i) => `animation-delay: ${600 + i * 250}ms`)
    .html((datum) => datum.text);

  // Chart
  const chart = svg
    .append("g")
    .attr("transform", `translate(${chartX}, ${statsY})`);

  const chartDomainLimit = data.reduce(
    (max, datum) => (datum.total_seconds > max ? datum.total_seconds : max),
    0
  );

  const chartXScale = d3
    .scaleLinear()
    .range([0, chartWidth])
    .domain([0, chartDomainLimit]);

  chart
    .selectAll()
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "durationBar")
    .attr("y", (datum) => yScale(datum.name))
    .attr("height", yScale.bandwidth())
    .attr("width", (datum) => chartXScale(datum.total_seconds))
    .attr("style", (_, i) => `animation-delay: ${700 + i * 250}ms;`)
    .attr("fill", "#438cee");

  // Styles
  svg.append("style").html(`
    text { font: 600 15px 'Segoe UI', Ubuntu, Sans-Serif; fill: #333333 }
    .nameText, .durationText { opacity: 0; animation: fadeInAnimation 0.5s ease-in-out forwards; }
    .durationBar { transform: scaleX(0); animation: scaleXInAnimation 0.5s ease-in-out forwards; }
    .titleText { font: 600 18px 'Segoe UI', Ubuntu, Sans-Serif; fill: #2f80ed; animation: fadeInAnimation 0.8s ease-in-out forwards; }
    @keyframes fadeInAnimation {
      0%   { opacity: 0; }
      100% { opacity: 1; }
    }
    @keyframes scaleXInAnimation {
      0%   { transform: scaleX(0); }
      100% { transform: scaleX(1); }
    }
`);

  fs.writeFileSync(
    "generated/wakatime_weekly_project_stats.svg",
    body.node().innerHTML
  );
};

(async () => {
  createGeneratedDirectory();
  const data = await getStatsData();
  generateLanguageStatsChart(data);
  generateProjectStatsChart(data);
})();
