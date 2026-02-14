import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module'; // 👈 IMPORTANTE

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule, // 👈 AQUÍ ESTÁ LA CLAVE
  ],
})
export class AppModule {}

