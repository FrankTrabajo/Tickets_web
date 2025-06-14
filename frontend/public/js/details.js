import { centrarMapa, pintarSite } from "./map.js";
import { hideItems, showItems } from "./utils.js";

/**
 * Se obtiene un evento en específico y se encarga de pintar los datos necesarios y su infromación en la web.
 */
function getEvent() {
    const id = getIdFromPath();
    console.log("Entra");

    let evento = null;

    fetch(`/api/event/details/${id}`)
        .then(response => response.json())
        .then(data => {
            evento = data.evento;
            console.log(data.evento.imagen);
            const imagen = data.evento.imagen && data.evento.imagen.trim() !== ""
                ? data.evento.imagen
                : "../img/eventos/banner_no_img.png";

            document.getElementById("imagenEvento").src = imagen;
            document.getElementById("eventTitle").textContent = data.evento.nombre;
            document.getElementById("eventDescription").textContent = data.evento.descripcion;
            document.getElementById("eventDate").textContent = formatDate(data.evento.fecha);
            document.getElementById("eventTime").textContent = formatTime(data.evento.fecha);
            document.getElementById("eventLocation").textContent = data.evento.lugar.nombre;
            document.getElementById("eventCapacity").textContent = data.evento.capacidad;
            // Calcular entradas disponibles
            if (Array.isArray(data.evento.entradas) && data.evento.entradas.length > 0) {
                const totalTickets = data.evento.entradas.reduce((total, entrada) => total + entrada.cantidad, 0);
                document.getElementById("eventTickets").textContent = totalTickets;

                const minPrice = Math.min(...data.evento.entradas.map(entrada => entrada.precio));
                document.getElementById("eventPrice").textContent = `€${minPrice.toFixed(2)}`;
            } else {
                document.getElementById("eventTickets").textContent = "No disponibles";
                document.getElementById("eventPrice").textContent = "N/A";
            }


            // Inicializar mapa (requiere API de Google Maps o similar)
            centrarMapa(data.evento.lugar.lat, data.evento.lugar.lon);
            pintarSite([data.evento.lugar.lat, data.evento.lugar.lon], data.evento.lugar.nombre);

            const btnComprar = document.querySelector('.comprar-btn');
            const entradasDisponibles = document.getElementById("eventTickets").textContent;
            btnComprar.disabled = entradasDisponibles === "No disponibles";

            fetch("/check-auth")
                .then(response => response.json())
                .then(data => {
                    btnComprar.addEventListener("click", () => {
                        if (!data.logueado) {
                            window.location.href = "/login";
                        } else {
                            window.location.href = `../vistaEntradas/${evento._id}`;
                        }
                    });
                });
        })
        .catch(error => console.error("ERROR:", error));
}

/**
 * Se encarga de formatear la fecha
 * @param {Date} dateString 
 * @returns 
 */
function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}
/**
 * Se encarga de formatear la hora
 * @param {Date} dateString 
 * @returns 
 */
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Obtiene el id por URL y lo retorna
 * @returns 
 */
function getIdFromPath() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1]; // Último segmento
}

const id_evento = getIdFromPath();

/**
 * Se encarga de obtener todos los comentarios de un evento en específico.
 */
function getAllCommentsEvent() {
    console.log(id_evento);
    fetch(`/api/comentarios/get-all-comments-event/${id_evento}`)
        .then(response => response.json())
        .then(data => {
            let comentarios = data.comentarios;
            let contenedor = document.getElementById('users-comments');
            contenedor.innerHTML = "";
            if (!comentarios || comentarios.length === 0) {
                contenedor.innerHTML = "<p>No hay comentarios aún.</p>";
                return;
            }

            comentarios.forEach(comentario => {
                console.log(comentario);
                const div = document.createElement('div');
                div.classList.add("comment");

                const nombreUsuario = comentario.id_usuario?.nombre || "Usuario desconocido";
                div.innerHTML = `<p><b>${nombreUsuario}:</b></p>
                                <p>${comentario.comentario}</p>
                                <p>Valoración: ${"⭐".repeat(comentario.valoracion)} (${comentario.valoracion}/5)</p>
                                <hr>`;
                contenedor.appendChild(div);
            });
        })
        .catch(error => {
            console.error(error);
        })
}
const boton_compra = document.getElementById('comprar-btn');
/**
 * Se encarga de hacer la comprobación para saber si el usuario actual es un administrador o no y ahi tomar las medidas necesarias para mostraro no
 * el boton de compra en la web.
 */
function checkAdmin() {
    fetch("/check-admin")
        .then(response => response.json())
        .then(data => {
            if (data.admin) {
                hideItems([boton_compra]);
            } else {
                showItems([boton_compra]);
            }
        })
}

document.addEventListener('DOMContentLoaded', () => {
    checkAdmin();
    getEvent();
    getAllCommentsEvent();
});