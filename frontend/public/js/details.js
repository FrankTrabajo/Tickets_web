import { centrarMapa } from "./map";

function getElevent(){
    const id = getIdFromPath();
    fetch(`/api/event/details/${id}`)
        .then(response => response.json())
        .then(data => {
            console.log(data.evento.evento);
            document.getElementById("imagenEvento").src = data.evento.imagen || "";
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

        })
        .catch(error => console.error("ERROR:", error));
}

function formatDate(dateString){
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', options);
}

function formatTime(dateString){
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit'});
}


function getIdFromPath() {
    const pathParts = window.location.pathname.split('/');
    return pathParts[pathParts.length - 1]; // Último segmento
}


document.addEventListener('DOMContentLoaded', () => {
    getElevent();
});