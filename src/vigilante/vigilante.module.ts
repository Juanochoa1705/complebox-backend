import { Module } from '@nestjs/common';
import { VigilanteController } from './vigilante.controller';
import { VigilanteService } from './vigilante.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VigilanteController],
  providers: [VigilanteService],
})
export class VigilanteModule {}