import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // =========================
  // REGISTER
  // =========================
  async register(dto: RegisterDto) {
    // 1. Verificar si el usuario ya existe
    const userExists = await this.prisma.persona.findFirst({
      where: {
        OR: [{ usuario: dto.usuario }, { correo: dto.correo }],
      },
    });

    if (userExists) {
      throw new ConflictException('El usuario o correo ya existe');
    }

    // 2. Hashear contraseña
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 3. Crear usuario
    await this.prisma.persona.create({
  data: {
    nombres: dto.nombres,
    apellidos: dto.apellidos,
    cedula: dto.cedula ?? null,
    correo: dto.correo,
    telefono: dto.telefono,
    usuario: dto.usuario,
    contrase_a: hashedPassword,

    // 🔹 ESTADO AUTOMÁTICO
    estado: {
      connect: { cod_estado: 1 }, // Activo
    },

    // 🔹 ROL DESDE FORMULARIO
    rol: {
      connect: { cod_rol: dto.fk_rol },
    },

    // 🔹 TIPO DOC DESDE FORMULARIO
    tipo_doc: {
      connect: { cod_tipo_doc: dto.fk_tipo_doc },
    },
  },
});

    return {
      message: 'Usuario registrado correctamente',
    };
  }

  // =========================
// LOGIN
// =========================
async login(dto: LoginDto) {
  const user = await this.prisma.persona.findFirst({
    where: { usuario: dto.usuario },
    include: { rol: true, estado: true },
  });

  if (!user) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  const isValid = await bcrypt.compare(dto.password, user.contrase_a);

  if (!isValid) {
    throw new UnauthorizedException('Credenciales inválidas');
  }

  // 🔥 PRIMER LOGIN
  if (user.estado.cod_estado === 2) {
    return {
      primerLogin: true,
      user: {
        id: user.cod_user,
        usuario: user.usuario,
        rol: user.rol.nombre_rol,
      },
      message: 'Debe cambiar la contraseña antes de continuar',
    };
  }

  const payload = {
    sub: user.cod_user,
    usuario: user.usuario,
    rol: user.rol.nombre_rol,
  };

  const token = this.jwtService.sign(payload);

  return {
    token,
    user: {
      id: user.cod_user,
      usuario: user.usuario,
      rol: user.rol.nombre_rol,
    },
  };
} // 👈 CERRAR LOGIN AQUÍ


// =========================
// PRIMER LOGIN (CAMBIO CLAVE)
// =========================
async cambiarPasswordPrimerLogin(userId: number, nuevaPassword: string) {

  const hash = await bcrypt.hash(nuevaPassword, 10);

  await this.prisma.persona.update({
    where: { cod_user: userId },
    data: {
      contrase_a: hash,
      estado: {
        connect: { cod_estado: 1 } // 🔥 ACTIVO
      }
    }
  });

  return { message: 'Contraseña actualizada correctamente' };
}
}

