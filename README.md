# Movva · Gestão de Frota

Aplicação web para gestão de frotas: cadastro de **motoristas** e **veículos**, com um **mapa de rastreamento** que simula o deslocamento das unidades em tempo real. Roda inteiramente no frontend — os dados vivem em memória (via Angular Signals) e persistem no `localStorage`, sem backend.

🔗 **Deploy:** https://cadastro-frota.vercel.app/login

## Funcionalidades

- **Autenticação simulada** com proteção de rotas (`authGuard` / `guestGuard`) e sessão persistida.
- **CRUD de motoristas** com validação de CPF, categoria e validade de CNH.
- **CRUD de veículos** com validação de placa (padrão Mercosul e antigo) e vínculo a um motorista.
- **Mapa de rastreamento** (Leaflet): simulação de rota sobre as ruas (roteamento OSRM, com fallback linear), rastreamento por GPS do dispositivo, ponto manual e replay do histórico.
- **Busca unificada** de motoristas e veículos.
- **Tema** claro, escuro ou automático (conforme o sistema), com preferência salva.
- **Layout responsivo**: tabelas viram cartões no mobile.

## Stack

- **Angular 19** — standalone components, Signals e novo control flow (`@if` / `@for`)
- **Angular Material 3** — tema customizado com as cores da marca Movva
- **RxJS** — fluxos assíncronos e reatividade
- **Leaflet** + **OSRM** — mapa e roteamento por ruas
- **ngx-mask** — máscaras de CPF, telefone e CNH
- **Sass (SCSS)** — estilos e responsividade

## Credenciais de teste

| Usuário | Senha      |
| ------- | ---------- |
| `admin` | `admin123` |

## Executando localmente

Requer **Node 22** (veja o `.nvmrc`).

```bash
npm install
npm start
```

Acesse `http://localhost:4200` — a aplicação redireciona para `/login`.

## Estrutura

```
src/app/
├── models/       # Interfaces de domínio (motorista, veículo, auth, geo)
├── services/     # Estado global em Signals (CRUD, tema, rastreamento, roteamento, busca)
├── validators/   # Regras de negócio reutilizáveis (CPF, placa, validade da CNH)
├── guards/       # Proteção de rotas
├── directives/   # Máscara de data no padrão brasileiro
├── utils/        # Funções puras (busca, geolocalização)
└── components/   # Telas standalone (login, listas, formulários, mapa, navegação)
```
