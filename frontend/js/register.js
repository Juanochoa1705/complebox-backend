const form = document.getElementById('registerForm');
const msg = document.getElementById('msg');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = {
    nombres: document.getElementById('nombres').value,
    apellidos: document.getElementById('apellidos').value,
    cedula: document.getElementById('cedula').value,
    correo: document.getElementById('correo').value,
    usuario: document.getElementById('usuario').value,
    password: document.getElementById('password').value,
    telefono: document.getElementById('telefono').value,
    fk_rol: 2,
    fk_tipo_doc: 1
  };

  try {
    const response = await fetch('http://localhost:3000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();

    if (!response.ok) {
      msg.style.color = 'red';
      msg.textContent = result.message || 'Error al registrar';
      return;
    }

    msg.style.color = 'green';
    msg.textContent = '✅ Usuario registrado correctamente';

    form.reset();

  } catch (error) {
    msg.style.color = 'red';
    msg.textContent = '❌ Error de conexión con el servidor';
  }
});
