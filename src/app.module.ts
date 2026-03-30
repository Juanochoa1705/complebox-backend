import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module'; // 👈 IMPORTANTE
import { PropietarioModule } from './propietario/propietario.module';
import { MensajeroModule } from './mensajero/mensajero.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    PropietarioModule,
    MensajeroModule, 
  ],
})
export class AppModule {}
