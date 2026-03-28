'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, ArrowRight, ChevronRight } from 'lucide-react';
import Image from 'next/image';

const TOTAL_STEPS = 2;

export default function OnboardingPage() {
  const router = useRouter();

  // Step 1
  const [name, setName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [step1Error, setStep1Error] = useState<string | null>(null);

  // Step 2
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

  // ── Validação passo 1
  function handleStep1() {
    if (!name.trim()) {
      setStep1Error('Informe seu nome para continuar.');
      return;
    }
    if (!birthDate) {
      setStep1Error('Informe sua data de nascimento para continuar.');
      return;
    }
    setStep1Error(null);
    setDirection(1);
    setStep(2);
  }

  // ── Seleção de foto
  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setPhotoError(null);
    if (!file) return;

    const MAX = 500 * 1024; // 500 KB
    if (file.size > MAX) {
      setPhotoError('A foto deve ter no máximo 500 KB.');
      return;
    }
    if (!['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)) {
      setPhotoError('Use uma imagem JPG ou PNG.');
      return;
    }
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  // ── Finalizar onboarding
  function handleFinish() {
    // Salva dados básicos em localStorage (fluxo provisório sem auth real)
    localStorage.setItem(
      'onboarding',
      JSON.stringify({ name: name.trim(), birthDate, hasAvatar: !!avatarPreview })
    );
    router.push('/map');
  }

  // ── Animação de slide entre passos
  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? 60 : -60, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? -60 : 60, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col px-6 pt-14 pb-10">
      {/* Header: logo + step indicator */}
      <div className="flex items-center justify-between mb-10">
        <Image src="/logo-fishintel.svg" alt="Fishintel" width={120} height={40} priority />
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: step === i + 1 ? 24 : 8,
                background: step > i ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.2)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo animado por passo */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
            <motion.div
              key="step1"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col flex-1"
            >
              {/* Eyebrow */}
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">
                Passo 1 de 2
              </p>
              <h1 className="text-white text-3xl font-extrabold leading-tight mb-2">
                Conta pra gente<br />quem você é
              </h1>
              <p className="text-white/50 text-sm mb-10">
                Seus dados ficam seguros e são usados apenas para personalizar sua experiência.
              </p>

              {/* Nome */}
              <div className="mb-5">
                <label className="block text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
                  Nome
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setStep1Error(null); }}
                  placeholder="Como quer ser chamado?"
                  autoFocus
                  className="w-full bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-3.5 text-white placeholder:text-white/30 text-sm focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              {/* Data de nascimento */}
              <div className="mb-8">
                <label className="block text-white/70 text-xs font-semibold uppercase tracking-widest mb-2">
                  Data de nascimento
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => { setBirthDate(e.target.value); setStep1Error(null); }}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full bg-white/[0.07] border border-white/10 rounded-2xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-primary/60 transition-colors [color-scheme:dark]"
                />
              </div>

              {/* Erro */}
              {step1Error && (
                <p className="text-red-400 text-sm mb-4 -mt-4">{step1Error}</p>
              )}

              {/* CTA */}
              <button
                onClick={handleStep1}
                className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors mt-auto"
              >
                Continuar <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col flex-1"
            >
              {/* Eyebrow */}
              <p className="text-primary text-xs font-bold uppercase tracking-widest mb-2">
                Passo 2 de 2
              </p>
              <h1 className="text-white text-3xl font-extrabold leading-tight mb-2">
                Adicione uma foto
              </h1>
              <p className="text-white/50 text-sm mb-10">
                Opcional — você pode adicionar ou trocar depois no seu perfil.
              </p>

              {/* Avatar picker */}
              <div className="flex flex-col items-center mb-8">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-dashed border-white/20 bg-white/[0.07] flex items-center justify-center group hover:border-primary/50 transition-colors"
                >
                  {avatarPreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-white/40 group-hover:text-white/60 transition-colors">
                      <Camera size={28} />
                      <span className="text-xs font-medium">Escolher foto</span>
                    </div>
                  )}
                  {/* Overlay ao hover quando já tem foto */}
                  {avatarPreview && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera size={22} className="text-white" />
                    </div>
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {avatarPreview && (
                  <button
                    type="button"
                    onClick={() => { setAvatarPreview(null); setPhotoError(null); }}
                    className="mt-3 text-white/40 text-xs hover:text-white/70 transition-colors"
                  >
                    Remover foto
                  </button>
                )}

                {photoError && (
                  <p className="text-red-400 text-sm mt-3 text-center">{photoError}</p>
                )}

                {!avatarPreview && (
                  <p className="text-white/30 text-xs mt-3">JPG ou PNG · máx. 500 KB</p>
                )}
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 mt-auto">
                <button
                  onClick={handleFinish}
                  className="w-full bg-primary text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  {avatarPreview ? 'Ir para o mapa' : 'Concluir'} <ArrowRight size={18} />
                </button>
                {!avatarPreview && (
                  <button
                    onClick={handleFinish}
                    className="w-full text-white/40 text-sm font-medium py-2 hover:text-white/60 transition-colors"
                  >
                    Pular esta etapa
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
