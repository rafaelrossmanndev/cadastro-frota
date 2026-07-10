---
name: Movva · Gestão de Frota
description: Painel de bordo para cadastro e rastreamento de frota, em tema claro e escuro.
colors:
  signal-blue: "#2e6ef5"
  signal-blue-lifted: "#5c8ef7"
  signal-blue-text-light: "#2261e7"
  signal-blue-text-dark: "#4b86fe"
  success-light: "#067a4b"
  success-dark: "#26a269"
  danger-light: "#ca2c37"
  danger-dark: "#f25457"
  bg-light: "#f4f6fb"
  surface-light: "#ffffff"
  surface-raised-light: "#eaecf5"
  ink-light: "#0d1020"
  ink-muted-light: "#4a5068"
  outline-light: "#d0d5e8"
  bg-dark: "#0b0b0b"
  surface-dark: "#141414"
  surface-raised-dark: "#242424"
  ink-dark: "#ffffff"
  ink-muted-dark: "#b4b9c9"
  outline-dark: "#3a3a3a"
typography:
  headline:
    fontFamily: "Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1.8rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "normal"
  title:
    fontFamily: "Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1.15rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
  overline:
    fontFamily: "Roboto, 'Helvetica Neue', sans-serif"
    fontSize: "0.72rem"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.04em"
rounded:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
components:
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "40px"
  button-primary-hover:
    backgroundColor: "{colors.signal-blue-lifted}"
  button-danger:
    backgroundColor: "{colors.danger-light}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "40px"
  button-outlined:
    backgroundColor: "transparent"
    textColor: "{colors.signal-blue}"
    rounded: "{rounded.pill}"
    padding: "0 24px"
    height: "40px"
  input-search:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.pill}"
    padding: "0 6px 0 14px"
    height: "44px"
  plate:
    textColor: "{colors.signal-blue-text-light}"
  card:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.md}"
    padding: "16px"
  list-item:
    backgroundColor: "{colors.surface-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.md}"
    padding: "12px 14px"
  list-item-selected:
    backgroundColor: "{colors.surface-raised-light}"
    textColor: "{colors.signal-blue}"
  detail-row:
    backgroundColor: "{colors.surface-raised-light}"
    textColor: "{colors.ink-light}"
    rounded: "{rounded.sm}"
    padding: "8px 12px"
  nav-link-active:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.surface-light}"
    rounded: "{rounded.pill}"
    padding: "0 16px"
    height: "36px"
---

# Design System: Movva · Gestão de Frota

## 1. Overview

**Creative North Star: "O Painel de Bordo"**

Um painel de bordo se lê de relance. O motorista não estuda o velocímetro; ele o consulta enquanto faz outra coisa. Esse é o contrato deste sistema: hierarquia forte o bastante para que a informação crítica chegue primeiro, alvos generosos o bastante para o polegar, e nenhum elemento competindo com o dado que importa. A interface não é o assunto. A frota é.

A densidade existe, mas sempre a serviço da leitura. Uma tabela de motoristas no desktop vira uma pilha de cartões no celular porque a mesma informação precisa sobreviver à mudança de contexto, não porque cartões são bonitos. O azul é a única cor de marca e aparece pouco: onde ele está, alguma coisa é acionável, atual ou selecionada. Todo o resto é neutro, e os neutros carregam um traço de azul (não de calor) porque a marca é fria.

O sistema rejeita, explicitamente: o **template Material cru**, com as cores e formas de fábrica do Angular Material; o **dashboard SaaS genérico**, de cards de métrica gigante e gradientes decorativos; o **ERP corporativo legado**, cinza sobre cinza e denso sem hierarquia; e a **landing page de startup**, com hero enorme, eyebrow em caps e seções numeradas. O framework deve desaparecer atrás da marca.

**Key Characteristics:**
- Uma única família tipográfica (Roboto), em escala fixa em `rem` — nunca fluida.
- Um único acento cromático (`#2e6ef5`), reservado a ação, seleção e estado.
- Neutros levemente azulados; profundidade por tom antes de sombra.
- Tema claro e escuro nativos, via `light-dark()` sobre tokens — jamais cor hardcoded.
- Responsividade estrutural (tabela vira cartão, nav vira hambúrguer), não tipografia elástica.

## 2. Colors

Uma paleta fria e quase monocromática, em que a saturação é um recurso escasso: três cores dizem algo e todo o resto se cala.

### Primary
- **Azul Sinal** (`#2e6ef5`): a única cor de marca. Aparece em ação primária (botões `Salvar`, `Novo motorista`), no item de navegação atual, no item de lista selecionado, na placa do veículo e no anel de foco. No tema escuro, clareia para **Azul Sinal Elevado** (`#5c8ef7`) para manter contraste sobre superfícies quase pretas.

### Secondary
Não existe. O sistema tem um acento e apenas um. A paleta tonal do Material inteira (primary, secondary, tertiary) é gerada a partir do `#2e6ef5`, então nenhum token herdado traz um matiz que ninguém escolheu.

### Tertiary
- **Verde Validade** (`#26a269` como âncora de matiz): exclusivo de estado de sucesso — uma CNH dentro do prazo, o GPS ativo.
- **Vermelho Vencimento** (`#e5484d` como âncora de matiz): exclusivo de estado de erro ou risco — uma CNH vencida, uma exclusão, um roteamento indisponível.

Nenhum dos dois é cor de marca. São vocabulário semântico, e só aparecem acompanhados de texto.

**As âncoras não são cores de texto.** Nem o verde nem o vermelho nem o Azul Sinal alcançam 4.5:1 sobre superfície clara. Cada um tem um par claro/escuro resolvido em OKLCH — matiz e croma preservados, luminosidade deslocada — que cumpre 4.5:1 contra superfície, linha zebrada e superfície elevada nos dois temas: `--app-cor-sucesso`, `--app-cor-perigo` e `--app-cor-primaria-texto`. Alterar um desses valores sem refazer a conta quebra a WCAG AA.

### Neutral
- **Névoa Azulada** (`#f4f6fb` claro / `#0b0b0b` escuro): o fundo da aplicação, atrás de tudo.
- **Superfície** (`#ffffff` claro / `#141414` escuro): cartões, painéis, campos, linhas de tabela.
- **Superfície Elevada** (`#eaecf5` claro / `#242424` escuro): a camada tonal que distingue cabeçalhos de tabela, linhas de detalhe, o toolbar e o item em hover. É este token — e não a sombra — que constrói a profundidade.
- **Tinta** (`#0d1020` claro / `#ffffff` escuro): texto de corpo, títulos, dados.
- **Tinta Apagada** (`#4a5068` claro / `#b4b9c9` escuro): rótulos, ícones secundários, texto de apoio. Nunca abaixo de 4.5:1 contra a superfície onde repousa.
- **Traço** (`#d0d5e8` claro / `#3a3a3a` escuro): bordas de 1px, divisores, contornos de campo.

### Named Rules

**A Regra do Sinal Único.** O Azul Sinal ocupa no máximo 10% de qualquer tela. Ele marca o que é acionável, o que está selecionado e o que tem foco — nada mais. Um azul usado para "dar vida" a um cabeçalho é um azul que deixou de significar alguma coisa.

**A Regra do Estado Falado.** Nenhum estado se comunica apenas por cor. "Vencida em 10/03/2024" é vermelha *e* diz que venceu. Se apagar a cor da tela e o significado sumir, o estado está mal desenhado.

**A Regra do Token.** Toda cor sai de uma variável CSS resolvida por `light-dark()`. Um hex literal em arquivo de componente é um bug de tema escuro esperando acontecer, não uma escolha estética.

**A Regra da Tinta que Inverte.** No tema escuro a primária e o vermelho clareiam, então a tinta por cima deles escurece (`--mat-sys-on-primary`, `--app-cor-perigo-tinta`). Branco sobre um preenchimento claro entrega 3.15:1, e é o erro mais fácil de cometer ao portar um botão para o escuro.

## 3. Typography

**Display Font:** nenhuma. O sistema não tem fonte de display.
**Body Font:** Roboto (com fallback `'Helvetica Neue', sans-serif`)
**Label/Mono Font:** nenhuma distinta.

**Character:** uma única voz, humanista e neutra, em pesos de 400 a 700. A hierarquia é construída por peso e tamanho, nunca por contraste de família. Roboto não tem personalidade forte, e isso é exatamente o ponto: numa ferramenta, a tipografia que chama atenção para si está atrapalhando.

### Hierarchy
- **Headline** (600, 1.8rem, 1.2): o título de cada tela — "Rastreamento da Frota", "Motoristas". Encolhe para 1.5rem abaixo de 768px, por regra explícita, não por `clamp()`.
- **Title** (600, 1.15rem, 1.3): título de cartão e de painel. No cartão mobile, 1.05rem.
- **Body** (400, 1rem, 1.5): texto corrido e valores de dado. Em linhas de detalhe e células densas, cai para 0.88–0.9rem.
- **Label** (500, 0.85rem, 1.4): rótulos de campo em cartões ("CPF", "Validade da CNH"), sempre em Tinta Apagada, pareados com o valor em Tinta.
- **Overline** (600, 0.72rem, +0.04em, caixa alta): apenas o cabeçalho de grupo dentro de dropdowns de busca ("MOTORISTAS", "VEÍCULOS"). É o **único** lugar onde caixa alta com tracking é permitida.

### Named Rules

**A Regra da Escala Fixa.** Nada de `clamp()` na tipografia. Um usuário de produto está a uma distância constante da tela; um título que encolhe dentro de uma sidebar fica pior, não melhor. Tamanhos em `rem`, mudanças por breakpoint.

**A Regra da Família Única.** Uma família para tudo: títulos, botões, rótulos, dados, tabelas. Pareamento de fontes é gramática de superfície de marca, não de ferramenta.

**A Regra do Eyebrow Proibido.** Caixa alta com tracking acima de cada seção é andaime de landing page. O único uso legítimo é o Overline, dentro de dropdown de resultados.

## 4. Elevation

Profundidade se constrói por **tom, não por sombra**. Uma superfície em repouso — cartão, painel, linha de tabela, toolbar, o container do mapa, o cartão do login — se distingue do fundo por um degrau na escala de cinza-azulado (`Superfície` sobre `Névoa Azulada`, `Superfície Elevada` sobre `Superfície`) e por uma borda de 1px em `Traço`. Nenhuma delas projeta sombra.

A sombra é reservada para o que **flutua**: overlays que saem do plano da página (dropdown de busca, menus, diálogos) e os marcadores sobre os tiles do mapa.

### Shadow Vocabulary
- **Overlay flutuante** (`box-shadow: 0 8px 24px rgba(0,0,0,0.15)`): dropdown de busca, menus. Sai do plano; a sombra é o que diz isso, e por isso ele não tem borda.
- **Marcador sobre o mapa** (`box-shadow: 0 2px 6px rgba(0,0,0,0.35)`): o marcador flutua sobre fotografia cartográfica, não sobre uma superfície do sistema.
- **Anel de foco**: não é sombra. É `outline: 2px solid var(--mat-sys-on-surface)` com `outline-offset: 2px`.

### Named Rules

**A Regra do Tom em Repouso.** Superfícies paradas não projetam sombra. Se dois planos precisam se distinguir sem que nada esteja acontecendo, use o próximo degrau tonal e uma borda de 1px.

**A Regra do Fantasma.** Proibido combinar `border: 1px solid` com `box-shadow` de blur ≥ 16px no mesmo elemento. Escolha um: a borda define, ou a sombra eleva. Os dois juntos são o cartão-fantasma, e denunciam interface gerada sem decisão.

## 5. Components

O caráter é **refinado e contido**: formas suaves, transições curtas, nada exagerado. O componente cumpre a função e recua para o fundo. Todo componente interativo precisa existir em sete estados — repouso, hover, foco, ativo, desabilitado, carregando, erro. Metade deles não é entrega.

### Buttons
- **Shape:** pílula completa (`999px`), altura de 40px no ponteiro fino, 44px sob `@media (pointer: coarse)`.
- **Primary:** fundo Azul Sinal sólido — nunca gradiente —, tinta `on-primary`, padding `0 24px`. É a ação da tela, uma por vista.
- **Hover / Focus:** hover clareia; foco recebe o anel de 2px. Transição de 150ms com `ease-out-quart`, sem deslocamento.
- **Outlined (secundário):** fundo transparente, contorno de 1px em Traço, texto em Azul Sinal. É o `Cancelar` ao lado do `Salvar`.
- **Destrutivo:** fundo `--app-cor-perigo`, tinta `--app-cor-perigo-tinta`. Só dentro do diálogo de confirmação.
- **Icon button:** 40px no ponteiro fino, 44px no toque, ícone de 24px, sem fundo em repouso. Sempre com `aria-label` — o `mat-icon` é `aria-hidden` e o `matTooltip` não dá nome acessível.

### Diálogo de confirmação
Toda ação destrutiva passa por `ConfirmacaoService`. O foco inicial vai para **Cancelar**, nunca para a ação destrutiva: um Enter apressado não pode apagar um cadastro. Nada de `confirm()` nativo.

### Cards / Containers
- **Corner Style:** 12px (`{rounded.md}`) em cartões de conteúdo; 16px (`{rounded.lg}`) no container do mapa e no cartão do login. Nada acima de 16px.
- **Background:** Superfície, sobre a Névoa Azulada do fundo.
- **Shadow Strategy:** nenhuma. Ver Elevation — tonal em repouso.
- **Border:** 1px em Traço.
- **Internal Padding:** 16px.
- **Cabeçalho do cartão:** faixa sólida em Superfície Elevada (ou `primary-container` no cartão do mapa), sangrada até as bordas (`margin: -16px -16px 8px`), com divisor de 1px abaixo. Sem gradiente.

### Inputs / Fields
- **Style:** `mat-form-field` com `appearance="outline"` em todos os formulários, sem exceção. Contorno de 1px, cantos de 4px, fundo transparente.
- **Campo de busca:** exceção deliberada e a única — pílula de 44px de altura, fundo em Superfície, ícone de lupa em Tinta Apagada à esquerda, botão de limpar à direita quando há termo.
- **Focus:** borda vira Azul Sinal e o anel de 3px aparece.
- **Error:** contorno e mensagem em Vermelho Vencimento, com texto explicando o que corrigir ("CPF inválido.", "CNH vencida — informe uma data futura.").

### Navigation
- **Desktop:** um *segmented control* — pílula de fundo em Superfície, borda de 1px, sombra interna sutil, contendo três links com ícone e rótulo. O link ativo recebe fundo Azul Sinal sólido e texto branco.
- **Mobile (< 768px):** a pílula desaparece por completo e dá lugar a um botão hambúrguer que abre um `mat-menu` com os mesmos três destinos, cada um com ícone e rótulo. Ícones soltos no toolbar estouram a largura da viewport; não voltar a esse padrão.
- **Toolbar:** fundo em Superfície Elevada, borda inferior de 1px, logotipo `movva-lockup-azul.svg` à esquerda com 28px de altura.

### Lista adaptativa (componente-assinatura)
A mesma informação em duas formas. Acima de 768px, `mat-table` com cabeçalho em Superfície Elevada, zebra striping de 5% de Azul Sinal e hover tonal. Abaixo, a tabela some (`display: none`) e uma pilha de cartões toma o lugar, cada linha virando um par rótulo-valor alinhado às extremidades. Dados idênticos, sem badge, sem chip: a CNH lê `02650306461 (AB)` e a placa lê em azul e negrito, nas duas formas. **Uma informação não muda de vocabulário visual só porque a tela encolheu.**

### Named Rules

**A Regra dos 250ms.** Nenhuma transição passa de 250ms. O usuário está numa tarefa, não assistindo a uma coreografia. O padrão do sistema é 150ms, com `ease`.

**A Regra do Movimento Devolvido.** Toda animação tem alternativa sob `prefers-reduced-motion: reduce`, garantida por uma rede global em `styles.scss`. Indicador de estado **para**, mas não some: o anel do GPS vira halo estático, porque o pulso é decoração e o ponto é a informação.

**A Regra do Foco Inequívoco.** A camada de estado do Material entrega 1.2:1 entre focado e não-focado; a WCAG 2.4.11 exige 3:1. O anel de 2px em `on-surface` com offset de 2px passa contra toda superfície do sistema e contra o azul do botão primário. Nunca removê-lo sem substituto medido.

## 6. Do's and Don'ts

### Do:
- **Do** derivar toda cor de um token `--mat-sys-*`, `--brand-*` ou `--app-*`, resolvido por `light-dark()`. Teste toda tela nos dois temas antes de considerá-la pronta.
- **Do** usar `--app-cor-primaria-texto`, `--app-cor-sucesso` e `--app-cor-perigo` para texto e ícone; as âncoras `--brand-*-base` são preenchimento, e reprovam em contraste como texto.
- **Do** manter o Azul Sinal abaixo de 10% da área da tela, reservado a ação primária, seleção e foco.
- **Do** acompanhar todo estado semântico de texto ou ícone, nunca só de cor: "Vencida em 10/03/2024", não um ponto vermelho.
- **Do** usar `appearance="outline"` em todo `mat-form-field`. O campo de busca em pílula é a única exceção do sistema.
- **Do** distinguir superfícies em repouso por degrau tonal (Superfície Elevada) e borda de 1px.
- **Do** dar `aria-label` a todo controle só-ícone e `<label>` a todo campo sem rótulo visível.
- **Do** usar escala fixa em `rem` e trocar tamanhos por breakpoint (768px, 1024px).
- **Do** manter cantos em 12px para cartões e 16px no teto.
- **Do** usar `--app-duracao-*` e `--app-easing` em toda transição, e a escala `--app-z-*` para empilhamento.

### Don't:
- **Don't** entregar **template Material cru**: cores e formas de fábrica do Angular Material, componente sem customização, cara de projeto de bootcamp.
- **Don't** construir **dashboard SaaS genérico**: card de métrica gigante, gradiente decorativo, grid infinito de cartões idênticos com ícone e título.
- **Don't** produzir **ERP corporativo legado**: cinza sobre cinza, tabela apertada, densidade sem hierarquia, formulário que parece planilha.
- **Don't** importar gramática de **landing page de startup**: hero enorme, eyebrow em caixa alta acima de cada seção, texto em gradiente, seções numeradas 01/02/03.
- **Don't** combinar `border: 1px solid` com `box-shadow` de blur ≥ 16px no mesmo elemento (a Regra do Fantasma).
- **Don't** pôr sombra em superfície parada. Overlay flutuante tem sombra e não tem borda; superfície tem borda e não tem sombra.
- **Don't** usar `border-radius` acima de 16px em cartão, seção ou campo. Pílula só em botão, chip e campo de busca.
- **Don't** usar `border-left` ou `border-right` maior que 1px como faixa colorida de destaque.
- **Don't** aplicar gradiente decorativo em botão, cabeçalho de card ou texto. Cor sólida, sempre.
- **Don't** reintroduzir badges para categoria de CNH ou placa. Categoria é texto entre parênteses; placa é texto em Azul Sinal e peso 700.
- **Don't** escrever hex literal em SCSS de componente. Se o token não existe, crie o token.
- **Don't** pôr tinta branca sobre preenchimento primário ou vermelho no tema escuro: lá eles são claros, e branco entrega ~3.2:1.
- **Don't** animar acima de 250ms, nem enviar animação sem alternativa em `prefers-reduced-motion`.
- **Don't** usar `overflow-x: hidden` global para esconder estouro. Contenha o overflow onde ele nasce (a tabela rola dentro do próprio contêiner).
- **Don't** chamar `confirm()`/`alert()` nativo, nem confiar em `matTooltip` como nome acessível.
- **Don't** interpolar dado de usuário em string de HTML para o Leaflet: `bindTooltip` aplica via `innerHTML`. Monte nós de DOM com `textContent`.
- **Don't** deixar o toolbar estourar a largura da viewport. Se o header rola na horizontal, o layout está errado — não é o usuário que precisa arrastar.
