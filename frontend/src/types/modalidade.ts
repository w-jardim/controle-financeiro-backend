export interface Modalidade {
  id: number;
  nome: string;
  descricao: string | null;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListaModalidadesResponse {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  dados: Modalidade[];
}

export interface CriarModalidadePayload {
  nome: string;
  descricao?: string;
}

export interface AtualizarModalidadePayload {
  nome?: string;
  descricao?: string;
  ativo?: boolean;
}

export interface ModalidadeResponse {
  mensagem: string;
  id?: number;
}
