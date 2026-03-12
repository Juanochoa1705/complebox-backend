export class CrearVigilanteDto {
  nombres: string;
  apellidos: string;
  cedula: string;
  correo: string;
  telefono: string;
  usuario: string;
  password: string;
  fk_tipo_doc: number;
  fk_empresa_vig_conjunto: number;
}