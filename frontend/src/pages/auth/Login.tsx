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
    <div className="min-h-screen flex items-center justify-center bg-brand-bg">
      <form onSubmit={handleSubmit(onSubmit)} className="card w-full max-w-md">
        <h2 className="text-2xl font-bold text-brand-text mb-6">Entrar</h2>
        {errorMsg && <div className="alert alert-error mb-4">{errorMsg}</div>}
        <label className="block mb-4">
          Email
          <input
            className="mt-1"
            {...register('email')}
            disabled={loading}
          />
          {errors.email && <span className="text-xs text-brand-danger mt-1">{errors.email.message}</span>}
        </label>
        <label className="block mb-5">
          Senha
          <input
            type="password"
            className="mt-1"
            {...register('senha')}
            disabled={loading}
          />
          {errors.senha && <span className="text-xs text-brand-danger mt-1">{errors.senha.message}</span>}
        </label>
        <button
          type="submit"
          className="btn btn-primary w-full mb-4"
          disabled={loading}
        >
          {loading ? 'Entrando...' : 'Entrar'}
        </button>

        <div className="text-center text-sm">
          <span className="text-brand-muted">Não tem conta? </span>
          <Link to="/register" className="text-brand-primary hover:underline">
            Criar conta
          </Link>
        </div>
      </form>
    </div>
  );
}

