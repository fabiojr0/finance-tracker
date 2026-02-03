# Finance Tracker - Visão Geral do Projeto

## Descrição
Aplicação web moderna e minimalista para monitoramento de finanças pessoais, desenvolvida com Next.js 15, TypeScript, Tailwind CSS e Supabase.

## Objetivo
Permitir que usuários gerenciem suas finanças pessoais de forma simples, intuitiva e visualmente agradável, com foco em:
- Controle de receitas e despesas
- Categorização de transações
- Visualização de saldo e estatísticas
- Relatórios e gráficos (em desenvolvimento)

## Stack Tecnológico

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Formulários**: React Hook Form + Zod

### Backend
- **BaaS**: Supabase
  - PostgreSQL (Database)
  - Authentication (Email/Password)
  - Row Level Security (RLS)

### Bibliotecas Auxiliares
- **date-fns**: Manipulação e formatação de datas (locale pt-BR)
- **recharts**: Gráficos e visualizações (planejado)
- **clsx + tailwind-merge**: Gerenciamento de classes CSS

## Design System

### Paleta de Cores
- **Primária**: Laranja (#f97316)
- **Neutra**: Escala de cinza/preto (#171717 a #fafafa)
- **Semântica**:
  - Sucesso: Verde (#22c55e)
  - Erro: Vermelho (#ef4444)

### Princípios de Design
- Minimalista e clean
- Mobile-first
- Acessível (WCAG AA)
- Responsivo em todos os breakpoints

## Funcionalidades Implementadas

### Autenticação
- ✅ Login com email/senha
- ✅ Cadastro de novos usuários
- ✅ Logout
- ✅ Proteção de rotas via middleware
- ❌ Recuperação de senha (planejado)

### Dashboard
- ✅ Visão geral financeira (saldo, receitas, despesas)
- ✅ Cards de estatísticas
- ❌ Gráficos interativos (planejado)
- ❌ Transações recentes (integração pendente)

### Transações
- ✅ Listagem de transações
- ✅ Criação de transações (receita/despesa)
- ✅ Exclusão de transações
- ❌ Edição de transações (planejado)
- ❌ Filtros e busca (planejado)
- ❌ Transações recorrentes (planejado)

### Categorias
- ✅ Listagem de categorias (receitas e despesas separadas)
- ✅ Criação de categorias personalizadas
- ✅ Exclusão de categorias (soft delete)
- ✅ Categorias padrão criadas automaticamente
- ❌ Edição de categorias (planejado)

### Relatórios
- ❌ Gráfico de gastos por categoria (placeholder)
- ❌ Gráfico de receitas vs despesas (placeholder)
- ❌ Comparação mensal (placeholder)

### Configurações
- ❌ Edição de perfil (placeholder)
- ❌ Preferências de moeda (placeholder)
- ❌ Exclusão de conta (placeholder)

## Estrutura de Dados (Supabase)

### Tabelas Principais
1. **profiles**: Perfis de usuário
2. **categories**: Categorias de transações
3. **transactions**: Transações financeiras
4. **budgets**: Orçamentos (planejado)

### Segurança
- Row Level Security (RLS) habilitado em todas as tabelas
- Políticas garantem que usuários só acessem seus próprios dados
- Trigger automático para criar perfil e categorias padrão

## Próximos Passos
1. Implementar edição de transações
2. Adicionar filtros e busca nas transações
3. Implementar gráficos com Recharts
4. Adicionar suporte a transações recorrentes
5. Implementar funcionalidade de orçamentos
6. Adicionar dark mode
7. PWA support
8. Exportação para CSV/PDF
