import { Module } from '@nestjs/common';
import { PropietarioController } from './propietario.controller';
import { PropietarioService } from './propietario.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PropietarioController],
  providers: [PropietarioService],
})
export class PropietarioModule {}