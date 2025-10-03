// services/dummyData.js
function monthlySales() {
  return {
    title: 'Penjualan per Bulan',
    labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'],
    values: [12,18,9,14,20,11,7,16,19,13,15,22],
  };
}

function ticketStatus() {
  return {
    title: 'Ticket by Status',
    labels: ['Open','In Progress','Resolved','Closed'],
    values: [23, 14, 32, 18],
  };
}

function categoryTopN() {
  return {
    title: 'Top 5 Kategori',
    labels: ['A','B','C','D','E'],
    values: [120, 95, 80, 60, 45],
  };
}

function weeklyRandom(title = 'Traffic 7 Hari') {
  const days = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  const values = days.map(() => Math.floor(Math.random()*50)+10);
  return { title, labels: days, values };
}

module.exports = { monthlySales, ticketStatus, categoryTopN, weeklyRandom };
