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

}