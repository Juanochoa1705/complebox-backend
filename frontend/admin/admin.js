/* ==========================================
   1. SEGURIDAD Y VARIABLES (SIN BLOQUEOS FATALES)
   ========================================== */
const API_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');
const estadoEspecialAdmin = localStorage.getItem("estadoEspecialAdmin");
const mensajeAdmin = localStorage.getItem("mensajeAdmin");

// Función de validación mejorada
function validarRol() {
    if (!token) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.rol === 'Administrador';
    } catch (e) { return false; }
}

/* ==========================================
   2. CONTROL DE INTERFAZ (UI)
   ========================================== */
if (!validarRol()) {
    mostrarPantallaBloqueo("No tienes permisos de Administrador.");
} else if (estadoEspecialAdmin === "true") {
    mostrarPantallaBloqueo(mensajeAdmin);
}

function mostrarPantallaBloqueo(msj) {
    document.addEventListener('DOMContentLoaded', () => {
        document.body.innerHTML = `
        <div style="margin: 0; height: 100vh; background: #f0f2f5; display: flex; justify-content: center; align-items: center; font-family: sans-serif;">
            <div style="width: 100%; max-width: 450px; height: 100vh; background: #fff; border-left: 30px solid #0d47a1; border-right: 30px solid #0d47a1; display: flex; flex-direction: column; align-items: center; padding: 40px 20px; box-sizing: border-box;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="margin: 0; color: #003366; font-size: 24px; font-weight: bold;">Complebox</h1>
                </div>
                <div style="text-align: center; margin-bottom: 40px;">
                    <h2 style="color: #0d47a1; font-size: 26px;">🚫 Acceso Denegado</h2>
                    <div style="background: #f8f9fa; border-radius: 15px; padding: 20px; border: 1px solid #dee2e6;">
                        <p style="color: #555; font-size: 18px;">${msj}</p>
                    </div>
                </div>
                <div class="iconos-flotantes">
                <div class="modo-switch" onclick="irModoResidente()" title="Modo Residente">🏠</div>
                <div class="modo-switch" onclick="irModoMensajero()" title="Modo Mensajero">🚚</div>
                <div class="modo-switch" onclick="irModoVigilante()" title="Modo Vigilante">👮‍♂️</div>
                <div class="modo-switch" onclick="irModoPropietario()" title="Modo Propietario">🔑</div>
                <div class="modo-switch" onclick="irModoAdministrador()" title="Modo Administrador">⚙️</div>
            </div>
                <button onclick="cerrarSesion()" style="width: 100%; background: #1976d2; color: white; border: none; padding: 16px; border-radius: 15px; font-weight: bold; cursor: pointer;">
                    Cerrar sesión
                </button>
            </div>
        </div>`;
    });
}

/* ==========================================
   3. INICIALIZACIÓN DE FUNCIONES
   ========================================== */
document.addEventListener('DOMContentLoaded', async () => {
    // Solo arrancamos si todo está OK
    if (validarRol() && estadoEspecialAdmin !== "true") {
        await cargarPerfilAdmin();
        obtenerConjunto();
        cargarVigilantesPendientes();
        cargarVigilantes();
    }
});

/* ==========================================
   3. PERFIL Y VALIDACIÓN
   ========================================== */
async function cargarPerfilAdmin() {
    try {
        const res = await fetch(`${API_URL}/admin/perfil`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();

        // Si el backend dice que NO tiene conjunto
        if (data.tieneConjunto === false) {
            localStorage.setItem("estadoEspecialAdmin", "false"); // No bloqueamos la pantalla
            
            // 1. Ponemos el nombre del admin en el saludo
            if(document.getElementById("titulo")) {
                document.getElementById("titulo").innerText = `💼 Bienvenido: ${data.nombres}`;
            }

            // 2. Forzamos que se vea el formulario de creación
            const formCrear = document.getElementById('crearSection');
            if(formCrear) {
                formCrear.classList.remove('d-none');
                formCrear.style.display = 'block';
            }
            
            // 3. Ocultamos la sección de info (porque está vacía)
            const infoSec = document.getElementById('infoSection');
            if(infoSec) infoSec.classList.add('d-none');

            return; // Detenemos aquí para que no busque torres de un conjunto que no existe
        }

        // Si todo está normal
        localStorage.setItem("estadoEspecialAdmin", "false");
        if(document.getElementById("titulo")) document.getElementById("titulo").innerText = `💼 Admin: ${data.nombres}`;
        
    } catch (err) {
        console.error("Error cargando perfil:", err);
    }
}

/* ==========================================
   4. GESTIÓN DE CONJUNTO
   ========================================== */
async function obtenerConjunto() {
    // CANDADO 1: Si es residente/restringido, NO HAGAS NADA.
    if (localStorage.getItem("estadoEspecialAdmin") === "true") {
        console.log("Acceso restringido: No se cargará el formulario.");
        return; 
    }

    try {
        const res = await fetch(`${API_URL}/admin/conjunto`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 404) {
            // CANDADO 2: Verificación doble antes de quitar el d-none
            if (localStorage.getItem("estadoEspecialAdmin") !== "true") {
                const form = document.getElementById('crearSection');
                if(form) {
                    form.classList.remove('d-none');
                    form.style.display = 'block'; // Por si usas estilos directos
                }
            }
            return;
        }

        const data = await res.json();
        mostrarConjunto(data);
    } catch (err) {
        console.error('Error:', err);
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
        ciudad_conjunto: conjuntoCiudad.value,
        direccion_conjunto: conjuntoDireccion.value,
        cantidad_torres: Number(torres.value)
    };
    const res = await fetch(`${API_URL}/admin/conjunto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body)
    });
    if (res.ok) location.reload();
}

/* ==========================================
   5. GESTIÓN DE TORRES
   ========================================== */
async function cargarCantidadTorres() {
    const res = await fetch(`${API_URL}/admin/torres`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if(document.getElementById('cantidadTorres')) cantidadTorres.textContent = data.length;
}

async function verTorres() {
    const res = await fetch(`${API_URL}/admin/torres`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const torresData = await res.json();
    listaTorres.innerHTML = "";
    torresData.forEach(t => {
        listaTorres.innerHTML += `
            <div style="margin-bottom:10px; border-bottom:1px solid #ccc; padding:5px;">
                <input type="number" value="${t.numero_torre}" id="torre-${t.cod_torre}" style="width:80px;">
                <button onclick="actualizarTorre(${t.cod_torre})">✏️</button>
                <button onclick="eliminarTorre(${t.cod_torre})">🗑️</button>
            </div>`;
    });
}

async function actualizarTorre(id) {
    const input = document.getElementById(`torre-${id}`);
    const numero = Number(input.value);
    if (!numero) return alert("Número inválido");
    await fetch(`${API_URL}/admin/torres/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ numero_torre: numero })
    });
    alert("✅ Torre actualizada");
    verTorres();
}

async function eliminarTorre(id) {
    if (!confirm("¿Eliminar torre?")) return;
    await fetch(`${API_URL}/admin/torres/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
    });
    alert("🗑️ Torre eliminada");
    cargarCantidadTorres();
    verTorres();
}

async function agregarTorre() {
    const numero = Number(nuevaTorre.value);
    if (!numero) return alert('Número inválido');
    await fetch(`${API_URL}/admin/torres`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ numero_torre: numero })
    });
    nuevaTorre.value = '';
    cargarCantidadTorres();
    verTorres();
}

/* ==========================================
   6. EMPRESA Y VIGILANTES
   ========================================== */
if(document.getElementById('empresaForm')) {
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
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(data)
        });
        if (res.ok) {
            empresaMessage.textContent = "Empresa creada ✅";
            empresaForm.reset();
        }
    });
}

async function cargarVigilantesPendientes() {
    const res = await fetch(`${API_URL}/admin/vigilantes-pendientes`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    if(!document.getElementById('tablaVigilantes')) return;
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
        </tr>`;
    });
}

async function aprobarVigilante(id) {
    await fetch(`${API_URL}/admin/aprobar-vigilante`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ cod_user: id })
    });
    alert("Aprobado");
    cargarVigilantesPendientes();
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

async function cargarVigilantes() {
    const contenedor = document.getElementById("contenedorVigilantes");
    if (!contenedor) return;
    try {
        const res = await fetch(`${API_URL}/admin/mis-vigilantes`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        const data = await res.json();
        contenedor.innerHTML = ""; 
        if (!data || data.length === 0) {
            contenedor.innerHTML = "<p>No hay vigilantes vinculados.</p>";
            return;
        }
        data.forEach(item => {
            const p = item.persona;
            contenedor.innerHTML += `
                <div style="border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:10px; background:#fff;">
                    <b>${p.nombres} ${p.apellidos}</b><br>
                    <small>Cédula: ${p.cedula || 'N/A'}</small><br>
                    <span>Estado: ${item.fk_estado_vigilante_empresa === 1 ? "🟢 Activo" : "🔴 Inactivo"}</span>
                    <div style="margin-top:10px; display:flex; gap:10px;">
                        <button onclick="updateStatusVigilante(${item.cod_empresa_vigilante}, 1)">Activar</button>
                        <button onclick="updateStatusVigilante(${item.cod_empresa_vigilante}, 2)">Inactivar</button>
                    </div>
                </div>`;
        });
    } catch (err) { console.error(err); }
}

async function updateStatusVigilante(idRegistro, nuevoEstado) {
    try {
        const res = await fetch(`${API_URL}/admin/cambiar-estado-vigilante`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ id: idRegistro, estado: nuevoEstado })
        });

        if (res.ok) {
            alert("✅ Estado actualizado");
            cargarVigilantes(); // Recarga la lista
        }
    } catch (error) {
        console.error("Error al actualizar:", error);
    }

  
 
}



/* ==========================================
   7. HISTORIAL Y BUSQUEDA
   ========================================== */
if(document.getElementById("buscarHistorial")) {
    buscarHistorial.addEventListener("input", async () => {
        const query = buscarHistorial.value.trim();
        if (query.length < 2) { tablaHistorial.innerHTML = ""; return; }
        try {
            const res = await fetch(`${API_URL}/admin/historial?query=${query}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            tablaHistorial.innerHTML = "";
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
                    <hr>`;
                tablaHistorial.appendChild(div);
            });
        } catch (error) { console.error(error); }
    });
}

/* ==========================================
   8. NAVEGACIÓN Y SESIÓN
   ========================================== */
function cerrarSesion() {
    localStorage.clear();
    window.location.href = '../login.html';
}

function volver() { window.history.back(); }

function irModoResidente() {
    localStorage.setItem("modo", "residente");
    localStorage.removeItem("estadoEspecial");
    localStorage.removeItem("mensajeEstado");
    window.location.href = "../residente/Residente.html";
}

function irModoMensajero() { window.location.href = "../mensajero/mensajero.html"; }
function irModoVigilante() { window.location.href = "../vigilante/vigilante.html"; }
function irModoPropietario() { window.location.href = "../propietario/propietario.html"; }
function irModoAdministrador() { window.location.href = "../admmin/admmin.html"; }
