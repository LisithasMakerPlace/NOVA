import { collection, getDocs, onSnapshot, query, orderBy, limit } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

let chart1, chart2, chart3, chart4, chart5, chart6, chart7, chart8;
const ctx1 = document.getElementById('myChart1');
const ctx2 = document.getElementById('myChart2');
const ctx3 = document.getElementById('myChart3');
const ctx4 = document.getElementById('myChart4');
const ctx5 = document.getElementById('myChart5');
const ctx6 = document.getElementById('myChart6');
const ctx7 = document.getElementById('myChart7');
const ctx8 = document.getElementById('myChart8');

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2, '0');
const dd = String(today.getDate()).padStart(2, '0');
const collectionName = `log_${yyyy}_${mm}_${dd}`;

const logRef = collection(window.firedb, collectionName);
const q = query(logRef, orderBy("__name__", "desc"), limit(12));

function createChart(ctx, label, color, values, suggestedMax = 200) {
  const labels = [...Array(values.length).keys()];
  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: label,
        data: values,
        borderColor: color,
        fill: false,
        cubicInterpolationMode: 'monotone',
        tension: 1
      }]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: label,
          font: { family: 'Ubuntu', size: 14, weight: '500' },
          color: '#f9f9f9'
        }
      },
      interaction: { intersect: true },
      scales: {
        x: { display: false },
        y: {
          display: true,
          suggestedMin: 0,
          suggestedMax: suggestedMax,
          ticks: {
            color: '#f0f0f0',
            font: { size: 14, family: 'Ubuntu', weight: '300' }
          }
        }
      }
    }
  });
}

function setgraph(activemarker) {
  if (activemarker === 1) {
    getDocs(q).then(snapshot => {
      const readings = snapshot.docs.reverse().map(doc => doc.data());

      const values = {
        Temperature: readings.map(e => e.Temparature ?? 0),
        Humidity: readings.map(e => e.Humidity ?? 0),
        PM1: readings.map(e => e.PM1 ?? 0),
        PM25: readings.map(e => e.PM25 ?? 0),
        PM10: readings.map(e => e.PM10 ?? 0),
        TVOC: readings.map(e => e.TVOC ?? 0),
        Sound_level: readings.map(e => e.Sound_level ?? 0),
        CO2eq: readings.map(e => e.CO2eq ?? 0)
      };

      chart1 = createChart(ctx2, 'Temperature', '#00a0aa', values.Temperature, 50);
      chart2 = createChart(ctx3, 'Humidity', '#00a0aa', values.Humidity, 100);
      chart3 = createChart(ctx4, 'PM1', '#00a0aa', values.PM1, 100);
      chart4 = createChart(ctx5, 'PM2.5', '#00a0aa', values.PM25, 100);
      chart5 = createChart(ctx6, 'PM10', '#00a0aa', values.PM10, 100);
      chart6 = createChart(ctx1, 'TVOC', '#00a0aa', values.TVOC, 1000);
      chart7 = createChart(ctx7, 'Sound Level', '#00a0aa', values.Sound_level, 100);
      chart8 = createChart(ctx8, 'CO2eq', '#00a0aa', values.CO2eq, 1500);
    });
  }
}
window.setgraph = setgraph;

// Real-time graph updates
onSnapshot(q, (snapshot) => {
  const readings = snapshot.docs.reverse().map(doc => doc.data());

  const updateValues = {
    Temparature: readings.map(e => e.Temparature ?? 0),
    Humidity: readings.map(e => e.Humidity ?? 0),
    PM1: readings.map(e => e.PM1 ?? 0),
    PM25: readings.map(e => e.PM25 ?? 0),
    PM10: readings.map(e => e.PM10 ?? 0),
    TVOC: readings.map(e => e.TVOC ?? 0),
    Sound_level: readings.map(e => e.Sound_level ?? 0),
    CO2eq: readings.map(e => e.CO2eq ?? 0),
  };

  if (chart1) { chart1.data.datasets[0].data = updateValues.Temparature; chart1.update(); }
  if (chart2) { chart2.data.datasets[0].data = updateValues.Humidity; chart2.update(); }
  if (chart3) { chart3.data.datasets[0].data = updateValues.PM1; chart3.update(); }
  if (chart4) { chart4.data.datasets[0].data = updateValues.PM25; chart4.update(); }
  if (chart5) { chart5.data.datasets[0].data = updateValues.PM10; chart5.update(); }
  if (chart6) { chart6.data.datasets[0].data = updateValues.TVOC; chart6.update(); }
  if (chart7) { chart7.data.datasets[0].data = updateValues.Sound_level; chart7.update(); }
  if (chart8) { chart8.data.datasets[0].data = updateValues.CO2eq; chart8.update(); }
});