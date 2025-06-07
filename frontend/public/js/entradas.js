document.addEventListener("DOMContentLoaded", () => {
    getEntradas();
});

function getEntradas() {
    fetch("/api/entradas", {
        credentials: 'include'
    })
    .then(res => res.json())
    .then(entradas => {
        const container = document.getElementById("entradas-container");
        container.innerHTML = "";

        if (entradas.length === 0) {
            container.innerHTML = "<p>No tienes entradas disponibles.</p>";
            return;
        }

        entradas.forEach(entrada => {
            const card = document.createElement("div");
            card.classList.add("card");

            card.innerHTML = `
            
                <h3>${entrada.evento}</h3>
                <p><strong>Lugar:</strong> ${entrada.lugar}</p>
                <p><strong>Fecha:</strong> ${new Date(entrada.fecha).toLocaleDateString()}</p>
                <p><strong>Precio:</strong> ${entrada.precio.toFixed(2)} €</p>
            `;

            container.appendChild(card);
        });
    })
    .catch(error => {
        console.error("Error al cargar entradas:", error);
    });
}


async function checkAuth() {
    return fetch('/check-auth', {
        credentials: 'include'
    })
        .then(response => response.json())
        .then(data => {
            if (!data.logueado) {
                window.location.href = '/login';
            }
        })
        .catch(error => {
            console.error("Error al verificar autenticación:", error);
            window.location.href = '/login';
        });
}

document.addEventListener('DOMContentLoaded', async () => {
    await checkAuth();
});