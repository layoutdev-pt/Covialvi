# Covialvi - Plataforma Imobiliária

Uma aplicação web imobiliária moderna e completa para a Covialvi (Portugal), construída com Next.js 14, React, TypeScript, Tailwind CSS e Supabase.

## 🏠 Visão Geral

A Covialvi é uma plataforma imobiliária de produção que inclui:

- **Site Público**: Página inicial, listagem de imóveis, páginas de detalhe com SEO otimizado
- **Área de Utilizador**: Autenticação, favoritos, agendamento de visitas, gestão de perfil
- **Backoffice Admin**: Dashboard com KPIs, gestão de imóveis, CRM com pipeline Kanban, gestão de visitas
- **Integrações**: Google Calendar para sincronização de visitas

## 🚀 Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilos**: Tailwind CSS + shadcn/ui
- **Base de Dados**: Supabase (PostgreSQL)
- **Autenticação**: Supabase Auth
- **Armazenamento**: Supabase Storage
- **Internacionalização**: next-intl (PT-PT por defeito)
- **Formulários**: React Hook Form + Zod
- **Estado**: Zustand + TanStack Query

## 📁 Estrutura do Projeto

```
covialvi/
├── src/
│   ├── app/                    # App Router pages
│   │   ├── (public)/           # Páginas públicas
│   │   ├── admin/              # Backoffice admin
│   │   ├── auth/               # Autenticação
│   │   └── conta/              # Área do utilizador
│   ├── components/
│   │   ├── layout/             # Header, Footer
│   │   ├── properties/         # Componentes de imóveis
│   │   ├── providers/          # Context providers
│   │   └── ui/                 # Componentes UI (shadcn)
│   ├── lib/
│   │   ├── supabase/           # Clientes Supabase
│   │   ├── database.types.ts   # Tipos da BD
│   │   └── utils.ts            # Utilitários
│   ├── messages/               # Traduções i18n
│   ├── middleware.ts           # Middleware de autenticação
│   └── i18n.ts                 # Configuração i18n
├── supabase/
│   └── migrations/             # Migrações SQL
├── public/                     # Assets estáticos
└── package.json
```

## 🛠️ Instalação

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Conta Supabase

### 1. Clonar o repositório

```bash
git clone https://github.com/covialvi/covialvi-web.git
cd covialvi-web
```

### 2. Instalar dependências

```bash
npm install
```

### 3. Configurar variáveis de ambiente

Copie o ficheiro `.env.example` para `.env.local`:

```bash
cp .env.example .env.local
```

Preencha as variáveis:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Covialvi

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=sua-api-key

# Email (SendGrid)
SENDGRID_API_KEY=sua-api-key
SENDGRID_FROM_EMAIL=noreply@covialvi.com
```

### 4. Configurar Supabase

#### Criar projeto no Supabase

1. Aceda a [supabase.com](https://supabase.com) e crie um novo projeto
2. Copie as credenciais para o `.env.local`

#### Executar migrações

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Ligar ao projeto
supabase link --project-ref seu-project-ref

# Executar migrações
supabase db push
```

Ou execute manualmente os ficheiros SQL em `supabase/migrations/` no SQL Editor do Supabase.

### 5. Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

Aceda a [http://localhost:3000](http://localhost:3000)

## 📦 Scripts Disponíveis

```bash
npm run dev          # Servidor de desenvolvimento
npm run build        # Build de produção
npm run start        # Iniciar servidor de produção
npm run lint         # Executar ESLint
npm run typecheck    # Verificar tipos TypeScript
npm run test         # Executar testes
npm run test:e2e     # Executar testes E2E
npm run db:migrate   # Executar migrações Supabase
npm run db:generate  # Gerar tipos da BD
```

## 🗄️ Base de Dados

### Tabelas Principais

| Tabela | Descrição |
|--------|-----------|
| `profiles` | Perfis de utilizador (extensão auth.users) |
| `properties` | Imóveis |
| `property_images` | Imagens dos imóveis |
| `property_floor_plans` | Plantas dos imóveis |
| `favorites` | Favoritos dos utilizadores |
| `leads` | Contactos/Leads CRM |
| `visits` | Visitas agendadas |
| `crm_notes` | Notas internas CRM |
| `audit_logs` | Logs de auditoria |
| `user_sessions` | Sessões de utilizador |
| `saved_searches` | Pesquisas guardadas |
| `notifications` | Notificações in-app |
| `google_tokens` | Tokens OAuth Google Calendar |

### Row Level Security (RLS)

Todas as tabelas têm políticas RLS configuradas:

- **Utilizadores**: Acesso apenas aos próprios dados
- **Admins**: Acesso a todos os dados
- **Super Admins**: Acesso total + eliminação

## 🔐 Autenticação

### Fluxos Implementados

- Registo com e-mail/password
- Login com e-mail/password
- Verificação de e-mail
- Recuperação de password
- Gestão de sessões

### Roles

| Role | Permissões |
|------|------------|
| `user` | Favoritos, visitas, perfil |
| `admin` | Gestão de imóveis, leads, visitas |
| `super_admin` | Tudo + gestão de utilizadores |

## 🌍 Internacionalização

A aplicação suporta múltiplos idiomas com PT-PT como idioma principal:

- **pt**: Português (Portugal) - Padrão
- **en**: Inglês
- **es**: Espanhol
- **fr**: Francês

A deteção de idioma é automática por IP (país).

## 🎨 Design System

### Cores

- **Primary**: Gold (#c9a227)
- **Background**: White (#ffffff)
- **Foreground**: Dark Gray (#1a1a2e)

### Tipografia

- **Sans**: Inter
- **Display**: Playfair Display

### Componentes

Baseado em shadcn/ui com customizações:

- Button, Input, Label
- Card, Badge, Dialog
- Select, Skeleton
- Toast (Sonner)

## 📱 Responsividade

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

## 🚀 Deploy

### Vercel (Recomendado)

1. Conecte o repositório GitHub ao Vercel
2. Configure as variáveis de ambiente
3. Deploy automático em cada push

```bash
# Ou via CLI
npm i -g vercel
vercel
```

### Variáveis de Ambiente no Vercel

Configure todas as variáveis do `.env.example` nas Settings do projeto.

## 🔒 Segurança

- HTTPS obrigatório
- Headers de segurança (CSP, HSTS, X-Frame-Options)
- RLS em todas as tabelas
- Validação com Zod
- Sanitização de inputs
- Rate limiting (a implementar)

## 📊 GDPR

### Funcionalidades Implementadas

- **Exportação de dados**: Utilizadores podem exportar todos os seus dados
- **Eliminação de conta**: Soft delete com período de retenção
- **Gestão de consentimentos**: Marketing e alertas
- **Política de Privacidade**: Página dedicada em PT-PT
- **Cookie Consent**: Banner de consentimento

### Como Exportar Dados

1. Aceder a Conta > Privacidade
2. Clicar em "Exportar os Meus Dados"
3. Download automático em JSON

### Como Eliminar Conta

1. Aceder a Conta > Privacidade
2. Clicar em "Eliminar Conta"
3. Confirmar eliminação
4. Dados retidos por 30 dias antes de eliminação permanente

## 🧪 Testes

```bash
# Testes unitários
npm run test

# Testes E2E
npm run test:e2e
```

## 📅 Google Calendar Integration

A plataforma integra com Google Calendar para sincronização automática de visitas.

### Funcionalidades

- **OAuth 2.0**: Autenticação segura com Google
- **Sincronização automática**: Visitas criadas aparecem no calendário
- **Atualização em tempo real**: Alterações refletidas no Google Calendar
- **Cancelamento**: Eventos removidos quando visitas são canceladas

### Configuração

1. Adicione as variáveis de ambiente:
```env
GOOGLE_CLIENT_ID=seu-client-id
GOOGLE_CLIENT_SECRET=seu-client-secret
GOOGLE_API_KEY=sua-api-key
```

2. Configure o redirect URI no Google Cloud Console:
```
{NEXT_PUBLIC_APP_URL}/api/auth/google/callback
```

3. Ative a Google Calendar API no Google Cloud Console

4. Conecte o calendário em Admin > Definições > Google Calendar

## 📈 Performance

Objetivos Lighthouse:

- Performance: > 90
- Accessibility: > 90
- Best Practices: > 90
- SEO: > 90

### Otimizações

- Server Components por defeito
- Image optimization (AVIF/WebP)
- Lazy loading
- ISR para páginas de imóveis
- Skeleton loading states para UX melhorada

## ♿ Acessibilidade

- ARIA labels em elementos interativos
- Focus rings visíveis para navegação por teclado
- Anúncio de erros em formulários (role="alert")
- Contraste de cores WCAG AA
- Labels descritivos para screen readers

## 🤝 Contribuição

1. Fork do repositório
2. Criar branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit (`git commit -m 'Adicionar nova funcionalidade'`)
4. Push (`git push origin feature/nova-funcionalidade`)
5. Abrir Pull Request

## 📄 Licença

Propriedade de Covialvi. Todos os direitos reservados.

## 📞 Suporte

- **Email**: suporte@covialvi.com
- **Telefone**: +351 275 000 000

---

Desenvolvido com ❤️ em Portugal
