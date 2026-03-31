import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { registerSchema, RegisterSchema } from '../../schemas/register.schema';
import { useAuth } from '../../hooks/useAuth';
import { registerApi } from '../../services/api/authService';

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterSchema>({ resolver: zodResolver(registerSchema) });
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function onSubmit(data: RegisterSchema) {
    setLoading(true);
    setErrorMsg(null);
    try {
      await registerApi(data);
      // Login automático após cadastro bem-sucedido
      await login(data.email, data.senha);
    } catch (error: any) {
      const msg = error?.response?.data?.mensagem || 'Erro ao criar conta';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-6 rounded shadow w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">Criar Conta</h2>
        {errorMsg && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">{errorMsg}</div>}
        
        <label className="block mb-3">
          <span className="text-sm font-medium">Nome do Responsável</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            {...register('nomeResponsavel')}
            disabled={loading}
          />
          {errors.nomeResponsavel && (
            <span className="text-xs text-red-600">{errors.nomeResponsavel.message}</span>
          )}
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">Email</span>
          <input
            type="email"
            className="mt-1 block w-full border rounded p-2"
            {...register('email')}
            disabled={loading}
          />
          {errors.email && <span className="text-xs text-red-600">{errors.email.message}</span>}
        </label>

        <label className="block mb-3">
          <span className="text-sm font-medium">Senha</span>
          <input
            type="password"
            className="mt-1 block w-full border rounded p-2"
            {...register('senha')}
            disabled={loading}
          />
          {errors.senha && <span className="text-xs text-red-600">{errors.senha.message}</span>}
        </label>

        <label className="block mb-4">
          <span className="text-sm font-medium">Nome da Conta</span>
          <input
            className="mt-1 block w-full border rounded p-2"
            {...register('nomeAccount')}
            disabled={loading}
          />
          {errors.nomeAccount && <span className="text-xs text-red-600">{errors.nomeAccount.message}</span>}
        </label>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50 mb-3"
          disabled={loading}
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </button>

        <div className="text-center text-sm">
          <span className="text-gray-600">Já tem conta? </span>
          <Link to="/login" className="text-blue-600 hover:underline">
            Entrar
          </Link>
        </div>
      </form>
    </div>
  );
}
