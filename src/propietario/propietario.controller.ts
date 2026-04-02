import { Controller, Get, Post, Body, Request, UseGuards,UnauthorizedException, Param } from '@nestjs/common';
import { PropietarioService } from './propietario.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('propietario')
export class PropietarioController {

  constructor(private propietarioService: PropietarioService) {}

  @UseGuards(JwtAuthGuard)
  @Get('residentes-pendientes')
  async residentesPendientes(@Request() req) {

      console.log("USUARIO TOKEN:", req.user);
    return this.propietarioService.residentesPendientes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('aprobar-residente')
  async aprobarResidente(@Body() body) {
    return this.propietarioService.aprobarResidente(body.cod_user);
  }

  @Get('perfil')
@UseGuards(JwtAuthGuard)
async perfil(@Request() req) {
  return this.propietarioService.obtenerPerfil(req.user.id);
}

  @UseGuards(JwtAuthGuard)
@Post('rechazar/:id')
rechazarResidente(@Param('id') id: number, @Request() req) {

  // 🔐 opcional pero recomendado
  if (req.user.rol !== 'Propietario') {
    throw new UnauthorizedException('No tienes permisos');
  }

  return this.propietarioService.rechazarResidente(Number(id));
}

}