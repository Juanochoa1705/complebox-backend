import { Injectable , NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PropietarioService {

  constructor(private prisma: PrismaService) {}

  async residentesPendientes(propietarioId: number) {

    // 1️⃣ buscar apartamento del propietario
    const aptoProp = await this.prisma.apto_propietario.findFirst({
      where: {
        fk_cod_propietario: propietarioId
      }
    });



    if (!aptoProp) {
      return [];
    }

    // 2️⃣ buscar residentes de ese apartamento
    const aptoResidentes = await this.prisma.apto_residente.findMany({
      where: {
        fk_cod_apto: aptoProp.fk_cod_apto,
        fk_estado_apto_residente: 3
      }
    });


    const residentes: any[] = [];

    for (const ar of aptoResidentes) {

      if (!ar.fk_cod_residente) continue;

      const persona = await this.prisma.persona.findUnique({
        where: {
          cod_user: ar.fk_cod_residente
        }
      });

      if (persona) {
        residentes.push({
          cod_user: persona.cod_user,
          nombres: persona.nombres,
          apellidos: persona.apellidos,
          cedula: persona.cedula
        });
      }

    }

    return residentes;

  }

  async aprobarResidente(codUser: number) {

    await this.prisma.apto_residente.updateMany({
      where: {
        fk_cod_residente: codUser
      },
      data: {
        fk_estado_apto_residente: 1
      }
    });

    return { message: "Residente aprobado correctamente" };

  }

  async obtenerPerfil(codUser: number) {

  const persona = await this.prisma.persona.findUnique({
    where: {
      cod_user: codUser
    },
    select: {
      nombres: true,
      apellidos: true
    }
  });

 const aptoPropietario = await this.prisma.apto_propietario.findFirst({
  where: {
    fk_cod_propietario: codUser
  },
  include: {
    apto: {
      include: {
        torre: true
      }
    }
  }
});

  return {
  nombres: persona?.nombres,
  apellidos: persona?.apellidos,
  torre: aptoPropietario?.apto?.torre?.numero_torre,
  apto: aptoPropietario?.apto?.numero_apto
};

}

async rechazarResidente(residenteId: number) {

  const residente = await this.prisma.persona.findUnique({
    where: { cod_user: residenteId }
  });

  if (!residente) {
    throw new NotFoundException('El residente no existe');
  }

  // 🔥 1. eliminar relación primero
  await this.prisma.apto_residente.deleteMany({
    where: {
      fk_cod_residente: residenteId
    }
  });

  // 🔥 2. ahora sí eliminar persona
  return this.prisma.persona.delete({
    where: {
      cod_user: residenteId
    }
  });
}

async obtenerResidentesPropietario(propietarioId: number) {
  return this.prisma.apto_propietario.findMany({
    where: { 
      fk_cod_propietario: propietarioId 
    },
    include: {
      apto: {
        include: {
          apto_residente: {
            where: {
              // FILTRO CLAVE: Traer todos excepto al que tiene mi ID
              NOT: {
                fk_cod_residente: propietarioId
              }
            },
            include: {
              persona: true, // Para traer nombres y apellidos
            }
          }
        }
      }
    }
  });
}

async cambiarEstadoResidente(codResidente: number, estado: number, propietarioId: number) {
  return this.prisma.apto_residente.updateMany({
    where: {
      fk_cod_residente: codResidente,
      NOT: {
        fk_cod_residente: propietarioId // Aquí bloqueamos que se edite a sí mismo
      }
    },
    data: {
      fk_estado_apto_residente: estado
    }
  });
}
}