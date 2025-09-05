const socket = io();

// console.log('connected');
if (navigator.geolocation) {
  const geoOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
  };
  // Ensure at least one immediate position is sent even if the tab becomes backgrounded
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    geoOptions
  );
  navigator.geolocation.watchPosition(
    (position) => {
      const { latitude, longitude } = position.coords;
      socket.emit("send-location", { latitude, longitude });
    },
    (error) => {
      console.error(error);
    },
    geoOptions
  );
}

const map = L.map("map").setView([0, 0], 16); //latitude,longitude,zoom level

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: "your welcome here",
}).addTo(map);

const markers = {};

function getStableDegreeJitterForId(id, baseLat) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  const angleRad = ((hash % 360) * Math.PI) / 180;
  const distanceMeters = 35 + (hash % 25);
  const metersPerDegLat = 111320;
  const metersPerDegLng =
    111320 * Math.max(0.1, Math.cos((baseLat * Math.PI) / 180));
  const dLat = (Math.sin(angleRad) * distanceMeters) / metersPerDegLat;
  const dLng = (Math.cos(angleRad) * distanceMeters) / metersPerDegLng;
  return [dLat, dLng];
}

function fitMapIfMultiple() {
  const ids = Object.keys(markers);
  if (ids.length >= 2) {
    const group = L.featureGroup(ids.map((k) => markers[k]));
    map.fitBounds(group.getBounds().pad(0.15), { maxZoom: 16 });
  }
}

socket.on("receive-location", (data) => {
  const { id, number, latitude, longitude } = data;
  const [dLat, dLng] = getStableDegreeJitterForId(id, latitude);
  const lat = latitude + dLat;
  const lng = longitude + dLng;

  if (markers[id]) {
    markers[id].setLatLng([lat, lng]);
    if (markers[id].__label) markers[id].__label.setLatLng([lat, lng]);
  } else {
    markers[id] = L.marker([lat, lng]).addTo(map);
    // show small number label near the marker
    const text = number != null ? String(number) : "?";
    const label = L.marker([lat, lng], {
      icon: L.divIcon({
        className: "num-label",
        html: `<div>${text}</div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 22],
      }),
      interactive: false,
      keyboard: false,
    }).addTo(map);
    markers[id].__label = label;
    if (Object.keys(markers).length === 1) {
      map.setView([lat, lng], 16);
    }
  }
});

// Receive existing active locations when connecting
socket.on("active-locations", (list) => {
  list.forEach(({ id, number, latitude, longitude }) => {
    const [dLat, dLng] = getStableDegreeJitterForId(id, latitude);
    const lat = latitude + dLat;
    const lng = longitude + dLng;
    if (markers[id]) {
      markers[id].setLatLng([lat, lng]);
      if (markers[id].__label) markers[id].__label.setLatLng([lat, lng]);
    } else {
      markers[id] = L.marker([lat, lng]).addTo(map);
      const text = number != null ? String(number) : "?";
      const label = L.marker([lat, lng], {
        icon: L.divIcon({
          className: "num-label",
          html: `<div>${text}</div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 22],
        }),
        interactive: false,
        keyboard: false,
      }).addTo(map);
      markers[id].__label = label;
    }
  });
});

// After listeners are bound, request current active locations
socket.emit("request-active-locations");

socket.on("user-disconnected", (id) => {
  if (markers[id]) {
    map.removeLayer(markers[id]);
    delete markers[id];
  }
});
