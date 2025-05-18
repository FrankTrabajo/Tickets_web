import { centrarMapa, pintarSite } from "./map.js"; // Asegúrate de importar correctamente si usas módulos
import { hideItems, showItems } from "./utils.js";

document.addEventListener("DOMContentLoaded", () => {
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

            if (evento.lugar && evento.lugar.lat && evento.lugar.lon) {
                //document.getElementById("mapContainer").classList.remove("d-none");

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
    const form = document.getElementById("eventoForm");
    const formData = new FormData(form);
    console.log(JSON.stringify(formData));
    fetch(`/api/event/update/${id}`, {
        method: "PUT",
        body: formData // Asegúrate que tu backend acepta multipart/form-data
    })
        .then(res => res.json()
        )
        .then(data => {
            if(data.ok){
               alert("Evento actualizado correctamente");
                window.location.href = "/admin_dashboard"; // Redirige a donde quieras 
            } else {
                console.log("Ha habido un error", data);
            }
            
        })
        .catch(error => console.error("ERROR al actualizar evento:", error));
}

function cargarGruposDeEntradas(entradas) {
    const container = document.getElementById("gruposContainer");
    container.innerHTML = "";

    entradas.forEach((entrada, index) => {
        const grupo = document.createElement("div");
        grupo.className = "mb-3";
        grupo.innerHTML = `
            <label class="form-label">Grupo ${index + 1}</label>
            <input type="text" class="form-control mb-1" name="grupos[${index}][nombre]" value="${entrada.tipo}" placeholder="Nombre del grupo" required>
            <input type="number" class="form-control mb-1" name="grupos[${index}][precio]" value="${entrada.precio}" placeholder="Precio" required>
            <input type="number" class="form-control mb-1" name="grupos[${index}][cantidad]" value="${entrada.cantidad}" placeholder="Cantidad" required>
        `;
        container.appendChild(grupo);
    });
}
