# 🤖 Code Reviewer AI

Code Reviewer AI é uma plataforma inteligente que conecta repositórios do GitHub e Bitbucket para realizar revisões automáticas de código com auxílio de IA. Ideal para detectar problemas de segurança, performance, estilo e arquitetura em tempo real, tanto em pushes quanto em pull requests.

---
## 📡 API - Endpoints

| Método | Rota                                         | Descrição                                                                 | Protegido por JWT |
|--------|----------------------------------------------|---------------------------------------------------------------------------|-------------------|
| POST   | `/auth/register`                             | Criação de usuário manual                                                | ❌                |
| POST   | `/auth/login`                                | Login com e-mail e senha                                                 | ❌                |
| POST   | `/auth/github`                               | Redireciona para autenticação com GitHub                                 | ❌                |
| POST   | `/auth/github/callback`                      | Callback do OAuth do GitHub                                              | ❌                |
| GET    | `/projects/list/external-repos`              | Lista repositórios externos do usuário autenticado                       | ✅                |
| POST   | `/projects/create/connection/:repoName`      | Cria conexão entre a plataforma e um repositório externo                 | ✅                |
| POST   | `/projects/create/settings/:repoName`        | Cria ou atualiza configurações do projeto para revisão                   | ✅                |
| GET    | `/projects/analyze/repo/:repoName`           | Analisa o repositório completo e gera _issues_ com base na IA            | ✅                |
| GET    | `/projects/create/context/:repoName`         | Cria embeddings (contexto vetorial) do repositório                       | ✅                |
| POST   | `/webhook/github/pull-request`               | Webhook para receber eventos de Pull Requests do GitHub                  | ❌ (Webhook)      |


---
## ✨ Funcionalidades

- 🔐 **Autenticação via OAuth (GitHub e Bitbucket)**
- 🔗 **Conexão com múltiplos repositórios**
- 📁 **Listagem paginada de repositórios**
- 🤖 **Revisão automática de código com IA**
- 📄 **Criação automática de _issues_ com sugestões e alertas**
- 🧠 **Evita duplicações com RAG e vetores de embeddings (via Gemini)**
- 🔄 **Análise de Pull Requests via Webhooks**
- 📦 **Suporte a múltiplos projetos com configurações customizadas**
- 🧹 **Limpeza automática de arquivos temporários após análise**

---

## 🚀 Tecnologias

- **Node.js**, **TypeScript**
- **Fastify**
- **Prisma ORM** + **PostgreSQL**
- **pgvector** (armazenamento vetorial)
- **Google Gemini** para geração de embeddings e análise de código
- **GitHub REST API v3**
- **Bitbucket API** (em breve)

---

## 🧠 IA e Embeddings

A plataforma utiliza **Gemini 1.5** para gerar embeddings vetoriais dos trechos de código e armazená-los com **pgvector**, permitindo:

- Evitar _issues_ duplicadas
- Consultar problemas semelhantes no histórico
- Melhorar o contexto da análise com RAG (_retrieval-augmented generation_)

---

## 🛠️ Como rodar localmente
### 1. Clone o projeto

```bash
git clone https://github.com/seu-usuario/code-reviewer-ai.git
cd code-reviewer-ai
```
### 2. Instale as dependências

```
yarn install
```

### 3. Configure o .env
Crie um arquivo .env baseado em .env.example:


### 4. Rode as migrations e o servidor

```
npx prisma migrate dev
npm run dev
```

# 🛣️ Roadmap

---

## Próximos Passos e Evoluções 🚀

Objetivo é tornar a análise de código ainda mais inteligente e integrada.

### Fase 1: Aprimoramento da Experiência e Análise

* **✅ Login e Autenticação Aprimorados com GitHub**:
    * Vamos refinar o fluxo de **login e autenticação OAuth com o GitHub**, buscando uma integração mais fluida e segura.
* **✅ Análise Abrangente de Repositórios Conectados**:
    * Expandiremos as capacidades de análise para **repositórios inteiros** que já estiverem conectados à plataforma, oferecendo uma visão completa do seu código.
* **✅ Embeddings para Prevenção de Duplicações**:
    * Utilizaremos **embeddings de código** para identificar e evitar a duplicação de "issues" ou análises repetitivas, otimizando o processo e garantindo feedbacks mais relevantes.
* **✅ Suporte Completo a Pull Requests (PRs)**:
    * Aprimoraremos a funcionalidade de análise em **Pull Requests**, garantindo que os feedbacks da IA sejam integrados de forma eficaz ao seu fluxo de trabalho de desenvolvimento.

### Fase 2: Expansão e Visualização

* **🕗 Suporte Completo ao Bitbucket**:
    * Adicionaremos **suporte total ao Bitbucket** como provedor de repositórios, para que usuários com projetos nessa plataforma também possam aproveitar nossa análise de código com IA.
* **🕗 Painel Web Intuitivo com Feedbacks dos Reviews**:
    *Será possivel visualizar e gerenciar facilmente os feedbacks das análises de código.
* **🕗 Histórico Completo de Análises por Projeto**:
    * Funcionalidade para registrar e exibir o **histórico detalhado de todas as análises** realizadas para cada projeto, sendo possivel acompanhar a evolução da qualidade do código ao longo do tempo.
