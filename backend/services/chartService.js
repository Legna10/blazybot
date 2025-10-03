// services/chartService.js
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');

const width = 900;
const height = 500;
const backgroundColour = 'white';

const chart = new ChartJSNodeCanvas({
  width,
  height,
  backgroundColour,
});

/**
 * Build config Chart.js untuk bar chart
 */
function buildBarConfig({ title = 'Bar Chart', labels = [], values = [] }) {
  return {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: title,
          data: values,
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: false,
      plugins: {
        legend: { display: false },
        title: { display: true, text: title },
        tooltip: { enabled: true },
      },
      scales: {
        y: { beginAtZero: true, ticks: { precision: 0 }, grid: { display: true } },
        x: { grid: { display: false } },
      },
    },
  };
}

/**
 * Render bar chart menjadi PNG buffer
 * @param {{title:string, labels:string[], values:number[]}} args
 * @returns {Promise<Buffer>}
 */
async function makeBarChartImage(args) {
  const cfg = buildBarConfig(args);
  return await chart.renderToBuffer(cfg); // image/png default
}

module.exports = { makeBarChartImage };
