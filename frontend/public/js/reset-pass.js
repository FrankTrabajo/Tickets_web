const formularioReset = document.getElementById('reset-form');

formularioReset.addEventListener('submit', async (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.pathname);
    const token = window.location.pathname.split('/').pop(); // extrae el token de la URL

    const password = formularioReset.password.value;
    const password2 = formularioReset.password2.value;

    const response = await fetch(`/api/user/reset-pass/${token}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, password2 })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Contraseña actualizada correctamente");
        window.location.href = "/login";
    } else {
        alert(data.message);
    }
});
