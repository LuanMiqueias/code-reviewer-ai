📋 Requisitos do Sistema: Code Reviewer AI
🧠 Visão Geral
O Code Reviewer AI é uma plataforma que se conecta com repositórios de código (inicialmente GitHub), analisa automaticamente o código-fonte utilizando agentes de IA (como Gemini ou OpenAI GPT) e sugere melhorias, boas práticas, refatorações e criação de issues diretamente no repositório. A arquitetura será extensível e modular, com foco em personalização por usuário.

⚙️ Stack Tecnológica
Backend: Node.js, Fastify, TypeScript

Banco de Dados: PostgreSQL com Prisma ORM

IA: Gemini (Google) e GPT (OpenAI), com suporte a RAG

Controle de Versão: GitHub (OAuth)

Revisão Automatizada: Análise de código e Pull Requests

Extração de Conhecimento (RAG): Indexação de arquivos com embeddings e busca vetorial

🧑‍💻 Funcionalidades por Módulo

1. 🔐 Autenticação
   Login com OAuth do GitHub

Armazenamento seguro do token de acesso

Permissões mínimas necessárias: leitura/escrita em repositórios e Pull Requests

2. 👤 Módulo de Usuários
   Cadastro e gerenciamento de configurações por usuário

Configuração de:

Linguagens usadas

Arquitetura do projeto (ex: MVC, DDD)

Área de foco: frontend, backend ou ambos

3. 📦 Módulo de Repositórios
   Conexão com repositórios via GitHub API

Listagem e sincronização dos repositórios do usuário

Clonagem local para análise dos arquivos

Extração de caminhos dos arquivos

Leitura e divisão de código em chunks

4. 🧠 Módulo de Análise com IA
   Envio de chunks para análise com IA (Gemini, GPT etc.)

Geração de issues com:

Título

Corpo explicativo com sugestões

Contexto técnico

Criação automática de issues no GitHub via API

Geração em formato JSON para controle interno

5. 🔍 Análise de Pull Requests
   Escuta de eventos de Pull Request (via webhook ou polling)

Análise somente dos arquivos modificados

Sugestões inline (ou fallback para comentário agregado com contexto)

Geração de review automático com botão "Aprovar" ou "Solicitar mudanças"

6. 🧠 RAG - Retrieval-Augmented Generation
   Armazenamento dos códigos em forma vetorial (embeddings)

Integração com um vetor DB como:

PostgreSQL + pgvector

Pinecone, Weaviate ou Qdrant (futuramente)

Uso de contexto dos arquivos do projeto para enriquecer os prompts

Possibilidade de consultar múltiplos arquivos para análise contextual
