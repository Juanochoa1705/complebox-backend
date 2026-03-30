import { Module } from '@nestjs/common';
import { ResidenteController } from './residente.controller';
import { ResidenteService } from './residente.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ResidenteController],
  providers: [ResidenteService],
})
export class ResidenteModule {}