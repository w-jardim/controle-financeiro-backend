export type Aluno = {
  id: number;
  account_id: number;
  ct_id: number;
  nome: string;
  cpf?: string | null;
  data_nascimento?: string | null;
  sexo?: string | null;
  telefone?: string | null;
  email?: string | null;
  nome_responsavel?: string | null;
  telefone_responsavel?: string | null;
  ativo: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ListaAlunosResponse = {
  dados: Aluno[];
};

export type CriarAlunoPayload = {
  ct_id: number;
  nome: string;
  cpf?: string;
  data_nascimento?: string;
  sexo?: string;
  telefone?: string;
  email?: string;
  nome_responsavel?: string;
  telefone_responsavel?: string;
};

export type AtualizarAlunoPayload = Partial<CriarAlunoPayload> & { ativo?: boolean };

export type AlunoResponse = { dados: Aluno };
