'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { ArrowLeft, Camera, Trash2, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const MAX_FILE_SIZE = 500 * 1024; // 500 KB

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Carrega sessão e dados do perfil
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    async function init() {
      let session = (await supabase.auth.getSession()).data.session;

      if (!session && process.env.NODE_ENV === 'development') {
        const { data } = await supabase.auth.signInWithPassword({
          email: process.env.NEXT_PUBLIC_DEV_TEST_EMAIL!,
          password: process.env.NEXT_PUBLIC_DEV_TEST_PASSWORD!,
        });
        session = data.session;
      }

      if (!session) {
        setLoading(false);
        return;
      }

      setUserId(session.user.id);

      const { data: profile } = await supabase
        .from('profiles')
        .select('name, bio, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        setName(profile.name ?? '');
        setBio(profile.bio ?? '');
        setAvatarUrl(profile.avatar_url ?? null);
      }

      setLoading(false);
    }

    init();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setPhotoError(null);

    if (!file) return;

    if (file.type !== 'image/jpeg') {
      setPhotoError('Formato inválido. Use apenas JPG/JPEG.');
      e.target.value = '';
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setPhotoError(
        `Arquivo muito grande (${(file.size / 1024).toFixed(0)} KB). Máximo: 500 KB.`
      );
      e.target.value = '';
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    if (!userId || !name.trim()) return;

    setSaving(true);
    setSaveMessage(null);
    setSaveError(null);

    const supabase = getSupabaseBrowserClient();
    let newAvatarUrl = avatarUrl;

    if (avatarFile) {
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(`${userId}/avatar.jpg`, avatarFile, {
          upsert: true,
          contentType: 'image/jpeg',
        });

      if (uploadError) {
        console.error('Erro ao fazer upload da foto:', uploadError);
        setSaveError('Não foi possível fazer upload da foto. Tente novamente.');
        setSaving(false);
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(`${userId}/avatar.jpg`);
      newAvatarUrl = publicUrlData.publicUrl;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ name: name.trim(), bio: bio.trim() || null, avatar_url: newAvatarUrl })
      .eq('id', userId);

    if (error) {
      console.error('Erro ao salvar perfil:', error);
      setSaveError('Não foi possível salvar as alterações. Tente novamente.');
    } else {
      setSaveMessage('Perfil atualizado com sucesso.');
      setTimeout(() => setSaveMessage(null), 4000);
    }

    setSaving(false);
  };

  const handleDeleteAccount = async () => {
    if (!userId) return;
    setDeleting(true);

    const supabase = getSupabaseBrowserClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setDeleting(false);
      return;
    }

    const res = await fetch('/api/delete-account', {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${session.access_token}` },
    });

    if (res.ok) {
      await supabase.auth.signOut();
      router.push('/');
    } else if (res.status === 401) {
      setDeleteError('Sessão expirada. Recarregue a página.');
      setDeleting(false);
    } else {
      console.error('Erro ao excluir conta');
      setDeleteError('Não foi possível excluir a conta. Tente novamente.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center md:pt-20">
        <p className="text-sm text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:pt-20">
      {/* Header mobile */}
      <div className="sticky top-0 z-10 border-b border-border bg-white shadow-sm md:hidden">
        <div className="mx-auto max-w-2xl px-4 py-4 flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Editar Perfil</h2>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-6 space-y-6">
        {/* Header desktop */}
        <div className="hidden md:flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-accent/10 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h2 className="text-xl font-bold">Editar Perfil</h2>
        </div>

        {/* Campos do perfil */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6 rounded-2xl bg-white p-6 shadow-md"
        >
          {/* Foto */}
          <div>
            <Label className="mb-1 block text-sm font-semibold">Foto de Perfil</Label>
            <p className="text-xs text-muted-foreground mb-3">
              JPG/JPEG · máx. 500 KB · 400×400 px recomendado
            </p>

            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-accent/10 flex items-center justify-center flex-shrink-0">
                {(avatarPreview || avatarUrl) ? (
                  <Image
                    src={avatarPreview ?? avatarUrl!}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <Button
                type="button"
                variant="outline"
                className="rounded-xl text-sm"
                onClick={() => fileInputRef.current?.click()}
              >
                Escolher foto
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".jpg,.jpeg"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {photoError && (
              <p className="mt-2 text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {photoError}
              </p>
            )}
          </div>

          {/* Nome */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">
              Nome <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
              className="rounded-xl"
            />
          </div>

          {/* Bio */}
          <div>
            <Label className="mb-2 block text-sm font-semibold">Legenda (opcional)</Label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Conte um pouco sobre você..."
              className="resize-none rounded-xl"
              rows={3}
            />
          </div>

          {saveMessage && (
            <p className="text-sm text-green-600 font-medium">{saveMessage}</p>
          )}
          {saveError && (
            <p className="text-sm text-red-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {saveError}
            </p>
          )}

          <Button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="w-full rounded-xl bg-primary py-3 font-semibold text-white hover:bg-primary/90"
          >
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </motion.div>

        {/* Zona de perigo */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl bg-white p-6 shadow-md"
        >
          <h3 className="font-semibold text-sm text-red-500 mb-1">Zona de Perigo</h3>
          <p className="text-xs text-muted-foreground mb-4">
            A exclusão da conta é permanente e não pode ser desfeita.
          </p>
          <Button
            type="button"
            variant="outline"
            className="border-red-200 text-red-500 hover:bg-red-50 rounded-xl"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Excluir minha conta
          </Button>
        </motion.div>
      </div>

      {/* Modal de confirmação de exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-xl">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="font-bold text-lg">Excluir conta</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Tem certeza? Todos os seus dados serão permanentemente removidos. Esta ação não
              pode ser desfeita.
            </p>
            {deleteError && (
              <p className="text-sm text-red-500 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {deleteError}
              </p>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl"
                onClick={() => { setShowDeleteModal(false); setDeleteError(null); }}
                disabled={deleting}
              >
                Cancelar
              </Button>
              <Button
                className="flex-1 rounded-xl bg-red-500 text-white hover:bg-red-600"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Excluindo...' : 'Confirmar'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
