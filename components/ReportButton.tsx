'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { MessageSquareWarning } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

const ROUTES_WITHOUT_BUTTON = ['/', '/onboarding'];

export default function ReportButton() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'problema' | 'melhoria'>('problema');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  if (ROUTES_WITHOUT_BUTTON.includes(pathname)) return null;

  const handleSubmit = () => {
    if (!message.trim()) return;
    // TODO: configurar destino do envio
    console.log({ type, message });
    setSent(true);
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setTimeout(() => {
        setType('problema');
        setMessage('');
        setSent(false);
      }, 300);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Reportar um problema"
        className="fixed bottom-[5.5rem] right-4 z-40 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors md:bottom-6 md:right-6"
      >
        <MessageSquareWarning className="h-5 w-5" />
      </button>

      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle>Reportar feedback</DialogTitle>
          </DialogHeader>

          {sent ? (
            <div className="py-6 text-center space-y-2">
              <p className="text-2xl">✅</p>
              <p className="font-semibold text-foreground">Obrigado pelo feedback!</p>
              <p className="text-sm text-muted-foreground">Sua mensagem foi recebida.</p>
              <Button className="mt-4 w-full rounded-xl" onClick={() => handleClose(false)}>
                Fechar
              </Button>
            </div>
          ) : (
            <div className="space-y-4 pt-1">
              <div>
                <Label className="mb-2 block text-sm font-semibold">Tipo</Label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setType('problema')}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                      type === 'problema'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    🐛 Problema
                  </button>
                  <button
                    type="button"
                    onClick={() => setType('melhoria')}
                    className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-colors ${
                      type === 'melhoria'
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    💡 Melhoria
                  </button>
                </div>
              </div>

              <div>
                <Label className="mb-2 block text-sm font-semibold">Mensagem</Label>
                <Textarea
                  placeholder={
                    type === 'problema'
                      ? 'Descreva o problema que encontrou...'
                      : 'Descreva sua sugestão de melhoria...'
                  }
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="resize-none rounded-xl"
                  rows={4}
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!message.trim()}
                className="w-full rounded-xl bg-primary font-semibold text-white hover:bg-primary/90 disabled:opacity-50"
              >
                Enviar
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
