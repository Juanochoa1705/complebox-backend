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
        const headers = {
    'Authorization': `Bearer ${token}`
};

// SOLO enviar si existe
if (conjuntoActivo) {
    headers["x-conjunto-id"] = conjuntoActivo;
}

const res = await fetch(`${API_URL}/admin/perfil`, {
    headers
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
// ✅ AQUI sí existe data
        console.log("DATA PERFIL 👉", data);
        console.log("CONJUNTOS 👉", data.conjuntos);
       // ===============================
// 🚨 NO TIENE CONJUNTOS
// ===============================
if (!data.conjuntos || data.conjuntos.length === 0) {

    // Mostrar sección para crear o vincularse
    const crearSection = document.getElementById('crearSection');
    crearSection?.classList.remove('d-none');

    // Ocultar info admin
    document.getElementById('infoSection')?.classList.add('d-none');

    // Ocultar selector
    document.getElementById('selectorConjunto')?.classList.add('d-none');

    // 🔥 IMPORTANTE
    // limpiar conjunto activo
    localStorage.removeItem("conjuntoActivo");

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
        cargarVigilantes(); 
        cargarVigilantesPendientes();// Esta es la función que corregimos antes
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
    const numeroInput = document.getElementById("numero_torre").value;

    if (!numeroInput.trim()) {
        Swal.fire({ icon: "warning", title: "Advertencia", text: "Por favor, ingresa un número de torre." });
        return; 
    }

    try {
        const res = await fetch("http://localhost:3000/admin/torres", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer " + localStorage.getItem("token"),
                "x-conjunto-id": conjuntoActivo // 👈 ¡ESTA ERA LA LÍNEA FALTANTE!
            },
            body: JSON.stringify({
                numero_torre: Number(numeroInput) 
            })
        });

        const data = await res.json();
        console.log("Respuesta del servidor:", data);

        if (!res.ok) {
            Swal.fire({
                icon: "error",
                title: "No se pudo crear",
                text: data.message || "La torre ya existe en este conjunto o la solicitud es inválida."
            });
            return; 
        }

        Swal.fire({
            icon: "success",
            title: "¡Éxito!",
            text: "Torre creada correctamente"
        });

        // Ejecuta las funciones de refresco que ya tienes declaradas arriba
        cargarCantidadTorres();
        if (typeof verTorres === "function") verTorres();

    } catch (error) {
        console.error("Error capturado:", error);
        Swal.fire({
            icon: "error",
            title: "Error de comunicación",
            text: "No se pudo procesar la respuesta del servidor."
        });
    }
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
        const result = await res.json();

if (!res.ok) {

    empresaMessage.innerHTML = `
        <div style="
            background:#ffe5e5;
            color:#b30000;
            padding:10px;
            border-radius:8px;
            margin-top:10px;
        ">
            ❌ ${result.message}
        </div>
    `;

    return;
}

empresaMessage.innerHTML = `
    <div style="
        background:#e7ffe7;
        color:#008000;
        padding:10px;
        border-radius:8px;
        margin-top:10px;
    ">
        ✅ Empresa creada correctamente
    </div>
`;

empresaForm.reset();
    });
}

async function cargarVigilantes() {
    const contenedor = document.getElementById("contenedorVigilantes");
    if (!contenedor) return;

    if (!conjuntoActivo) {
        contenedor.innerHTML = "<p>Seleccione un conjunto para ver vigilantes.</p>";
        return;
    }

    try {
        // Usamos la ruta con el ID del conjunto para que traiga los correctos
        const res = await fetch(`${API_URL}/admin/mis-vigilantes/${conjuntoActivo}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) throw new Error("Error al obtener vigilantes");

        const data = await res.json();
        contenedor.innerHTML = ""; 

        if (!data || data.length === 0) {
            contenedor.innerHTML = "<p>No hay vigilantes vinculados a este conjunto.</p>";
            return;
        }

        // Diseño exacto solicitado
       data.forEach(item => {

    const p = item.persona;

    let estadoTexto = "🔴 Inactivo";

    if (item.fk_estado_vigilante_empresa === 1) {
        estadoTexto = "🟢 Activo";
    }

    if (item.fk_estado_vigilante_empresa === 3) {
        estadoTexto = "🟡 Pendiente";
    }

    contenedor.innerHTML += `
        <div style="border:1px solid #eee; padding:15px; border-radius:10px; margin-bottom:10px; background:#fff;">

            <b>${p.nombres} ${p.apellidos}</b><br>

            <small>Cédula: ${p.cedula || 'N/A'}</small><br>

            <span>Estado: ${estadoTexto}</span>

            <div style="margin-top:10px; display:flex; gap:10px;">

                <button 
                    style="cursor:pointer; padding:5px 10px;" 
                    onclick="updateStatusVigilante(${item.cod_empresa_vigilante}, 1)">
                    Activar
                </button>

                <button 
                    style="cursor:pointer; padding:5px 10px;" 
                    onclick="updateStatusVigilante(${item.cod_empresa_vigilante}, 2)">
                    Inactivar
                </button>

            </div>

        </div>
    `;
});

    } catch (err) { 
        console.error("Error cargando vigilantes:", err);
        contenedor.innerHTML = "<p>Error al cargar la lista.</p>";
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

if (document.getElementById("buscarHistorial")) {
    const buscarHistorial = document.getElementById("buscarHistorial");
    const tablaHistorial = document.getElementById("tablaHistorial");

    buscarHistorial.addEventListener("input", async () => {
        const query = buscarHistorial.value.trim();
        
        // Si el buscador está vacío, puedes decidir si limpiar o traer todo
        // Aquí lo dejamos para que limpie si hay menos de 2 caracteres
        if (query.length < 2) { 
            tablaHistorial.innerHTML = ""; 
            return; 
        }
        
        try {
            const res = await fetch(`${API_URL}/admin/historial?query=${encodeURIComponent(query)}`, {
                headers: { 
                    "Authorization": `Bearer ${token}`,
                    "x-conjunto-id": conjuntoActivo 
                }
            });
            
            if (!res.ok) throw new Error("Error al obtener el historial");

            const data = await res.json();
            tablaHistorial.innerHTML = "";
            
            data.forEach(p => {
    const div = document.createElement("div");
    
    // Estilo del contenedor
    div.style = `
        border: 1px solid #e0e0e0; 
        border-radius: 12px; 
        padding: 20px; 
        margin-bottom: 15px; 
        background: #ffffff; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        line-height: 1.6;
    `;
    
    // Lógica para la firma
    const seccionFirma = p.firma_residente 
        ? `<div style="margin-top: 15px;">
             <b>✍️ Firma del Residente:</b><br>
             <img src="${p.firma_residente}" style="max-width: 200px; height: auto; border: 1px solid #eee; border-radius: 4px; background: #fafafa;">
           </div>`
        : `<div style="margin-top: 15px; color: #888;"><b>✍️ Firma:</b> <i>Pendiente de entrega</i></div>`;

    div.innerHTML = `
        <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f0f0f0; padding-bottom: 8px; margin-bottom: 10px;">
            <span style="font-size: 1.1em; color: #333;">📦 <b>${p.nombre_pedido || 'Pedido'}</b></span>
            <span style="background: #e3f2fd; color: #1976d2; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; font-weight: bold;">
                ${p.estado_pedido}
            </span>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
                <b>🔢 Guía:</b> ${p.numero_guia || 'N/A'}<br>
                <b>📅 Recibido:</b> ${new Date(p.fecha_recibido).toLocaleString()}<br>
                <b>👮 Recibe:</b> ${p.nombre_vigilante_recibe} ${p.apellido_vigilante_recibe}
            </div>
            <div>
                <b>🏠 Residente:</b> ${p.nombre_residente} ${p.apellido_residente}<br>
                <b>🏢 Apto:</b> T${p.numero_torre} - ${p.numero_apto}<br>
                <b>🪪 Cédula:</b> ${p.cedula || 'N/A'}
            </div>
        </div>

        <div style="margin-top: 10px; border-top: 1px solid #f0f0f0; pt: 10px;">
            <b>🚚 Mensajería:</b> ${p.nombre_empresa || 'Particular'} (${p.nombre_mensajero || 'N/A'})<br>
            <b>📅 Entregado:</b> ${p.fecha_entregado ? new Date(p.fecha_entregado).toLocaleString() : '⏳ En custodia'}<br>
            <b>👮 Entrega:</b> ${p.nombre_vigilante_entrega ? `${p.nombre_vigilante_entrega} ${p.apellido_vigilante_entrega}` : '---'}
        </div>

        ${seccionFirma}
    `;
    
    tablaHistorial.appendChild(div);
});
        } catch (error) { 
            console.error("Error en búsqueda:", error); 
        }
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

async function cargarVigilantesPendientes() {

    const tabla = document.getElementById("tablaVigilantes");
    const mensaje = document.getElementById("mensajeVacio");

    try {

        const res = await fetch(`${API_URL}/admin/vigilantes-pendientes`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "x-conjunto-id": conjuntoActivo
            }
        });

        const data = await res.json();

        tabla.innerHTML = "";

        if (!data || data.length === 0) {
            mensaje.style.display = "block";
            return;
        }

        mensaje.style.display = "none";

        data.forEach(v => {

            tabla.innerHTML += `
                <tr>
                    <td>${v.nombres} ${v.apellidos}</td>
                    <td>${v.cedula}</td>
                    <td>
                        <button onclick="aprobarVigilante(${v.cod_user})">
                            ✅ Aprobar
                        </button>

                        <button onclick="rechazarVigilante(${v.cod_user})">
                            ❌ Rechazar
                        </button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.error(err);
    }
}

function cancelarEdicion() {
    document.getElementById("editarEmpresaForm").classList.add("d-none");
}

function mostrarPantallaBloqueo(mensaje) {

    document.body.innerHTML = `
    
    <div style="
        min-height:100vh;
        background:#f5f7fb;
        display:flex;
        justify-content:center;
        align-items:center;
        padding:20px;
        font-family:sans-serif;
        position:relative;
    ">

        <div style="
            background:white;
            width:100%;
            max-width:420px;
            padding:30px;
            border-radius:20px;
            text-align:center;
            box-shadow:0 4px 20px rgba(0,0,0,0.1);
        ">

            <h2 style="
                margin-bottom:15px;
                color:#d32f2f;
            ">
                🚫 Acceso bloqueado
            </h2>

            <p style="
                color:#555;
                margin-bottom:25px;
                line-height:1.5;
            ">
                ${mensaje}
            </p>

            <button 
                onclick="solicitaradmin()" 
                style="
                    width:100%;
                    background:#1976d2;
                    color:white;
                    border:none;
                    padding:16px;
                    border-radius:15px;
                    font-weight:bold;
                    cursor:pointer;
                    margin-bottom:12px;
                "
            >
                🛡️ Solicitar permiso de administrador
            </button>

            <button 
                onclick="cerrarSesion()" 
                style="
                    width:100%;
                    background:#ef5350;
                    color:white;
                    border:none;
                    padding:16px;
                    border-radius:15px;
                    font-weight:bold;
                    cursor:pointer;
                "
            >
                🔒 Cerrar sesión
            </button>

        </div>

        <!-- ICONOS FLOTANTES -->
        <div style="
            position:fixed;
top:20px;
right:20px;
display:flex;
flex-direction:row;
        ">

            <div onclick="irModoResidente()" style="
                width:55px;
                height:55px;
                background:white;
                border-radius:50%;
                display:flex;
                justify-content:center;
                align-items:center;
                cursor:pointer;
                font-size:24px;
                box-shadow:0 4px 10px rgba(0,0,0,0.15);
            ">
                🏠
            </div>

            <div onclick="irModoMensajero()" style="
                width:55px;
                height:55px;
                background:white;
                border-radius:50%;
                display:flex;
                justify-content:center;
                align-items:center;
                cursor:pointer;
                font-size:24px;
                box-shadow:0 4px 10px rgba(0,0,0,0.15);
            ">
                🚚
            </div>

            <div onclick="irModoVigilante()" style="
                width:55px;
                height:55px;
                background:white;
                border-radius:50%;
                display:flex;
                justify-content:center;
                align-items:center;
                cursor:pointer;
                font-size:24px;
                box-shadow:0 4px 10px rgba(0,0,0,0.15);
            ">
                👮‍♂️
            </div>

            <div onclick="irModoPropietario()" style="
                width:55px;
                height:55px;
                background:white;
                border-radius:50%;
                display:flex;
                justify-content:center;
                align-items:center;
                cursor:pointer;
                font-size:24px;
                box-shadow:0 4px 10px rgba(0,0,0,0.15);
            ">
                🔑
            </div>

        </div>

    </div>
    `;
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