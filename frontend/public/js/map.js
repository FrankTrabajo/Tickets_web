const popup = document.getElementById("popup"); 
const popupContent = popup.querySelector(".popup-content")
const LONGITUD_MADRID = -3.703790;
const LATITUD_MADRID = 40.416775;
const ZOOM_PREDETERMINADO = 13;
const UBICACION = "https://overpass-api.de/api/interpreter?data=[out:json];node[\"historic\"=\"monument\"](around:5000,40.416775,-3.703790);out;";
const RESTO_UBICACIONES= `https://cdn-icons-png.flaticon.com/512/252/252025.png`;
const mapContainer = document.getElementById("map");
let map = null;

/**
 * Función para mostrar un popup con información proporcionada
 * @param {string} infoHTML 
 */
function mostrarPopup(infoHTML) {
    popupContent.innerHTML = infoHTML; // Insertar contenido en el popup
    popup.style.display = "flex"; // Mostrar popup
}

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
            cargarDatos();
            cargarSitios();
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
function pintarSite(coords, titulo) {

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


/**
 * Funcion que carga los datos de la api y los pinta en el mapa
 */
function cargarDatos(){
    const xhr = new XMLHttpRequest();
    xhr.open("GET" , UBICACION , true);
    xhr.responseType = "text";
    xhr.onload = function(){
        switch(xhr.status){
            case 200:
                console.log(JSON.parse(xhr.response)['elements']);
                const ubicaciones = JSON.parse(xhr.response)['elements'];

                ubicaciones.forEach(element => {
                    pintarUbicacion([element['lat'],element['lon']], RESTO_UBICACIONES,element['tags']['name']);
                });

                break;
            default:
                break;
        }
    };

    xhr.send();
}

/**
 * Función para obtener sitios de la API  y mostrarlos en el mapa
 */
function cargarSitios(){
    fetch("/api/site/")
    .then(response => response.json())
    .then(data => {
        for(let ubicacion of data){
            pintarSite([ubicacion.lat, ubicacion.lon],ubicacion.siteName);
        }
        
    })
    .catch(err => console.error(err));
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
