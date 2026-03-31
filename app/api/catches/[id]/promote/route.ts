import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const jwt = authHeader.replace('Bearer ', '');

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verifica se o usuário é admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profile?.role !== 'admin') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { promote } = await request.json() as { promote: boolean };

  const supabaseAdmin = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabaseAdmin
    .from('catches')
    .update({
      is_promoted: promote,
      promoted_by: promote ? user.id : null,
      promoted_at: promote ? new Date().toISOString() : null,
    })
    .eq('id', params.id);

  if (error) {
    console.error('Erro ao atualizar promoção:', error);
    return Response.json({ error: 'Failed to update promotion' }, { status: 500 });
  }

  return Response.json({ success: true, promoted: promote }, { status: 200 });
}
