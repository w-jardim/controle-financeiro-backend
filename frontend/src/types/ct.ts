export type CT = {
  id: number;
  account_id: number;
  nome: string;
  ativo: boolean;
};

export type ListaCtsResponse = {
  pagina: number;
  limite: number;
  total: number;
  totalPaginas: number;
  dados: CT[];
};

export type CriarCtPayload = {
  nome: string;
};

export type AtualizarCtPayload = {
  nome: string;
  ativo?: boolean;
};
