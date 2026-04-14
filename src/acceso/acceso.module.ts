import { Module } from '@nestjs/common';
import { AccesoService } from './acceso.service';
import { AccesoController } from './acceso.controller';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [AccesoController],
  providers: [AccesoService, PrismaService],
})
export class AccesoModule {}