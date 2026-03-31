import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ResidenteService {
  constructor(private prisma: PrismaService) {}

  async obtenerMisPedidos(residenteId: number) {
    // Es vital que residenteId sea un número real
    return this.prisma.pedido_estado_entrega_residente.findMany({
      where: { fk_residente: residenteId },
      orderBy: { cod_pedido_estado_entrega: 'desc' },
    });
  }

  async confirmarPedido(id: number) {
  try {
    return await this.prisma.pedido_estado_entrega_residente.update({
      where: { cod_pedido_estado_entrega: id },
      data: {
        fk_estado_pedido: 3 // <-- AQUÍ: Cambia el estado a 3 (Confirmado/Recogido)
      },
    });
  } catch (error) {
    throw new NotFoundException(`No se pudo encontrar el pedido con ID ${id}`);
  }
}

async firmarPedido(id: number, firma: string, residenteId: number) {

  if (!firma) {
    throw new BadRequestException('La firma es obligatoria');
  }

  // 🔎 buscar el apartamento del residente
  const apto = await this.prisma.apto_residente.findFirst({
    where: {
      fk_cod_residente: residenteId,
      fk_estado_apto_residente: 1 // activo
    }
  });

  if (!apto) {
    throw new BadRequestException('Residente sin apartamento');
  }

  return this.prisma.pedido_estado_entrega_residente.update({
    where: { cod_pedido_estado_entrega: id },
    data: {
      fk_estado_pedido: 5,
      firma_residente: firma,
      fecha_entregado: new Date(),
      fk_apto_entrega: apto.fk_cod_apto // 🔥 AQUÍ
    }
  });
}
}