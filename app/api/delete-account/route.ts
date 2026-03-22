import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export async function DELETE(request: Request) {
  // 1. Extrai o JWT do header Authorization
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const jwt = authHeader.replace('Bearer ', '');

  // 2. Valida o token com o cliente anon (sem service role)
  //    supabase.auth.getUser(jwt) verifica a assinatura e expiração do token
  //    diretamente no servidor — não depende de cookies nem sessão local
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);

  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 3. Cliente admin com service role — apenas server-side, nunca NEXT_PUBLIC_
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 4. Remove o avatar do bucket antes de deletar o usuário
  //    Ignora erro caso o arquivo não exista (conta sem foto)
  await supabaseAdmin.storage.from('avatars').remove([`${user.id}/avatar.jpg`]);

  // 5. Deleta o usuário do Auth (cascata remove dados vinculados via FK)
  const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
  if (deleteError) {
    console.error('Erro ao deletar usuário:', deleteError);
    return Response.json({ error: 'Failed to delete account' }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 200 });
}
