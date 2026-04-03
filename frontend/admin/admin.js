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
    <td>
      <button onclick="aprobarVigilante(${v.cod_user})">✅ Aprobar</button>
      <button onclick="rechazarVigilante(${v.cod_user})">❌ Rechazar</button>
    </td>
  </tr>
`;

  });
}

async function rechazarVigilante(id) {

  const confirmar = confirm("¿Seguro que deseas eliminar este vigilante?");
  if (!confirmar) return;

  try {

    const res = await fetch(`${API_URL}/admin/rechazar/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    alert("❌ Vigilante eliminado correctamente");

    cargarVigilantesPendientes();

  } catch (err) {
    alert(err.message);
  }
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

const inputHistorial = document.getElementById("buscarHistorial");
const tabla = document.getElementById("tablaHistorial");

inputHistorial.addEventListener("input", async () => {

  const query = inputHistorial.value.trim();

  // 🔥 SI ESTÁ VACÍO → LIMPIA Y NO BUSCA
  if (query.length === 0) {
    tabla.innerHTML = "";
    return;
  }

  // 🔥 OPCIONAL (evita consultas innecesarias)
  if (query.length < 2) {
    tabla.innerHTML = "";
    return;
  }

  try {
    const res = await fetch(`http://localhost:3000/admin/historial?query=${query}`, {
      headers: {
        Authorization: "Bearer " + localStorage.getItem("token")
      }
    });

    const data = await res.json();

    tabla.innerHTML = "";

    data.forEach(p => {

      const div = document.createElement("div");

      div.innerHTML = `
        <b>📦 Pedido:</b> ${p.nombre_pedido || "❌ No registrado"}<br>
        <b>🔢 Guía:</b> ${p.numero_guia || "❌ No registrada"}<br>
        <b>📌 Estado:</b> ${p.estado_pedido || "⚪ Sin estado"}<br>

        <b>📅 Recibido:</b> ${p.fecha_recibido ? new Date(p.fecha_recibido).toLocaleString("es-CO") : "❌ No registrado"}<br>
        <b>📅 Entregado:</b> ${p.fecha_entregado ? new Date(p.fecha_entregado).toLocaleString("es-CO") : "⏳ Pendiente"}<br>

        <b>👮 Recibe:</b> ${p.nombre_vigilante_recibe || ""} ${p.apellido_vigilante_recibe || ""}<br>
        <b>👮 Entrega:</b> ${p.nombre_vigilante_entrega || "⏳ Pendiente"} ${p.apellido_vigilante_entrega || ""}<br>

        <b>🏠 Residente:</b> ${p.nombre_residente || ""} ${p.apellido_residente || ""}<br>
        <b>🆔 Cédula:</b> ${p.cedula || "❌ No registrada"}<br>

        <b>🏢 Apto:</b> ${
          p.numero_torre && p.numero_apto
            ? `Torre ${p.numero_torre} - Apto ${p.numero_apto}`
            : "❌ No asignado"
        }<br>

        <b>🚚 Mensajero:</b> ${p.nombre_mensajero || ""} ${p.apellido_mensajero || ""}<br>
        <b>🏢 Empresa:</b> ${p.nombre_empresa || "❌ Sin empresa"}<br>

        <b>✍️ Firma:</b><br>
${
  p.firma_residente
    ? `<img src="${p.firma_residente}" 
           style="
             width:100px;
             height:auto;
             border:1px solid #ccc;
             border-radius:6px;
             object-fit:contain;
             margin-top:4px;
           " />`
    : `<span style="color:red;">❌ No registrada</span>`
}

        <hr>
      `;

      tabla.appendChild(div);
    });

  } catch (error) {
    console.error("Error:", error);
  }

});