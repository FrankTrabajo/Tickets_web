import { hideItems, showItems } from "./utils.js";

let map;
let marker;
let nombre_lugar_evento = '';
let lat, lon;
let evento;

const mapaBtn = document.getElementById('mapaEventoBtn');
const mapaContainer = document.getElementById('mapContainer');

document.addEventListener("DOMContentLoaded", () => {
    checkToken();
    const id = window.location.pathname.split('/').pop();
    if (id) {
        getEvent(id);
    }

    document.getElementById("eventoForm").addEventListener("submit", (e) => {
        e.preventDefault();
        updateEvent(id);
    });

    mapaBtn.addEventListener('click', () => {
        const isVisible = !mapaContainer.classList.contains('d-none');
        if (isVisible) {
            hideItems([mapaContainer]);
            mapaBtn.textContent = 'Mostrar mapa';
        } else {
            showItems([mapaContainer]);
            mapaBtn.textContent = 'Ocultar mapa';
            if (!map) {
                drawMap();
            }
        }
    });
});

/**
 * Se encarga de autenticar si el usuario está logueado o no.
 */
function checkToken() {
    fetch("/check-auth")
        .then(response => response.json())
        .then(data => {
            if (!data.logueado) {
                window.location.href = "/login";
            }
        });
}

/**
 * Se encarga de pintar el mapa.
 */
function drawMap() {
    map = L.map('map').setView([lat || 40.4168, lon || -3.7038], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Si ya hay lat/lon, coloca el marcador
    if (lat && lon) {
        marker = L.marker([lat, lon]).addTo(map)
            .bindPopup(nombre_lugar_evento || "Lugar actual")
            .openPopup();
    }

    document.getElementById('buscarBtn').addEventListener('click', async () => {
        const lugar = document.getElementById('buscadorLugar').value;
        if (!lugar) return alert('Escribe un lugar para buscar');
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(lugar)}`);
        const data = await res.json();
        if (data.length > 0) {
            const { lat: newLat, lon: newLon, display_name } = data[0];
            nombre_lugar_evento = display_name;
            lat = parseFloat(newLat);
            lon = parseFloat(newLon);
            if (marker) marker.remove();
            marker = L.marker([lat, lon]).addTo(map)
                .bindPopup(display_name)
                .openPopup();
            map.setView([lat, lon], 16);
        } else {
            alert('No encontrado');
        }
    });
}

/**
 * Se encarga de pintar los datos necesarios del evento en esepcífico que se va a editar.
 * @param {String} id 
 */
function getEvent(id) {
    fetch(`/api/event/details/${id}`)
        .then(response => response.json())
        .then(data => {
            evento = data.evento;
            document.getElementById("nombreEvento").value = evento.nombre;
            document.getElementById("descripcionEvento").value = evento.descripcion;
            document.getElementById("fechaEvento").value = evento.fecha.split("T")[0];
            document.getElementById("capacidadEvento").value = evento.capacidad;
            document.getElementById("buscadorLugar").value = evento.lugar.nombre;
            nombre_lugar_evento = evento.lugar.nombre;
            lat = evento.lugar.lat;
            lon = evento.lugar.lon;
            // Si el mapa ya está visible, inicialízalo
            if (!map && !mapaContainer.classList.contains('d-none')) {
                drawMap();
            }
            if (evento.entradas && evento.entradas.length > 0) {
                cargarGruposDeEntradas(evento.entradas);
            }
        })
        .catch(error => console.error("ERROR al obtener evento:", error));
}

/** 
 * Se encarga de enviar los datos para crear la actualización del evento.
*/
function updateEvent(id) {
    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.logueado) {
                const nombreEvento = document.getElementById('nombreEvento').value;
                const descripcionEvento = document.getElementById('descripcionEvento').value;
                const fechaEvento = document.getElementById('fechaEvento').value;
                const capacidadEvento = parseInt(document.getElementById('capacidadEvento').value);

                // Si el usuario no ha buscado un nuevo lugar, usa el del input
                if (!nombre_lugar_evento) {
                    nombre_lugar_evento = document.getElementById("buscadorLugar").value;
                }

                const lugarEvento = {
                    nombre: nombre_lugar_evento,
                    lat: lat,
                    lon: lon
                };

                // Crear un arreglo con los grupos de entradas
                const entradas = [];
                const entradasGrupos = document.querySelectorAll('#gruposContainer .row');

                entradasGrupos.forEach(grupo => {
                    const tipo = grupo.querySelector('input[name="tipoEntrada[]"]').value;
                    const cantidad = parseInt(grupo.querySelector('input[name="cantidadEntradas[]"]').value);
                    const precio = parseInt(grupo.querySelector('input[name="precioEntradas[]"]').value);

                    if (tipo && cantidad && precio) {
                        entradas.push({ tipo, cantidad, precio });
                    } else {
                        alert('Todos los campos de las entradas son obligatorios');
                        return;
                    }
                });

                let totalEntradas = entradas.reduce((total, grupo) => total + (grupo.cantidad || 0), 0);
                if (totalEntradas > capacidadEvento) {
                    alert('La capacidad total de entradas no puede superar la capacidad del evento');
                    return;
                }

                const formData = new FormData();
                formData.append('nombre', nombreEvento);
                formData.append('descripcion', descripcionEvento);
                formData.append('fecha', fechaEvento);
                formData.append('lugar', JSON.stringify(lugarEvento));
                formData.append('capacidad', capacidadEvento.toString());
                formData.append('entradas', JSON.stringify(entradas));

                const imagenInput = document.getElementById('imagenEvento');
                if (imagenInput.files.length > 0) {
                    formData.append('imagen', imagenInput.files[0]);
                }

                fetch(`/api/event/update/${id}`, {
                    method: "PUT",
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if (data.ok) {
                            alert("Evento actualizado correctamente");
                            window.location.href = "/admin_dashboard";
                        } else {
                            console.log("Ha habido un error", data);
                        }
                    })
                    .catch(error => console.error("ERROR al actualizar evento:", error));
            } else {
                window.location.href = "/login";
            }
        });
}

// Permitir agregar nuevo grupo de entradas
const nuevoGrupoBtn = document.getElementById("nuevoGrupoEntradas");
const gruposContainer = document.getElementById('gruposContainer');

if (nuevoGrupoBtn && gruposContainer) {
    nuevoGrupoBtn.addEventListener("click", () => {
        const grupo = document.createElement("div");
        grupo.className = 'row mb-3';
        grupo.innerHTML = `
            <div class="col-md-4">
                <label>Tipo de entrada:</label>
                <input type="text" class="form-control" name="tipoEntrada[]" placeholder="Tipo de entrada" required>
            </div>
            <div class="col-md-4">
            <label>Cantidad de entradas:</label>
                <input type="number" class="form-control" name="cantidadEntradas[]" placeholder="Cantidad" required>
            </div>
            <div class="col-md-4">
            <label>Precio por entrada:</label>
                <input type="number" class="form-control" name="precioEntradas[]" placeholder="Precio" required>
            </div>
            <div class="col-12 mt-2">
                <button type="button" class="btn btn-danger btn-sm eliminarGrupo">Eliminar grupo</button>
            </div>
        `;
        grupo.querySelector('.eliminarGrupo').addEventListener('click', () => {
            grupo.remove();
        });
        gruposContainer.appendChild(grupo);
    });
}

// Cargar grupo de entradas si ya existen
function cargarGruposDeEntradas(entradas) {
    const container = document.getElementById("gruposContainer");
    container.innerHTML = "";

    entradas.forEach((entrada, index) => {
        const grupo = document.createElement("div");
        grupo.className = "row mb-3";
        grupo.innerHTML = `
            <div class="col-md-4">
                <label>Tipo de entrada:</label>
                <input type="text" class="form-control" name="tipoEntrada[]" value="${entrada.tipo}" placeholder="Tipo de entrada" required>
            </div>
            <div class="col-md-4">
                <label>Cantidad de entrada:</label>
                <input type="number" class="form-control" name="cantidadEntradas[]" value="${entrada.cantidad}" placeholder="Cantidad" required>
            </div>
            <div class="col-md-4">
                <label>Precio por entrada:</label>
                <input type="number" class="form-control" name="precioEntradas[]" value="${entrada.precio}" placeholder="Precio" required>
            </div>
            <div class="col-12 mt-2">
                <button type="button" class="btn btn-danger btn-sm eliminarGrupo">Eliminar grupo</button>
            </div>
        `;
        grupo.querySelector('.eliminarGrupo').addEventListener('click', () => {
            grupo.remove();
        });
        container.appendChild(grupo);
    });
}