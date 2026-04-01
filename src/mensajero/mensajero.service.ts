
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class MensajeroService {

  constructor(private prisma: PrismaService) {}

async crearPedido(dto: any, mensajeroId: number) {

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
}