import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer'; // 👈 IMPORTACIÓN CLAVE
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { AdminModule } from './admin/admin.module'; 
import { PropietarioModule } from './propietario/propietario.module';
import { MensajeroModule } from './mensajero/mensajero.module';
import { VigilanteModule } from './vigilante/vigilante.module';
import { ResidenteModule } from './residente/residente.module';
import { AccesoModule } from './acceso/acceso.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AdminModule,
    PropietarioModule,
    MensajeroModule,
    VigilanteModule,
    ResidenteModule, 
    AccesoModule,
    
    // 👈 CONFIGURACIÓN ADENTRO DE IMPORTS:
    MailerModule.forRoot({
      transport: {
        host: "sandbox.smtp.mailtrap.io",
        port: 2525,
        auth: {
          user: "529a11f44ff0ca", 
          pass: "14568c201e872f", // Reemplaza esto con tu contraseña real de Mailtrap
        },
      },
      defaults: {
        from: '"Soporte Ochtech Datacore App complebox" <soportecomplebox@ochtechdatacore.com>',
      },
    }),
  ],
})
export class AppModule {}


