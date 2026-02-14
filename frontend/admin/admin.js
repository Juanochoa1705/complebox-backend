const API_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '../auth/login.html';
}

// Al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  obtenerConjunto();
});

async function obtenerConjunto() {
  try {
    const res = await fetch(`${API_URL}/admin/conjunto`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // Si no tiene conjunto
    if (res.status === 404) {
      document.getElementById('crearSection').classList.remove('d-none');
      return;
    }

    if (!res.ok) throw new Error('Error al consultar conjunto');

    const data = await res.json();
    mostrarConjunto(data);

  } catch (err) {
    console.error(err);
    alert('Error cargando datos');
  }
}

function mostrarConjunto(conjunto) {
  document.getElementById('infoSection').classList.remove('d-none');
  document.getElementById('infoNombre').textContent = conjunto.nombre_conjunto;
  document.getElementById('infoTelefono').textContent = conjunto.telefono_conjunto;
}

async function crearConjunto() {
  const body = {
    nombre_conjunto: document.getElementById('nombre').value,
    telefono_conjunto: document.getElementById('telefono').value,
    cantidad_torres: Number(document.getElementById('torres').value),
  };

  try {
    const res = await fetch(`${API_URL}/admin/conjunto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) throw new Error('Error creando conjunto');

    alert('Conjunto creado correctamente');
    location.reload();

  } catch (err) {
    alert(err.message);
  }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../login.html';
}
