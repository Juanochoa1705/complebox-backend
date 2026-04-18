
import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class MensajeroService {

  constructor(private prisma: PrismaService) {}

async crearPedido(dto: any, mensajeroId: number)
 {

  // 🔥 VALIDAR QUE EXISTA
  const residente = await this.prisma.persona.findUnique({
    where: { cod_user: dto.fk_residente }
  });

  if (!residente) {
    throw new NotFoundException("Residente no existe");
  }

  return this.prisma.pedido_estado_entrega_residente.create({
    data: {
      numero_guia: dto.numero_guia,
      nombre_pedido: dto.nombre_pedido,
      descripcion_pedido: dto.descripcion_pedido,

      fk_estado_pedido: 1,
      fk_residente: residente.cod_user,
      fk_mensajero: mensajeroId
    }
  });
}

async buscarResidente(query: string) {

  return this.prisma.persona.findMany({
    where: {
      AND: [
        {
          fk_rol: {
            in: [2, 3] // 🔥 propietario y residente
          }
        },
        {
          OR: [
            { nombres: { contains: query } },
            { apellidos: { contains: query } },
            { cedula: { contains: query } }
          ]
        }
      ]
    },
    take: 5
  });
}

async obtenerPerfilmen(codUser: number) {

  const persona = await this.prisma.persona.findUnique({
    where: {
      cod_user: codUser
    },
    select: {
      nombres: true,
      apellidos: true
    }
  });

 const empresaMensajero = await this.prisma.empresa_mensajero.findFirst({
  where: {
    fk_persona_mensajero: codUser
  }
});

  return {
  nombres: persona?.nombres,
  apellidos: persona?.apellidos
};

}

async historialMensajero(query: string, mensajeroId: number) {

  return this.prisma.$queryRaw`
    SELECT *
    FROM vista_historial_pedidos v
    INNER JOIN pedido_estado_entrega_residente p 
      ON p.cod_pedido_estado_entrega = v.cod_pedido_estado_entrega

    WHERE 
      p.fk_mensajero = ${mensajeroId}
      AND (
        v.nombre_residente LIKE ${'%' + query + '%'}
        OR v.apellido_residente LIKE ${'%' + query + '%'}
        OR v.cedula LIKE ${'%' + query + '%'}
        OR v.nombre_pedido LIKE ${'%' + query + '%'}
        OR v.numero_guia LIKE ${'%' + query + '%'}
      )
    ORDER BY v.cod_pedido_estado_entrega DESC
  `;
}

async eliminarPedido(id: number, mensajeroId: number) {

  const pedido = await this.prisma.pedido_estado_entrega_residente.findFirst({
    where: {
      cod_pedido_estado_entrega: id,
      fk_mensajero: mensajeroId,
      fk_estado_pedido: 1
    }
  });

  if (!pedido) {
    throw new Error("No puedes eliminar este pedido");
  }

  return this.prisma.pedido_estado_entrega_residente.delete({
    where: {
      cod_pedido_estado_entrega: id
    }
  });
}

// 🔍 OBTENER PEDIDO
  async obtenerPedido(id: number, mensajeroId: number) {
    return this.prisma.pedido_estado_entrega_residente.findFirst({
      where: {
        cod_pedido_estado_entrega: id,
        fk_mensajero: mensajeroId
      },
      include: {
        persona_pedido_estado_entrega_residente_fk_residenteTopersona: true
      }
    });
  }

  // ✏️ EDITAR
  async editarPedido(id: number, dto: any, mensajeroId: number) {

    const pedido = await this.prisma.pedido_estado_entrega_residente.findFirst({
      where: {
        cod_pedido_estado_entrega: id,
        fk_mensajero: mensajeroId,
        fk_estado_pedido: 1 // 🔥 SOLO REGISTRADO
      }
    });

    if (!pedido) {
      throw new BadRequestException('No puedes editar este pedido');
    }

    if (!dto.fk_residente) {
      throw new BadRequestException('Debe seleccionar un residente');
    }

    return this.prisma.pedido_estado_entrega_residente.update({
      where: {
        cod_pedido_estado_entrega: id
      },
      data: {
        numero_guia: dto.numero_guia,
        nombre_pedido: dto.nombre_pedido,
        descripcion_pedido: dto.descripcion_pedido,
        fk_residente: dto.fk_residente
      }
    });
  }

 async actualizarEmpresaMensajero(userId: number, dto: any) {

  // 🔍 Buscar relación mensajero - empresa
  let relacion = await this.prisma.empresa_mensajero.findFirst({
    where: { fk_persona_mensajero: userId },
    include: { empresa: true }
  });

  // ============================
  // 🟢 CASO 1: NO EXISTE RELACIÓN
  // ============================
  if (!relacion) {

    // 🔍 buscar empresa por NIT
    let empresa = await this.prisma.empresa.findUnique({
      where: { nit_empresa: dto.nit_empresa }
    });

    // 🆕 si no existe empresa → crearla
    if (!empresa) {
      empresa = await this.prisma.empresa.create({
        data: {
          nit_empresa: dto.nit_empresa,
          nombre_empresa: dto.nombre_empresa,
          direccion_empresa: dto.direccion_empresa,
          telefono_empresa: dto.telefono_empresa,
          correo_empresa: dto.correo_empresa,
          fk_estado_empresa: 1
        }
      });
    }

    // 🔗 crear relación mensajero - empresa
    await this.prisma.empresa_mensajero.create({
      data: {
        fk_persona_mensajero: userId,
        fk_empresa_mensajero: empresa.cod_empresa
      }
    });

    return { message: "Empresa creada y asociada correctamente" };
  }

  // ============================
  // 🔵 CASO 2: YA TIENE RELACIÓN
  // ============================

  const empresaActual = relacion.empresa;

if (!empresaActual) {
  throw new Error("Relación existe pero no tiene empresa asociada");
}

if (empresaActual.nit_empresa === dto.nit_empresa) {

  await this.prisma.empresa.update({
    where: { cod_empresa: empresaActual.cod_empresa },
    data: {
      nombre_empresa: dto.nombre_empresa,
      direccion_empresa: dto.direccion_empresa,
      telefono_empresa: dto.telefono_empresa,
      correo_empresa: dto.correo_empresa
    }
  });

  return { message: "Empresa actualizada correctamente" };
}

  // ============================
  // 🟡 CASO 3: CAMBIO DE NIT
  // ============================

  let empresa = await this.prisma.empresa.findUnique({
    where: { nit_empresa: dto.nit_empresa }
  });

  // 🆕 si no existe nueva empresa → crearla
  if (!empresa) {
    empresa = await this.prisma.empresa.create({
      data: {
        nit_empresa: dto.nit_empresa,
        nombre_empresa: dto.nombre_empresa,
        direccion_empresa: dto.direccion_empresa,
        telefono_empresa: dto.telefono_empresa,
        correo_empresa: dto.correo_empresa,
        fk_estado_empresa: 1
      }
    });
  }

  // 🔁 actualizar relación
  await this.prisma.empresa_mensajero.update({
    where: {
      cod_empresa_mensajero: relacion.cod_empresa_mensajero
    },
    data: {
      fk_empresa_mensajero: empresa.cod_empresa
    }
  });

  return { message: "Empresa cambiada correctamente" };
}
async obtenerEmpresaMensajero(userId: number) {

  const empresaActual = await this.prisma.empresa_mensajero.findFirst({
    where: {
      fk_persona_mensajero: userId
    },
    include: {
      empresa: true
    }
  });

  // 🔥 VALIDACIÓN CLAVE
  if (!empresaActual || !empresaActual.empresa) {
  return null; // 🔥 clave
}

  return empresaActual.empresa;
}
  async validarEmpresa(userId: number) {

  const mensajero = await this.prisma.persona.findUnique({
    where: { cod_user: userId },
    include: {
      empresa_mensajero: {
        include: {
          empresa: true
        }
      }
    }
  });

  // ❌ NO TIENE RELACIÓN
  if (!mensajero || mensajero.empresa_mensajero.length === 0) {
    return {
      acceso: false,
      mensaje: "⚠️ No tienes empresa asociada. Debes registrarla para continuar."
    };
  }

  const empresa = mensajero.empresa_mensajero[0].empresa;

  // ❌ RELACIÓN PERO EMPRESA NULL
  if (!empresa) {
    return {
      acceso: false,
      mensaje: "⚠️ Empresa no válida."
    };
  }

  // ✅ TODO OK
  return {
    acceso: true,
    empresa
  };
}

async buscarEmpresaPorNit(nit: string) {

  const nitLimpio = nit.trim();

  const empresa = await this.prisma.empresa.findUnique({
    where: { nit_empresa: nitLimpio }
  });

  return empresa || null;
}
}