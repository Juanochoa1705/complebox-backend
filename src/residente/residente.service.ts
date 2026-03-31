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

  async firmarPedido(id: number, firma: string) {
    if (!firma) {
      throw new BadRequestException('La firma es obligatoria para finalizar la entrega');
    }

    // Usar la fecha actual del servidor (Prisma maneja UTC por defecto)
    return this.prisma.pedido_estado_entrega_residente.update({
      where: { cod_pedido_estado_entrega: id },
      data: {
        fk_estado_pedido: 5, // Estado: Entregado
        firma_residente: firma,
        fecha_entregado: new Date(),
      },
    });
  }
}