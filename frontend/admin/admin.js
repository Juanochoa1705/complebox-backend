/* ==========================================
   1. SEGURIDAD Y VARIABLES
   ========================================== */
const API_URL = 'http://localhost:3000';
const token = localStorage.getItem('token');
const estadoEspecialAdmin = localStorage.getItem("estadoEspecialAdmin");
const mensajeAdmin = localStorage.getItem("mensajeAdmin");

// Declaramos las variables globales una sola vez
let conjuntoActivo = localStorage.getItem("conjuntoActivo");
let conjuntoSeleccionadoId = null; 

function validarRol() {
    if (!token || token.split('.').length < 3) return false;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.rol === 'Administrador';
    } catch (e) { 
        return false; 
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    console.log("🚀 DOM listo");

    if (!validarRol()) {
        mostrarPantallaBloqueo("No tienes permisos de Administrador.");
        return;
    }

    if (estadoEspecialAdmin === "true") {
        mostrarPantallaBloqueo(mensajeAdmin);
        return;
    }

    // Iniciamos la carga del perfil
    await cargarPerfilAdmin();
});

/* ==========================================
   4. PERFIL Y CONTROL DE INTERFAZ
   ========================================== */
async function cargarPerfilAdmin() {
    try {
        const res = await fetch(`${API_URL}/admin/perfil`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                "x-conjunto-id": conjuntoActivo 
            }
        });
        
        if (!res.ok) throw new Error("Error en la petición de perfil");
        
        const data = await res.json();
        console.log("DATA PERFIL 👉", data);

        if (data.bloqueado) {
            mostrarPantallaBloqueo(data.mensaje);
            return;
        }

        const titulo = document.getElementById("titulo");
        if(titulo) {
            titulo.innerText = `💼 Admin: ${data.nombres || 'Usuario'}`;
        }

        // Si no tiene conjuntos
        if (!data.conjuntos || data.conjuntos.length === 0) {
            document.getElementById('crearSection')?.classList.remove('d-none');
            document.getElementById('infoSection')?.classList.add('d-none');
            document.getElementById('selectorConjunto')?.classList.add('d-none');
            return;
        }

        const conjuntos = data.conjuntos;

        // Si tiene varios y no hay uno activo, mostrar selector
        if (conjuntos.length > 1 && !conjuntoActivo) {
            mostrarSelectorConjunto(conjuntos);
            return; 
        }

        // Si solo tiene uno, seleccionarlo automáticamente
        if (!conjuntoActivo && conjuntos.length === 1) {
            conjuntoActivo = conjuntos[0].cod_conjunto;
            localStorage.setItem("conjuntoActivo", conjuntoActivo);
        }

        const conjuntoActual = conjuntos.find(c => c.cod_conjunto == conjuntoActivo);

        if (!conjuntoActual) {
            localStorage.removeItem("conjuntoActivo");
            location.reload();
            return;
        }

        mostrarConjunto(conjuntoActual);

        // Cargar datos del conjunto seleccionado
        cargarVigilantes(); // Esta es la función que corregimos antes
        cargarCantidadTorres();
        cargarEmpresa(); 

    } catch (err) {
        console.error("Error cargando perfil:", err);
    }
}

// Función auxiliar para activar la vista del conjunto
function mostrarConjunto(conjunto) {
    document.getElementById('selectorConjunto')?.classList.add('d-none');
    document.getElementById('crearSection')?.classList.add('d-none');
    
    const infoSec = document.getElementById('infoSection');
    if (infoSec) {
        infoSec.classList.remove('d-none');
        document.getElementById("infoNombre").innerText = conjunto.nombre_conjunto;
        document.getElementById("infoTelefono").innerText = conjunto.telefono_conjunto;
    }
}



function mostrarSelectorConjunto(conjuntos) {

    const selector = document.getElementById("selectorConjunto");
    const lista = document.getElementById("listaConjuntos");

    selector.classList.remove("d-none");
    document.getElementById("infoSection")?.classList.add("d-none");
    document.getElementById("crearSection")?.classList.add("d-none");

    lista.innerHTML = "";

    conjuntos.forEach(c => {
        const btn = document.createElement("button");
        btn.style.display = "block";
        btn.style.width = "100%";
        btn.style.marginBottom = "10px";

        btn.innerText = `${c.nombre_conjunto} - ${c.ciudad_conjunto}`;

        btn.onclick = () => {
            localStorage.setItem("conjuntoActivo", c.cod_conjunto);
            location.reload();
        };

        lista.appendChild(btn);
    });
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
            headers: { Authorization: `Bearer ${token}` ,"x-conjunto-id": conjuntoActivo}
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

    console.log("ELEMENTO 👉", document.getElementById('infoSection'));
    localStorage.getItem("token")

    const infoSection = document.getElementById('infoSection');
    const nombre = document.getElementById('infoNombre');
    const telefono = document.getElementById('infoTelefono');

    if (!infoSection || !nombre || !telefono) {
        console.error("❌ Elementos del DOM no encontrados");
        return;
    }

    infoSection.classList.remove('d-none');
    nombre.textContent = data.nombre_conjunto;
    telefono.textContent = data.telefono_conjunto;

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
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}`,"x-conjunto-id": conjuntoActivo },
        body: JSON.stringify(body)
    });
    if (res.ok) location.reload();
}

/* ==========================================
   5. GESTIÓN DE TORRES
   ========================================== */
async function cargarCantidadTorres() {
    const res = await fetch(`${API_URL}/admin/torres`, {
    headers: { 
        "Authorization": `Bearer ${token}`,
        "x-conjunto-id": conjuntoActivo
    }
});
    const data = await res.json();
    if(document.getElementById('cantidadTorres')) cantidadTorres.textContent = data.length;
}

async function verTorres() {
    const res = await fetch(`${API_URL}/admin/torres`, {
        headers: { 
        "Authorization": `Bearer ${token}`,
        "x-conjunto-id": conjuntoActivo
    }
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
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`, "x-conjunto-id": conjuntoActivo },
        body: JSON.stringify({ numero_torre: numero })
    });
    alert("✅ Torre actualizada");
    verTorres();
}

async function eliminarTorre(id) {
    if (!confirm("¿Eliminar torre?")) return;
    await fetch(`${API_URL}/admin/torres/${id}`, {
        method: "DELETE",
        headers: { 
        "Authorization": `Bearer ${token}`,
        "x-conjunto-id": conjuntoActivo
    }
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
        headers: { 'Content-Type': 'application/json', "Authorization": `Bearer ${token}`,
     "x-conjunto-id": conjuntoActivo
    },
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
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` , "x-conjunto-id": conjuntoActivo},
            body: JSON.stringify(data)
        });
        if (res.ok) {
            empresaMessage.textContent = "Empresa creada ✅";
            empresaForm.reset();
        }
    });
}

async function cargarVigilantes() {
    const contenedor = document.getElementById("contenedorVigilantes");
    if (!contenedor) return;

    // VALIDACIÓN PREVIA: Si no hay conjuntoActivo, ni siquiera hacemos la petición
    if (!conjuntoActivo) {
        console.warn("⚠️ No hay conjunto activo para cargar vigilantes.");
        contenedor.innerHTML = "<p>Seleccione un conjunto.</p>";
        return;
    }

    try {
        // CORRECCIÓN RUTA: Aseguramos que lleve el ID del conjunto
        const url = `${API_URL}/admin/mis-vigilantes/${conjuntoActivo}`;
        console.log("📡 Pidiendo vigilantes a:", url);

        const res = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        // Si el servidor responde 404 o 500, salimos elegantemente
        if (!res.ok) {
            const errorData = await res.json();
            console.error("❌ Error del servidor:", errorData);
            contenedor.innerHTML = "<p>No se encontraron vigilantes para este conjunto.</p>";
            return;
        }

        const data = await res.json();

        // VALIDACIÓN DE DATOS: Verificamos si es un Array antes del forEach
        contenedor.innerHTML = ""; 
        if (Array.isArray(data) && data.length > 0) {
            data.forEach(item => {
                const p = item.persona;
                contenedor.innerHTML += `
                    <div style="border:1px solid #eee; padding:10px; margin-bottom:5px; border-radius:8px;">
                        <b>${p.nombres} ${p.apellidos}</b><br>
                        <span>Estado: ${item.fk_estado_vigilante_empresa === 1 ? "🟢 Activo" : "🔴 Inactivo"}</span>
                    </div>`;
            });
        } else {
            contenedor.innerHTML = "<p>Este conjunto aún no tiene vigilantes asignados.</p>";
        }

    } catch (err) { 
        console.error("🔥 Error crítico en cargarVigilantes:", err);
    }
}

async function aprobarVigilante(id) {
    await fetch(`${API_URL}/admin/aprobar-vigilante`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}`,"x-conjunto-id": conjuntoActivo },
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
        "Authorization": `Bearer ${token}`,"x-conjunto-id": conjuntoActivo
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

async function updateStatusVigilante(idRegistro, nuevoEstado) {
    try {
        const res = await fetch(`${API_URL}/admin/cambiar-estado-vigilante`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
                "x-conjunto-id": conjuntoActivo
            },
            body: JSON.stringify({ id: idRegistro, estado: nuevoEstado })
        });

        if (res.ok) {
            alert("✅ Estado actualizado");
            cargarVigilantes();
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
                headers: { "Authorization": `Bearer ${token}` , "x-conjunto-id": conjuntoActivo}
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

async function buscarConjuntos() {
    const input = document.getElementById('searchConjunto').value;
    const resultados = document.getElementById('resultadosBusqueda');
    
    if (input.length < 3) {
        resultados.innerHTML = "";
        return;
    }

    // AGREGAMOS LOS HEADERS AQUÍ:
    const res = await fetch(`${API_URL}/admin/conjuntos/buscar?q=${input}`, {
        method: 'GET',
        headers: { 
            'Authorization': `Bearer ${token}`,'x-conjunto-id': conjuntoActivo, // <-- Esto es lo que falta
            'Content-Type': 'application/json'
        }
    });

    if (res.status === 401) {
        console.error("Sesión expirada o sin permisos");
        return;
    }

    const conjuntos = await res.json();

    resultados.innerHTML = "";
    conjuntos.forEach(c => {
        const item = document.createElement('button');
        item.className = "list-group-item list-group-item-action";
        item.innerHTML = `<strong>${c.nombre_conjunto}</strong> - ${c.ciudad_conjunto}`;
        item.onclick = () => seleccionarConjunto(c.cod_conjunto, c.nombre_conjunto);
        resultados.appendChild(item);
    });
}

function seleccionarConjunto(id, nombre) {
    document.getElementById('selectedConjuntoId').value = id;
    document.getElementById('searchConjunto').value = nombre;
    document.getElementById('resultadosBusqueda').innerHTML = "";
}

// Función para enviar la vinculación al Backend
async function vincularAdminAConjunto() {
    const conjuntoId = document.getElementById('selectedConjuntoId').value;
    
    if (!conjuntoId) return alert("Selecciona un conjunto de la lista");

    const res = await fetch(`${API_URL}/admin/vincular`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`,'x-conjunto-id': conjuntoActivo },
        body: JSON.stringify({ conjuntoId: Number(conjuntoId) })
    });

    if (res.ok) {
        alert("¡Vinculación exitosa!");
        location.reload();
    }
}

async function activarEmpresa() {
    await fetch(`${API_URL}/admin/empresa/estado`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "x-conjunto-id": conjuntoActivo
        },
        body: JSON.stringify({ estado: 1 })
    });

    alert("Empresa activada ✅");
    location.reload();
}

async function inactivarEmpresa() {
    await fetch(`${API_URL}/admin/empresa/estado`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "x-conjunto-id": conjuntoActivo
        },
        body: JSON.stringify({ estado: 2 })
    });

    alert("Empresa inactivada ❌");
    location.reload();
}
async function cargarEmpresa() {
    if (!conjuntoActivo) return;
    
    try {
        const res = await fetch(`${API_URL}/admin/empresa`, {
            headers: { 
                'Authorization': `Bearer ${token}`,
                'x-conjunto-id': conjuntoActivo 
            }
        });

        if (!res.ok) return;

        const data = await res.json();
        if (!data) return;

        // 1. Mostrar la tarjeta de información (la que ya tenías)
        const empresaCard = document.getElementById("empresaCard");
        if (empresaCard) {
            empresaCard.classList.remove("d-none");
            document.getElementById("empresaNombreTxt").textContent = data.nombre_empresa;
            document.getElementById("empresaNitTxt").textContent = data.nit_empresa;
            document.getElementById("empresaTelefonoTxt").textContent = data.telefono_empresa;
            document.getElementById("empresaCorreoTxt").textContent = data.correo_empresa;
            document.getElementById("empresaEstadoTxt").textContent = 
                data.fk_estado_empresa_seguridad_conjunto === 1 ? "🟢 Activa" : "🔴 Inactiva";
        }

        // 2. LLENAR EL FORMULARIO DE EDICIÓN (Aquí está lo que buscas)
        // Usamos el operador ?. por seguridad por si el elemento no existe en el DOM
        if (document.getElementById("editNombre")) {
            document.getElementById("editNombre").value = data.nombre_empresa || "";
            document.getElementById("editTelefono").value = data.telefono_empresa || "";
            document.getElementById("editCorreo").value = data.correo_empresa || "";
            document.getElementById("editDireccion").value = data.direccion_empresa || "";
            // Si tienes un campo oculto para el NIT que no se edita pero quieres mostrar:
            if(document.getElementById("editNit")) document.getElementById("editNit").value = data.nit_empresa || "";
        }

        console.log("✅ Formulario de edición precargado con:", data.nombre_empresa);

    } catch (error) {
        console.error("❌ Error al precargar datos de empresa:", error);
    }
}

function mostrarEditarEmpresa() {
    document.getElementById("editarEmpresaForm").classList.remove("d-none");
}

async function guardarEmpresa() {
    const body = {
        nombre: editNombre.value,
        telefono: editTelefono.value,
        correo: editCorreo.value,
        direccion: editDireccion.value
    };

    await fetch(`${API_URL}/admin/empresa`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,'x-conjunto-id': conjuntoActivo
        },
        body: JSON.stringify(body)
    });

    alert("Empresa actualizada ✅");
    location.reload();
}

function cancelarEdicion() {
    document.getElementById("editarEmpresaForm").classList.add("d-none");
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
function irModoAdministrador() { window.location.href = "../admin/admin.html"; }
function solicitaradmin() { window.location.href = "../superadmin/solicitudes.html"; }