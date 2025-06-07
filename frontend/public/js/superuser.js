let users = [];
let eventos = [];

function getUsers() {
    fetch("/api/user/get_all_users", {
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            users = data.users.filter(user => {
                const roles = Array.isArray(user.rol) ? user.rol : [];
                return !roles.includes("SUPER_ADMIN");
            });

            console.log(users);
            renderUsers();
        })
        .catch(error => console.error(error));
}


function cargarEventos() {
    return fetch("/api/event/get_all_events")
        .then(res => res.json())
        .then(data => {
            eventos = data;
        })
        .catch(err => console.error("Error cargando eventos:", err));
}

function renderUsers() {
    const tbody = document.getElementById("bodyusuarios");
    tbody.innerHTML = "";

    const sortedUsers = [...users].sort((a, b) => {
        const aIsAdmin = Array.isArray(a.rol) && a.rol.includes('ADMIN');
        const bIsAdmin = Array.isArray(b.rol) && b.rol.includes('ADMIN');
        return bIsAdmin - aIsAdmin;
    });

    sortedUsers.forEach((user) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user.nombre}</td>
          <td>${user.email}</td>
          <td>
            <span id="rol-${user._id}">${user.rol.join(', ')}</span>
            <select id="select-rol-${user._id}" multiple class="edit-input" style="display:none;">
              <option value="USER" ${user.rol.includes("USER") ? "selected" : ""}>USER</option>
              <option value="ADMIN" ${user.rol.includes("ADMIN") ? "selected" : ""}>ADMIN</option>
            </select>
          </td>
          <td>
            <button class="btn" onclick="deleteUser('${user._id}')">Eliminar</button>
            <button class="btn" onclick="toggleEdit('${user._id}')">Editar</button>
            ${Array.isArray(user.rol) && user.rol.includes('ADMIN') ? `<button class="btn" onclick="toggleEvents('${user._id}')">Mostrar Eventos</button>` : ''}
          </td>
        `;
        tbody.appendChild(tr);

        const dropdown = document.createElement("tr");
        dropdown.id = `events-${user._id}`;
        dropdown.className = "event-dropdown";
        dropdown.style.display = "none";
        dropdown.innerHTML = `<td colspan="4" id="events-container-${user._id}"></td>`;
        tbody.appendChild(dropdown);
    });
}

function toggleEdit(userId) {
    const spanRol = document.getElementById(`rol-${userId}`);
    const selectRol = document.getElementById(`select-rol-${userId}`);

    if (selectRol.style.display === "none") {
        selectRol.style.display = "inline";
        spanRol.style.display = "none";
        selectRol.focus();
        selectRol.onblur = () => saveUserChanges(userId);
    } else {
        selectRol.style.display = "none";
        spanRol.style.display = "inline";
    }
}

function saveUserChanges(userId) {
    const selectRol = document.getElementById(`select-rol-${userId}`);
    const selectedRoles = Array.from(selectRol.selectedOptions).map(opt => opt.value);

    const userIndex = users.findIndex(u => u._id === userId);
    const user = users[userIndex];

    fetch(`/api/user/update-user/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rol: selectedRoles })
    })
        .then(res => {
            if (!res.ok) throw new Error("Error al actualizar usuario");
            return res.json();
        })
        .then(updatedUser => {
            users[userIndex] = updatedUser;
            renderUsers();
        })
        .catch(err => {
            alert("Error actualizando usuario");
            console.error(err);
        });
}

function deleteUser(userId) {
    if (!confirm("¿Seguro que quieres eliminar este usuario?")) return;

    fetch(`/api/user/delete-user/${userId}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                getUsers();
                cargarEventos();
            } else {
                alert("Ha habido un problema");
            }
        })
        .catch(err => {
            alert("Error eliminando usuario");
            console.error(err);
        });
}

function toggleEvents(userId) {
    const dropdownRow = document.getElementById(`events-${userId}`);
    const container = document.getElementById(`events-container-${userId}`);

    if (dropdownRow.style.display === "none" || !dropdownRow.style.display) {
        const userEvents = eventos.filter(e => e.creador === userId || e.creador._id === userId);

        if (userEvents.length === 0) {
            container.innerHTML = "<em>Este usuario no ha creado eventos.</em>";
        } else {
            container.innerHTML = userEvents.map(event => `
                <div class="event-item" style="border: 1px solid #ccc; margin: 5px 0; padding: 5px;">
                    <strong>${event.nombre}</strong><br>
                    <p>${event.descripcion}</p>
                    <button onclick="deleteEvent('${event._id}', '${userId}')">Eliminar Evento</button>
                </div>
            `).join('');
        }

        dropdownRow.style.display = "table-row";
    } else {
        dropdownRow.style.display = "none";
    }
}

function deleteEvent(eventId, userId) {
    if (!confirm("¿Seguro que quieres eliminar este evento?")) return;

    fetch(`/api/event/delete_event/${eventId}`, {
        method: 'DELETE'
    })
        .then(res => {
            if (!res.ok) throw new Error("Error al eliminar evento");
            return cargarEventos();
        })
        .then(() => {
            toggleEvents(userId); // recargar eventos del usuario
        })
        .catch(err => {
            alert("Error eliminando evento");
            console.error(err);
        });
}

function check_auth() {
    fetch("/check-superadmin", {
        method: 'GET',
        credentials: "include"
    })
        .then(response => response.json())
        .then(data => {
            if (!data.super_admin) {
                window.location.href = "/login";
            }
        })
        .catch(error => console.error("ERROR: " + error));
}

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    check_auth();
    getUsers();
    cargarEventos();
});
