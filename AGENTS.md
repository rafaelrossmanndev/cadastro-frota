# AGENTS.md

## Design Context

Antes de mexer em qualquer interface, leia [PRODUCT.md](PRODUCT.md) (estratégia: para quem, por quê) e [DESIGN.md](DESIGN.md) (sistema visual: cores, tipografia, componentes). O resumo abaixo é ponteiro, não substituto.

**Registro:** product (app UI) · **Plataforma:** web · **Stack:** Angular 19 standalone + signals, Angular Material 3, SCSS, Leaflet.

**Posicionamento:** uma gestão de frota que se comporta como software de produção, não como demonstração.

**Princípios estratégicos:**

- **O acabamento é o argumento.** Ninguém lê o código antes de formar uma opinião. Detalhe malfeito é afirmação contrária.
- **Funcione para o gestor, mesmo que ele ainda não exista.** Dados falsos, fluxo verdadeiro.
- **Familiaridade ganha de invenção.** É uma ferramenta. Afordâncias padrão, vocabulário consistente, a interface some dentro da tarefa.
- **Nada pode denunciar o andaime.** Se um elemento existe porque "é assim que se faz", refaça ou remova.
- **Acessibilidade é acabamento, não conformidade.** Contraste, foco, teclado e movimento reduzido pertencem ao mesmo cuidado que espaçamento e tipografia.

**Anti-referências:** template Material cru · dashboard SaaS genérico · ERP corporativo legado · landing page de startup.

**Regras visuais que mais pegam** (as completas estão no DESIGN.md):

- Toda cor sai de token `--mat-sys-*` / `--brand-*` / `--app-*` via `light-dark()`. Hex literal em SCSS de componente é bug de tema escuro.
- **Preenchimento ≠ texto.** `--brand-*-base` são âncoras de matiz e reprovam em contraste como texto. Para texto e ícone use `--app-cor-primaria-texto`, `--app-cor-sucesso`, `--app-cor-perigo`.
- No tema escuro, primária e vermelho clareiam, então a tinta por cima **escurece**. Branco sobre eles dá ~3.2:1.
- O azul é o único acento: ação primária, seleção, foco. Nada de decoração, nada de gradiente.
- Nenhum estado se comunica só por cor.
- Escala tipográfica fixa em `rem`, sem `clamp()`. Uma família só (Roboto).
- Superfície em repouso não projeta sombra: distinga por degrau tonal + borda de 1px. Overlay flutuante tem sombra e não tem borda.
- Nunca `border: 1px solid` junto de `box-shadow` com blur ≥ 16px no mesmo elemento.
- Transições via `--app-duracao-*` + `--app-easing`; empilhamento via `--app-z-*`.
- Todo controle só-ícone precisa de `aria-label`: `mat-icon` é `aria-hidden` e `matTooltip` **não** dá nome acessível.
- Ação destrutiva passa pelo `ConfirmacaoService`. Nada de `confirm()` nativo.

**Acessibilidade assumida:** WCAG AA, movimento reduzido, nunca só pela cor, teclado completo. Vale nos temas claro e escuro. Verificado por medição, não por inspeção visual.

## Comandos

```bash
npm start        # ng serve em http://localhost:4200
npm run build    # build de produção
npm test         # karma + jasmine
```

Login de teste: `admin` / `admin123`. Rotas: `/mapa` (padrão), `/motoristas`, `/veiculos`, `/login`.
