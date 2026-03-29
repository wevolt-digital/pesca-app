'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export default function IntroPage() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [signingIn, setSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Trava scroll do body nessa página (evita faixa branca no mobile)
  useEffect(() => {
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.background = '#0a1628';
    return () => {
      document.documentElement.style.overflow = '';
      document.body.style.overflow = '';
      document.body.style.background = '';
    };
  }, []);

  // Redireciona automaticamente se já houver sessão ativa
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace('/map');
      } else {
        setChecking(false);
      }
    });
  }, [router]);

  const handleGoogleLogin = async () => {
    setSigningIn(true);
    setError(null);
    const supabase = getSupabaseBrowserClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/map`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
    if (error) {
      setError('Não foi possível entrar com Google. Tente novamente.');
      setSigningIn(false);
    }
  };

  // Evita flash da intro para usuários já autenticados
  if (checking) return null;

  return (
    <div className="relative h-screen bg-[#0a1628] flex flex-col items-center justify-center px-6 overflow-hidden" style={{ height: '100dvh' }}>
      {/* Vídeo de fundo — desktop */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 hidden md:block"
      >
        <source src="/fishintel.mp4" type="video/mp4" />
      </video>

      {/* Vídeo de fundo — mobile */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-30 md:hidden"
      >
        <source src="/fishintel-mobile.mp4" type="video/mp4" />
      </video>

      {/* Overlay escuro para manter contraste */}
      <div className="absolute inset-0 bg-[#0a1628]/60" />
      {/* Conteúdo */}
      <div className="relative z-10 w-full flex flex-col items-center">

      {/* Logo */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full flex justify-center"
      >
        <Image
          src="/logo-fishintel.svg"
          alt="Fishintel"
          width={240}
          height={80}
          priority
        />
      </motion.div>

      {/* Frase principal */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="w-full text-white/90 text-xl font-semibold text-center mt-8 leading-snug"
      >
        A maior inteligência de pesca esportiva do Brasil.
      </motion.p>

      {/* Frase secundária */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.95, duration: 0.5 }}
        className="w-full text-white/50 text-sm text-center mt-3 mb-14 leading-relaxed"
      >
        Uma base completa de locais e capturas para levar sua pescaria ao próximo nível.
      </motion.p>

      {/* Botão Google */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.5 }}
        className="w-full max-w-xs space-y-3"
      >
        <button
          onClick={handleGoogleLogin}
          disabled={signingIn}
          className="w-full flex items-center justify-center gap-3 bg-white text-gray-800 font-semibold py-3.5 rounded-2xl shadow-lg hover:bg-gray-50 transition-colors disabled:opacity-60"
        >
          {signingIn ? (
            <span>Entrando...</span>
          ) : (
            <>
              <GoogleIcon />
              <span>Entrar com Google</span>
            </>
          )}
        </button>
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
      </motion.div>

      </div>
    </div>
  );
}
