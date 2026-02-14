import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminService } from './admin.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('admin')
@UseGuards(JwtAuthGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

@Post('conjunto')
async crearConjunto(
  @Req() req: any,
  @Body() dto: CreateConjuntoDto,
) {
  const codAdmin = req.user.userId; // 👈 CORRECTO
  return this.adminService.crearConjunto(codAdmin, dto);
}

  @Get('conjunto')
  async obtenerConjunto(@Req() req: any) {
    const codAdmin = req.user.sub;
    return this.adminService.obtenerConjuntoAdmin(codAdmin);
  }
}


