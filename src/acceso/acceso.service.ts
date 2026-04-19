import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AccesoService {

  constructor(private prisma: PrismaService) {}

  // ==============================
  // 🔥 OBTENER TODOS LOS APTOS
  // ==============================
  async obtenerAptos() {
    return await this.prisma.apto.findMany({
      include: {
        torre: {
          include: {
            conjunto: true
          }
        }
      }
    });
  }

  // ==============================
  // 🔥 SOLICITAR CAMBIO DE APTO
  // ==============================
  async cambiarApto(userId: number, fk_apto: number) {

    // 🔒 Validación básica (opcional pero recomendable)
    if (!fk_apto) {
      throw new BadRequestException('Debes seleccionar un apartamento');
    }

    try {

      // 🔥 LLAMAMOS TU PROCEDURE (NO SE TOCA)
      await this.prisma.$executeRawUnsafe(`
        CALL sp_cambiar_apto_residente(${fk_apto}, ${userId});
      `);

      return {
        ok: true,
        message: 'Solicitud enviada. Pendiente aprobación'
      };

    } catch (error) {
      console.error('Error cambiarApto:', error);

      throw new BadRequestException('Error al solicitar cambio de apartamento');
    }
  }

   async cambiarEmpresaVig(userId: number, fk_empresa_vig_conjunto: number) {

  if (!fk_empresa_vig_conjunto) {
    throw new BadRequestException('Debes seleccionar una empresa');
  }

  try {

    await this.prisma.$executeRawUnsafe(`
      CALL sp_asignar_conjunto(${fk_empresa_vig_conjunto}, ${userId});
    `);

    return {
      ok: true,
      message: 'Solicitud enviada. Pendiente aprobación'
    };

  } catch (error) {
    console.error('Error cambiarEmpresaVig:', error);

    throw new BadRequestException('Error al solicitar cambio de empresa de seguridad');
  }
}

 async buscarEmpresas(q: string) {

  if (!q) return [];

  return await this.prisma.empresa_seguridad_conjunto.findMany({
    where: {
      empresa: {
        nombre_empresa: {
          contains: q,
       
        }
      }
    },
    include: {
      empresa: true
    },
    take: 10
  });

}

async validarAcceso(userId: number) {

  const residente = await this.prisma.apto_residente.findFirst({
    where: {
      fk_cod_residente: userId,
      fk_estado_apto_residente: 1 // activo
    }
  });

  if (!residente) {
    return {
      acceso: false,
      mensaje: "No tienes un apartamento activo asociado"
    };
  }

  return {
    acceso: true
  };
}

async solicitarAccesoAdmin(cod_user: number) {
  // 1. Forzamos que sea número (a veces desde el controlador llega como string)
  const idLimpio = Number(cod_user);
  
  console.log('--- Intentando actualizar ID:', idLimpio, '---');

  try {
    // 2. Realizamos la actualización directamente
    const resultado = await this.prisma.persona.update({
      where: { 
        cod_user: idLimpio 
      },
      data: { 
        // Verifica que este nombre coincida EXACTO con tu schema.prisma
        fk_estado_user: 3 
      },
    });

    console.log('✅ Actualización exitosa en DB:', resultado);
    return resultado;

  } catch (error) {
    console.error('❌ Error de Prisma al actualizar:', error.message);
    
    // Si el error es P2025 es que el ID no existe
    if (error.code === 'P2025') {
      throw new Error(`No se encontró el usuario con ID ${idLimpio}`);
    }
    
    throw error;
  }
}

  // 2. Tú apruebas la solicitud
  async aprobarAcceso(cod_user: number) {
    return this.prisma.persona.update({
      where: { cod_user },
      data: { 
        fk_rol: 1,         // Cambiamos a Rol Admin
        fk_estado_user: 1  // Cambiamos a Estado Activo
      },
    });
  }

  // 3. Ver lista de gente que quiere ser Admin
  async obtenerSolicitudesPendientes() {
    return this.prisma.persona.findMany({
      where: {
        fk_estado_user: 3, // Todos los que están esperando
      },
      include: {
        rol: true,
      }
    });
  }

 async obtenerPendientesTraspaso() {
  return await this.prisma.adminConjunto.findMany({
    where: { fk_estado_admin: 3 }, // Solo los pendientes
    include: {
      admin: {
        select: { cod_user: true, nombres: true, apellidos: true }
      },
      conjunto: {
        select: { cod_conjunto: true, nombre_conjunto: true }
      }
    }
  });
}

  async rechazarAcceso(cod_user: number) {
  const idLimpio = Number(cod_user);
  
  return await this.prisma.persona.update({
    where: { cod_user: idLimpio },
    data: { 
      fk_estado_user: 1 // Lo regresamos a estado normal (Residente/Invitado)
    },
  });
  
}

async obtenerConjuntos() {
  return await this.prisma.conjunto.findMany({
    select: {
      cod_conjunto: true,
      nombre_conjunto: true,
    },
    orderBy: {
      nombre_conjunto: 'asc', // Para que salgan en orden alfabético
    },
  });
}
async crearSolicitudTraspaso(cod_user: number, cod_conjunto: number) {
  return await this.prisma.$transaction(async (tx) => {
    // 1. Cambiamos el estado del usuario a "En espera" (estado 3)
    await tx.persona.update({
      where: { cod_user: Number(cod_user) },
      data: { fk_estado_user: 3 } 
    });

    // 2. Creamos la relación en admin_conjunto con estado "Pendiente" (estado 3)
    // Esto guarda el conjunto que el usuario seleccionó
    return await tx.adminConjunto.create({
      data: {
        fk_cod_administrador: Number(cod_user),
        fk_cod_conjunto: Number(cod_conjunto),
        fk_estado_admin: 3 // <-- 3 significa "Esperando que el SuperAdmin me apruebe"
      }
    });
  });
}

  // --- PASO 2: El SuperAdmin aprueba y se ejecuta la "magia" ---
  async ejecutarTraspasoReal(cod_user: number, cod_conjunto: number) {
  return await this.prisma.$transaction(async (tx) => {
    
    // A. Inactivar a cualquier administrador que esté ACTIVO (estado 1) en ese conjunto
    await tx.adminConjunto.updateMany({
      where: { 
        fk_cod_conjunto: Number(cod_conjunto), 
        fk_estado_admin: 1 
      },
      data: { fk_estado_admin: 2 } // 2 = Inactivo
    });

    // B. Activar la solicitud del usuario (Pasar de estado 3 a 1)
    await tx.adminConjunto.update({
      where: {
        // Usamos el unique que tienes en tu esquema
        fk_cod_conjunto_fk_cod_administrador: {
          fk_cod_administrador: Number(cod_user),
          fk_cod_conjunto: Number(cod_conjunto)
        }
      },
      data: { fk_estado_admin: 1 } // 1 = Activo
    });

    // C. Poner al usuario como Admin Activo
    await tx.persona.update({
      where: { cod_user: Number(cod_user) },
      data: { 
        fk_rol: 1, 
        fk_estado_user: 1 // 1= Activo
      }
    });
  });
}
}
