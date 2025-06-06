let map;
let eventosCargados = [];

document.addEventListener('DOMContentLoaded', () => {
    if (!navigator.geolocation) {
        alert("Geolocalización no es soportada por tu navegador");
        initMapDefault();
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            map = L.map('mapContainer').setView([lat, lon], 13);

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors'
            }).addTo(map);

            L.marker([lat,lon]).addTo(map)
                .bindPopup('Estas aquí')
                .openPopup();

            cargarEventos();
        },
        (error) => {
            alert("No se pudo obtener la ubiación.");
            initMapDefault();
        }
    );
});

function initMapDefault() {
    map = L.map('mapContainer').setView([40.4168, -3.7038], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    cargarEventos();
}

async function cargarEventos() {
    fetch("/api/event/get_all_events")
        .then(response => response.json())
        .then(data => {
            eventosCargados = data;
            pintarEventosMapa();
        })
        .catch(error => {
            alert("Hubo un problema");
            window.location.href = "/login";
        });
}

function pintarEventosMapa() {
    eventosCargados.forEach(evento => {
        const imagenHtml = evento.imagen
            ? `<img src="${evento.imagen}" alt="${evento.nombre}" style="width:150px; height:auto; display:block; margin: 0 auto 10px;" />`
            : '';

        const popupContent = `
      <div style="text-align:center;">
        <h3>${evento.nombre}</h3>
        ${imagenHtml}
        <button onclick="window.location.href='/details/${evento._id}'" style="background:#ff5f6d; color:white; border:none; padding:8px 12px; border-radius:4px; cursor:pointer;">
          Ir a evento
        </button>
      </div>
    `;

        L.marker([evento.lugar.lat, evento.lugar.lon])
            .addTo(map)
            .bindPopup(popupContent);
    });
}