document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');

    // Llamada al login.php
    fetch('login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    .then(res => res.json())
    .then(data => {
        if(data.success) {
    // Login exitoso
    errorMessage.style.display = 'none';

    // Animación de transición
    document.getElementById('loginScreen').style.transform = 'translateX(-100%)';
    document.getElementById('loginScreen').style.opacity = '0';
    
    setTimeout(() => {
        document.getElementById('loginScreen').style.display = 'none';
        
        // Aquí puedes mantener la pantalla de bienvenida opcionalmente
        const welcomeScreen = document.getElementById('welcomeScreen');
        welcomeScreen.querySelector('h2').textContent = `¡Bienvenido ${data.usuario}!`;
        welcomeScreen.classList.add('show');
        welcomeScreen.style.transform = 'translateX(0)';
        welcomeScreen.style.opacity = '1';

        // Después de un pequeño delay, redirigimos a index.html
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 500); // 0.5 segundos para que se vea la animación

    }, 300); // tiempo de la primera animación
} else {
    // Login fallido
    errorMessage.style.display = 'block';
    errorMessage.textContent = data.message;

    // Animación de error
    const container = document.querySelector('.login-container');
    container.style.animation = 'shake 0.5s ease-in-out';
    
    setTimeout(() => {
        container.style.animation = '';
    }, 500);
}

    })
    .catch(err => {
        console.error(err);
        errorMessage.style.display = 'block';
        errorMessage.textContent = 'Error de conexión';
    });
});

function logout() {
    document.getElementById('welcomeScreen').classList.remove('show');
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'block';
    document.getElementById('loginScreen').style.transform = 'translateX(0)';
    document.getElementById('loginScreen').style.opacity = '1';

    // Limpiar formulario
    document.getElementById('loginForm').reset();
    document.getElementById('errorMessage').style.display = 'none';
}

// Animación de shake para errores
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
    }
`;
document.head.appendChild(style);

// Efecto de typing en el placeholder
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('focus', function() {
        this.style.transform = 'scale(1.02)';
    });
    
    input.addEventListener('blur', function() {
        this.style.transform = 'scale(1)';
    });
});
