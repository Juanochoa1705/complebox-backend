import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  Request,
  UnauthorizedException,
  Param,
  Query,
  Put,
  Delete,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import type { Response } from 'express';
import { PrismaService } from '../prisma/prisma.service';



@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(
    private readonly adminService: AdminService,
    private readonly prisma: PrismaService // <--- ESTA ES LA LÍNEA QUE TE FALTA
  ) {}

  @Post('conjunto')
  async crearConjunto(
    @Req() req: any,
    @Body() dto: CreateConjuntoDto,
  ) {
    const codAdmin = req.user.id; // usa el mismo que tu JWT imprime

    return this.adminService.crearConjunto(codAdmin, dto);
  }

 @UseGuards(JwtAuthGuard)
@Get('conjunto')
async obtenerConjuntoAdmin(@Request() req){
  return this.adminService.obtenerConjuntoAdmin(req.user.id);
}

  @Get('torres')
  async obtenerTorres(@Req() req: any) {
    const codAdmin = req.user.id;
    return this.adminService.obtenerTorresAdmin(codAdmin);
  }

  @Post('torres')
  async crearTorre(
    @Req() req: any,
    @Body() body: { numero_torre: number },
  ) {
    const codAdmin = req.user.id;
    return this.adminService.crearTorre(codAdmin, body.numero_torre);
  }

  @Post('upload-propietarios')
@UseInterceptors(
  FileInterceptor('file', {
    storage: require('multer').memoryStorage(),
  }),
)

async uploadPropietarios(@UploadedFile() file: Express.Multer.File) {
  return this.adminService.processExcel(file);
}


@Post('crear-empresa-seguridad')
@UseGuards(JwtAuthGuard)
async crearEmpresa(
  @Req() req,
  @Body() dto: CrearEmpresaDto
) {
  const adminId = req.user.id;

  return this.adminService.crearEmpresaSeguridad(req.user.id, dto);
}

  @UseGuards(JwtAuthGuard)
  @Get('vigilantes-pendientes')
  async vigilantesPendientes(@Request() req) {

      
    return this.adminService.vigilantesPendientes(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('aprobar-vigilante')
  async aprobarVigilante(@Body() body) {
    return this.adminService.aprobarVigilante(body.cod_user);
  }

  @UseGuards(JwtAuthGuard)
@Post('rechazar/:id')
rechazarVigilante(@Param('id') id: number, @Request() req) {

  // 🔐 opcional pero recomendado
  if (req.user.rol !== 'Administrador') {
    throw new UnauthorizedException('No tienes permisos');
  }

  return this.adminService.rechazarVigilante(Number(id));
}

@Get('historial')
@UseGuards(JwtAuthGuard)
async historial(@Query('query') query: string, @Req() req: any) {

  const userId = req.user.id;
  const rol = req.user.rol;

  return this.adminService.historial(query || '', userId, rol);
}
@Put('torres/:id')
async actualizarTorre(
  @Req() req,
  @Param('id') id: string,
  @Body() body: { numero_torre: number }
) {
  return this.adminService.actualizarTorre(
    req.user.id,
    Number(id),
    body.numero_torre
  );
}
@Delete('torres/:id')
async eliminarTorre(
  @Req() req,
  @Param('id') id: string
) {
  return this.adminService.eliminarTorre(
    req.user.id,
    Number(id)
  );
}
@Get('mis-vigilantes')
@UseGuards(JwtAuthGuard)
async listarVigilantes(@Req() req: any) {
  // Solo extraemos el ID del token y se lo pasamos al servicio
  const adminId = req.user.id; 
  return this.adminService.obtenerVigilantesPorAdmin(adminId);
}

  @Post('cambiar-estado-vigilante')
  async cambiarEstado(@Body() body: { id: number, estado: number }) {
    return this.adminService.cambiarEstadoVigilante(body.id, body.estado);
  }

@Get('perfil')
async obtenerPerfil(@Req() req) {
  const userId = req.user.id;

  const adminRelacion = await this.prisma.adminConjunto.findFirst({
    where: { fk_cod_administrador: userId },
    include: { conjunto: true } // 🔥 IMPORTANTE
  });

  if (!adminRelacion) {
    return { tieneConjunto: false };
  }

  if (adminRelacion.fk_estado_admin !== 1) {
    return {
      bloqueado: true,
      mensaje: "Tu acceso como administrador ha sido revocado o está inactivo."
    };
  }

  return {
    tieneConjunto: true,
    bloqueado: false,
    conjunto: adminRelacion.conjunto // 🔥 AQUÍ VA LO QUE PREGUNTASTE
  };
}
@Get('conjuntos/buscar') // <-- Fíjate que la ruta sea exactemente esta
async buscarConjuntos(@Query('q') query: string) {
  return await this.adminService.buscarConjuntos(query);
}
@Post('vincular')
async vincular(@Req() req, @Body() body: { conjuntoId: number }) {
  // El adminId lo sacas del token (payload)
  const adminId = req.user.id; 
  return await this.adminService.vincularAdmin(adminId, body.conjuntoId);
}

}
