import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async crearConjunto(codAdmin: number, dto: CreateConjuntoDto) {
    // 1. Crear conjunto
    const conjunto = await this.prisma.conjunto.create({
      data: {
        nombre_conjunto: dto.nombre_conjunto,
        telefono_conjunto: dto.telefono_conjunto,
      },
    });

    // 2. Crear torres
    for (let i = 1; i <= dto.cantidad_torres; i++) {
      await this.prisma.torre.create({
        data: {
          numero_torre: i,
          fk_cod_conjunto: conjunto.cod_conjunto,
        },
      });
    }

    // 3. Asociar admin con conjunto ✅ CORREGIDO
    await this.prisma.adminConjunto.create({
      data: {
        fk_cod_conjunto: conjunto.cod_conjunto,
        fk_cod_administrador: codAdmin,
      },
    });

    return {
      message: 'Conjunto creado correctamente',
    };
  }

  async obtenerConjuntoAdmin(codAdmin: number) {
    const adminConjunto = await this.prisma.adminConjunto.findFirst({
      where: { fk_cod_administrador: codAdmin },
      include: { conjunto: true },
    });

    if (!adminConjunto) {
      throw new NotFoundException('ADMIN_SIN_CONJUNTO');
    }

    return adminConjunto.conjunto;
  }
}

