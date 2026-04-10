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
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-brand-text mb-6">Criar Conta</h2>
        {errorMsg && <div className="alert alert-error mb-4">{errorMsg}</div>}
        
        <label className="block mb-4">
          Nome do Responsável
          <input
            className="mt-1"
            {...register('nomeResponsavel')}
            disabled={loading}
          />
          {errors.nomeResponsavel && (
            <span className="text-xs text-brand-danger mt-1">{errors.nomeResponsavel.message}</span>
          )}
        </label>

        <label className="block mb-4">
          Email
          <input
            type="email"
            className="mt-1"
            {...register('email')}
            disabled={loading}
          />
          {errors.email && <span className="text-xs text-brand-danger mt-1">{errors.email.message}</span>}
        </label>

        <label className="block mb-4">
          Senha
          <input
            type="password"
            className="mt-1"
            {...register('senha')}
            disabled={loading}
          />
          {errors.senha && <span className="text-xs text-brand-danger mt-1">{errors.senha.message}</span>}
        </label>

        <label className="block mb-5">
          Nome da Conta
          <input
            className="mt-1"
            {...register('nomeAccount')}
            disabled={loading}
          />
          {errors.nomeAccount && <span className="text-xs text-brand-danger mt-1">{errors.nomeAccount.message}</span>}
        </label>

        <button
          type="submit"
          className="btn btn-primary w-full mb-4"
          disabled={loading}
        >
          {loading ? 'Criando conta...' : 'Criar Conta'}
        </button>

        <div className="text-center text-sm">
          <span className="text-brand-muted">Já tem conta? </span>
          <Link to="/login" className="text-brand-primary hover:underline">
            Entrar
          </Link>
        </div>
      </form>
    </div>
  );
}
