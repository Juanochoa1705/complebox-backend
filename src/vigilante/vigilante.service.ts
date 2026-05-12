import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';


@Injectable()
export class VigilanteService {

  constructor(private prisma: PrismaService) {}


async obtenerPedidos(vigilanteId: number) {

  const vigilante = await this.prisma.persona.findUnique({
    where: { cod_user: vigilanteId },
    include: {
      empresa_vigilante_conjunto: {
        include: {
          empresa_seguridad_conjunto: true
        }
      }
    }
  });

  if (
    !vigilante ||
    !vigilante.empresa_vigilante_conjunto.length ||
    !vigilante.empresa_vigilante_conjunto[0].empresa_seguridad_conjunto
  ) {
    throw new Error("Vigilante no asignado a conjunto");
  }

  const conjuntoId =
    vigilante.empresa_vigilante_conjunto[0]
      .empresa_seguridad_conjunto.fk_cod_conjunto;

  return this.prisma.pedido_estado_entrega_residente.findMany({
    where: {
      fk_estado_pedido: 1, // solo registrados
      persona_pedido_estado_entrega_residente_fk_residenteTopersona: {
        apto_residente: {
          some: {
            apto: {
              torre: {
                fk_cod_conjunto: conjuntoId
              }
            }
          }
        }
      }
    },
    include: {
      persona_pedido_estado_entrega_residente_fk_residenteTopersona: true
    }
  });
}
async aprobarPedido(pedidoId: number, vigilanteId: number) {

  const fecha = new Date();
  fecha.setHours(fecha.getHours() - 5);

  return this.prisma.pedido_estado_entrega_residente.update({
    where: {
      cod_pedido_estado_entrega: pedidoId
    },
    data: {
      fk_estado_pedido: 2, // Recibido
      fecha_recibido: fecha, // ✅ aquí sí usas la fecha corregida
      fk_cod_vigilante_recibe: vigilanteId
    }
  });
}

async rechazarPedido(pedidoId: number) {

  // 🔥 validar que exista
  const pedido = await this.prisma.pedido_estado_entrega_residente.findUnique({
    where: { cod_pedido_estado_entrega: pedidoId }
  });

  if (!pedido) {
    throw new NotFoundException('El pedido no existe');
  }

  // 🔥 eliminar
  return this.prisma.pedido_estado_entrega_residente.delete({
    where: {
      cod_pedido_estado_entrega: pedidoId
    }
  });
}

async buscarPedidos(query: string, vigilanteId: number) {

  return this.prisma.pedido_estado_entrega_residente.findMany({
    where: {
      fk_estado_pedido: {
        in: [2, 3, 4]
      },
      persona_pedido_estado_entrega_residente_fk_residenteTopersona: {
        OR: [
          { nombres: { contains: query } },
          { cedula: { contains: query } }
        ]
      }
    },
    include: {
      persona_pedido_estado_entrega_residente_fk_residenteTopersona: true,
      estado_pedido: true
    }
  }).then(pedidos => pedidos.map(p => ({
    id: p.cod_pedido_estado_entrega,
    numero_guia: p.numero_guia,
    nombre_pedido: p.nombre_pedido,
    estado: p.estado_pedido?.nombre_pedido || "Sin estado",
    fk_estado_pedido: p.fk_estado_pedido,
    residente: p.persona_pedido_estado_entrega_residente_fk_residenteTopersona?.nombres || "Sin residente"
  })));

}

async entregarPedido(id: number, vigilanteId: number) {

  const fecha = new Date();
  fecha.setHours(fecha.getHours() - 5);

  return this.prisma.pedido_estado_entrega_residente.update({
    where: {
      cod_pedido_estado_entrega: id
    },
    data: {
      fk_estado_pedido: 4,
      fecha_entregado: fecha,
      fk_cod_vigilante_entrega: vigilanteId
    }
  });
}

async obtenerPerfilvig(codUser: number) {

  // 🔹 1. Buscar persona
  const persona = await this.prisma.persona.findUnique({
    where: { cod_user: codUser },
    select: {
      nombres: true,
      apellidos: true
    }
  });

  if (!persona) {
    throw new Error("Usuario no encontrado");
  }

  // 🔹 2. Buscar relación completa (CON INCLUDE 🔥)
  const relacion = await this.prisma.empresa_vigilante_conjunto.findFirst({
    where: { fk_persona_vigilante: codUser },
    include: {
      empresa_seguridad_conjunto: {
        include: {
          conjunto: true,
          empresa: true
        }
      },
      estado: true
    }
  });

  // 🔹 3. Validar si no existe o está bloqueado
  if (!relacion || relacion.fk_estado_vigilante_empresa === 3) {
    return {
      accesoRestringido: true,
      mensaje: "Tu perfil de vigilante está inactivo o fue rechazado.",
      nombres: persona.nombres,
      apellidos: persona.apellidos
    };
  }

  // 🔹 4. Extraer datos seguros (evita undefined)
  const conjunto = relacion.empresa_seguridad_conjunto?.conjunto;
  const empresa = relacion.empresa_seguridad_conjunto?.empresa;

  // 🔹 5. Retornar TODO lo necesario
  return {
  accesoRestringido: false,

  nombres: persona.nombres,
  apellidos: persona.apellidos,

  nombre_conjunto: conjunto?.nombre_conjunto || null,
  nombre_empresa: empresa?.nombre_empresa || null
};
}

async historialPedidos(query: string, vigilanteId: number) {

  return this.prisma.$queryRaw`
    SELECT v.*
    FROM vista_historial_pedidos v

    INNER JOIN empresa_vigilante_conjunto evc 
      ON evc.fk_persona_vigilante = ${vigilanteId}

    INNER JOIN empresa_seguridad_conjunto esc 
      ON esc.cod_empresa_vig_conjunto = evc.fk_cod_empresa_vig_conjunto

    WHERE 
      v.cod_conjunto = esc.fk_cod_conjunto
      AND (
        v.nombre_residente LIKE ${'%' + query + '%'}
        OR v.cedula LIKE ${'%' + query + '%'}
        OR v.numero_apto LIKE ${'%' + query + '%'}
        OR v.nombre_pedido LIKE ${'%' + query + '%'}
      )
  `;
}
}