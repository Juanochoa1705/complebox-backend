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

@Post('entregar/:id')
@UseGuards(JwtAuthGuard)
entregarPedido(
  @Param('id') id: string,
  @Req() req
) {
  console.log("ID RAW:", id); // 👈 DEBUG
  console.log("ID NUMBER:", Number(id)); // 👈 DEBUG

  const vigilanteId = req.user.id;

  return this.vigilanteService.entregarPedido(
    Number(id), // 🔥 CLAVE
    vigilanteId
  );
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
@UseGuards(JwtAuthGuard)
@Get('historial')
async historialPedidos(@Query('query') query: string, @Req() req: any) {

  console.log("REQ.USER:", req.user); // 👀 DEBUG

  const vigilanteId = req.user.id;

  return this.vigilanteService.historialPedidos(query || '', vigilanteId);
}
}