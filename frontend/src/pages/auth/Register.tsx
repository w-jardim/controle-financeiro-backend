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
      await login(data.email, data.senha);
    } catch (error: any) {
      const msg = error?.response?.data?.mensagem || 'Erro ao criar conta';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo — imagem */}
      <div
        className="hidden md:flex w-3/5 bg-cover bg-center relative"
        style={{ backgroundImage: `url('/artes-marciais.jpg')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 to-indigo-900/50" />
        <div className="relative z-10 flex flex-col justify-end p-12 pb-16">
          <span className="text-indigo-300 text-sm font-semibold uppercase tracking-widest mb-3">
            CT Control
          </span>
          <h1 className="text-4xl font-bold text-white leading-tight mb-3">
            Comece agora
          </h1>
          <p className="text-slate-300 text-base max-w-sm">
            Crie sua conta e gerencie seu Centro de Treinamento em minutos.
          </p>
        </div>
      </div>

      {/* Lado direito — formulário */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 px-6 py-10">
        <div className="w-full max-w-sm">
          <div className="md:hidden text-center mb-8">
            <span className="text-2xl font-bold text-gray-900">CT Control</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Criar Conta</h2>
            <p className="text-sm text-gray-500 mt-1">Preencha os dados para começar</p>
          </div>

          {errorMsg && (
            <div className="alert-error mb-5">{errorMsg}</div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Nome do Responsável</label>
              <input
                className="form-input"
                placeholder="Seu nome completo"
                {...register('nomeResponsavel')}
                disabled={loading}
              />
              {errors.nomeResponsavel && (
                <span className="form-error">{errors.nomeResponsavel.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                placeholder="seu@email.com"
                {...register('email')}
                disabled={loading}
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Senha</label>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                {...register('senha')}
                disabled={loading}
              />
              {errors.senha && <span className="form-error">{errors.senha.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Nome da Conta / CT</label>
              <input
                className="form-input"
                placeholder="Ex: Academia Dragão"
                {...register('nomeAccount')}
                disabled={loading}
              />
              {errors.nomeAccount && (
                <span className="form-error">{errors.nomeAccount.message}</span>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full mt-2"
              disabled={loading}
            >
              {loading ? 'Criando conta...' : 'Criar Conta'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Já tem conta?{' '}
            <Link to="/login" className="text-indigo-600 font-medium hover:underline">
              Entrar
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
