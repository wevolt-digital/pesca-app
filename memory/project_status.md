---
name: Estado atual do projeto pesca-app
description: O que foi implementado, decisões técnicas e o que falta fazer
type: project
---

## Stack
- Next.js (App Router) + TypeScript
- Supabase (auth + banco de dados)
- MapLibre GL com tiles OpenFreeMap (estilo Liberty)
- Vercel (hospedagem)

## O que foi implementado

### Geocodificação no registro de pesca (`/app/register/page.tsx`)
- Campo "Local da Pesca" com autocomplete via API Nominatim (OSM), debounce 500ms, restrito ao Brasil
- Botão GPS (ícone Navigation) que captura localização atual + geocodificação reversa
- Coordenadas reais salvas no banco (lat/lng), substituindo os valores hardcoded (-23.55, -46.63)
- lat/lng tornados opcionais no tipo Insert de catches (`lib/supabase/types.ts`)

### OAuth Google (`/app/auth/callback/route.ts`)
- Rota de callback criada para o fluxo PKCE do Supabase
- `redirectTo` na intro atualizado para `/auth/callback?next=/map`
- **Why:** sem essa rota, o OAuth retornava ERR_CONNECTION_REFUSED

### Configuração de produção
- Deploy via Vercel (conectado ao GitHub, auto-deploy no push para main)
- Supabase Site URL deve apontar para a URL do Vercel (não localhost)
- Redirect URLs no Supabase: URL de produção + localhost (manter ambos)
- Netlify removido do projeto (netlify.toml deletado, @netlify/plugin-nextjs desinstalado)

### Proteção de rotas (`/middleware.ts`)
- Middleware protege: /map, /feed, /discover, /register, /profile, /onboarding
- Redireciona para / se não autenticado (verificação server-side, sem flash)

## O que ainda falta / estava incompleto quando paramos
- Página /discover usa dados mock (`constants/mockData.ts`), não o banco real
- Upload de foto no registro: UI existe mas funcionalidade não implementada
- Página /feed: estado desconhecido (não foi revisada nessa sessão)
- Página /onboarding: tem modificação pendente não commitada ("Nome completo" → "Nome")
- Pasta /app/test: existe mas não foi revisada
