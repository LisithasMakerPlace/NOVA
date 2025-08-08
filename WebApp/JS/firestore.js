import { getFirestore, collection, getDocs, setDoc, doc } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-firestore.js";

window.firedb = getFirestore(window.app);

function getCollectionAndDocPath() {
  const now = new Date();

  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');

  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');

  const colid = `log_${yyyy}_${mm}_${dd}`;
  const docid = `001_${hh}:${min}`;

  return { colid, docid };
}

setInterval(() => {
  const { colid, docid } = getCollectionAndDocPath();
  const updaterec = doc(firedb, colid, docid);

  const sensorData = {
    General_level: window.db_LED ?? `Safe`,
    Sound_level: window.db_db ?? 45,
    PM1: window.db_PM1 ?? 2,
    PM25: window.db_PM25 ?? 6,
    PM10: window.db_PM10 ?? 6,
    TVOC: window.db_TVOC ?? 0,
    CO2eq: window.db_CO2eq ?? 400,
    Humidity: window.db_hum ?? 50.00,
    Temparature: window.db_temp ?? 30,
    Absolute_humidity: window.db_A_hum ?? 20
  };

  setDoc(updaterec, sensorData, { merge: true });
}, 10000); //Create new database document every 1 minute. 

function convertToCSV(data) {
  if (data.length === 0) return "";

  const keys = Object.keys(data[0]);
  const header = keys.join(",");
  const rows = data.map(row => keys.map(k => JSON.stringify(row[k] ?? "")).join(","));
  return [header, ...rows].join("\n");
}
function downloadCSV(csvContent, filename = "data.csv") {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
async function exportCollectionToCSV(collectionName) {
  const snapshot = await getDocs(collection(window.firedb, collectionName));
  const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  const csv = convertToCSV(data);
  downloadCSV(csv, `${collectionName}.csv`);
}
document.getElementById("csvbtn").addEventListener("click", () => {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, '0');
  const dd = String(today.getDate()).padStart(2, '0');
  const collectionName = `log_${yyyy}_${mm}_${dd}`; // format log_2025_06_19

  exportCollectionToCSV(collectionName);
});