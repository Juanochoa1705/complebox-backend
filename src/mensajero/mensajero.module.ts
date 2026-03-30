import { Module } from '@nestjs/common';
import { MensajeroController } from './mensajero.controller';
import { MensajeroService } from './mensajero.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MensajeroController],
  providers: [MensajeroService],
})
export class MensajeroModule {}