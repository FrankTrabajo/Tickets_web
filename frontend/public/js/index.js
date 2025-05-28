import { hideItems, showItems } from "./utils.js";

const loginBtn = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const logoutBtn = document.getElementById('logoutBtn');
logoutBtn.className = "cerrar-btn";
const perfilImg = document.getElementById('perfilImg');
const buscarEvento = document.getElementById('buscarEvento');

let eventosCargados = [];

function checkUser() {
  fetch("/check-auth")
    .then(response => response.json())
    .then(data => {
      if (!data.logueado) {
        hideItems([logoutBtn, perfilImg]);
        showItems([loginBtn, registerBtn]);
      } else {
        hideItems([loginBtn, registerBtn]);
        showItems([logoutBtn, perfilImg]);
      }
    });
}

loginBtn.addEventListener('click', () => {
  window.location.href = './login';
});
registerBtn.addEventListener('click', () => {
  window.location.href = './register';
});
logoutBtn.addEventListener('click', async () => {
  await fetch('/api/user/logout', { method: 'POST', credentials: 'include' });
  window.location.href = '/';
});

document.addEventListener('DOMContentLoaded', () => {
  checkUser();

  const toggleBtn = document.getElementById('filtroTicket');
  const cerrarBtn = document.getElementById('cerrarFiltro');
  const aside = document.getElementById('filtroAside');

  const toggleAside = () => {
    aside.classList.toggle('hidden');
  };

  cargarEventos();

  toggleBtn.addEventListener('click', toggleAside);
  cerrarBtn.addEventListener('click', toggleAside);
});

buscarEvento.addEventListener('keyup', () => {
  const texto = buscarEvento.value.toLowerCase();
  const filtrados = eventosCargados.filter(e =>
    e.nombre.toLowerCase().includes(texto)
  );
  mostrarFiltrados(filtrados);
});

function cargarEventos() {
  fetch("/api/event/get_all_events")
    .then(res => res.json())
    .then(data => {
      eventosCargados = data;
      mostrarEventos(data);
      filtrado(data);
    })
    .catch(err => console.error("Error cargando eventos:", err));
}

function mostrarEventos(lista) {
  const contenedor = document.querySelector(".eventos");
  contenedor.innerHTML = "";

  lista.forEach(evento => {
    let totalEntradas = "Entradas no disponibles";
    let precioMinimo = 0;

    if (evento.entradas && evento.entradas.length > 0) {
      let suma = 0;
      let precios = [];
      evento.entradas.forEach(e => {
        suma += e.cantidad;
        precios.push(e.precio);
      });
      if (suma > 0) {
        totalEntradas = suma;
        precioMinimo = Math.min(...precios);
      }
    }

    const lugar = evento.lugar?.nombre || evento.lugar || "No especificado";
    const fecha = new Date(evento.fecha).toLocaleDateString("es-ES", {
      year: "numeric", month: "long", day: "numeric",
      hour: "2-digit", minute: "2-digit"
    });

    const card = document.createElement("div");
    card.classList.add("evento");

    if (evento.imagen && !evento.imagen.startsWith("blob:")) {
      const img = document.createElement("img");
      img.src = evento.imagen;
      img.alt = "Imagen de " + evento.nombre;
      card.appendChild(img);
    }

    const info = document.createElement("div");
    info.classList.add("info");

    info.innerHTML = `
      <h3>${evento.nombre}</h3>
      <p><strong>Lugar:</strong> ${lugar}</p>
      <p><strong>Fecha:</strong> ${fecha}</p>
    `;
    const botonesDiv = document.createElement("div");
    botonesDiv.classList.add("botones-evento");

    const btnVerMas = document.createElement("button");
    btnVerMas.textContent = "Ver más";
    btnVerMas.className = "verMas-btn";
    btnVerMas.addEventListener("click", () => {
      window.location.href = `/detallesEvento.html?id=${evento._id}`;
    });

    const btnComprar = document.createElement("button");
    btnComprar.textContent = "Comprar";
    btnComprar.className = "comprar-btn";
    btnComprar.disabled = totalEntradas === "Entradas no disponibles";

    fetch("/check-auth")
      .then(response => response.json())
      .then(data => {
        btnComprar.addEventListener("click", () => {
          if (!data.logueado) {
            window.location.href = "/login.html";
          } else {
            window.location.href = `./vistaEntradas.html?id=${evento._id}`;
          }
        });
      });
    
    botonesDiv.appendChild(btnVerMas);
    botonesDiv.appendChild(btnComprar);
    info.appendChild(botonesDiv);
    card.appendChild(info);
    contenedor.appendChild(card);
  });
}

function filtrado(eventos) {
  const lugares = new Set();
  eventos.forEach(e => {
    if (e.lugar && e.lugar.nombre) {
      lugares.add(e.lugar.nombre);
    }
  });

  const lista = document.getElementById('lista-lugares');
  lista.innerHTML = '';

  const liTodos = document.createElement('li');
  liTodos.innerHTML = `<a href="#" class="filtro-link" data-lugar="todos">Todos</a>`;
  liTodos.addEventListener('click', e => {
    e.preventDefault();
    mostrarEventos(eventosCargados);
  });
  lista.appendChild(liTodos);

  lugares.forEach(nombreLugar => {
    const li = document.createElement('li');
    li.innerHTML = `<a href="#" class="filtro-link" data-lugar="${nombreLugar}">${acortarLugar(nombreLugar)}</a>`;
    li.addEventListener('click', e => {
      e.preventDefault();
      const lugarCompleto = e.target.dataset.lugar;
      const filtrados = eventosCargados.filter(ev => ev.lugar?.nombre === lugarCompleto);
      mostrarEventos(filtrados);
    });
    lista.appendChild(li);
  });
}

//Muestra solo hasta la ','
function acortarLugar(nombre) {
  return nombre.split(',')[0];
}

