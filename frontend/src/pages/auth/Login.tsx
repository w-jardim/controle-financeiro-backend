import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const schema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

type Form = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Form>({ resolver: zodResolver(schema) });
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(data: Form) {
    setLoading(true);
    setErrorMsg(null);
    try {
      await login(data.email, data.senha);
    } catch (error: any) {
      const msg = error?.response?.data?.mensagem || 'Erro ao fazer login';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Entrar</h2>
        {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{errorMsg}</div>}
        <label className="block mb-3">
          <span className="text-sm font-medium">Email</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            {...register('email')}
            disabled={loading}
          />
          {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
        </label>
        <label className="block mb-4">
          <span className="text-sm font-medium">Senha</span>
          <input
            type="password"
            className="mt-1 block w-full border rounded p-2"
            {...register('senha')}
            disabled={loading}
          />
          {errors.senha && <span className="text-xs text-red-600">{errors.senha.message}</span>}
        </label>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50 mb-3"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Não tem conta? </span>
          <Link to="/register" className="text-blue-600 hover:underline">
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
}

