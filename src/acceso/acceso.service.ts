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

}