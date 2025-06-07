let users = [];
let eventos = [];


function getUsers() {
    fetch("/api/user/get_all_users")
        .then(response => response.json())
        .then(data => {
            users = data;
        })
        .catch(error => console.error(error));
}

function cargarEventos() {
  fetch("/api/event/get_all_events")
    .then(res => res.json())
    .then(data => {
      eventos = data;
    })
    .catch(err => console.error("Error cargando eventos:", err));
}

function renderUsers() {
      const tbody = document.getElementById("usersBody");
      tbody.innerHTML = "";

      users.forEach((user, index) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user.nombre}</td>
          <td>
            <span id="correo-${index}">${user.correo}</span>
            <input type="text" id="input-${index}" class="edit-input" style="display:none;" value="${user.correo}">
          </td>
          <td>${user.rol}</td>
          <td>
            <button class="btn" onclick="makeAdmin(${index})">Hacer Admin</button>
            <button class="btn" onclick="deleteUser(${index})">Eliminar</button>
            <button class="btn" onclick="editUser(${index})">Editar</button>
            <button class="btn" onclick="toggleEvents(${index}, ${user.id})">Mostrar Eventos</button>
          </td>
        `;
        tbody.appendChild(tr);

        const dropdown = document.createElement("div");
        dropdown.id = `events-${index}`;
        dropdown.className = "event-dropdown";
        tbody.appendChild(dropdown);
      });
}

