# 🚚 Movva · Gestão de Frota

Aplicação web da **Movva** para **Gestão de Frotas** (cadastro de Motoristas e Veículos). Ela foi desenvolvida para rodar 100% no frontend (dados salvos em memória e simulados de forma reativa).

Acesse a aplicação online hospedada na Vercel: **[https://cadastro-frota.vercel.app/](https://cadastro-frota.vercel.app/)**

---

## 🎨 Identidade Visual

A identidade da Movva é aplicada de forma fixa em toda a aplicação. Os assets ficam em `public/`:
* **`movva-logo.svg`** — ícone da marca, usado como favicon da aba.
* **`movva-lockup.svg`** — logotipo com wordmark, exibido no header e na tela de login.

A paleta de cores é derivada de três cores-base definidas em `src/styles.scss` (todos os demais tons — hover, container, gradiente, variante escura — saem delas via `color-mix()`):
* **Primária (Azul):** `#2e6ef5`
* **Sucesso (Verde):** `#26a269`
* **Perigo (Vermelho):** `#e5484d`

Há também um seletor de **tema** (claro / escuro / automático conforme o sistema) no header, com a preferência persistida em `localStorage`.

---

## 📱 Responsividade & UI/UX Mobile

A aplicação foi completamente adaptada para dispositivos móveis seguindo as melhores práticas de design de interface:
* **Transformação de Tabelas em Cartões:** Em telas pequenas (< 768px), as tabelas de listagem (`lista-motoristas` e `lista-veiculos`) deixam de ser exibidas no formato clássico de linhas horizontais e são dinamicamente transformadas em **cartões empilhados verticais** com bordas arredondadas e divisores dashed. Isso é feito via CSS puro (`display: block` nas tags de tabela + atributos `data-label` gerando legendas), proporcionando excelente legibilidade.
* **Barra de Navegação Adaptável:** No celular, os textos dos botões são removidos, mantendo apenas o logotipo da Movva e os ícones correspondentes para preservar o espaço horizontal.
* **Formulários Responsivos:** Os formulários de cadastro possuem preenchimento de tela cheia em dispositivos menores, e os botões de ação ("Salvar" e "Cancelar") são empilhados verticalmente em ordem lógica reversa, facilitando o toque com o polegar.

---

## 🔒 Arquitetura de Autenticação (Simulação Real)

A aplicação conta com um sistema de login simulado que emula fielmente o fluxo de uma arquitetura Angular corporativa real:

1. **Serviço de Autenticação (`auth.service.ts`):** 
   * Controla o estado de autenticação de forma centralizada utilizando **Signals** do Angular 19 (`isAuthenticated` e `usuarioLogado` expostos de forma somente leitura).
   * O método de login retorna um `Observable<boolean>` do RxJS simulando um atraso de rede de 1.2 segundos para demonstrar estados de carregamento (spinner/progress bar).
   * Persiste o estado do usuário logado no `localStorage` do navegador para que a sessão não seja perdida ao recarregar a página.
2. **Guardião de Rotas (`auth.guard.ts`):** 
   * **`authGuard`**: Protege todas as rotas internas da aplicação (listas e formulários). Caso um usuário não autenticado tente acessá-las, é redirecionado para a tela de login.
   * **`guestGuard`**: Impede que um usuário já autenticado acesse a tela de login `/login`, redirecionando-o automaticamente para `/motoristas`.
3. **Tela de Login (`login.component.ts`):** 
   * Desenvolvida com formulários reativos (`ReactiveFormsModule`) e Material Design.
   * Contém recurso de revelação/ocultação de senha (botão de olho).
   * Validação visual com mensagens de erro.
   * Exibição de dica contendo as credenciais de teste para o avaliador.

### 🔑 Credenciais para Teste
* **Usuário:** `admin`
* **Senha:** `admin123`

---

## 🏗️ Estrutura do Projeto & Arquitetura

A arquitetura do projeto segue o padrão de responsabilidade única e desacoplamento em camadas:

```
src/app/
├── models/         # Interfaces de domínio (motorista, veiculo, auth)
├── services/       # Serviços centralizados com dados em memória usando Signals
├── validators/     # Validadores de regras de negócio (CPF, Placas no padrão Mercosul e antigo, validade CNH)
├── guards/         # Guardiões de rotas (authGuard, guestGuard)
└── components/
    ├── barra-navegacao/ # Barra de ferramentas com links e menu de perfil
    ├── login/           # Tela de autenticação
    ├── lista-motoristas/
    ├── formulario-motorista/
    ├── lista-veiculos/
    └── formulario-veiculo/
```

* **Models:** Apenas descrevem as estruturas dos dados (`interfaces` e `types`).
* **Services:** Centralizam e controlam a manipulação do estado global do app (CRUDs usando Signals). Nenhum componente duplica ou gerencia dados originais diretamente.
* **Validators:** Funções TypeScript puras (`ValidatorFn`) reaproveitáveis que validam campos sem misturar regras de negócio ao arquivo do componente.
* **Guards:** Controlam os fluxos de acesso a nível de rotas.
* **Components:** Componentes Standalone focados estritamente na interface do usuário (UI) e orquestração.

---

## 🛠️ Tecnologias Utilizadas

* **Angular 19** (Standalone Components, Signals, Novo Control Flow `@if`/`@for`).
* **Angular Material 3** (Customizado a partir das cores da marca Movva).
* **RxJS** (para fluxos de carregamento assíncronos e reatividade).
* **ngx-mask** (máscaras de telefone, CPF e CNH).
* **Sass (SCSS)** (para folha de estilos estruturada e responsividade por media queries).

---

## 🚀 Como Executar Localmente

### Pré-requisitos
Certifique-se de possuir o **Node 22** instalado (consulte o arquivo `.nvmrc` se utilizar um gerenciador de versão).

### Passo a Passo

1. Instale as dependências do projeto:
   ```bash
   npm install
   ```

2. Execute o servidor de desenvolvimento local:
   ```bash
   npm run start
   ```

3. Acesse em seu navegador:
   ```
   http://localhost:4200
   ```
   A rota padrão do sistema redirecionará você para `/login`. Utilize as credenciais `admin` / `admin123` para acessar as listagens de Motoristas e Veículos.
