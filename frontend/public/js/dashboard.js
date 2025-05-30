import { showItems, hideItems } from "./utils.js";

const URL = 'https://www.ticketsweb.es';

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
export function drawMap() {
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
            <input type="text" class="form-control" name="tipoEntrada[]"  placeholder="Tipo de entrada" required>
          </div>
          <div class="col-md-4">
            <input type="number" class="form-control" name="cantidadEntradas[]" placeholder="Cantidad" required>
          </div>
          <div class="col-md-4">
            <input type="number" class="form-control" name="precioEntradas[]" placeholder="Precio" required>
          </div>
        </div>
        <button type="button" class="btn btn-danger btn-sm mt-3 eliminarGrupo">Eliminar grupo</button>
    `;

    grupo.querySelector('.eliminarGrupo').addEventListener('click', () => {
        grupo.remove();
    });

    gruposContainer.appendChild(grupo);
});



// Creacion de eventos
document.getElementById("eventoForm").addEventListener('submit', async (e) => {
    e.preventDefault();
    createEvent();
});


export function createEvent() {
    // Valido si el usuario está autenticado para poder crear un nuevo evento
    fetch('/check-auth')
        .then(response => response.json())
        .then(data => {
            if (data.logueado) {
                const nombreEvento = document.getElementById('nombreEvento').value;
                const descripcionEvento = document.getElementById('descripcionEvento').value;
                const fechaEvento = document.getElementById('fechaEvento').value;  // Obtener el valor de la fecha
                const capacidadEvento = parseInt(document.getElementById('capacidadEvento').value);  // Obtener el valor de la capacidad
                
                // Obtener la ubicación del mapa
                if (!marker) {
                    alert('Debes seleccionar un lugar en el mapa');
                    return;
                }

                
                const lugarEvento = {
                    nombre: nombre_lugar_evento, // Suponiendo que 'nombre_lugar_evento' es una variable global con el nombre del lugar
                    lat: marker.getLatLng().lat,
                    lon: marker.getLatLng().lng
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

                // Si las entradas están vacías, no permitir el envío del formulario
                if (entradas.length === 0) {
                    alert('Debes agregar al menos un grupo de entradas');
                    return;
                }

                //* Esto lo que hace es validar la suma de las entradas y asegurarse que las entradas no superen la capacidad del evento 
                let totalEntradas = entradas.reduce((total, grupo) => total + (grupo.cantidad || 0), 0);
                if (totalEntradas > capacidadEvento) {
                    alert('La capacidad total de entradas no puede superar la capacidad del evento');
                    return;
                }

                //* Esto lo que hace es validar que haya entradas en el evento
                if (entradas.length === 0) {
                    alert('Debes agregar al menos un grupo de entradas');
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
                if(imagenInput.files.length > 0){
                    formData.append('imagen', imagenInput.files[0]);
                }

                // Enviar los datos al backend usando fetch
                fetch("/api/event/new_event", {
                    method: 'POST',
                    credentials: 'include',  // Incluir cookies en la solicitud
                    body: formData
                })
                    .then(response => response.json())
                    .then(data => {
                        if(data.ok){
                            alert(data.mensaje || "Evento creado correctamente");  // Mostrar mensaje de éxito
                            window.location.href = "/admin_dashboard";  // Redirigir al dashboard del administrador
                        }else{
                            throw new Error(data.error || "Error al crear el evento");
                        }
                        
                    })
                    .catch(error => {
                        console.error("ERROR:", error);  // Mostrar error en consola
                        alert(error.mensaje || "Hubo un problema al crear el evento");  // Mostrar alerta en caso de error
                    });
            } else {
                alert("No estás autenticado, por favor, vuelve a loguearte");
                window.location.href = "/login";
            }
        })
        .catch(error => {
            console.error("Error verificando autenticación:", error);
            // alert("Hubo un problema al verificar tu autenticación, por favor, vuelve a loguearte");
            // window.location.href = "/login";
        });
}
