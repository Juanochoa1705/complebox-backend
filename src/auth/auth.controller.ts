import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { CrearVigilanteDto } from './dto/crear-vigilante.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService,
              private prisma: PrismaService,) {}

  @Post('register-residente')
registerResidente(@Body() dto: RegisterDto) {
  return this.authService.registerResidente(dto);
}

  // 👉 REGISTRO
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('registeradmin')
  registeradmin(@Body() dto: RegisterDto) {
    return this.authService.registeradmin(dto);
  }
  

  // 👉 LOGIN
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  // 👉 PERFIL (PROTEGIDO)
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@Request() req) {
    return req.user;
  }

  @Post('primer-login')
async primerLogin(
  @Body() body: { userId: number; nuevaPassword: string },
) {
  return this.authService.cambiarPasswordPrimerLogin(
    body.userId,
    body.nuevaPassword,
  );
}

@Get('aptos')
findAllAptos() {
  return this.authService.findAllAptos();
}

@Get('empresas-seguridad')
async obtenerEmpresasSeguridad() {
  return this.prisma.empresa_seguridad_conjunto.findMany({
    where: {
      fk_estado_empresa_seguridad_conjunto: 1, // 🔥 solo activas
    },
    include: {
      empresa: true,
    },
  });
}

@Post('register-vigilante')
async registerVigilante(@Body() dto: CrearVigilanteDto) {
  return this.authService.registrarVigilante(dto);
}

@Get('empresa/:nit')
buscarEmpresa(@Param('nit') nit: string) {
  return this.authService.buscarEmpresaPorNit(nit);
}

@Post('register-mensajero')
async registerMensajero(@Body() dto: any) {
  return this.authService.registerMensajero(dto);
}
}
