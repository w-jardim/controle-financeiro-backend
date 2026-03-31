export interface Profissional {
  id: number;
  nome: string;
  email: string | null;
  telefone: string | null;
  especialidade: string | null;
  ativo: boolean;
  criado_em: string;
  atualizado_em: string;
}

export interface ListaProfissionaisResponse {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  dados: Profissional[];
}

export interface CriarProfissionalPayload {
  nome: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
}

export interface AtualizarProfissionalPayload {
  nome?: string;
  email?: string;
  telefone?: string;
  especialidade?: string;
  ativo?: boolean;
}

export interface ProfissionalResponse {
  mensagem: string;
  id?: number;
}
