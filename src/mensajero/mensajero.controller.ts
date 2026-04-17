
import { Controller, Get, Post, Body, Request, UseGuards,BadRequestException, Req, Param, Delete, Put } from '@nestjs/common';
import { MensajeroService } from './mensajero.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Query } from '@nestjs/common';

@Controller('mensajero')
export class MensajeroController {

  constructor(private mensajeroService: MensajeroService) {}

@Post('crear-pedido')
@UseGuards(JwtAuthGuard)
async crearPedido(@Body() dto: any, @Request() req) {
  if (!dto || Object.keys(dto).length === 0) {
    throw new BadRequestException("El cuerpo (Body) de la petición está vacío o mal formado");
  }
  
  console.log('DTO recibido:', dto);

  console.log('Usuario del token:', req.user);

return await this.mensajeroService.crearPedido(dto, req.user.id);
}


@Get('buscar-residente')
buscarResidente(@Query('q') query: string) {
  return this.mensajeroService.buscarResidente(query);
}

@Get('perfilmen')
@UseGuards(JwtAuthGuard)
async perfilmen(@Request() req) {
  return this.mensajeroService.obtenerPerfilmen(req.user.id);
}

@UseGuards(JwtAuthGuard)
@Get('historial')
historial(
  @Query('query') query: string,
  @Req() req
) {
  return this.mensajeroService.historialMensajero(
    query || '',
    req.user.id // 🔥 CLAVE
  );
}

@UseGuards(JwtAuthGuard)
@Delete('eliminar/:id')
eliminarPedido(
  @Param('id') id: string,
  @Req() req
) {
  return this.mensajeroService.eliminarPedido(
    Number(id),
    req.user.id
  );
}

@UseGuards(JwtAuthGuard)
  @Get('pedido/:id')
  obtenerPedido(
    @Param('id') id: string,
    @Req() req
  ) {
    return this.mensajeroService.obtenerPedido(
      Number(id),
      req.user.id
    );
  }

   @UseGuards(JwtAuthGuard)
  @Put('editar/:id')
  editarPedido(
    @Param('id') id: string,
    @Body() dto: any,
    @Req() req
  ) {
    return this.mensajeroService.editarPedido(
      Number(id),
      dto,
      req.user.id
    );
  }

@Put('empresa-mensajero')
@UseGuards(JwtAuthGuard)
actualizarEmpresa(@Request() req, @Body() dto: any) {
  return this.mensajeroService.actualizarEmpresaMensajero(req.user.id, dto);
}

 @Get('empresa-mensajero')
@UseGuards(JwtAuthGuard)
obtenerEmpresa(@Request() req) {
  return this.mensajeroService.obtenerEmpresaMensajero(req.user.id);
}

}