import { Driver } from "./driver";

export interface Vehicle {
  id: number;
  marca: string;
  modelo: string;
  motorizacao: string;
  anoFabricacao: number;
  kmInicial: number;
  tipoCombustivel: string;
  dataVencimentoIUC: string;
  lastRecordedKm: number;
  capacidadeViatura: string;
  foto?: File | null | string;
  placa: string;
  id_empresa?: number;
  documentoVeiculoDUA?: string | File | null | FileList;
  motoristas?: Driver[];
  idViatura?: string;
}

export interface VehicleResponse {
  viaturas: Vehicle[];
}
