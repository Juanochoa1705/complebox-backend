export class CrearVigilanteDto {
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  telefono: string;
  password: string;
  tipo_doc: number;
  fk_empresa_vig_conjunto: number;
}