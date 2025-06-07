const formularioReset = document.getElementById('reset-form');

formularioReset.addEventListener('submit', async (e) => {
    e.preventDefault();

    const urlParams = new URLSearchParams(window.location.pathname);
    const token = window.location.pathname.split('/reset-password/')[1];

    console.log(token);
    const password = formularioReset.password.value;
    const password2 = formularioReset.password2.value;

    fetch(`/api/user/reset-pass/${token}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, password2 })
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                alert("Contraseña actualizada correctamente");
                window.location.href = "/login";
            } else {
                alert(data.message);
            }
        })
        .catch(error => console.error(error));



});
