const popup = document.getElementById("popup"); 
const LONGITUD_MADRID = -3.703790;
const LATITUD_MADRID = 40.416775;
const ZOOM_PREDETERMINADO = 13;
const RESTO_UBICACIONES= `https://cdn-icons-png.flaticon.com/512/252/252025.png`;
const mapContainer = document.getElementById("map");
let map = null;



let coordenadas = null;

/**
 * Función para cargar el mapa 
 * @returns {boolean} 
 */
function cargarMapa() {
    try {
        map = L.map('map').setView([LATITUD_MADRID,LONGITUD_MADRID], ZOOM_PREDETERMINADO);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        return true;
    } catch (error) {
        return false;
    }
  
}

let lat, long;


/**
 * Función para cargar las librerías de Leaflet 
 */

function cargarLibrerias() {
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=";
    link.crossOrigin="";
    link.onerror = () => {
        agregarNotificacion("ERROR: libreria de estilos no cargado");
    }
    document.head.appendChild(link);

    // Crear e insertar el script de Leaflet
    const script = document.createElement("script");
    script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    script.integrity = "sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=";
    script.crossOrigin="";
    script.onload = () => {
        if(cargarMapa()){
        }
    }
    document.head.appendChild(script);
}

/**
 * Funcion para pintar la coordenadas que recojemos de la api
 * @param {array} coords 
 * @param {string} icono 
 * @param {string} titulo 
 */
function pintarUbicacion(coords,icono, titulo) {
    const iconoPersonalizado = L.icon({
        iconUrl: icono,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32]
    });
    let marcador = L.marker(coords,{
        icon: iconoPersonalizado
    })
    .bindPopup()
    .addTo(map);

    marcador.bindPopup(titulo);

    marcador.on("mouseover", function(){
        marcador.openPopup();
    });

    marcador.on('mouseout', function(){
        marcador.closePopup();
    })
}

/**
 * Funcion para pintar las coordenadas del sitio que pinta el usuario
 * @param {array} coords 
 * @param {string} titulo 
 */
export function pintarSite(coords, titulo) {

    let marcador = L.marker(coords)
    .bindPopup()
    .addTo(map);

    marcador.bindPopup(titulo);

    marcador.on("mouseover", function(){
        marcador.openPopup();
    });

    marcador.on('mouseout', function(){
        marcador.closePopup();
    })
}



//esto hace que se ejecute esto nada más cargar la pagina
document.addEventListener("DOMContentLoaded", function () { 
    ///compruebo si tengo conexion a una red
    if(navigator.onLine){
       cargarLibrerias();
    }else{
        agregarNotificacion("ERROR:no se han cargado correctamente las librerias");
    }
});

/**
 * Centra el mapa en las coordenadas proporcionadas
 * @param {number} lat - Latitud
 * @param {number} lng - Longitud
 * @param {number} [zoom=15] - Nivel de zoom opcional (default: 15)
 */
export function centrarMapa(lat, lng, zoom = 15) {
    if (map) {
        map.setView([lat, lng], zoom);
    } else {
        console.warn("El mapa aún no está cargado.");
    }
}
