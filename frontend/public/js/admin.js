const new_event_btn = document.getElementById("new-event");

new_event_btn.addEventListener('click', (e) => {
    e.preventDefault();
    window.location.href = "/admin_dashboard/new_event";
});

function getEstadisticasUsuario() {
    fetch('/api/event/get_estadisticas_usuario', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if(data.message === "No autorizado"){
            window.location.href = "/login";
        } // Verifica la respuesta del servidor
        document.getElementById('total-eventos').textContent = data.totalEventos || 0;
        document.getElementById('total-entradas').textContent = data.totalEntradasVendidas || 0;
        document.getElementById('total-ingresos').textContent = data.totalIngresos ? `$${data.totalIngresos.toLocaleString()}` : '0€';
    })
    .catch(error => {
        console.error("Error al obtener las estadísticas:", error);
    });
}



function getEventos() {
    fetch('/api/event/get_all_events_from_user', {
        credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
        console.log(data); // Verifica la respuesta del servidor
        const eventos = data.eventos || []; // Asegura que eventos sea un array
        const tbody = document.querySelector('.event-table tbody');
        tbody.innerHTML = ''; // Limpiar contenido anterior

        eventos.forEach(evento => {
            if (eventos.length === 0) {
                const row = document.createElement('tr');
                row.innerHTML = `<td colspan="6" style="text-align: center;">No tienes eventos creados.</td>`;
                tbody.appendChild(row);
                return;
            }
            
            const fila = document.createElement('tr');


            fila.innerHTML = `
                <td>${evento.nombre}</td>
                <td>${new Date(evento.fecha).toLocaleDateString()}</td>
                <td>${evento.lugar?.nombre || 'Sin lugar'}</td>
                <td>${evento.capacidad.toLocaleString()}</td>
                <td>
                    <button class="btn details" data-id="${evento._id}">Detalles del evento</button>
                    <button class="btn edit" data-id="${evento._id}">Editar</button>
                    <button class="btn delete" data-id="${evento._id}">Eliminar</button>
                </td>
            `;

        tbody.appendChild(fila);
        });
    })
    .catch(error => {
        console.error("Error al crear la fila:", error);
    });
}


document.getElementById('logout-button').addEventListener('click', async () => {
    await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
    window.location.href = '/login.html';
  });


document.querySelector('.event-table tbody').addEventListener('click', (e) => {
    if(e.target.classList.contains('delete')) {
        const eventoId = e.target.dataset.id;
        if (confirm("¿Estás seguro de que deseas eliminar este evento?")) {
            fetch(`/api/event/delete_event/${eventoId}`, {
                method: 'DELETE',
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message);
                getEventos(); // Actualiza la lista de eventos después de eliminar
                getEstadisticasUsuario(); // Actualiza las estadísticas después de eliminar
            })
            .catch(error => {
                console.error("Error al eliminar el evento:", error);
            });
        }
    } else if (e.target.classList.contains('details')){
        const eventoId = e.target.dataset.id;
        window.location.href = `/admin_dashboard/details/${eventoId}`;
    } else if (e.target.classList.contains("edit")) {
        const eventoId = e.target.dataset.id;
        window.location.href = `/admin_dashboard/update/${eventoId}`;
    }
    
});
  


document.addEventListener('DOMContentLoaded', () => {
    getEventos();
    getEstadisticasUsuario();
});