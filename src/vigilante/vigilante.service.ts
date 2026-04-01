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

async buscarPedidos(query: string, vigilanteId: number) {

  return this.prisma.pedido_estado_entrega_residente.findMany({
    where: {
      fk_estado_pedido: {
        in: [2, 3]
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

async entregarPedido(pedidoId: number, vigilanteId: number) {

  const fecha = new Date();
  fecha.setHours(fecha.getHours() - 5);

  return this.prisma.pedido_estado_entrega_residente.update({
    where: {
      cod_pedido_estado_entrega: Number(pedidoId)
    },
    data: {
      fk_estado_pedido: 4, // pendiente firma
      fecha_entregado: fecha,
      fk_cod_vigilante_entrega: vigilanteId
    }
  });

}

async obtenerPerfilvig(codUser: number) {

  const persona = await this.prisma.persona.findUnique({
    where: {
      cod_user: codUser
    },
    select: {
      nombres: true,
      apellidos: true
    }
  });

 const empresaVigilanteconjunto = await this.prisma.empresa_vigilante_conjunto.findFirst({
  where: {
    fk_persona_vigilante: codUser
  }
});

  return {
  nombres: persona?.nombres,
  apellidos: persona?.apellidos
};

}
}