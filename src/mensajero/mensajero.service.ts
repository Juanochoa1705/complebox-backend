
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
        { fk_rol: 3 }, // 🔥 SOLO residentes
        {
          OR: [
            { nombres: { contains: query } },
            { apellidos: { contains: query } },
            { cedula: { contains: query } }
          ]
        }
      ]
    },
    take: 5 // 🔥 limita resultados
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

}