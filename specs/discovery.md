# Discovery: Aplicação de Previsão do Tempo

## Personas

### Persona 1 — Marina, a viajante frequente

- **Objetivo principal:** consultar rapidamente o clima atual e a previsão de cinco dias de cidades que pretende visitar, para decidir o que levar na mala e planejar atividades.
- **Contexto de uso:** predominantemente mobile, em momentos curtos e muitas vezes com conexão móvel instável (aeroportos, deslocamentos); ocasionalmente acessa via desktop ao planejar a viagem com mais calma.
- **Métrica de sucesso (pela ótica dela):** consegue encontrar a cidade certa e ver a previsão em poucos toques, sem erros de conexão que a impeçam de decidir o que fazer.

### Persona 2 — Diego, o profissional que trabalha na rua

- **Objetivo principal:** verificar o clima atual e a previsão do dia da sua cidade (e de cidades próximas onde presta serviço) para se planejar rapidamente, sem distrações.
- **Contexto de uso:** mobile, em consultas rápidas ao longo do dia, muitas vezes com tela pequena, luz solar forte e uma mão ocupada.
- **Métrica de sucesso (pela ótica dele):** obtém a informação essencial (temperatura, condição, chance de chuva) em segundos, com textos legíveis e controles fáceis de tocar mesmo em movimento.

### Persona 3 — Beatriz, a analista que monitora múltiplas localidades

- **Objetivo principal:** comparar o clima atual e a previsão de várias cidades diferentes (por exemplo, filiais ou regiões de interesse) para embasar decisões operacionais.
- **Contexto de uso:** principalmente desktop, em sessões mais longas, alternando entre várias buscas e unidades de temperatura (Celsius/Fahrenheit) conforme o público do relatório.
- **Métrica de sucesso (pela ótica dela):** consegue trocar de cidade e de unidade de forma confiável e consistente, sem dados incompletos ou inconsistentes que comprometam a análise.

## Contexto

A empresa deseja disponibilizar uma aplicação de previsão do tempo para permitir que usuários consultem as condições meteorológicas de cidades de interesse.

A solução deve oferecer informações do clima atual, previsão para os próximos cinco dias, conversão entre Celsius e Fahrenheit e uma experiência adequada para dispositivos móveis.

## Requisitos Funcionais

### RF01 — Buscar cidades

O usuário deve poder buscar uma cidade informando seu nome.

A aplicação deve:

- Exibir resultados compatíveis com o termo informado.
- Permitir selecionar uma cidade para consultar sua previsão.
- Informar quando nenhuma cidade for encontrada.
- Tratar erros de comunicação com o serviço de localização.

### RF02 — Exibir clima atual

Após a seleção de uma cidade, a aplicação deve exibir:

- Nome da cidade e país ou região.
- Temperatura atual.
- Unidade de temperatura selecionada.
- Condição climática atual.
- Ícone ou representação visual da condição.
- Informações adicionais relevantes, como sensação térmica, umidade e vento, caso estejam disponíveis.

### RF03 — Exibir previsão de cinco dias

A aplicação deve apresentar a previsão dos cinco dias seguintes, incluindo, quando disponível:

- Data ou dia da semana.
- Temperatura mínima e máxima.
- Condição climática.
- Ícone representativo.

### RF04 — Alternar unidade de temperatura

O usuário deve poder alternar entre:

- Celsius, usando graus Celsius.
- Fahrenheit, usando graus Fahrenheit.

A aplicação deve atualizar todas as temperaturas exibidas após a alteração.

A preferência de unidade deve permanecer durante a sessão atual. A persistência entre acessos futuros fica fora do escopo da primeira versão e depende de decisão posterior.

### RF05 — Atualizar dados meteorológicos

O usuário deve poder atualizar manualmente os dados meteorológicos da cidade selecionada.

A aplicação deve indicar visualmente quando os dados estão sendo carregados.

### RF06 — Estados da aplicação

A aplicação deve tratar, no mínimo, os seguintes estados:

- Estado inicial, antes de uma cidade ser selecionada.
- Carregamento da busca.
- Carregamento da previsão.
- Resultado encontrado.
- Nenhum resultado encontrado.
- Erro na busca.
- Erro ao consultar a previsão.
- Dados incompletos ou indisponíveis.

## Requisitos Não-Funcionais

### RNF01 — Responsividade

A aplicação deve funcionar adequadamente em dispositivos móveis, tablets e desktops, a partir de 320 px de largura.

A interface deve adaptar layout, tamanhos, espaçamentos e controles a diferentes larguras de tela, sem rolagem horizontal, sobreposição ou perda dos controles principais.

Os fluxos de busca, seleção de cidade, alternância de unidade e atualização devem funcionar nas orientações retrato e paisagem.

### RNF02 — Acessibilidade

A aplicação deve:

- Usar elementos semânticos e labels acessíveis.
- Permitir navegação completa por teclado, com foco visível e ordem de foco lógica.
- Fornecer mensagens compreensíveis para erros, carregamentos e ausência de resultados, anunciadas adequadamente por tecnologias assistivas.
- Manter contraste suficiente entre texto e fundo, seguindo o nível AA da WCAG 2.2 quando aplicável.
- Não depender exclusivamente de cor para transmitir informações.
- Apresentar o nome textual da condição climática além de qualquer ícone ou representação visual.

### RNF03 — Desempenho

A aplicação deve apresentar o estado inicial ou de carregamento em até 1 segundo após uma ação do usuário.

Em uma conexão 4G, a busca e a consulta meteorológica devem apresentar resultado ou erro em até 5 segundos, desconsiderando indisponibilidade do provedor externo.

A aplicação deve evitar chamadas duplicadas para a mesma cidade e configuração, usando debounce na busca e cache em memória durante a sessão quando tecnicamente possível.

### RNF04 — Confiabilidade

Falhas de rede, respostas inválidas e indisponibilidade do serviço externo não devem causar o travamento da aplicação.

As requisições ao provedor devem ter timeout e tratamento de erro. A aplicação deve permitir nova tentativa controlada e preservar a última previsão válida enquanto uma atualização estiver em andamento.

### RNF05 — Compatibilidade

A aplicação deve ser compatível com as versões atuais dos principais navegadores modernos em desktop e dispositivos móveis.

### RNF06 — Segurança e privacidade

A aplicação não deve solicitar dados pessoais desnecessários.

Entradas fornecidas pelo usuário devem ser tratadas com segurança antes de serem usadas em requisições ou exibidas na interface.

### RNF07 — Manutenibilidade

A solução deve separar a interface, a lógica de negócio e o acesso aos serviços meteorológicos, permitindo evolução e testes independentes.

### RNF08 — Disponibilidade

A aplicação deve atingir disponibilidade mensal mínima de 99,5%, excluindo manutenções programadas comunicadas previamente.

Quando o provedor externo estiver indisponível, a interface deve continuar utilizável e informar claramente que os dados mais recentes não puderam ser obtidos.

### RNF09 — Observabilidade

A aplicação deve registrar erros de comunicação, respostas inválidas e falhas de conversão sem armazenar dados pessoais ou a localização precisa do usuário.

Devem ser coletadas métricas de tempo de busca, tempo de consulta meteorológica, taxa de erro e indisponibilidade do provedor.

## Riscos

- O serviço meteorológico externo pode ficar indisponível ou apresentar instabilidade.
- O nome de uma cidade pode corresponder a várias localidades diferentes.
- Dados meteorológicos podem estar incompletos, atrasados ou inconsistentes.
- O serviço externo pode impor limites de requisições.
- A experiência pode ser prejudicada em conexões móveis lentas.
- A conversão de unidades pode gerar diferenças de arredondamento.
- A interface pode apresentar problemas em telas muito pequenas.
- A previsão de cinco dias pode variar conforme a disponibilidade do provedor.
- Usuários podem interpretar incorretamente horários, datas ou localidades sem indicação clara do fuso horário.

## Perguntas em Aberto

1. Qual serviço ou fornecedor fornecerá os dados meteorológicos?
2. A aplicação deverá exibir a previsão por horário ou apenas um resumo diário?
3. Quais informações, além da temperatura e condição climática, são obrigatórias?
4. A busca deve iniciar após o envio do formulário ou enquanto o usuário digita?
5. Como a aplicação deve diferenciar cidades com o mesmo nome?
6. A localização atual do usuário deve ser usada como opção de busca?
7. A persistência da unidade entre sessões será considerada em uma versão futura?
8. Qual é o intervalo esperado para atualização automática dos dados?
9. Como devem ser exibidos horários e datas em diferentes fusos?
10. Há requisitos de autenticação, favoritos ou histórico de cidades?
11. Quais navegadores e versões móveis precisam ser oficialmente suportados?
12. As metas de desempenho, disponibilidade e observabilidade definidas nesta descoberta são adequadas ao produto?
13. A aplicação precisará funcionar parcialmente sem conexão?
14. Quais textos, idiomas e padrões de localização devem ser suportados?
15. Quais métricas de uso e monitoramento deverão ser coletadas?

## Decisões

- **Fonte de dados: Open-Meteo, sem API key.** A aplicação usará o Open-Meteo para geocodificação e dados meteorológicos, evitando a necessidade de gerenciar credenciais na primeira versão. Resolve a pergunta 1 sobre o fornecedor dos dados.
- **Período de previsão: cinco dias correspondem a hoje mais quatro dias.** A previsão será exibida em formato diário, incluindo o dia atual e os quatro dias seguintes. Resolve a pergunta 2 sobre o recorte temporal da previsão e detalha o requisito RF03.
- **Unidade padrão: Celsius.** As temperaturas serão exibidas inicialmente em graus Celsius, mantendo Fahrenheit como alternativa selecionável. Resolve a pergunta 7 sobre a unidade inicial e confirma a suposição correspondente.
- **Sem autenticação e sem persistência de servidor.** A primeira versão não terá login, favoritos ou histórico persistido em servidor; preferências e dados poderão existir apenas durante a sessão. Resolve a pergunta 10 sobre autenticação, favoritos e histórico e delimita a pergunta 7 quanto à persistência entre sessões.
- **Idioma da interface: pt-BR.** Textos, mensagens e padrões de localização da interface serão inicialmente definidos para português do Brasil. Resolve a pergunta 14 sobre idiomas e localização suportados.

## Suposições

- A aplicação será inicialmente disponibilizada em um único idioma, provavelmente português do Brasil.
- O serviço meteorológico escolhido fornecerá geocodificação e previsão atual e diária para pelo menos cinco dias.
- Não será necessária autenticação na primeira versão.
- O usuário selecionará uma cidade manualmente por meio da busca.
- A previsão será apresentada em formato diário, salvo decisão posterior em contrário.
- Celsius será a unidade padrão inicial.
- Fahrenheit será disponibilizado como alternativa de visualização, sem alterar os dados originais do provedor.
- A aplicação dependerá de conexão com a internet para buscar dados atualizados.
- A atualização manual será suficiente para a primeira versão, sem atualização automática obrigatória.
- Não haverá necessidade de armazenar dados meteorológicos permanentemente.
- O layout será responsivo e priorizará uma experiência mobile-first.
- O provedor externo será acessado por uma camada de serviço isolada da interface.
