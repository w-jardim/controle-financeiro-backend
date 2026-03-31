import api from './axios';

type LoginResponse = {
  dados: {
    mensagem: string;
    token: string;
  };
};

type RegisterData = {
  nomeResponsavel: string;
  email: string;
  senha: string;
  nomeAccount: string;
};

type RegisterResponse = {
  dados: {
    mensagem: string;
  };
};

export async function loginApi(email: string, senha: string): Promise<string> {
  const response = await api.post<LoginResponse>('/auth/login', { email, senha });
  return response.data.dados.token;
}

export async function registerApi(data: RegisterData): Promise<void> {
  await api.post<RegisterResponse>('/auth/cadastro', data);
}

