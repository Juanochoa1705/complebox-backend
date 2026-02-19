import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

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


}
