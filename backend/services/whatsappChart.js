// services/whatsappChart.js
const { MessageMedia } = require('whatsapp-web.js');
const { makeBarChartImage } = require('./chartService');
const Dummy = require('./dummyData');

/**
 * Kirim bar chart ke WA
 * @param {object} client - instance dari WhatsApp client
 * @param {string} to - nomor tujuan (mis. 6281234567890@c.us)
 * @param {{title?:string, labels?:string[], values?:number[], preset?: 'sales'|'ticket'|'top'|'weekly'}} payload
 */
async function sendBarChart(client, to, payload = {}) {
  let data;

  if (payload.labels && payload.values) {
    data = { title: payload.title || 'Bar Chart', labels: payload.labels, values: payload.values };
  } else {
    switch (payload.preset) {
      case 'ticket': data = Dummy.ticketStatus(); break;
      case 'top':    data = Dummy.categoryTopN(); break;
      case 'weekly': data = Dummy.weeklyRandom(); break;
      case 'sales':
      default:       data = Dummy.monthlySales();
    }
  }

  const png = await makeBarChartImage(data);
  const media = new MessageMedia('image/png', png.toString('base64'), 'chart.png');
  await client.sendMessage(to, media, { caption: `📊 ${data.title}` });
}

module.exports = { sendBarChart };
