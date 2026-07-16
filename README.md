<h1 align="center">MOVVA · GESTÃO DE FROTA</h1>
<p align="center">Aplicação web de gestão de frotas com cadastro de motoristas, veículos e mapa de rastreamento, feita com Angular 19.</p>

<p align="center">
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/angular/angular-original.svg" width="48" height="48" alt="Angular" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" width="48" height="48" alt="TypeScript" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg" width="48" height="48" alt="HTML5" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/sass/sass-original.svg" width="48" height="48" alt="SCSS" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rxjs/rxjs-original.svg" width="48" height="48" alt="RxJS" />
<img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vercel/vercel-original.svg" width="48" height="48" alt="Vercel" />
</p>

<p align="center">
<a href="https://cadastro-frota.vercel.app/login">🔗 acessar o deploy</a>
</p>

## >_ sobre este projeto

Projeto de estudos que implementa a gestão de uma frota: CRUD de motoristas e de veículos, além de um mapa que simula o deslocamento das unidades em tempo real. A proposta foi praticar Angular 19 a fundo — standalone components, Signals, o novo control flow (`@if` / `@for`), formulários reativos com validação de regras brasileiras e composição de serviços.

**Não há backend.** Toda a aplicação roda no frontend: o estado vive em memória com Angular Signals e persiste no `localStorage`. A autenticação é simulada, apenas para exercitar guards e proteção de rotas. É um exercício de arquitetura de frontend, não um produto pronto para produção.

A interface usa Angular Material 3 com um tema customizado nas cores da marca, e SCSS para responsividade — no mobile, as tabelas viram cartões.

## >_ funcionalidades

- **Autenticação simulada** com proteção de rotas (`authGuard` / `guestGuard`) e sessão persistida
- **CRUD de motoristas** com validação de CPF, categoria e validade da CNH
- **CRUD de veículos** com validação de placa (padrão Mercosul e antigo) e vínculo a um motorista
- **Mapa de rastreamento** com simulação de rota sobre as ruas (roteamento OSRM, com fallback linear), rastreamento por GPS do dispositivo, ponto manual e replay do histórico
- **Busca unificada** de motoristas e veículos
- **Tema** claro, escuro ou automático (conforme o sistema), com preferência salva
- **Layout responsivo**, com tabelas que viram cartões no mobile

## >_ tecnologias

- Angular 19 (standalone components, Signals, novo control flow)
- TypeScript
- Angular Material 3
- RxJS
- Leaflet + OSRM (mapa e roteamento por ruas)
- ngx-mask (máscaras de CPF, telefone e CNH)
- HTML
- SCSS
- Vercel (deploy)

## >_ uso de IA

Algumas funcionalidades deste projeto foram desenvolvidas com auxílio de IA. Nada de copiar e colar ou de prompts prontos. Usei como apoio em pontos específicos, como a simulação de rota no mapa e alguns ajustes de tema, sempre revisando e adaptando o resultado ao restante da base. O ganho foi de velocidade: destravou partes que tomariam bem mais tempo e me deixou focar na arquitetura e nas decisões do projeto.

## >_ arquitetura do projeto

```
cadastro-frota/
├── src/
│   ├── app/
│   │   ├── components/           # Telas standalone
│   │   │   ├── login/                    # Tela de login
│   │   │   ├── barra-navegacao/          # Navegação e busca global
│   │   │   ├── lista-motoristas/         # Listagem de motoristas
│   │   │   ├── lista-veiculos/           # Listagem de veículos
│   │   │   ├── formulario-motorista/     # Cadastro e edição de motorista
│   │   │   ├── formulario-veiculo/       # Cadastro e edição de veículo
│   │   │   ├── mapa/                     # Mapa de rastreamento (Leaflet)
│   │   │   └── dialogo-confirmacao/      # Diálogo reutilizável de confirmação
│   │   ├── models/               # Interfaces de domínio (motorista, veículo, auth, geo, tema)
│   │   ├── services/             # Estado global em Signals (CRUD, tema, rastreamento, roteamento, busca)
│   │   ├── validators/           # Regras de negócio reutilizáveis (CPF, placa, validade da CNH)
│   │   ├── guards/               # Proteção de rotas
│   │   ├── directives/           # Máscara de data no padrão brasileiro
│   │   ├── utils/                # Funções puras (busca, geolocalização)
│   │   ├── config/               # Configuração de locale pt-BR
│   │   ├── app.component.*       # Componente raiz da aplicação
│   │   ├── app.config.ts         # Providers da aplicação
│   │   └── app.routes.ts         # Definição das rotas
│   ├── styles/                   # Paleta e tema do Angular Material
│   ├── styles.scss               # Estilos globais
│   ├── index.html                # HTML base
│   └── main.ts                   # Ponto de entrada da aplicação
├── public/                       # Imagens e recursos estáticos
├── angular.json                  # Configurações do Angular CLI
├── package.json                  # Dependências e scripts
├── tsconfig.json                 # Configurações do TypeScript
└── vercel.json                   # Configuração do deploy
```

## >_ como clonar e rodar

Pré-requisitos: [Node.js 22](https://nodejs.org/) (veja o `.nvmrc`) e o [Angular CLI](https://angular.dev/tools/cli) instalados.

Clone o repositório e entre na pasta do projeto:

```bash
git clone https://github.com/rafaelrossmanndev/cadastro-frota.git
cd cadastro-frota
```

Instale as dependências e inicie o servidor de desenvolvimento:

```bash
npm install
npm start
```

Depois, acesse http://localhost:4200 no navegador — a aplicação redireciona para `/login`.

## >_ credenciais de teste

| Usuário | Senha      |
| ------- | ---------- |
| `admin` | `admin123` |
