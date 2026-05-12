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
  Headers,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UseInterceptors, UploadedFile , Headers as NestHeaders} from '@nestjs/common';
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
async obtenerTorres(
  @Req() req,
  @Headers('x-conjunto-id') conjuntoId: string
) {

  const codAdmin = req.user.id;

  return this.adminService.obtenerTorresAdmin(
    codAdmin,
    Number(conjuntoId)
  );
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
async vigilantesPendientes(
  @Req() req,
  @Headers('x-conjunto-id') conjuntoId: string
) {
  return this.adminService.vigilantesPendientes(
    req.user.id,
    Number(conjuntoId)
  );
}

  @UseGuards(JwtAuthGuard)
  @Post('aprobar-vigilante')
  async aprobarVigilante(@Body() body) {
    return this.adminService.aprobarVigilante(body.cod_user);
  }

  @UseGuards(JwtAuthGuard)
@Post('rechazar/:id')
rechazarVigilante(@Param('id') id: number, @Request() req) {

  return this.adminService.rechazarVigilante(Number(id));
}

@Get('historial')
async obtenerHistorial(@Req() req, @Query('query') query: string) {
  const conjuntoIdHeader = req.headers['x-conjunto-id'];
  const conjuntoId = conjuntoIdHeader ? parseInt(conjuntoIdHeader as string) : null;

  if (!conjuntoId) return [];

  // Consultamos directamente a la vista de la base de datos
  return await (this.prisma as any).vista_historial_pedidos.findMany({
    where: {
      cod_conjunto: conjuntoId,
      ...(query ? {
        OR: [
          { numero_guia: { contains: query } },
          { nombre_pedido: { contains: query } },
          { nombre_residente: { contains: query } },
          { apellido_residente: { contains: query } },
          { cedula: { contains: query } }
        ]
      } : {})
    },
    orderBy: {
      fecha_recibido: 'desc' // Para que lo más nuevo salga primero
    }
  });
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
@Get('mis-vigilantes/:conjuntoId')
@UseGuards(JwtAuthGuard)
async listarVigilantes(@Req() req: any, @Param('conjuntoId') conjuntoId: string) {
  return this.adminService.obtenerVigilantesPorConjunto(req.user.id, Number(conjuntoId));
}

  @Post('cambiar-estado-vigilante')
  async cambiarEstado(@Body() body: { id: number, estado: number }) {
    return this.adminService.cambiarEstadoVigilante(body.id, body.estado);
  }

@Get('perfil')
async obtenerPerfil(@Req() req) {
  const userId = req.user.id;

  const relaciones = await this.prisma.adminConjunto.findMany({
  where: { fk_cod_administrador: userId },
  include: { conjunto: true }
});

if (relaciones.length === 0) {
  return { tieneConjunto: false };
}

// validar si alguno está activo
const relacionesActivas = relaciones.filter(r => r.fk_estado_admin === 1);

if (relacionesActivas.length === 0) {
  return {
    bloqueado: true,
    mensaje: "No tienes acceso activo a ningún conjunto."
  };
}

return {
  tieneConjunto: true,
  bloqueado: false,
  conjuntos: relacionesActivas.map(r => r.conjunto)
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
@Post('empresa/estado')
async cambiarEstadoEmpresa(
  @Req() req,
  @Body() body: { estado: number }
) {
  return this.adminService.cambiarEstadoEmpresa(req.user.id, body.estado);
}

@Put('empresa')
async editarEmpresa(
  @Req() req,
  @Body() body: {
    nombre?: string;
    telefono?: string;
    correo?: string;
    direccion?: string;
  }
) {
  return this.adminService.editarEmpresa(req.user.id, body);
}

@Get('empresa')
async obtenerEmpresa(@Req() req) {
  // Extraemos el ID directamente de los headers del request
  const conjuntoIdHeader = req.headers['x-conjunto-id'];
  const adminId = req.user.id;

  // Convertimos a número
  const conjuntoId = conjuntoIdHeader ? parseInt(conjuntoIdHeader) : null;

  console.log("🚀 Buscando empresa para el conjunto ID:", conjuntoId);

  if (!conjuntoId) {
    console.log("⚠️ No se recibió x-conjunto-id en los headers");
    return null;
  }

  // 1. Verificamos que el admin tenga permiso sobre ese conjunto
  const vinculacion = await this.prisma.adminConjunto.findFirst({
    where: { 
      fk_cod_administrador: adminId,
      fk_cod_conjunto: conjuntoId 
    }
  });

  if (!vinculacion) {
    console.log("🚫 El admin no tiene acceso a este conjunto");
    return null;
  }

  // 2. Buscamos la empresa vinculada a ese ID específico
  const empresa = await this.prisma.empresa_seguridad_conjunto.findFirst({
    where: { fk_cod_conjunto: conjuntoId },
    include: { empresa: true }
  });

  if (!empresa) return null;

  return {
    cod_empresa: empresa.empresa?.cod_empresa,
    nombre_empresa: empresa.empresa?.nombre_empresa,
    nit_empresa: empresa.empresa?.nit_empresa,
    telefono_empresa: empresa.empresa?.telefono_empresa,
    correo_empresa: empresa.empresa?.correo_empresa,
    direccion_empresa: empresa.empresa?.direccion_empresa,
    fk_estado_empresa_seguridad_conjunto: empresa.fk_estado_empresa_seguridad_conjunto
  };
}
}