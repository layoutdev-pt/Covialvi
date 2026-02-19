# Covialvi — Documentação Completa do Projeto (SOP / Template)

> **Objetivo:** Servir como base/template para replicar sites imobiliários do mesmo género.
> Última atualização: Fevereiro 2026

---

## 1. STACK TECNOLÓGICA

| Camada | Tecnologia | Versão | Finalidade |
|---|---|---|---|
| **Framework** | Next.js (App Router) | 14.1.0 | SSR, SSG, API Routes, Middleware |
| **Linguagem** | TypeScript | 5.3 | Tipagem estática em todo o projeto |
| **UI Framework** | React | 18.2 | Componentes declarativos |
| **Styling** | Tailwind CSS | 3.4 | Utility-first CSS |
| **Componentes UI** | Radix UI / shadcn-style | vários | Accordion, Dialog, Select, Tabs, Tooltip, etc. |
| **Animações** | Framer Motion | 11.18 | Animações de scroll, hover, page transitions |
| **Ícones** | Lucide React | 0.331 | Iconografia consistente |
| **Backend/DB** | Supabase (PostgreSQL) | 2.90 | Auth, DB, Storage, RLS, Realtime |
| **Auth** | Supabase Auth + SSR | 0.8 | PKCE flow, cookies, middleware |
| **Email** | Resend | 6.7 | Envio transacional de emails |
| **Forms** | React Hook Form + Zod | 7.50 / 3.22 | Validação de formulários |
| **State** | Zustand | 4.5 | Estado global (leve) |
| **Data Fetching** | TanStack React Query | 5.22 | Cache, refetch, stale-while-revalidate |
| **Tabelas** | TanStack React Table | 8.12 | Tabelas admin com sort/filter/pagination |
| **Charts** | Recharts | 2.12 | Gráficos no dashboard admin |
| **i18n** | next-intl | 3.9 | Internacionalização (PT-PT) |
| **Temas** | next-themes | 0.4 | Dark mode / Light mode / System |
| **Toasts** | Sonner | 1.4 | Notificações toast |
| **Calendar** | react-day-picker | 8.10 | Seleção de datas (visitas) |
| **PDF** | @react-pdf/renderer | 4.3 | Geração de fichas de imóvel |
| **SEO** | JSON-LD (schema.org) | — | Structured data para Google |
| **Analytics** | Vercel Analytics + Speed Insights | 1.6 / 1.3 | Métricas de performance |
| **Monitoring** | Sentry | 7.100 | Error tracking (opcional) |
| **Deploy** | Vercel / Netlify | — | CI/CD automático |
| **Imagens** | Sharp | 0.33 | Otimização de imagens server-side |

---

## 2. ESTRUTURA DE FICHEIROS

```
covialvi/
├── .env.example              # Template de variáveis de ambiente
├── .env.local                # Variáveis locais (NÃO comitar)
├── .env.vercel               # Variáveis para Vercel
├── .eslintrc.json            # Config ESLint
├── .gitignore                # Ficheiros ignorados pelo Git
├── netlify.toml              # Config deploy Netlify
├── vercel.json               # Config deploy Vercel (região, funções)
├── next.config.js            # Config Next.js (imagens, headers segurança, i18n)
├── tailwind.config.ts        # Config Tailwind (cores, fontes, animações)
├── tsconfig.json             # Config TypeScript
├── postcss.config.js         # Config PostCSS (autoprefixer)
├── package.json              # Dependências e scripts
│
├── public/                   # Assets estáticos
│   └── team-covialvi.png     # Imagem da equipa
│
├── scripts/                  # Scripts utilitários
│   ├── scrape-properties.js  # Scraper de imóveis (importação inicial)
│   ├── import-properties.js  # Importação de imóveis para Supabase
│   ├── import-images.js      # Importação de imagens para Storage
│   ├── delete-all-properties.js # Limpeza de dados
│   ├── properties-export.csv # Export CSV de imóveis
│   └── properties-export.json # Export JSON de imóveis
│
├── supabase/                 # Configuração Supabase
│   ├── config.toml           # Config local do Supabase CLI
│   └── migrations/           # Migrações SQL (14 ficheiros)
│       ├── 00001_initial_schema.sql
│       ├── 00002_rls_policies.sql
│       ├── 00003–00014_*.sql  # Migrações incrementais
│
├── docs/                     # Documentação
│
└── src/                      # Código-fonte principal
    ├── middleware.ts          # Middleware Next.js (auth session)
    ├── i18n.ts               # Configuração next-intl
    ├── app/                  # App Router (páginas e API)
    ├── components/           # Componentes reutilizáveis
    ├── hooks/                # Custom hooks
    ├── lib/                  # Utilitários, configs, Supabase clients
    ├── messages/             # Ficheiros de tradução (PT-PT)
    └── types/                # Tipos TypeScript
```

---

## 3. VARIÁVEIS DE AMBIENTE (.env)

```bash
# === OBRIGATÓRIAS ===
NEXT_PUBLIC_SUPABASE_URL=         # URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=    # Chave anónima (pública)
SUPABASE_SERVICE_ROLE_KEY=        # Chave service role (NUNCA expor no cliente)

# === APP ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Covialvi

# === EMAIL ===
RESEND_API_KEY=                   # Chave da API Resend
ADMIN_EMAIL=covialvi@gmail.com    # Email que recebe notificações

# === OPCIONAIS ===
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=  # Google Maps embed
SENTRY_DSN=                       # Sentry error tracking
GOOGLE_CLIENT_ID=                 # Google Calendar integration
GOOGLE_CLIENT_SECRET=
GOOGLE_API_KEY=
IPINFO_TOKEN=                     # Deteção de idioma por IP
```

---

## 4. FICHEIROS DE CONFIGURAÇÃO DE DEPLOY

### vercel.json
```json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "regions": ["cdg1"],           // Paris (mais próximo de Portugal)
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 30          // Timeout de 30s para API routes
    }
  }
}
```

### netlify.toml
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

---

## 5. SCRIPTS npm

| Script | Comando | Descrição |
|---|---|---|
| `dev` | `next dev -H 0.0.0.0` | Servidor de desenvolvimento (acessível na rede local) |
| `build` | `next build` | Build de produção |
| `start` | `next start` | Servidor de produção |
| `lint` | `next lint` | Linting com ESLint |
| `typecheck` | `tsc --noEmit` | Verificação de tipos TypeScript |
| `test` | `vitest` | Testes unitários |
| `test:e2e` | `playwright test` | Testes end-to-end |
| `db:migrate` | `supabase db push` | Aplicar migrações na DB |
| `db:generate` | `supabase gen types typescript` | Gerar tipos TS a partir da DB |
| `db:seed` | `tsx scripts/seed.ts` | Popular a DB com dados de teste |

---

## 6. BASE DE DADOS (Supabase / PostgreSQL)

### 6.1 Tabelas Principais

| Tabela | Descrição | Campos-chave |
|---|---|---|
| **profiles** | Perfis de utilizadores (extends auth.users) | id, email, first_name, last_name, phone, role (user/admin/super_admin), avatar_url, marketing_consent, alerts_consent |
| **properties** | Imóveis | id, reference, title, slug, description, business_type (sale/rent/transfer), nature (apartment/house/land/...), status (draft/published/archived), price, district, municipality, parish, address, bedrooms, bathrooms, gross_area, useful_area, land_area, construction_status, energy_certificate, equipment[], extras[], featured, views_count |
| **property_images** | Imagens dos imóveis | id, property_id, url, alt, order, is_cover |
| **property_floor_plans** | Plantas dos imóveis | id, property_id, url, title, order |
| **favorites** | Favoritos dos utilizadores | id, user_id, property_id (UNIQUE) |
| **leads** | Contactos/leads CRM | id, email, first_name, last_name, phone, source, status (new/contacted/visit_scheduled/negotiation/closed/lost), assigned_to, property_id, message, tags[], custom_fields (JSONB) |
| **visits** | Visitas agendadas | id, property_id, user_id, lead_id, scheduled_at, status (pending/confirmed/completed/cancelled/rescheduled), notes, internal_notes, assigned_to |
| **crm_notes** | Notas do CRM | id, lead_id, author_id, content |
| **audit_logs** | Registo de auditoria (imutável) | id, user_id, action, entity_type, entity_id, old_values, new_values, ip_address |
| **user_sessions** | Sessões ativas | id, user_id, ip_address, user_agent |
| **saved_searches** | Pesquisas guardadas | id, user_id, name, filters (JSONB), alerts_enabled |

### 6.2 Enums PostgreSQL

- `user_role`: user, admin, super_admin
- `property_status`: draft, published, archived
- `business_type`: sale, rent, transfer
- `property_nature`: apartment, house, land, commercial, warehouse, office, garage, shop
- `construction_status`: new, used, under_construction, to_recover, renovated
- `lead_status`: new, contacted, visit_scheduled, negotiation, closed, lost
- `visit_status`: pending, confirmed, completed, cancelled, rescheduled

### 6.3 Triggers e Funções

- **`update_updated_at_column()`** — Atualiza `updated_at` automaticamente em profiles, properties, leads, visits, crm_notes, saved_searches
- **`handle_new_user()`** — Cria perfil na tabela profiles quando um utilizador se regista via auth.users
- **`log_audit_event()`** — Função para registar eventos de auditoria

### 6.4 Índices

- Full-text search em properties (título, descrição, distrito, município) usando `pg_trgm`
- Índices em todos os campos frequentemente filtrados (status, business_type, nature, district, municipality, price, bedrooms, slug, featured)
- Índices parciais (ex: `featured WHERE featured = TRUE`)

### 6.5 RLS (Row Level Security)

- Ficheiro dedicado: `00002_rls_policies.sql`
- Utilizadores normais só veem imóveis publicados
- Admin/super_admin veem tudo
- Leads e visitas protegidos por role
- Service role key bypassa RLS para operações server-side

### 6.6 Migrações

14 migrações incrementais cobrindo:
1. Schema inicial completo
2. Políticas RLS
3. Atualizações de status de propriedades
4. Sistema de notificações
5. Integração Google Calendar
6. Coluna de divisões
7. Buckets de storage
8. Fix de construction_status
9. Status default como published
10. Fix de performance RLS
11. Sync de role para JWT
12. Campos para visitantes convidados

---

## 7. AUTENTICAÇÃO E AUTORIZAÇÃO

### 7.1 Fluxo de Auth

```
Utilizador → Supabase Auth (PKCE flow)
           → Cookies geridos pelo middleware Next.js
           → AuthProvider (contexto React) expõe user/profile/session
```

### 7.2 Três clientes Supabase

| Ficheiro | Uso | Contexto |
|---|---|---|
| `src/lib/supabase/client.ts` | `createBrowserClient` (singleton) | Client Components |
| `src/lib/supabase/server.ts` | `createServerClient` com cookies | Server Components, Route Handlers |
| `src/lib/supabase/server.ts` | `createServiceClient` com service key | API Routes que bypassam RLS |

### 7.3 Middleware (`src/middleware.ts` + `src/lib/supabase/middleware.ts`)

- Atualiza sessão em cada request
- Redireciona utilizadores não autenticados de `/conta/*`
- Redireciona utilizadores autenticados de `/auth/*` (exceto `/auth/logout` e `/auth/callback`)
- Protege rotas admin exigindo role `admin` ou `super_admin`

### 7.4 Roles

| Role | Acesso |
|---|---|
| `user` | Site público, conta pessoal, favoritos, agendar visitas |
| `admin` | Tudo acima + painel admin completo |
| `super_admin` | Tudo acima + gestão de administradores |

### 7.5 Rotas de Auth

| Rota | Ficheiro | Descrição |
|---|---|---|
| `/auth/login` | page.tsx | Login com email/password |
| `/auth/registar` | page.tsx | Registo de nova conta |
| `/auth/recuperar-password` | page.tsx | Reset de password |
| `/auth/nova-password` | page.tsx | Definir nova password |
| `/auth/verificar-email` | page.tsx | Verificação de email |
| `/auth/callback` | route.ts | Callback OAuth / magic link |
| `/auth/logout` | route.ts | Logout server-side (limpa cookies) |
| `/auth/erro` | page.tsx | Página de erro de auth |

---

## 8. ARQUITETURA DO APP ROUTER

### 8.1 Layout Hierarchy

```
src/app/layout.tsx (Root)
├── Poppins font
├── ThemeProvider (dark/light/system)
├── NextIntlClientProvider (i18n)
├── QueryProvider (React Query)
├── AuthProvider (Supabase Auth context)
├── Toaster (Sonner)
├── CookieConsent
├── Vercel Analytics + SpeedInsights
├── StructuredData (JSON-LD)
│
├── src/app/(public)/layout.tsx
│   ├── Header (navbar)
│   ├── main content
│   ├── SellPropertyWizard (modal flutuante)
│   └── Footer
│
├── src/app/admin/layout.tsx
│   └── AdminAuthWrapper
│       ├── AdminSidebar (72px fixed left)
│       ├── AdminTopbar
│       └── main content
│
├── src/app/conta/layout.tsx
│   └── Sidebar + content (área do utilizador)
│
└── src/app/auth/ (sem layout extra)
```

### 8.2 Páginas Públicas (`src/app/(public)/`)

| Rota | Ficheiro | Descrição |
|---|---|---|
| `/` | `page.tsx` + `home-client.tsx` | Homepage com hero, destaques, serviços, CTA |
| `/sobre` | `sobre/about-client.tsx` | Sobre nós, história, valores, equipa, contactos |
| `/servicos` | `servicos/` | Serviços oferecidos |
| `/imoveis` | `imoveis/page.tsx` | Listagem com filtros (tipo, natureza, preço, quartos, localização) |
| `/imoveis/[slug]` | `imoveis/[slug]/page.tsx` | Detalhe do imóvel (galeria, mapa, características, agendamento) |
| `/contacto` | `contacto/page.tsx` | Formulário de contacto, mapa, QR code vCard |
| `/procuro-imovel` | `procuro-imovel/` | Formulário "procuro imóvel" |
| `/simulador-credito` | `simulador-credito/` | Simulador de crédito habitação |
| `/recrutamento` | `recrutamento/` | Página de recrutamento |
| `/avaliacao-completa` | `avaliacao-completa/` | Avaliação completa de imóvel |
| `/termos-e-condicoes` | Termos e Condições (versão detalhada) |
| `/politica-de-privacidade` | Política de Privacidade (versão detalhada) |
| `/politica-de-cookies` | Política de Cookies (versão detalhada) |
| `/termos` | Termos (versão simplificada) |
| `/privacidade` | Privacidade (versão simplificada) |
| `/cookies` | Cookies (versão simplificada) |

### 8.3 Área do Utilizador (`src/app/conta/`)

| Rota | Descrição |
|---|---|
| `/conta` | Dashboard pessoal (perfil, dados, ações rápidas) |
| `/conta/favoritos` | Imóveis favoritos |
| `/conta/visitas` | Visitas agendadas |
| `/conta/definicoes` | Definições da conta |
| `/conta/privacidade` | Privacidade e consentimentos |

---

## 9. PAINEL DE ADMINISTRAÇÃO (Detalhado)

### 9.1 Estrutura Visual

- **Sidebar fixa** (72px width) à esquerda com navegação principal
- **Topbar** com pesquisa, notificações, tema, perfil
- **Conteúdo principal** à direita

### 9.2 Dashboard (`/admin`)

O dashboard principal carrega **server-side** com `createServiceClient` e faz 11 queries paralelas:

- **Total de imóveis** (todos + publicados)
- **Novos imóveis** (este mês vs. mês anterior — calcula variação %)
- **Leads** (esta semana vs. semana anterior — calcula variação %)
- **Visitas agendadas** (pendentes + esta semana)
- **Leads pendentes** (status = new)
- **Últimos 5 leads** (com imóvel associado)
- **Últimas 5 ações** (audit_logs com perfil do autor)

Apresenta:
- 4 cards KPI com variação percentual (positiva/negativa/neutra)
- Lista de leads recentes com status colorido
- Feed de atividade recente

### 9.3 Gestão de Imóveis (`/admin/imoveis`)

**Listagem (`properties-client.tsx` — 22KB)**
- Tabela com colunas: imagem, referência, título, tipo, natureza, preço, status, ações
- Filtros: pesquisa por texto, tipo de negócio, natureza, status
- Ordenação por colunas
- Paginação
- Ações: ver, editar, duplicar, arquivar, eliminar

**Criação/Edição (`/admin/imoveis/novo` e `/admin/imoveis/[id]`)**
- Formulário completo com:
  - Dados básicos (título, referência, slug, descrição)
  - Tipo de negócio (venda/arrendamento/trespasse)
  - Natureza (apartamento/moradia/terreno/comercial/...)
  - Preço e "sob consulta"
  - Localização (distrito, município, freguesia, morada, código postal, coordenadas GPS)
  - Características (quartos, casas de banho, andares, tipologia, área bruta/útil/terreno)
  - Estado de construção (novo/usado/em construção/para recuperar/renovado)
  - Certificado energético
  - Equipamentos, extras, envolvente (arrays de checkboxes)
  - Vídeo, tour virtual, brochura (URLs)
  - Upload de imagens com drag & drop, ordenação, seleção de capa
  - Upload de plantas
  - Checkbox "Destaque" (featured) — aparece na homepage (máx 6)
  - Status (rascunho/publicado/arquivado)

**Ações em lote (`property-actions.tsx`)**
- Alterar status
- Eliminar

**Preview (`/admin/imoveis/preview`)**
- Pré-visualização do imóvel antes de publicar

### 9.4 CRM / Contactos (`/admin/crm`)

**Vista principal (`crm-client.tsx` — 21KB)**
- **Lista de leads** com filtros por status, pesquisa, data
- Para cada lead: nome, email, telefone, source, status, imóvel associado, data
- Ações: ver detalhes, alterar status, atribuir a consultor, adicionar notas

**Vista Kanban (`crm-kanban.tsx` — 6.5KB)**
- Board tipo Trello com colunas por status:
  - Novo → Contactado → Visita Agendada → Negociação → Fechado / Perdido
- Drag & drop entre colunas

**Funcionalidades CRM:**
- Notas internas por lead (crm_notes)
- Tags e campos custom (JSONB)
- Histórico de interações
- Atribuição a consultores

### 9.5 Visitas (`/admin/visitas`)

**Calendário (`visits-calendar-client.tsx` — 22KB)**
- Vista de calendário mensal
- "Pills" coloridas por status em cada dia
- Criar nova visita (selecionar imóvel, lead, data/hora)
- Confirmar/cancelar/reagendar visitas
- Eliminar visitas do calendário
- Notas internas por visita
- Envio automático de email de confirmação ao cliente

### 9.6 Utilizadores (`/admin/utilizadores`)

- Listagem de todos os utilizadores registados
- Perfil, role, data de registo, último acesso
- Ativar/desativar contas

### 9.7 Administradores (`/admin/administradores`) — Só super_admin

- Gerir quem tem acesso admin
- Promover/revogar roles

### 9.8 Relatórios (`/admin/relatorios`)

- Gráficos com Recharts
- Métricas de imóveis, leads, visitas por período

### 9.9 Definições (`/admin/definicoes`)

- **Geral:** nome da empresa, email, telefone, morada (pré-preenchidos com `company` config)
- **Notificações:** toggles para novos contactos, pedidos de visita, alertas de sistema, relatórios semanais
- **Email:** email de envio, nome do remetente, assinatura
- **Regional:** idioma, fuso horário, moeda
- **Segurança:** 2FA, timeout de sessões, auditoria
- **Tema:** claro / escuro / sistema
- **Zona de perigo:** limpar cache, exportar base de dados

### 9.10 Auditoria (`/admin/auditoria`)

- Registo completo e imutável de todas as ações admin
- Quem fez, o quê, quando, valores antes/depois

### 9.11 Ajuda (`/admin/ajuda`)

- Página de suporte e documentação

---

## 10. API ROUTES (`src/app/api/`)

| Rota | Método | Descrição |
|---|---|---|
| `/api/properties` | GET, POST | Listar/criar imóveis |
| `/api/properties/[id]` | GET, PUT, DELETE | CRUD de imóvel individual |
| `/api/properties/[id]/images` | POST, DELETE | Upload/remoção de imagens |
| `/api/properties/[id]/pdf` | GET | Gerar ficha HTML do imóvel (para impressão/PDF) |
| `/api/contact` | POST | Formulário de contacto (cria lead + envia email admin) |
| `/api/leads` | GET | Listar leads |
| `/api/leads/[id]` | GET, PUT, DELETE | CRUD de lead |
| `/api/leads/sell-property` | POST | Lead de "quero vender" |
| `/api/leads/complete-evaluation` | POST | Lead de avaliação completa |
| `/api/visits/schedule` | POST | Agendar visita |
| `/api/visits/confirm` | POST | Confirmar visita (atualiza status + envia email) |
| `/api/visits/status` | PUT | Alterar status da visita |
| `/api/visits/delete` | DELETE | Eliminar visita |
| `/api/favorites` | GET, POST, DELETE | Gerir favoritos do utilizador |
| `/api/analytics` | GET | Dados para dashboards |
| `/api/calendar` | GET, POST | Integração Google Calendar |
| `/api/auth/*` | — | Rotas de autenticação |
| `/api/og` | GET | Open Graph image generation |
| `/api/debug/*` | GET | Debug (apenas desenvolvimento) |

---

## 11. COMPONENTES REUTILIZÁVEIS

### 11.1 Layout

| Componente | Ficheiro | Descrição |
|---|---|---|
| `Header` | `components/layout/header.tsx` | Navbar responsiva com menu mobile, user dropdown, dark mode toggle |
| `Footer` | `components/layout/footer.tsx` | Footer com links, contactos (via company config), disclaimer, créditos |

### 11.2 UI (shadcn-style)

Todos em `components/ui/`:

- **button.tsx** — Variantes: default, gold, outline, ghost, destructive. Tamanhos: sm, default, lg, icon
- **card.tsx** — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- **input.tsx** — Input estilizado com Tailwind
- **label.tsx** — Label acessível (Radix)
- **textarea.tsx** — Textarea estilizada
- **select.tsx** — Select com Radix (SelectTrigger, SelectContent, SelectItem)
- **dialog.tsx** — Modal/dialog com Radix
- **dropdown-menu.tsx** — Menu dropdown com Radix
- **tabs.tsx** — Tabs com Radix
- **badge.tsx** — Badge com variantes (default, secondary, destructive, outline, gold)
- **slider.tsx** — Slider para ranges de preço
- **skeleton.tsx** — Loading skeleton
- **hero-skeleton.tsx** — Skeleton específico para hero sections
- **sonner.tsx** — Config do Sonner toast
- **motion.tsx** — Componentes de animação (FadeInUp, SlideInLeft, SlideInRight, StaggerContainer, StaggerItem, ScaleIn)
- **form-field.tsx** — Campo de formulário com label + erro
- **auto-save-indicator.tsx** — Indicador de auto-save
- **whatsapp-button.tsx** — Botão flutuante de WhatsApp

### 11.3 Outros

| Componente | Descrição |
|---|---|
| `cookie-consent.tsx` | Banner de consentimento de cookies (RGPD) com localStorage |
| `sell-property-wizard.tsx` | Wizard multi-step "Vender Imóvel" (38KB, modal flutuante) |
| `seo/structured-data.tsx` | JSON-LD schemas (Organization, LocalBusiness, WebSite, Breadcrumb, Property, FAQ) |

### 11.4 Providers

| Provider | Descrição |
|---|---|
| `auth-provider.tsx` | Contexto de auth (user, profile, session, signIn, signUp, signOut, resetPassword) |
| `query-provider.tsx` | React Query client (staleTime: 60s) |
| `theme-provider.tsx` | next-themes wrapper |

---

## 12. SISTEMA DE EMAILS

### 12.1 Configuração

- **Provider:** Resend (API key em `RESEND_API_KEY`)
- **Remetente:** `Covialvi <noreply@covialvi.com>`
- **Admin:** recebe notificações via `ADMIN_EMAIL`
- **Contactos centralizados:** importados de `src/lib/company.ts`

### 12.2 Templates de Email

| Template | Trigger | Destinatário |
|---|---|---|
| `newLeadEmailTemplate` | Novo contacto/lead | Admin |
| `visitConfirmationEmailTemplate` | Visita confirmada | Cliente |
| `propertyAlertEmailTemplate` | Novos imóveis matching | Utilizador com alertas |

### 12.3 Funções de Envio

- `notifyNewLead()` — Notifica admin de novo contacto
- `sendVisitConfirmation()` — Envia confirmação de visita ao cliente
- `sendPropertyAlerts()` — Envia alertas de novos imóveis

---

## 13. SEO E PERFORMANCE

### 13.1 Metadata

- Configurado no `layout.tsx` root com `Metadata` API do Next.js
- OpenGraph, Twitter Cards, robots, verification
- Template de título: `%s | Covialvi`
- Favicon: logo da empresa (URL externa)

### 13.2 Structured Data (JSON-LD)

- **RealEstateAgent** — Dados da empresa
- **LocalBusiness** — Negócio local
- **WebSite** — Schema do site com SearchAction
- **RealEstateListing** — Para cada imóvel individual
- **BreadcrumbList** — Breadcrumbs dinâmicos
- **FAQPage** — Para FAQ pages

### 13.3 Sitemap Dinâmico

`src/app/sitemap.ts`:
- Páginas estáticas (homepage, sobre, serviços, contacto, legal)
- Páginas dinâmicas de imóveis (query à DB por imóveis publicados)

### 13.4 Robots.txt

`src/app/robots.ts`:
- Allow: `/`
- Disallow: `/admin/`, `/api/`, `/auth/`, `/conta/`

### 13.5 Otimizações

- **Imagens:** Next.js Image com AVIF/WebP, lazy loading, priority para above-the-fold
- **Fontes:** Poppins via `next/font/google` com `display: swap` e preload
- **Preconnect:** Unsplash, eGo Real Estate
- **Headers de segurança:** HSTS, X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy

---

## 14. SISTEMA DE DESIGN

### 14.1 Cores

| Token | Valor Light | Valor Dark | Uso |
|---|---|---|---|
| **Primary/Accent** | `hsl(43, 71%, 47%)` — Gold #C9A227 | Mesmo | Botões, links, destaques |
| **Background** | `hsl(0, 0%, 100%)` — Branco | `hsl(220, 14%, 20%)` — Cinza escuro | Fundo da página |
| **Foreground** | `hsl(220, 14%, 10%)` — Quase preto | `hsl(0, 0%, 98%)` — Quase branco | Texto principal |
| **Card** | Branco | `hsl(220, 14%, 24%)` | Cards e containers |
| **Muted** | `hsl(220, 14%, 96%)` | `hsl(220, 14%, 28%)` | Fundos secundários |
| **Destructive** | `hsl(0, 84%, 60%)` — Vermelho | `hsl(0, 62%, 50%)` | Erros, eliminar |
| **Gold scale** | 50–950 | — | Gradiente completo de gold |

### 14.2 Tipografia

- **Fonte principal:** Poppins (400, 500, 600, 700)
- **Display sizes:** 2xl (4.5rem) → xs (1.5rem) com letter-spacing e line-height otimizados
- **Font features:** `rlig`, `calt`

### 14.3 Espaçamento e Layout

- **Container wide:** max-width 1600px, padding responsivo
- **Container narrow:** max-width 4xl
- **Section padding:** py-16 → py-32 responsivo
- **Border radius:** 0.5rem (variações sm, md, lg)

### 14.4 Sombras

- `soft` — Sombra suave para cards
- `soft-lg` — Sombra grande para hover
- `gold` — Sombra dourada para CTAs

### 14.5 Animações

- Accordion, fade-in, fade-up, slide-in-right, shimmer (skeleton loading)
- Framer Motion para: hover scale, scroll reveal, stagger, page transitions

### 14.6 Classes Utilitárias Custom

```css
.container-wide     /* max-w-[1600px] responsivo */
.container-narrow   /* max-w-4xl responsivo */
.section-padding    /* py-16 md:py-24 lg:py-32 */
.text-gradient-gold /* Gradiente dourado em texto */
.card-hover         /* Hover com shadow + translate */
.link-underline     /* Underline animado */
.skeleton           /* Shimmer loading */
.focus-ring         /* Ring de foco acessível */
.scrollbar-hide     /* Esconder scrollbar */
```

---

## 15. FUNCIONALIDADES ESPECÍFICAS

### 15.1 Dados de Contacto Centralizados

`src/lib/company.ts` — Single source of truth para:
- Nome da empresa, email, telefone, telemóvel, morada, horário, redes sociais
- Importado em todas as páginas legais, footer, contacto, about, SEO, emails, admin

### 15.2 Cookie Consent (RGPD)

- Banner com 3 opções: aceitar todos, rejeitar, configurar
- Categorias: necessários, analíticos, marketing
- Persistido em `localStorage` (`covialvi_cookie_consent`)
- Botão "Configurar Cookies" no footer

### 15.3 Dark Mode

- 3 opções: claro, escuro, sistema
- Gerido por `next-themes` com classe CSS
- CSS variables HSL para todas as cores
- Sem flash de tema (SSR-safe com `suppressHydrationWarning`)

### 15.4 Internacionalização

- `next-intl` configurado para PT-PT
- Mensagens em `src/messages/`
- Middleware deteta locale

### 15.5 Localização Portuguesa

`src/lib/portugal-locations.ts` — 17KB de dados com:
- Todos os distritos de Portugal
- Municípios por distrito
- Freguesias por município
- Usado nos filtros de pesquisa e formulários de imóveis

### 15.6 Simulador de Crédito

- Cálculo de prestação mensal
- Inputs: valor do imóvel, entrada, taxa de juro, prazo
- Tabela de amortização

### 15.7 Wizard "Vender Imóvel"

- Modal multi-step (38KB)
- Steps: tipo de imóvel → localização → características → contacto
- Submete como lead

### 15.8 WhatsApp Button

- Botão flutuante no canto inferior direito
- Link direto para WhatsApp com mensagem pré-preenchida

### 15.9 Geração de PDF/Ficha

- Route handler que gera HTML estilizado da ficha do imóvel
- Inclui: imagem, detalhes, preço, características, QR code, contactos
- Pode ser impresso como PDF pelo browser

### 15.10 Google Calendar Integration

- `src/lib/google-calendar.ts` — Integração com Google Calendar API
- Criar eventos de visitas automaticamente no calendário do consultor

---

## 16. CHECKLIST PARA NOVO PROJETO (Template)

### 16.1 Setup Inicial

- [ ] Clonar repositório base
- [ ] `npm install`
- [ ] Criar projeto Supabase
- [ ] Copiar `.env.example` → `.env.local` e preencher chaves
- [ ] Executar migrações: `npm run db:migrate`
- [ ] Gerar tipos: `npm run db:generate`
- [ ] Criar primeiro admin via SQL: `UPDATE profiles SET role = 'super_admin' WHERE email = '...'`

### 16.2 Personalização

- [ ] Atualizar `src/lib/company.ts` com dados do novo cliente
- [ ] Atualizar logo (URL ou ficheiro em `/public`)
- [ ] Atualizar cores em `globals.css` (CSS variables HSL) e `tailwind.config.ts` (gold scale)
- [ ] Atualizar fonte em `layout.tsx` se necessário
- [ ] Atualizar textos das páginas públicas
- [ ] Atualizar `portugal-locations.ts` se necessário
- [ ] Atualizar metadata SEO em `layout.tsx`
- [ ] Atualizar structured data em `structured-data.tsx`
- [ ] Atualizar `sitemap.ts` e `robots.ts` com novo domínio
- [ ] Configurar Resend com domínio verificado
- [ ] Configurar Google Maps API key

### 16.3 Deploy

- [ ] Configurar variáveis de ambiente no Vercel/Netlify
- [ ] Verificar build: `npm run build`
- [ ] Verificar tipos: `npm run typecheck`
- [ ] Fazer deploy
- [ ] Verificar domínio custom
- [ ] Testar auth flow completo (registo, login, logout)
- [ ] Testar admin panel
- [ ] Testar formulário de contacto + email
- [ ] Testar agendamento de visitas
- [ ] Verificar SEO (sitemap, robots, structured data)

---

## 17. DEPENDÊNCIAS COMPLETAS

### Produção (dependencies)

```
@hookform/resolvers    — Resolvers para react-hook-form (zod)
@radix-ui/*            — 16 pacotes de componentes primitivos (accordion, dialog, select, tabs, etc.)
@react-pdf/renderer    — Geração de PDF
@sentry/nextjs         — Error tracking
@supabase/auth-helpers-nextjs — Auth helpers (legacy)
@supabase/ssr          — Auth SSR (cookies)
@supabase/supabase-js  — Cliente Supabase
@tanstack/react-query  — Data fetching/caching
@tanstack/react-table  — Tabelas admin
@vercel/analytics      — Analytics
@vercel/speed-insights — Core Web Vitals
class-variance-authority — Variantes de estilo (cva)
clsx                   — Merge de classes
cmdk                   — Command palette
date-fns               — Manipulação de datas
framer-motion          — Animações
lucide-react           — Ícones
next                   — Framework
next-intl              — Internacionalização
next-themes            — Dark mode
react / react-dom      — UI library
react-day-picker       — Calendário
react-hook-form        — Formulários
recharts               — Gráficos
resend                 — Email
sharp                  — Otimização de imagens
sonner                 — Toasts
tailwind-merge         — Merge inteligente de classes Tailwind
tailwindcss-animate    — Animações Tailwind
zod                    — Validação de schemas
zustand                — Estado global
```

### Desenvolvimento (devDependencies)

```
@playwright/test       — Testes E2E
@testing-library/react — Testes de componentes
@types/node            — Tipos Node.js
@types/react           — Tipos React
@types/react-dom       — Tipos React DOM
autoprefixer           — PostCSS autoprefixer
eslint                 — Linter
eslint-config-next     — Config ESLint Next.js
postcss                — PostCSS
supabase               — Supabase CLI
tailwindcss            — CSS framework
tsx                    — Executor TypeScript para scripts
typescript             — Compilador TypeScript
vitest                 — Testes unitários
```

---

*Este documento serve como referência completa para replicar e adaptar este projeto para novos clientes imobiliários.*
