import { showItems, hideItems } from "./utils.js";

// Mostrar / Ocultar Mapa
const mapaBtn = document.getElementById('mapaEventoBtn');
const mapaContainer = document.getElementById('mapContainer');
let map; // Variable para el mapa
let marker;
let nombre_lugar_evento = '';

mapaBtn.addEventListener('click', () => {
    const isVisible = !mapaContainer.classList.contains('d-none'); // si NO tiene 'd-none', entonces está visible
    if (isVisible) {
        hideItems([mapaContainer]);
        mapaBtn.textContent = 'Mostrar mapa';
    } else {
        showItems([mapaContainer]);
        mapaBtn.textContent = 'Ocultar mapa';

        // Inicializa el mapa solo cuando sea necesario
        if (!map) {
            drawMap();
        }
    }
});

// Función para inicializar el mapa
function drawMap() {
    map = L.map('mapaEventoContainer').setView([40.4168, -3.7038], 13); // Centro en Madrid

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Manejo de búsqueda de lugar
    document.getElementById('buscarBtn').addEventListener('click', async () => {
        const lugar = document.getElementById('buscadorLugar').value;
        if (!lugar) return alert('Escribe un lugar para buscar');

        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`);
        const data = await res.json();

        if (data.length > 0) {
            const { lat, lon, display_name } = data[0];
            nombre_lugar_evento = display_name;
            if (marker) marker.remove(); // Elimina el marcador anterior
            marker = L.marker([lat, lon]).addTo(map)
                .bindPopup(display_name)
                .openPopup();

            map.setView([lat, lon], 16); // Mueve el mapa al nuevo lugar

            console.log("Lugar seleccionado:", { nombre: display_name, lat, lon });
        } else {
            alert('No encontrado');
        }
    });
}

// Agregar grupo de entradas
const nuevoGrupoBtn = document.getElementById('nuevoGrupoEntradas');
const gruposContainer = document.getElementById('gruposContainer');

nuevoGrupoBtn.addEventListener('click', () => {
    const grupo = document.createElement('div');
    grupo.classList.add('border', 'p-3', 'mb-3', 'rounded');

    grupo.innerHTML = `
        <div class="row g-3">
          <div class="col-md-4">
            <input type="text" class="form-control" id="tipoEntrada"  placeholder="Tipo de entrada" required>
          </div>
          <div class="col-md-4">
            <input type="number" class="form-control" id="cantidadEntradas" placeholder="Cantidad" required>
          </div>
          <div class="col-md-4">
            <input type="number" class="form-control" id="precioEntradas" placeholder="Precio" required>
          </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm mt-3 eliminarGrupo">Eliminar grupo</button>
    `;

    grupo.querySelector('.eliminarGrupo').addEventListener('click', () => {
        grupo.remove();
    });

    gruposContainer.appendChild(grupo);
});

// Simular envío de formulario
document.getElementById('eventoForm').addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Formulario enviado correctamente.');
});


// Creacion de eventos
document.getElementById("eventoForm").addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombreEvento = document.getElementById('nombreEvento').value;
    const descripcionEvento = document.getElementById('descripcionEvento').value;
    const fechaEvento = document.getElementById('fechaEvento');
    const capacidadEvento = document.getElementById('capacidadEvento');
    const imagenEvento = document.getElementById('imagenEvento').files[0];

    const lugarEvento = {
        nombre: nombre_lugar_evento,
        lat: marker.getLatLng().lat,
        lon: marker.getLatLng().lng
    };

    let imagenUrl = '';
    if(imagenEvento){
        imagenUrl = URL.createObjectURL(imagenEvento);
    }

    const entradas = [];

    const entradasGrupos = document.querySelectorAll('#gruposContainer .row');
    entradasGrupos.forEach(grupo => {
        const tipo = grupo.getElementById('tipoEntrada');
        const cantidad = grupo.getElementById('cantidadEntradas');
        const precio = grupo.getElementById('precioEntrada');

        entradas.push({ tipo, cantidad, precio });
    });

    const eventoData = {
        nombre: nombreEvento,
        descripcion: descripcionEvento,
        fecha: fechaEvento,
        lugar: lugarEvento,
        capacidad: capacidadEvento,
        imagen: imagenEvento,
        entradas: entradas
    };

    fetch("/api/evento/new_event", {
        method: 'POST',
        headers: {
            'Content-Type': "application/json"
        },
        body: JSON.stringify(eventoData)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.mensaje);
        console.log(data);
    })
    .catch(error => { console.error("ERROR:", error); alert("Hubo un problema al crear el evento"); });



});