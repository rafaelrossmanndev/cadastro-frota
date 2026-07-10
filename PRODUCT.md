# Product

## Register

product

## Platform

web

## Users

O usuário primário, hoje, é o **avaliador técnico**: um recrutador ou tech lead que abre o app sem intenção de gerir frota alguma, navega por alguns minutos e julga a qualidade do trabalho pelo que vê e pelo que toca. Ele chega pela tela de login, sem treinamento e sem contexto, e forma sua opinião antes de completar qualquer tarefa.

A audiência secundária é o **gestor de frota** que ainda não existe: a pessoa que um dia usará estas telas para cadastrar motoristas, manter veículos em dia e acompanhar posições no mapa. Ela não usa o app hoje, mas suas tarefas são o que justifica cada decisão de UX. Uma escolha que só faz sentido como teatro de demonstração, e que atrapalharia esse gestor, está errada.

## Product Purpose

Uma aplicação de gestão de frota (cadastro de motoristas, cadastro de veículos e rastreamento em mapa) que roda inteiramente no frontend, com dados em memória e um backend simulado.

O projeto vive em dois tempos: é **portfólio agora e produto depois**. A arquitetura é construída pensando em uso real (serviços centralizados com signals, validadores de domínio isolados, guardas de rota), mas nada disso é exercido por um usuário de verdade ainda. Por isso o sucesso não se mede em tarefas concluídas: mede-se na **qualidade percebida nos primeiros dez segundos**. Se quem abre o app percebe polimento, coerência e cuidado antes mesmo de clicar em algo, a interface cumpriu seu trabalho.

## Positioning

Uma gestão de frota que se comporta como software de produção, não como demonstração.

## Brand Personality

Polido, moderno, confiante. A confiança aqui é a de quem não precisa levantar a voz: nenhuma tela argumenta que o trabalho é bom, ela apenas não erra. O polimento é percebido no acabamento (alinhamentos que fecham, estados que existem, transições que respeitam o contexto), não em ornamento aplicado por cima. O tom da escrita é direto e sem marketing: rótulos dizem o que a coisa é, mensagens de erro dizem o que fazer.

## Anti-references

- **Template Material cru.** Angular Material com cores e formas de fábrica, componentes sem customização, cara de projeto de bootcamp. O framework deve desaparecer atrás da marca.
- **Dashboard SaaS genérico.** Cards de métrica gigante, gradientes decorativos, grid infinito de cartões idênticos com ícone e título.
- **ERP corporativo legado.** Cinza sobre cinza, tabelas apertadas, densidade sem hierarquia, formulários que parecem planilha.
- **Landing page de startup.** Hero enorme, eyebrow em caps, texto em gradiente, seções numeradas 01/02/03. Marketing onde deveria haver tarefa.

## Design Principles

**O acabamento é o argumento.** Ninguém vai ler o código antes de formar uma opinião. O alinhamento que fecha, o estado de foco que existe, o card que não estoura no mobile: é isso que prova a competência técnica. Detalhe malfeito é afirmação contrária.

**Funcione para o gestor, mesmo que ele ainda não exista.** Toda decisão de interface se justifica pela tarefa real de gerir uma frota, nunca pela conveniência da demonstração. Dados falsos, fluxo verdadeiro.

**Familiaridade ganha de invenção.** Esta é uma ferramenta, não uma experiência. Um botão de salvar se parece com um botão de salvar. Afordâncias padrão, vocabulário consistente entre telas, e a interface some dentro da tarefa.

**Nada pode denunciar o andaime.** Nem o Material de fábrica, nem o template de SaaS, nem a gramática de landing page. Se um elemento existe porque "é assim que se faz", ele não existe por decisão, e precisa ser refeito ou removido.

**Acessibilidade é acabamento, não conformidade.** Contraste, foco visível, teclado e movimento reduzido pertencem à mesma categoria de cuidado que o espaçamento e a tipografia. Um estado que só se comunica por cor é um estado mal desenhado, antes de ser uma violação.

## Accessibility & Inclusion

O projeto assume **WCAG AA** como piso: contraste de 4.5:1 em texto de corpo e 3:1 em texto grande.

Além do nível, quatro compromissos concretos:

- **Movimento reduzido.** Toda animação respeita `prefers-reduced-motion`, com alternativa de crossfade ou transição instantânea.
- **Nunca só pela cor.** Estados semânticos (CNH vencida, CNH válida, alerta de roteamento) sempre trazem texto ou ícone junto do vermelho e do verde, para leitores daltônicos.
- **Teclado completo.** Toda ação é alcançável por teclado com foco sempre visível, incluindo o menu hambúrguer do mobile e os controles do mapa.

O app oferece tema claro e escuro; os mínimos acima valem para os dois.
