import { centrarMapa, pintarSite } from "./map.js"; // Asegúrate de importar correctamente si usas módulos
import { hideItems, showItems } from "./utils.js";

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
});

// Mostrar / Ocultar Mapa
const mapaBtn = document.getElementById('mapaEventoBtn');
const mapaContainer = document.getElementById('mapContainer');
let map = document.getElementById("map"); // Variable para el mapa;

mapaBtn.addEventListener('click', () => {
    const isVisible = !mapaContainer.classList.contains('d-none'); // si NO tiene 'd-none', entonces está visible
    if (isVisible) {
        hideItems([mapaContainer]);
        mapaBtn.textContent = 'Mostrar mapa';
    } else {
        showItems([mapaContainer]);
        mapaBtn.textContent = 'Ocultar mapa';

    }

});

function checkToken() {
    fetch("/check-auth")
        .then(response => response.json())
        .then(data => {
            if (!data.logueado) {
                window.location.href = "/login";
            }
        })
}

let lat;
let lon;
let evento;
function getEvent(id) {
    fetch(`/api/event/details/${id}`)
        .then(response => response.json())
        .then(data => {
            evento = data.evento;
            console.log(evento);
            document.getElementById("nombreEvento").value = evento.nombre;
            document.getElementById("descripcionEvento").value = evento.descripcion;
            document.getElementById("fechaEvento").value = evento.fecha.split("T")[0];
            document.getElementById("capacidadEvento").value = evento.capacidad;
            document.getElementById("buscadorLugar").value = evento.lugar.nombre;
            lat = evento.lugar.lat;
            lon = evento.lugar.lon;
            if (evento.lugar && evento.lugar.lat && evento.lugar.lon) {
                
                centrarMapa(evento.lugar.lat, evento.lugar.lon);
                pintarSite([evento.lugar.lat, evento.lugar.lon], evento.lugar.nombre);
            }

            if (evento.entradas && evento.entradas.length > 0) {
                cargarGruposDeEntradas(evento.entradas);
            }
        })
        .catch(error => console.error("ERROR al obtener evento:", error));
}




function updateEvent(id) {

    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.logueado) {
                const nombreEvento = document.getElementById('nombreEvento').value;
                const descripcionEvento = document.getElementById('descripcionEvento').value;
                const fechaEvento = document.getElementById('fechaEvento').value;  // Obtener el valor de la fecha
                const capacidadEvento = parseInt(document.getElementById('capacidadEvento').value);  // Obtener el valor de la capacidad
                const nombre_lugar_evento = document.getElementById("buscadorLugar").value;
                // Obtener la ubicación del mapa
                const lugarEvento = {
                    nombre: nombre_lugar_evento, // Suponiendo que 'nombre_lugar_evento' es una variable global con el nombre del lugar
                    lat: lat,
                    lon: lon
                };

                // Crear un arreglo con los grupos de entradas
                const entradas = [];
                const entradasGrupos = document.querySelectorAll('#gruposContainer .row');

                entradasGrupos.forEach(grupo => {
                    const tipo = grupo.querySelector('input[name="tipoEntrada[]"]').value;  // Seleccionar el input de tipo
                    const cantidad = parseInt(grupo.querySelector('input[name="cantidadEntradas[]"]').value);  // Seleccionar el input de cantidad
                    const precio = parseInt(grupo.querySelector('input[name="precioEntradas[]"]').value);  // Seleccionar el input de precio

                    // Verificar que los campos no estén vacíos
                    if (tipo && cantidad && precio) {
                        entradas.push({ tipo, cantidad, precio });
                    } else {
                        alert('Todos los campos de las entradas son obligatorios');
                        return;
                    }
                });


                //* Esto lo que hace es validar la suma de las entradas y asegurarse que las entradas no superen la capacidad del evento 
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
                    body: formData // Asegúrate que tu backend acepta multipart/form-data
                })
                    .then(response => response.json()
                    )
                    .then(data => {
                        if (data.ok) {
                            alert("Evento actualizado correctamente");
                            window.location.href = "/admin_dashboard"; // Redirige a donde quieras 
                        } else {
                            console.log("Ha habido un error", data);
                        }

                    })
                    .catch(error => console.error("ERROR al actualizar evento:", error));
            } else {
                window.location.href = "/login";
            }
        })

}

function cargarGruposDeEntradas(entradas) {
    const container = document.getElementById("gruposContainer");
    container.innerHTML = "";

    entradas.forEach((entrada, index) => {
        const grupo = document.createElement("div");
        grupo.className = "mb-3";
        grupo.innerHTML = `
            <label class="form-label">Grupo ${index + 1}</label>
            <label>Tipo de entrada</label>
            <input type="text" class="form-control mb-1" name="grupos[${index}][nombre]" value="${entrada.tipo}" placeholder="Nombre del grupo" required>
            <label>Precio de entrada</label>
            <input type="number" class="form-control mb-1" name="grupos[${index}][precio]" value="${entrada.precio}" placeholder="Precio" required>
            <label>Cantidad de entradas</label>
            <input type="number" class="form-control mb-1" name="grupos[${index}][cantidad]" value="${entrada.cantidad}" placeholder="Cantidad" required>
        `;
        container.appendChild(grupo);
    });
}
