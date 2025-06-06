const map = L.map('map').setView([40.4168, -3.7038], 13); // Coordenadas de Madrid

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// Ejemplo de marcador
L.marker([40.4168, -3.7038])
  .addTo(map)
  .bindPopup('Estás en Madrid.')
  .openPopup();
