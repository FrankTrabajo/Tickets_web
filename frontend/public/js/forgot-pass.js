const formulario = document.getElementById('forgot-form');

formulario.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;

    try {
        const response = await fetch('/api/user/forgot-pass', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            alert("Revisa tu correo electrónico para restablecer tu contraseña.");
        } else {
            alert(data.message || "Error al enviar el correo.");
        }

    } catch (error) {
        console.error("Error en la solicitud:", error);
        alert("Error de red o del servidor.");
    }
});
