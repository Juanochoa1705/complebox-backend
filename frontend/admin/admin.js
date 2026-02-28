

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

async function mostrarConjunto(conjunto) {
  document.getElementById('infoSection').classList.remove('d-none');
  document.getElementById('infoNombre').textContent = conjunto.nombre_conjunto;
  document.getElementById('infoTelefono').textContent = conjunto.telefono_conjunto;

  await cargarCantidadTorres();
}

async function crearConjunto() {
  const body = {
    nombre_conjunto: document.getElementById('conjuntoNombre').value,
    telefono_conjunto: document.getElementById('conjuntoTelefono').value,
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

async function cargarCantidadTorres() {
  const res = await fetch(`${API_URL}/admin/torres`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const torres = await res.json();
  document.getElementById('cantidadTorres').textContent = torres.length;
}



function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '../login.html';
}


async function verTorres() {
  const res = await fetch(`${API_URL}/admin/torres`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const torres = await res.json();

  const lista = document.getElementById('listaTorres');
  lista.innerHTML = '';

  torres.forEach(t => {
    lista.innerHTML += `
      <div class="card p-2 mb-2">
        Torre ${t.numero_torre}
      </div>
    `;
  });
}

async function agregarTorre() {
  const numero = Number(document.getElementById('nuevaTorre').value);

  if (!numero) {
    alert('Ingresa un número válido');
    return;
  }

  const res = await fetch(`${API_URL}/admin/torres`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ numero_torre: numero }),
  });

  if (!res.ok) {
    alert('Error agregando torre');
    return;
  }

  alert('Torre agregada correctamente');

  document.getElementById('nuevaTorre').value = '';
  await cargarCantidadTorres();
  await verTorres();
}

const empresaForm = document.getElementById("empresaForm");
const empresaMessage = document.getElementById("empresaMessage");

empresaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombre: document.getElementById("empresaNombre").value,
    nit: document.getElementById("empresaNit").value,
    telefono: document.getElementById("empresaTelefono").value,
    correo: document.getElementById("empresaCorreo").value,
    direccion: document.getElementById("empresaDireccion").value
  };

  try {
    const res = await fetch(`${API_URL}/admin/crear-empresa-seguridad`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    // 🔴 Si hay error
    if (!res.ok) {
      empresaMessage.classList.remove("d-none", "alert-success");
      empresaMessage.classList.add("alert", "alert-danger");
      empresaMessage.textContent = result.message;
      return;
    }

    // 🟢 Si todo sale bien
    empresaMessage.classList.remove("d-none", "alert-danger");
    empresaMessage.classList.add("alert", "alert-success");
    empresaMessage.textContent = "Empresa creada correctamente ✅";

    empresaForm.reset();

  } catch (err) {
    empresaMessage.classList.remove("d-none", "alert-success");
    empresaMessage.classList.add("alert", "alert-danger");
    empresaMessage.textContent = "Error de conexión con el servidor";
  }
});