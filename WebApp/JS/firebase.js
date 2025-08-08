import { initializeApp } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js";
import { getDatabase, ref, onValue, off } from "https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js";

const firebaseConfig = { //ENTER YOUR FIREBASE CONFIG HERE!
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  databaseURL: "YOUR_DATABASE_URL",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

  window.app = initializeApp(firebaseConfig);
  const database = getDatabase(window.app);

  window.db_lat = null;
  window.db_long = null;
  window.db_LED = null;
  window.db_db = null;
  window.db_PM1 = null;
  window.db_PM25 = null;
  window.db_PM10 = null;
  window.db_TVOC = null;
  window.db_CO2eq = null;
  window.db_hum = null;
  window.db_temp = null;
  window.db_A_hum = null;

  const dataref1 = ref(database, 'Location/Lat');
  const dataref2 = ref(database, 'Location/Long');
  let dataref3 = ref(database, 'LED');

  onValue(dataref1, (snapshot) => {
  window.db_lat = snapshot.val();
  console.log("Latitude:", window.db_lat);
  });
  onValue(dataref2, (snapshot) => {
  window.db_long = snapshot.val();
  console.log("Longitude:", window.db_long);

  if (dynamicMarker) {
    dynamicMarker.position = {lat: window.db_lat, lng: window.db_long};
  }
  });

  onValue(dataref3, (snapshot) => {
    window.db_LED = snapshot.val();
    console.log("LED", window.db_LED);

      if (dynamicMarker) {
        if (window.db_LED === "Safe") {
          markerContent.className = "GREEN";
        } else if (window.db_LED === "Moderate") {
          markerContent.className = "YEL";
        } else if (window.db_LED === "Hazardous") {
          markerContent.className = "RED";
        }
      }
    });

function update(activemarker) {
  if (activemarker === 1){
    dataref3 = ref(database, 'LED');
    const dataref4 = ref(database, 'Decibel');
    const dataref5 = ref(database, 'PMS7003/PM1');
    const dataref6 = ref(database, 'PMS7003/PM25');
    const dataref7 = ref(database, 'PMS7003/PM10');
    const dataref8 = ref(database, 'SVM30/TVOC');
    const dataref9 = ref(database, 'SVM30/CO2eq');
    const dataref10 = ref(database, 'SVM30/Humidity');
    const dataref11 = ref(database, 'SVM30/Temprature');
    const dataref12 = ref(database, 'SVM30/Absolute_Humidity');

    off(dataref3);
    off(dataref4);
    off(dataref5);
    off(dataref6);
    off(dataref7);
    off(dataref8);
    off(dataref9);
    off(dataref10);
    off(dataref11);
    off(dataref12);

    onValue(dataref3, (snapshot) => {
    window.db_LED = snapshot.val();
    console.log("LED", window.db_LED);
    document.getElementById('LED').innerHTML = window.db_LED;

      if (dynamicMarker) {
        if (window.db_LED === "Safe") {
          markerContent.className = "GREEN";
        } else if (window.db_LED === "Moderate") {
          markerContent.className = "YEL";
        } else if (window.db_LED === "Hazardous") {
          markerContent.className = "RED";
        }
      }
    });
    onValue(dataref4, (snapshot) => {
  window.db_db = snapshot.val();
  console.log("DB", window.db_db);
  document.getElementById('decibel').innerHTML = window.db_db;
});
onValue(dataref5, (snapshot) => {
  window.db_PM1 = snapshot.val();
  console.log("PM1", window.db_PM1);
  document.getElementById('PM1').innerHTML = window.db_PM1;
});
onValue(dataref6, (snapshot) => {
  window.db_PM25 = snapshot.val();
  console.log("PM25", window.db_PM25);
  document.getElementById('PM25').innerHTML = window.db_PM25;
});
onValue(dataref7, (snapshot) => {
  window.db_PM10 = snapshot.val();
  console.log("PM10", window.db_PM10);
  document.getElementById('PM10').innerHTML = window.db_PM10;
});
onValue(dataref8, (snapshot) => {
  window.db_TVOC = snapshot.val();
  console.log("TVOC", window.db_TVOC);
  document.getElementById('TVOC').innerHTML = window.db_TVOC;
});
onValue(dataref9, (snapshot) => {
  window.db_CO2eq = snapshot.val();
  console.log("CO2eq", window.db_CO2eq);
  document.getElementById('CO2eq').innerHTML = window.db_CO2eq;
});
onValue(dataref10, (snapshot) => {
  window.db_hum = snapshot.val();
  console.log("Humidity", window.db_hum);
  document.getElementById('hum').innerHTML = window.db_hum;
});
onValue(dataref11, (snapshot) => {
  window.db_temp = snapshot.val();
  console.log("Temparature", window.db_temp);
  document.getElementById('temp').innerHTML = window.db_temp;
});
onValue(dataref12, (snapshot) => {
  window.db_A_hum = snapshot.val();
  console.log("Absolute Humidity", window.db_A_hum);
  document.getElementById('A_hum').innerHTML = window.db_A_hum;
});
  }
}
window.update = update;