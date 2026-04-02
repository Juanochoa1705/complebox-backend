import { Controller, Get, Post, Param, UseGuards, Request, Query, Req,UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { VigilanteService } from './vigilante.service';

@Controller('vigilante')
export class VigilanteController {

  constructor(private vigilanteService: VigilanteService) {}

  @UseGuards(JwtAuthGuard)
  @Get('pedidos')
  obtenerPedidos(@Request() req) {
    return this.vigilanteService.obtenerPedidos(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('aprobar/:id')
  aprobarPedido(@Param('id') id: number, @Request() req) {
    return this.vigilanteService.aprobarPedido(Number(id), req.user.id);
  }

@UseGuards(JwtAuthGuard)
@Get('buscar-pedidos')
buscarPedidos(@Query('query') query: string, @Req() req) {
  return this.vigilanteService.buscarPedidos(query, req.user.id);
}

@UseGuards(JwtAuthGuard)
@Post('entregar/:id')
entregar(@Param('id') id: number, @Req() req) {
  return this.vigilanteService.entregarPedido(id, req.user.id);
}

@Get('perfilvig')
@UseGuards(JwtAuthGuard)
async perfilvig(@Request() req) {
  return this.vigilanteService.obtenerPerfilvig(req.user.id);
}
@UseGuards(JwtAuthGuard)
@Post('rechazar/:id')
rechazarPedido(@Param('id') id: number, @Request() req) {

  // 🔐 opcional pero recomendado
  if (req.user.rol !== 'Vigilante') {
    throw new UnauthorizedException('No tienes permisos');
  }

  return this.vigilanteService.rechazarPedido(Number(id));
}
}