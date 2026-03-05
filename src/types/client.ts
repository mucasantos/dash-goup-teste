export interface Client {
  id: number;
  qtd_licenca: number | null;
  nome_razao_social: string;
  nif_nipc: string;
  endereco: string;
  cidade: string;
  pais: string;
  contacto: string;
  whatsapp: string;
  email: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
  password?: string;
}

export interface ClientsResponse {
  clientes: Client[];
  currentPage: number;
  totalPages: number;
  totalClientes: number;
} 