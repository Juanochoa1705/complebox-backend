
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class MensajeroService {

  constructor(private prisma: PrismaService) {}

async crearPedido(dto: any, mensajeroId: number) {

  // 🔎 buscar residente
  const residente = await this.prisma.persona.findUnique({
    where: { cedula: dto.cedula_residente }
  });

  if (!residente) {
    throw new NotFoundException("La cédula del residente no existe");
  }

  // 🔥 crear pedido
  return this.prisma.pedido_estado_entrega_residente.create({
    data: {
      numero_guia: dto.numero_guia,
      nombre_pedido: dto.nombre_pedido,
      descripcion_pedido: dto.descripcion_pedido,

      fk_estado_pedido: 1, // Registrado
      fk_residente: residente.cod_user,

      // 🔥 ESTE ES EL IMPORTANTE
      fk_mensajero: mensajeroId
    }
  });
}
}