# Cadastro de Frota

Mini-projeto de estudo: cadastro de Frota (Motoristas e Veículos), 100% frontend, com dados em memória (sem backend). Feito com Angular 19 (standalone, Signals, novo control flow `@if`/`@for`), Angular Material com tema Material 3 customizado e `ngx-mask`.

## Como rodar

Requer Node 22 (ver `.nvmrc`).

```bash
nvm use
npm install
npx ng serve
```

Acesse `http://localhost:4200` — a rota inicial redireciona para `/motoristas`.

## Funcionalidades

- **Motoristas**: listar, cadastrar, editar e excluir. Validação de CPF (algoritmo real dos dígitos verificadores) e de validade da CNH (não pode estar vencida).
- **Veículos**: listar, cadastrar, editar e excluir, sempre vinculados a um motorista responsável. Validação de placa nos dois formatos brasileiros (antigo `AAA-9999` e Mercosul `AAA9A99`).

## Arquitetura

```
src/app/
├── models/        # Driver, Vehicle — interfaces do domínio (sem lógica)
├── services/       # DriverService, VehicleService — "banco de dados" em memória (Signal) + CRUD
├── validators/     # cpfValidator, plateValidator, cnhValidityValidator — regras de negócio puras
└── components/
    ├── navbar/
    ├── driver-list/  vehicle-list/   # mat-table
    └── driver-form/  vehicle-form/   # Reactive Forms
```

Separação em camadas: `models` descreve os dados, `services` guarda e muta o estado (a única fonte de verdade — nenhum componente mantém cópia própria da lista), `validators` isola as regras de validação do domínio brasileiro (CPF/placa/CNH) do formulário em si, e `components` só orquestra essas três camadas. Um novo domínio (ex.: "Manutenções") seguiria exatamente o mesmo padrão: um model, um service com o mesmo formato de CRUD (`getAll`/`getById`/`add`/`update`/`remove` sobre um `signal<T[]>`), validators próprios se necessário, e list/form components — sem precisar inventar uma estrutura nova.

Por que Reactive Forms em vez de template-driven: os validadores de domínio (CPF, placa, CNH) são funções TypeScript puras (`ValidatorFn`), testáveis isoladamente e reaproveitáveis entre `driver-form` e `vehicle-form`, sem duplicar regra de negócio no template.

## Tema (Material 3)

O tema é gerado a partir da paleta de marca fornecida, usando o schematic oficial `ng generate @angular/material:theme-color`, que aplica o algoritmo HCT do Material 3 para transformar cada cor-semente em uma paleta tonal completa (13-16 tons):

| Cor da marca | Hex | Papel no tema M3 |
|---|---|---|
| Aubergine | `#2C001E` | **Primary** — cor principal (toolbar, botões primários) |
| Laranja | `#E95420` | **Tertiary** — ações/destaque (classe utilitária `.btn-tertiary`, ver `styles.scss`) |
| Cinza-quente | `#AEA79F` | **Neutral** — semente de superfícies/bordas/outline |
| Ruby/crimson | `#B0173B` | **Error** — cor de erro escolhida por combinar com o roxo (undertone vinho) e contrastar com o laranja, evitando confusão visual entre "erro" e "ação" |
| Porcelana | `#F5F5F0` | Fundo/superfície no modo claro |
| Preto-jato | `#0A0A0C` | Fundo/superfície no modo escuro |
| Verde | `#26A269` | **Sucesso** (ver abaixo) |

O Material 3 só tem 5 papéis nativos (primary/secondary/tertiary/error/neutral) — não existe um slot para "sucesso". Por isso `#26A269` foi modelado como uma custom property própria da aplicação (`--app-color-success`, fora do namespace `--mat-sys-*` do Material), usada manualmente onde o domínio precisa de um sinal positivo — por exemplo, o badge "CNH válida" em `driver-list`. Isso mantém a extensão isolada e explícita, em vez de forçar a cor dentro de um papel do Material que não é dela.

Dark mode: as duas variantes (clara/escura) são geradas automaticamente a partir das mesmas sementes via `theme-type: color-scheme` + `color-scheme: light dark`, sem precisar duplicar a definição do tema — o Material resolve qual variante usar em cada token `--mat-sys-*` conforme a preferência do sistema operacional.

Arquivos: `src/styles/_theme-colors.scss` (gerado pelo schematic, não editar à mão) e `src/styles.scss` (aplica o tema via `mat.theme()` e documenta cada decisão inline).
