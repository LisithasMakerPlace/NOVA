//Initialize google maps API of NOVA WebApp. Created by Lisitha's Maker Place.*/
let dynamicMarker = null;
let markerContent = document.createElement("div");
let map;
async function initMap() {
  const { Map, InfoWindow } = await google.maps.importLibrary("maps");
  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  const {ColorScheme} = await google.maps.importLibrary("core");

  map = new Map(document.getElementById("map"), {
    center: { lat: 7, lng: 80.7},
    zoom: 8,
    disableDefaultUI: true,
    mapId: "yourmapid", //ENTER YOUR GOOGLE MAPS JAVASCRYPT API - MAP ID
    colorScheme: ColorScheme.DARK,
  });

  markerContent.className = "GREEN"; // Defaults to green color marker
  markerContent.textContent = "";

  const RED = document.createElement("div");
  RED.className = "RED";
  RED.textContent = "";
  const YEL = document.createElement("div");
  YEL.className = "YEL";
  YEL.textContent = "";
  const GREEN = document.createElement("div");
  GREEN.className = "GREEN";
  GREEN.textContent = "";

  dynamicMarker = new AdvancedMarkerElement({
  map,
  content: markerContent,
  gmpClickable: true,
  title: '<div class="message">NOVA 001</div>',
  position: { lat: 7.4, lng: 80.5 }, // Default pin location
  });

  const dynamicinfoWindow = new InfoWindow();
  dynamicMarker.addListener("click", () => {
    window.activemarker = 1;
    setgraph(1);
    update(1);
    dynamicinfoWindow.close();
    dynamicinfoWindow.setContent(dynamicMarker.title);
    dynamicinfoWindow.open(dynamicMarker.map, dynamicMarker);
  });
}
initMap();