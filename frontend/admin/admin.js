const API_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');

if (!token) {
  window.location.href = '../auth/login.html';
}

/* ================= INIT ================= */
document.addEventListener('DOMContentLoaded', () => {
  obtenerConjunto();
  cargarVigilantesPendientes();
});

/* ================= CONJUNTO ================= */

async function obtenerConjunto() {
  try {
    const res = await fetch(`${API_URL}/admin/conjunto`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.status === 404) {
      document.getElementById('crearSection').classList.remove('d-none');
      return;
    }

    const data = await res.json();
    mostrarConjunto(data);

  } catch {
    alert('Error cargando datos');
  }
}

function mostrarConjunto(data) {
  document.getElementById('infoSection').classList.remove('d-none');
  document.getElementById('infoNombre').textContent = data.nombre_conjunto;
  document.getElementById('infoTelefono').textContent = data.telefono_conjunto;

  cargarCantidadTorres();
}

async function crearConjunto() {
  const body = {
    nombre_conjunto: conjuntoNombre.value,
    telefono_conjunto: conjuntoTelefono.value,
    cantidad_torres: Number(torres.value)
  };

  const res = await fetch(`${API_URL}/admin/conjunto`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });

  if (res.ok) location.reload();
}

/* ================= TORRES ================= */

async function cargarCantidadTorres() {
  const res = await fetch(`${API_URL}/admin/torres`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  cantidadTorres.textContent = data.length;
}

async function verTorres() {
  const res = await fetch(`${API_URL}/admin/torres`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const torres = await res.json();

  listaTorres.innerHTML = torres.map(t =>
    `<div>Torre ${t.numero_torre}</div>`
  ).join('');
}

async function agregarTorre() {
  const numero = Number(nuevaTorre.value);

  if (!numero) return alert('Número inválido');

  await fetch(`${API_URL}/admin/torres`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ numero_torre: numero })
  });

  nuevaTorre.value = '';
  cargarCantidadTorres();
  verTorres();
}

/* ================= EMPRESA ================= */

empresaForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    nombre: empresaNombre.value,
    nit: empresaNit.value,
    telefono: empresaTelefono.value,
    correo: empresaCorreo.value,
    direccion: empresaDireccion.value
  };

  const res = await fetch(`${API_URL}/admin/crear-empresa-seguridad`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(data)
  });

  if (res.ok) {
    empresaMessage.textContent = "Empresa creada ✅";
    empresaForm.reset();
  } else {
    empresaMessage.textContent = "Error al crear empresa";
  }
});

/* ================= VIGILANTES ================= */

async function cargarVigilantesPendientes() {
  const res = await fetch(`${API_URL}/admin/vigilantes-pendientes`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();

  tablaVigilantes.innerHTML = "";

  if (data.length === 0) {
    mensajeVacio.style.display = "block";
    return;
  }

  mensajeVacio.style.display = "none";

  data.forEach(v => {
    tablaVigilantes.innerHTML += `
      <tr>
        <td>${v.nombres} ${v.apellidos}</td>
        <td>${v.cedula}</td>
        <td><button onclick="aprobarVigilante(${v.cod_user})">OK</button></td>
      </tr>
    `;
  });
}

async function aprobarVigilante(id) {
  await fetch(`${API_URL}/admin/aprobar-vigilante`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({ cod_user: id })
  });

  alert("Aprobado");
  cargarVigilantesPendientes();
}

/* ================= SESSION ================= */

function cerrarSesion() {
  localStorage.clear();
  window.location.href = '../login.html';
}