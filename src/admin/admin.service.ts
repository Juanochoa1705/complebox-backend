import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateConjuntoDto } from './dto/create-conjunto.dto';
import { CrearEmpresaDto } from './dto/crear-empresa.dto';
import * as XLSX from 'xlsx';
import * as bcrypt from 'bcrypt';
import { BadRequestException } from '@nestjs/common';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async crearConjunto(codAdmin: number, dto: CreateConjuntoDto) {
    const conjunto = await this.prisma.conjunto.create({
      data: {
        nombre_conjunto: dto.nombre_conjunto,
        telefono_conjunto: dto.telefono_conjunto,
      },
    });

    for (let i = 1; i <= dto.cantidad_torres; i++) {
      await this.prisma.torre.create({
        data: {
          numero_torre: i,
          fk_cod_conjunto: conjunto.cod_conjunto,
        },
      });
    }

    await this.prisma.adminConjunto.create({
      data: {
        fk_cod_conjunto: conjunto.cod_conjunto,
        fk_cod_administrador: codAdmin,
      },
    });

    return { message: 'Conjunto creado correctamente' };
  }


    async obtenerConjuntoAdmin(adminId: number) {

  const adminConj = await this.prisma.adminConjunto.findFirst({
    where:{
      fk_cod_administrador: adminId
    },
    include:{
      conjunto:true
    }
  });

  if(!adminConj){
    throw new NotFoundException("Admin sin conjunto");
  }

  return adminConj.conjunto;

}

  async obtenerTorresAdmin(codAdmin: number) {
    const adminConjunto = await this.prisma.adminConjunto.findFirst({
      where: { fk_cod_administrador: codAdmin },
    });

    if (!adminConjunto) {
      throw new NotFoundException('ADMIN_SIN_CONJUNTO');
    }

    return this.prisma.torre.findMany({
      where: {
        fk_cod_conjunto: adminConjunto.fk_cod_conjunto,
      },
      orderBy: {
        numero_torre: 'asc',
      },
    });
  }

  async crearTorre(codAdmin: number, numero: number) {
    const adminConjunto = await this.prisma.adminConjunto.findFirst({
      where: { fk_cod_administrador: codAdmin },
    });

    if (!adminConjunto) {
      throw new NotFoundException('ADMIN_SIN_CONJUNTO');
    }

    return this.prisma.torre.create({
      data: {
        numero_torre: numero,
        fk_cod_conjunto: adminConjunto.fk_cod_conjunto,
      },
    });
  }

  // ✅ MÉTODO CORREGIDO Y DENTRO DE LA CLASE
async processExcel(file: Express.Multer.File) {
  const workbook = XLSX.read(file.buffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet);

  for (const row of data as any[]) {

    // 🔹 1️⃣ VALIDAR TORRE
    const numeroTorre = Number(row.numero_torre);

    if (isNaN(numeroTorre)) {
      console.log('Número de torre inválido:', row);
      continue;
    }

    const torreDB = await this.prisma.torre.findFirst({
      where: { numero_torre: numeroTorre },
    });

    if (!torreDB) {
      console.log(`La torre ${numeroTorre} no existe`);
      continue;
    }

    // 🔹 2️⃣ CREAR O BUSCAR PERSONA
    const cedulaStr = String(row.cedula).trim();
    const telefonoStr = String(row.telefono).trim();
    const usuarioStr = cedulaStr;

    if (!cedulaStr) {
      console.log('Cédula inválida:', row);
      continue;
    }

    let persona = await this.prisma.persona.findUnique({
      where: { cedula: cedulaStr },
    });

    if (!persona) {

const hash = await bcrypt.hash('123456', 10);

persona = await this.prisma.persona.create({
  data: {
    nombres: row.nombres,
    apellidos: row.apellidos,
    cedula: cedulaStr,
    correo: row.correo,
    telefono: telefonoStr,
    usuario: usuarioStr,
    contrase_a: hash,

    estado: {
      connect: { cod_estado: 2 } // 👈 INACTIVO
    },

    rol: {
      connect: { cod_rol: 2 }
    },

    tipo_doc: {
      connect: { cod_tipo_doc: Number(row.fk_tipo_doc) }
    },
  },
});
}
    // 🔹 3️⃣ CREAR O BUSCAR APTO
    const numeroApto = Number(row.numero_apto);

    if (isNaN(numeroApto)) {
      console.log('Número de apto inválido:', row);
      continue;
    }

    let aptoDB = await this.prisma.apto.findFirst({
      where: {
        fk_cod_torre: torreDB.cod_torre,
        numero_apto: numeroApto,
      },
    });

    if (!aptoDB) {
      aptoDB = await this.prisma.apto.create({
        data: {
          numero_apto: numeroApto,
          fk_cod_torre: torreDB.cod_torre,
        },
      });
    }

    // 🔹 4️⃣ CREAR O ACTUALIZAR RELACIÓN
    const estadoNuevo = Number(row.fk_estado_apto_propietario);

    if (isNaN(estadoNuevo)) {
      console.log('Estado inválido:', row);
      continue;
    }

    const relacion = await this.prisma.apto_propietario.findFirst({
      where: {
        fk_cod_apto: aptoDB.cod_apto,
        fk_cod_propietario: persona.cod_user,
      },
    });

    if (!relacion) {
      // Crear relación
      await this.prisma.apto_propietario.create({
        data: {
          fk_cod_apto: aptoDB.cod_apto,
          fk_cod_propietario: persona.cod_user,
          fk_estado_apto_propietario: estadoNuevo,
        },
      });
    } else if (relacion.fk_estado_apto_propietario !== estadoNuevo) {
      // Actualizar solo si cambió el estado
      await this.prisma.apto_propietario.update({
        where: {
          cod_apto_propietario: relacion.cod_apto_propietario, // 👈 usa tu PK real
        },
        data: {
          fk_estado_apto_propietario: estadoNuevo,
        },
      });
    }
  }

  return { message: 'Carga masiva completada correctamente' };
}

async crearEmpresaSeguridad(adminId: number, dto: CrearEmpresaDto) {

  // 🔹 1️⃣ Buscar el admin correctamente
  const adminConjunto = await this.prisma.adminConjunto.findFirst({
    where: { fk_cod_administrador: adminId },
  });

  if (!adminConjunto) {
    throw new NotFoundException('Administrador no tiene conjunto asignado');
  }

  // 🔹 2️⃣ Validar si ya existe empresa activa en su conjunto
  const empresaActiva = await this.prisma.empresa_seguridad_conjunto.findFirst({
    where: {
      fk_cod_conjunto: adminConjunto.fk_cod_conjunto,
      fk_estado_empresa_seguridad_conjunto: 1, // Activo
    },
  });

  if (empresaActiva) {
    throw new BadRequestException(
      'Ya existe una empresa de seguridad activa para este conjunto.'
    );
  }

  // 🔹 3️⃣ Crear empresa
  const empresa = await this.prisma.empresa.create({
  data: {
    nit_empresa: dto.nit,
    nombre_empresa: dto.nombre,
    direccion_empresa: dto.direccion,
    telefono_empresa: dto.telefono,
    correo_empresa: dto.correo,
    fk_estado_empresa: 1, // 🔥 Activa por defecto
  },
})

  // 🔹 4️⃣ Relacionarla con el conjunto
  await this.prisma.empresa_seguridad_conjunto.create({
    data: {
      fk_cod_conjunto: adminConjunto.fk_cod_conjunto,
      fk_empresa_vig: empresa.cod_empresa,
      fk_estado_empresa_seguridad_conjunto: 1,
      fecha_registro: new Date(),
    },
  });

  return {
    message: 'Empresa de seguridad creada correctamente',
  };
}

async vigilantesPendientes(adminId: number) {

  // 1️⃣ buscar conjunto del admin
  const adminConj = await this.prisma.adminConjunto.findFirst({
    where: {
      fk_cod_administrador: adminId
    }
  });

  if (!adminConj) return [];

  // 2️⃣ buscar empresa de seguridad del conjunto
  const empresa = await this.prisma.empresa_seguridad_conjunto.findFirst({
    where: {
      fk_cod_conjunto: adminConj.fk_cod_conjunto
    }
  });

  if (!empresa) return [];

  // 3️⃣ buscar vigilantes de esa empresa
  const vigiConjunto = await this.prisma.empresa_vigilante_conjunto.findMany({
    where: {
      fk_cod_empresa_vig_conjunto: empresa.cod_empresa_vig_conjunto,
      fk_estado_vigilante_empresa: 2
    }
  });

  const vigilantes: any[] = [];

  for (const ar of vigiConjunto) {

    if (!ar.fk_persona_vigilante) continue;

    const persona = await this.prisma.persona.findUnique({
      where: {
        cod_user: ar.fk_persona_vigilante
      }
    });

    if (persona) {
      vigilantes.push({
        cod_user: persona.cod_user,
        nombres: persona.nombres,
        apellidos: persona.apellidos,
        cedula: persona.cedula
      });
    }

  }

  return vigilantes;

}

  async aprobarVigilante(codUser: number) {

    await this.prisma.empresa_vigilante_conjunto.updateMany({
      where: {
  fk_persona_vigilante: codUser
},
      data: {
        fk_estado_vigilante_empresa: 1
      }
    });



    return { message: "Vigilante aprobado correctamente" };

  }


}
