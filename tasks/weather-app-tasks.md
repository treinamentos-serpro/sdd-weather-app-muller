# Backlog de Implementacao — Weather App

Backlog derivado de `plans/weather-app-plan.md`, ordenado por dependencias.
Cada tarefa representa uma unidade pequena, testavel, delegavel e verificavel.

## Priorizacao e tamanho

- **P0:** indispensavel para demonstrar e liberar o fluxo principal de busca,
  consulta e apresentacao do clima.
- **P1:** confiabilidade, qualidade de uso e cobertura necessarias para fechar a
  primeira versao apos o fluxo principal estar disponivel.
- **P2:** validacoes incrementais de cache, observabilidade e seguranca que nao
  bloqueiam a primeira demonstracao.
- **P:** pequena, concluivel em ate um dia; **M:** media, de um a dois dias;
  **G:** grande, deve ser acompanhada por testes e pode exigir mais de dois dias.

| Tarefa | Prioridade | Tamanho |
| --- | --- | --- |
| T-01 | P0 | M |
| T-02 | P0 | P |
| T-03 | P0 | M |
| T-04 | P0 | P |
| T-05 | P0 | M |
| T-06 | P0 | G |
| T-07 | P0 | G |
| T-08 | P0 | M |
| T-09 | P0 | M |
| T-10 | P0 | M |
| T-11 | P0 | M |
| T-12 | P0 | G |
| T-13 | P0 | G |
| T-14 | P1 | G |
| T-15 | P0 | M |
| T-16 | P0 | M |
| T-17 | P0 | M |
| T-18 | P0 | M |
| T-19 | P0 | P |
| T-20 | P0 | G |
| T-21 | P0 | M |
| T-22 | P0 | P |
| T-23 | P0 | M |
| T-24 | P0 | M |
| T-25 | P0 | M |
| T-26 | P0 | M |
| T-27 | P0 | M |
| T-28 | P2 | M |
| T-29 | P0 | G |
| T-30 | P1 | M |
| T-31 | P0 | M |
| T-32 | P0 | M |
| T-33 | P0 | M |
| T-34 | P1 | G |
| T-35 | P1 | G |
| T-36 | P1 | M |
| T-37 | P1 | M |
| T-38 | P2 | P |
| T-39 | P1 | M |
| T-40 | P1 | P |
| T-41 | P0 | M |

## Sequencia recomendada por fatias verticais

As fatias respeitam as dependencias do backlog, mas agrupam trabalho de dados,
UI e testes pelo resultado que o usuario consegue perceber. Cada fatia deve ser
demonstrada antes de iniciar a seguinte.

1. **Busca de cidades visivel:** concluir T-01, T-05, T-07, T-08, T-10, T-12,
   T-15 e T-16, com T-23, T-25, T-26 e T-31. O resultado e uma busca acessivel, com
   loading, vazio, erro, lista de desambiguacao limitada a 10 opcoes e selecao
   explicita de cidade; os componentes podem ser
   demonstrados isoladamente enquanto a tela completa ainda e composta.
2. **Clima atual navegavel:** adicionar T-02, T-03, T-06, T-09, T-11, T-13,
   T-17 e T-19, com T-22, T-24, T-27 e T-29. A selecao passa a mostrar imediatamente
   cidade, condicao e temperatura, e a troca de unidade funciona sem rede.
3. **Previsao e aplicacao integrada:** adicionar T-04, T-18, T-20 e T-21, com
   T-32 e T-33. Esta e a primeira entrega completa no `App`: busca, clima atual,
   previsao de cinco dias e unidade ativa.
4. **Confiabilidade para uso real:** concluir T-14, com T-28, T-30, T-34 e T-39.
  A entrega passa a reutilizar consultas, suportar refresh e retry
   sem apagar o ultimo snapshot e resistir a respostas fora de ordem.
5. **Acabamento e liberacao:** concluir T-35, T-36, T-37, T-38 e T-40; depois
  executar T-41. As tarefas P2 ocorrem apos a demonstracao do MVP, reforcando
  cache e observabilidade antes da verificacao final de entrega.

## Entrega 1 — Fundacoes de dominio

### T-01 — Definir contratos do dominio
- **Tipo:** Data
- **Descricao:** Criar tipos compartilhados para unidade, cidade, condicao, clima atual, previsao diaria, snapshot meteorologico, erro e estado da aplicacao.
- **Rastreabilidade:** RF01, RF02, RF03, RF04, RF05, RF06; AC01–AC06.
- **Criterios de aceite:**
  - `WeatherData` expõe `unit`, `current`, `daily` e exatamente 5 entradas diarias em ordem cronologica;
  - `City` inclui `id`, `name`, `country`, `admin1`/`admin2`, `latitude` e `longitude` quando disponiveis;
  - `AppError` cobre `network`, `api`, `timeout` e `invalid-payload` e e usado por todos os services;
  - o projeto compila com TypeScript strict sem erros de tipos em `pnpm build`.
- **Dependencias:** — (tarefa inicial)
- **Arquivos provaveis:** `src/types/weather.ts`

## Entrega 2 — Funcoes puras

### T-02 — Implementar conversao e arredondamento de temperatura
- **Tipo:** Data
- **Descricao:** Criar funcoes puras para converter Celsius para Fahrenheit e formatar valores para a UI sem alterar a fonte de dados canonica.
- **Rastreabilidade:** RF02, RF03, RF04; AC02, AC03, AC04.
- **Criterios de aceite:**
  - Fahrenheit usa a formula `C * 9 / 5 + 32` antes do arredondamento para o inteiro mais proximo;
  - valores `null`, `undefined` ou `NaN` sao tratados como indisponiveis e nao geram `NaN` na UI;
  - casos de teste cobrem `0`, `100`, `-40`, `-5` e valores negativos;
  - ao converter de Celsius para Fahrenheit e voltar, o valor final coincide com o valor original respeitando arredondamento.
- **Dependencias:** T-01
- **Arquivos provaveis:** `src/lib/temperature.ts`

### T-03 — Mapear codigos WMO para condicoes
- **Tipo:** Data
- **Descricao:** Criar mapeamento puro de codigo WMO para texto em pt-BR e chave de icone, com fallback para codigos desconhecidos.
- **Rastreabilidade:** RF02, RF03; AC02, AC03.
- **Criterios de aceite:**
  - codigos principais de sol, nuvens, neblina, chuva, neve e trovoada retornam texto e `iconKey` legiveis;
  - codigo desconhecido retorna uma condicao valida e textualmente compreensivel;
  - nenhum componente precisa conhecer a tabela WMO; a API de mapeamento e funcional e pura;
  - testes unitarios validam codigo conhecido e codigo desconhecido sem depender de DOM.
- **Dependencias:** T-01
- **Arquivos provaveis:** `src/lib/weatherCode.ts`

### T-04 — Formatar datas locais da previsao
- **Tipo:** Data
- **Descricao:** Criar formatadores puros para datas ISO do provedor e labels em pt-BR sem deslocar dias por timezone do navegador.
- **Rastreabilidade:** RF03; AC03.
- **Criterios de aceite:**
  - datas validas produzem label legivel em pt-BR, como dia da semana ou data formatada;
  - datas invalidas ou nulas retornam texto de indisponivel sem levantar excecao;
  - a funcao preserva o dia correto do payload sem aplicar timezone do navegador indevidamente;
  - testes validam data valida, data invalida e entrada nula.
- **Dependencias:** T-01
- **Arquivos provaveis:** `src/lib/date.ts`

### T-05 — Normalizar resultados de geocodificacao
- **Tipo:** Data
- **Descricao:** Validar, mapear, deduplicar e limitar a resposta bruta da busca para um array de `City`.
- **Rastreabilidade:** RF01; AC01, AC06.
- **Criterios de aceite:**
  - somente itens com `id`, `name` e coordenadas numericas sao aceitos;
  - `admin1` e depois `admin2` sao usados como contexto geografico quando disponiveis;
  - duplicatas sao removidas por `id` e, como fallback, por coordenadas com precisao de 6 casas decimais;
  - o retorno e limitado a 10 cidades, preservando a ordem relevante do provedor, e lista vazia e tratada como resultado vazio;
  - a funcao rejeita payloads invalidos sem quebrar a busca.
- **Dependencias:** T-01
- **Arquivos provaveis:** `src/lib/geocoding.ts`

### T-06 — Normalizar payload de previsao
- **Tipo:** Data
- **Descricao:** Validar e mapear o payload Open-Meteo para `WeatherData`, preservando posicoes incompletas e rejeitando payloads invalidos.
- **Rastreabilidade:** RF02, RF03, RF06; AC02, AC03, AC06.
- **Criterios de aceite:**
  - `current` e `daily` sao validados antes da transformacao;
  - campos ausentes sao convertidos para `null` sem quebrar o restante do array;
  - a lista diaria preserva cinco posicoes, mesmo com dias incompletos;
  - payload nulo, sem `current` essencial ou sem `daily` utilizavel e rejeitado explicitamente;
  - testes validam payload completo, incompleto e invalido.
- **Dependencias:** T-01, T-03
- **Arquivos provaveis:** `src/lib/weather.ts`

## Entrega 3 — Services e acesso a dados

### T-07 — Implementar transporte HTTP resiliente
- **Tipo:** Data
- **Descricao:** Encapsular `fetch` com timeout de 5 segundos, validacao de HTTP/JSON e erros tipados.
- **Rastreabilidade:** RF01, RF05, RF06; RNF03, RNF04, RNF09; AC01, AC05, AC06.
- **Criterios de aceite:**
  - `fetch` usa `URL` e `URLSearchParams` e aborta em timeout de 5 segundos;
  - respostas HTTP fora de 2xx sao classificadas como `api`; falhas de rede como `network`; timeout como `timeout`; JSON invalido como `invalid-payload`;
  - mensagens expostas ao dominio nao revelam detalhes tecnicos do provedor;
  - callback opcional de metricas recebe tempo de resposta sem registrar query, coordenadas ou PII.
- **Dependencias:** T-01
- **Arquivos provaveis:** `src/services/request.ts`

### T-08 — Criar service de geocodificacao
- **Tipo:** Data
- **Descricao:** Consultar o endpoint de geocodificacao com termo normalizado e entregar cidades de dominio.
- **Rastreabilidade:** RF01; AC01, AC06.
- **Criterios de aceite:**
  - a URL envia `count=10`, `language=pt` e `format=json`;
  - o termo e normalizado antes da chamada e a resposta vazia e tratada como vazio e nao como erro;
  - a validacao e deduplicacao sao delegadas para `geocoding.ts`;
  - os erros de transporte sao repassados com tipos e sem quebra da UI.
- **Dependencias:** T-05, T-07
- **Arquivos provaveis:** `src/services/geocodingService.ts`

### T-09 — Criar service de previsao
- **Tipo:** Data
- **Descricao:** Consultar o endpoint de forecast com unidades canonicas e devolver `WeatherData` normalizado.
- **Rastreabilidade:** RF02, RF03, RF05; AC02, AC03, AC05.
- **Criterios de aceite:**
  - a URL envia coordenadas, `current`, `daily`, `forecast_days=5`, temperatura em Celsius, velocidade em km/h e `timezone=auto`;
  - a cidade selecionada e usada no snapshot e a resposta e mapeada para `WeatherData`;
  - erro de transporte e payload invalido sao separados para permitir retry e mensagem adequada;
  - a camada de servico nunca retorna valores em bruto para renderizacao.
- **Dependencias:** T-06, T-07
- **Arquivos provaveis:** `src/services/weatherService.ts`

### T-10 — Adicionar cache e deduplicacao da geocodificacao
- **Tipo:** Data
- **Descricao:** Adicionar cache em memoria e deduplicacao de requisicoes em andamento no service de geocodificacao.
- **Rastreabilidade:** RF01; RNF03; AC01.
- **Criterios de aceite:**
  - a chave do cache usa o termo normalizado em lowercase;
  - consultas equivalentes reutilizam o valor em cache ou a mesma Promise em andamento;
  - `localStorage` nao e usado para persistir a busca;
  - erros de rede e sem resultados continuam com o contrato atual e sem efeito colateral.
- **Dependencias:** T-08
- **Arquivos provaveis:** `src/services/geocodingService.ts`

### T-11 — Adicionar cache e deduplicacao da previsao
- **Tipo:** Data
- **Descricao:** Adicionar cache em memoria e deduplicacao de requisicoes em andamento no service de previsao.
- **Rastreabilidade:** RF02, RF03, RF05; RNF03; AC02, AC03, AC05.
- **Criterios de aceite:**
  - a chave usa latitude e longitude normalizadas com ate 6 casas decimais;
  - consultas equivalentes reutilizam cache ou Promise em andamento;
  - `refresh` ignora o cache quando solicitado;
  - a entrada nao persiste em `localStorage` e nao altera o contrato de erro.
- **Dependencias:** T-09
- **Arquivos provaveis:** `src/services/weatherService.ts`

## Entrega 4 — Hook de orquestracao

### T-12 — Implementar estado de busca no hook
- **Tipo:** Data
- **Descricao:** Criar a parte do `useWeatherApp` responsavel por termo, debounce, submit e resultados de geocodificacao.
- **Rastreabilidade:** RF01; RF06; AC01, AC06.
- **Criterios de aceite:**
  - termos com menos de 2 caracteres ficam em estado `idle` e nao disparam request;
  - o submit cancela o debounce em andamento e a busca nao dispara duas vezes para o mesmo termo;
  - transicoes cobrem `idle`, `loading`, `success`, `empty` e `error`;
  - resultados validos permanecem em `searchResults` ate `selectCity` e nao iniciam forecast automaticamente;
  - retry usa o ultimo termo valido e reexecuta a busca atual.
- **Dependencias:** T-08, T-10
- **Arquivos provaveis:** `src/hooks/useWeatherApp.ts`

### T-13 — Implementar estado de clima e unidade no hook
- **Tipo:** Data
- **Descricao:** Adicionar selecao de cidade, consulta meteorologica, unidade ativa, refresh e retry no `useWeatherApp`.
- **Rastreabilidade:** RF02, RF03, RF04, RF05; AC02, AC03, AC04, AC05.
- **Criterios de aceite:**
  - `selectCity` armazena a cidade selecionada e dispara consulta meteorologica somente apos a acao explicita do usuario;
  - a busca nunca escolhe automaticamente o primeiro resultado, inclusive quando retorna uma unica cidade;
  - a unidade inicial e Celsius e `setUnit` nao dispara rede nem altera snapshot de dados;
  - o hook preserva a cidade ao alternar unidade e ao consultar outra cidade na mesma sessao;
  - refresh e retry usam a cidade atual e mantem o estado de carregamento visivel.
- **Dependencias:** T-09, T-11, T-12
- **Arquivos provaveis:** `src/hooks/useWeatherApp.ts`

### T-14 — Controlar concorrencia e preservacao do snapshot
- **Tipo:** Data
- **Descricao:** Completar o hook com cancelamento de requisicoes e preservacao do ultimo clima valido.
- **Rastreabilidade:** RF02, RF03, RF05, RF06; AC02, AC03, AC05, AC06.
- **Criterios de aceite:**
  - respostas obsoletas nao sobrescrevem termo, cidade ou snapshot atuais;
  - refresh com falha preserva a ultima previsao valida e mostra mensagem de erro;
  - a cidade selecionada permanece visivel durante carregamento de atualizacao;
  - cliques repetidos na mesma acao sao ignorados ou idempotentes sem duplicar request.
- **Dependencias:** T-12, T-13
- **Arquivos provaveis:** `src/hooks/useWeatherApp.ts`

## Entrega 5 — Componentes de apresentacao

### T-15 — Criar formulario de busca
- **Tipo:** UI
- **Descricao:** Implementar `SearchForm` controlado, acessivel e desacoplado de rede.
- **Rastreabilidade:** RF01; AC01, AC06; RNF02.
- **Criterios de aceite:**
  - o campo possui label acessivel e nome semantico;
  - o valor e trimado antes da validacao e termos menores que 2 caracteres nao disparam callback;
  - submit dispara callback somente com termo valido;
  - quando em loading, controles aplicaveis sao desabilitados sem perder acessibilidade e foco.
- **Dependencias:** T-01, T-12
- **Arquivos provaveis:** `src/components/SearchForm.tsx`

### T-16 — Exibir resultados e selecao de cidade
- **Tipo:** UI
- **Descricao:** Implementar lista de ate dez cidades com contexto geografico e selecao explicita por mouse ou teclado.
- **Rastreabilidade:** RF01; AC01, AC06; RNF02.
- **Criterios de aceite:**
  - a lista renderiza nome, pais ou regiao quando disponiveis;
  - a lista nunca exibe mais de 10 opcoes e preserva a ordem recebida do service;
  - cidades com mesmo nome sao diferenciadas por contexto geografico;
  - cada item e acionavel por teclado e mouse;
  - nenhum item e selecionado automaticamente, inclusive quando existe uma unica opcao;
  - estados de vazio e erro mantem o formulario acessivel e informam a situacao sem depender apenas de cor.
- **Dependencias:** T-12
- **Arquivos provaveis:** `src/components/CityResults.tsx`

### T-17 — Renderizar clima atual
- **Tipo:** UI
- **Descricao:** Criar painel de clima atual com unidade ativa, condicao e campos opcionais.
- **Rastreabilidade:** RF02; AC02, AC06.
- **Criterios de aceite:**
  - exibe cidade, contexto, temperatura atual e unidade ativa;
  - exibe texto e representacao visual da condicao climatica quando houver codigo;
  - mostra sensacao termica, umidade, vento, precipitacao e pressao quando presentes;
  - campos ausentes sao renderizados como `indisponivel` sem `NaN` ou `undefined` na tela.
- **Dependencias:** T-01, T-02, T-03, T-13
- **Arquivos provaveis:** `src/components/CurrentWeather.tsx`

### T-18 — Renderizar previsao de cinco dias
- **Tipo:** UI
- **Descricao:** Criar cinco blocos diarios independentes a partir do snapshot canonico.
- **Rastreabilidade:** RF03; AC03, AC06.
- **Criterios de aceite:**
  - a interface renderiza exatamente cinco blocos diarios, começando no dia atual;
  - cada bloco mostra data ou dia da semana, minima, maxima e condicao climatica quando validos;
  - dias incompletos exibem indisponibilidade sem deslocar os demais blocos;
  - todas as temperaturas respeitam a unidade ativa em tempo real.
- **Dependencias:** T-01, T-02, T-03, T-04, T-13
- **Arquivos provaveis:** `src/components/Forecast.tsx`

### T-19 — Criar seletor de unidade acessivel
- **Tipo:** UI
- **Descricao:** Implementar `UnitToggle` para Celsius/Fahrenheit sem conversao local acumulativa.
- **Rastreabilidade:** RF04; AC04, AC06; RNF02.
- **Criterios de aceite:**
  - os estados Celsius e Fahrenheit sao distinguiveis por texto e semantica;
  - o controle funciona por teclado e toque;
  - a action chama apenas `setUnit` e não recarrega a pagina;
  - ao alternar unidade, todas as temperaturas visiveis refletem a unidade ativa sem alterar a cidade selecionada.
- **Dependencias:** T-01, T-02, T-13
- **Arquivos provaveis:** `src/components/UnitToggle.tsx`

### T-20 — Compor estados meteorologicos
- **Tipo:** UI
- **Descricao:** Criar `WeatherView` para compor busca, resultados, clima, previsao, refresh, loading, empty e erro usando props e callbacks.
- **Rastreabilidade:** RF01–RF06; AC01–AC06; RNF02.
- **Criterios de aceite:**
  - a tela inicial mostra campo de busca sem painel meteorologico;
  - estados de busca/clima sao semanticamente anunciados com `role=status`/`role=alert` quando aplicavel;
  - erro inicial oferece retry e refresh mantem o ultimo snapshot valido;
  - `WeatherView` nao realiza requisicoes HTTP e continua acessivel em todos os estados.
- **Dependencias:** T-14, T-15, T-16, T-17, T-18, T-19
- **Arquivos provaveis:** `src/components/WeatherView.tsx`

## Entrega 6 — Integracao da tela

### T-21 — Conectar a tela principal ao hook
- **Tipo:** UI
- **Descricao:** Integrar `WeatherView` ao `useWeatherApp` no `App` e encaminhar todas as acoes da sessao.
- **Rastreabilidade:** RF01–RF06; AC01–AC06.
- **Criterios de aceite:**
  - `App` fornece estado e callbacks completos para busca, selecao, unidade, refresh e retry;
  - nenhum componente de apresentacao conhece transporte HTTP ou logica de negocio complexa;
  - a tela inicial e os estados de erro continuam renderizaveis sem quebrar a interface;
  - a integracao e testavel via `App` com o hook e os componentes desacoplados.
- **Dependencias:** T-14, T-20
- **Arquivos provaveis:** `src/App.tsx`

## Entrega 7 — Testes automatizados

### T-22 — Testar conversao de unidade em camada unitaria
- **Tipo:** Test
- **Descricao:** Cobrir exclusivamente a conversao de temperatura e o arredondamento da unidade ativa, sem rede ou DOM.
- **Rastreabilidade:** RF02, RF03, RF04; AC02, AC03, AC04.
- **Criterios de aceite:**
  - testes unitarios validam `0`, `100`, `-40` e valores negativos em Celsius/Fahrenheit;
  - o arredondamento segue o inteiro mais proximo para a UI;
  - a conversao e reversivel sem drift numerico, respeitando a regra de arredondamento;
  - valores `null`, `undefined` e `NaN` sao tratados como indisponiveis e nao geram `NaN` na renderizacao.
- **Dependencias:** T-02
- **Arquivos provaveis:** `tests/unit/lib/temperature.test.ts`

### T-23 — Testar formatacao de datas e geocodificacao
- **Tipo:** Test
- **Descricao:** Cobrir formatacao local de datas e normalizacao de cidades.
- **Rastreabilidade:** RF01, RF03; AC01, AC03.
- **Criterios de aceite:**
  - testes validam labels de datas validas e invalidas sem depender do timezone do navegador;
  - a geocodificacao limita para no maximo 10 resultados e preserva a ordem do provedor;
  - duplicatas sao removidas por `id` ou coordenadas equivalentes;
  - lista vazia e tratada como resultado vazio e nao como erro de servico.
- **Dependencias:** T-04, T-05
- **Arquivos provaveis:** `tests/unit/lib/date.test.ts`, `tests/unit/lib/geocoding.test.ts`

### T-24 — Testar normalizacao de previsao
- **Tipo:** Test
- **Descricao:** Cobrir a normalizacao de payloads meteorologicos.
- **Rastreabilidade:** RF02, RF03, RF06; AC02, AC03, AC06.
- **Criterios de aceite:**
  - uma resposta completa gera 5 dias validos;
  - payload nulo ou sem `current` essencial e rejeitado;
  - dias incompletos sao preservados como `null` sem compactar o array;
  - campos opcionais ausentes nao quebram o restante da renderizacao.
- **Dependencias:** T-06
- **Arquivos provaveis:** `tests/unit/lib/weather.test.ts`

### T-25 — Testar service HTTP com fetch mockado
- **Tipo:** Test
- **Descricao:** Verificar o transporte do service com `fetch` mockado, cobrindo timeout, cancelamento, classificacao de HTTP e validacao de payload.
- **Rastreabilidade:** RF01, RF05, RF06; RNF03, RNF04, RNF09; AC01, AC05, AC06.
- **Criterios de aceite:**
  - 2xx sao aceitos; 4xx/5xx sao classificados como `api`;
  - falhas de rede sao `network`; timeout de 5 segundos e `timeout`;
  - payload JSON invalido e `invalid-payload` e a camada de servico repassa erro tipado sem expor detalhes tecnicos;
  - o mock de `fetch` valida URL, query params e callback de metricas sem registrar query, coordenadas nem PII.
- **Dependencias:** T-07
- **Arquivos provaveis:** `tests/unit/services/request.test.ts`

### T-26 — Testar service de geocodificacao
- **Tipo:** Test
- **Descricao:** Verificar URL, normalizacao e erros do service de geocodificacao com `fetch` mockado.
- **Rastreabilidade:** RF01; AC01, AC06.
- **Criterios de aceite:**
  - a URL inclui `count=10`, `language=pt` e `format=json`;
  - termos vazios e invalidos nao disparam requisicao;
  - lista vazia e tratada como vazio e payload invalido e transformado em `AppError`;
  - a funcao delega para o normalizador e nao toca a rede real.
- **Dependencias:** T-08, T-25
- **Arquivos provaveis:** `tests/unit/services/geocodingService.test.ts`

### T-27 — Testar service de previsao
- **Tipo:** Test
- **Descricao:** Verificar URL, campos solicitados e normalizacao do service de previsao com `fetch` mockado.
- **Rastreabilidade:** RF02, RF03, RF05; AC02, AC03, AC05.
- **Criterios de aceite:**
  - a URL envia coordenadas, `forecast_days=5`, Celsius e `timezone=auto`;
  - o service retorna `WeatherData` normalizado para sucesso;
  - payload invalido gera erro tipado e nao quebra a UI;
  - erro de transporte e separado de erro de payload.
- **Dependencias:** T-09, T-25
- **Arquivos provaveis:** `tests/unit/services/weatherService.test.ts`

### T-28 — Testar cache e deduplicacao dos services
- **Tipo:** Test
- **Descricao:** Verificar cache, promises em andamento e refresh separadamente no service de busca e previsao.
- **Rastreabilidade:** RF01, RF02, RF03, RF05; AC01, AC02, AC03, AC05.
- **Criterios de aceite:**
  - buscas equivalentes reutilizam cache ou Promise em andamento;
  - previsoes equivalentes usam chave de coordenadas normalizadas;
  - `refresh` ignora cache e dispara nova consulta;
  - nenhuma entrada e persistida em `localStorage`.
- **Dependencias:** T-10, T-11, T-26, T-27
- **Arquivos provaveis:** `tests/unit/services/geocodingService.test.ts`, `tests/unit/services/weatherService.test.ts`

### T-29 — Testar hook: estados e acoes
- **Tipo:** Test
- **Descricao:** Testar transicoes, debounce, retry e unidade com services substituidos.
- **Rastreabilidade:** RF01, RF02, RF03, RF04, RF05, RF06; AC01–AC06.
- **Criterios de aceite:**
  - `idle -> loading -> success/empty/error` e validado para busca e clima;
  - submit cancela debounce e evita duplicacao para o mesmo termo;
  - resultados multiplos e unicos permanecem aguardando `selectCity` e nao disparam forecast automaticamente;
  - `selectCity` dispara uma unica consulta usando o identificador e coordenadas da opcao escolhida;
  - `setUnit` nao chama service de rede;
  - retry reexecuta a operacao atual com sucesso ou erro.
- **Dependencias:** T-12, T-13, T-14
- **Arquivos provaveis:** `tests/unit/hooks/useWeatherApp.test.ts`

### T-30 — Testar hook: concorrencia e snapshot
- **Tipo:** Test
- **Descricao:** Testar respostas fora de ordem, refresh, idempotencia e preservacao do ultimo snapshot.
- **Rastreabilidade:** RF02, RF03, RF05, RF06; AC02, AC03, AC05, AC06.
- **Criterios de aceite:**
  - resposta obsoleta nao altera termo, cidade ou snapshot atuais;
  - refresh preserva a ultima previsao valida durante loading e em erro;
  - cliques repetidos na mesma acao sao ignorados ou idempotentes;
  - o estado atual continua consistente mesmo com respostas fora de ordem.
- **Dependencias:** T-14, T-29
- **Arquivos provaveis:** `tests/unit/hooks/useWeatherApp.test.ts`

### T-31 — Testar componentes em loading, erro e vazio
- **Tipo:** Test
- **Descricao:** Testar `SearchForm` e `CityResults` com props controladas, cobrindo os estados visuais de carregamento, vazio e erro sem depender de rede.
- **Rastreabilidade:** RF01; AC01, AC06; RNF02.
- **Criterios de aceite:**
  - label, validacao local e submit sao validados;
  - os estados de `loading`, `empty` e `error` mantem a interface acessivel e informativa sem depender apenas de cor;
  - selecao por mouse e teclado e validada;
  - listas com 2 a 10 resultados exibem contexto geografico, nao selecionam automaticamente uma opcao e limitam o total a 10;
  - contexto geografico e exibido corretamente e as mensagens de indisponibilidade nao vazam detalhes tecnicos.
- **Dependencias:** T-15, T-16
- **Arquivos provaveis:** `tests/unit/components/SearchForm.test.tsx`, `tests/unit/components/CityResults.test.tsx`

### T-32 — Testar clima atual e previsao
- **Tipo:** Test
- **Descricao:** Testar `CurrentWeather` e `Forecast` com dados completos e incompletos.
- **Rastreabilidade:** RF02, RF03; AC02, AC03, AC06.
- **Criterios de aceite:**
  - campos obrigatorios e opcionais sao renderizados quando disponibili;
  - cinco blocos diarios aparecem com min/max e condicao;
  - dias incompletos indicam indisponibilidade sem `NaN` ou `undefined`;
  - a renderizacao e estavel com dados ausentes e nulos.
- **Dependencias:** T-17, T-18
- **Arquivos provaveis:** `tests/unit/components/CurrentWeather.test.tsx`, `tests/unit/components/Forecast.test.tsx`

### T-33 — Testar unidade e composicao da tela
- **Tipo:** Test
- **Descricao:** Testar `UnitToggle`, `WeatherView` e estados semanticos da tela.
- **Rastreabilidade:** RF04, RF06; AC04, AC05, AC06; RNF02.
- **Criterios de aceite:**
  - o evento de troca de unidade dispara callback e atualiza a UI;
  - `role=status` e `role=alert` sao usados em estados de loading e erro;
  - mensagens de retry e refresh continuam acessiveis;
  - o snapshot anterior permanece visivel durante erro ou loading.
- **Dependencias:** T-19, T-20, T-21
- **Arquivos provaveis:** `tests/unit/components/UnitToggle.test.tsx`, `tests/unit/components/WeatherView.test.tsx`

### T-34 — Testar fluxo principal E2E com Playwright
- **Tipo:** Test
- **Descricao:** Validar pelo navegador o fluxo principal da aplicacao com respostas Open-Meteo interceptadas, incluindo mobile e desktop.
- **Rastreabilidade:** RF01–RF06; AC01–AC06; RNF01, RNF02, RNF03, RNF04, RNF05.
- **Criterios de aceite:**
  - cobre busca, selecao, vazio, erro e retry no fluxo principal;
  - cobre desambiguacao com multiplos resultados, limite de 10 opcoes e ausencia de forecast antes da selecao;
  - cobre resultado unico que tambem exige selecao explicita;
  - confirma que uma opcao selecionada usa seu identificador e coordenadas para consultar o clima;
  - valida clima atual e previsao de cinco dias;
  - confirma troca de unidade sem nova requisicao e refresh com snapshot preservado;
  - executa em viewport 320px sem rolagem horizontal e verifica comportamento desktop sem regressao.
- **Dependencias:** T-21
- **Arquivos provaveis:** `tests/e2e/weather-app.spec.ts`

## Entrega 6 — Hardening e entrega

### T-35 — Aplicar responsividade e tema
- **Tipo:** UI
- **Descricao:** Finalizar o tema Tailwind dark glassmorphism e o layout mobile first.
- **Rastreabilidade:** RNF01, RNF02, RNF05; RF01–RF06.
- **Criterios de aceite:**
  - a app funciona a partir de 320px sem overflow horizontal ou sobreposicao;
  - o tema de dark glassmorphism e consistente em mobile e desktop;
  - contrastes e foco visivel atendem requisitos de acessibilidade basicos;
  - a tela continua legivel em portrait e landscape sem clobber de conteudo.
- **Dependencias:** T-21
- **Arquivos provaveis:** `src/index.css`, `tailwind.config.js`

### T-36 — Aplicar acessibilidade ao formulario e resultados
- **Tipo:** UI
- **Descricao:** Finalizar foco, labels, semantica, contraste e operacao por teclado de busca e resultados.
- **Criterios de aceite:** Foco e labels sao visiveis; validacao, loading, vazio e erro sao anunciados; formulario e resultados funcionam por teclado e toque; informacoes criticas nao dependem somente de cor.
- **Dependencias:** T-21, T-35
- **Arquivos provaveis:** `src/components/SearchForm.tsx`, `src/components/CityResults.tsx`

### T-37 — Aplicar acessibilidade aos controles meteorologicos
- **Tipo:** UI
- **Descricao:** Finalizar semantica, contraste e operacao por teclado dos controles meteorologicos.
- **Criterios de aceite:** Refresh, retry e toggle funcionam por teclado e toque; foco e labels sao visiveis; loading, erro e vazio sao anunciados sem depender somente de cor.
- **Dependencias:** T-21, T-35
- **Arquivos provaveis:** `src/components/UnitToggle.tsx`, `src/components/WeatherView.tsx`

### T-38 — Validar seguranca do transporte
- **Tipo:** Test
- **Descricao:** Adicionar casos de timeout, payload parcial e metricas tecnicas ao teste do transporte.
- **Criterios de aceite:** Timeout e rede classificam erros sem detalhes tecnicos; metricas registram duracao, resultado, erro e endpoint sem termo completo, coordenadas ou PII.
- **Dependencias:** T-25
- **Arquivos provaveis:** `tests/unit/services/request.test.ts`

### T-39 — Validar falhas do hook
- **Tipo:** Test
- **Descricao:** Cobrir payload parcial, refresh concorrente e mensagens seguras no teste do hook.
- **Criterios de aceite:** Campos parciais viram indisponiveis; timeout e rede oferecem retry; refresh preserva o ultimo snapshot; respostas concorrentes nao exibem detalhes tecnicos.
- **Dependencias:** T-14, T-30
- **Arquivos provaveis:** `tests/unit/hooks/useWeatherApp.test.ts`

### T-40 — Validar mensagens seguras da UI
- **Tipo:** Test
- **Descricao:** Verificar mensagens de erro e indisponibilidade nos componentes.
- **Criterios de aceite:** A UI nao exibe detalhes tecnicos, termo completo ou coordenadas; estados de erro e dados parciais continuam acessiveis e legiveis.
- **Dependencias:** T-33, T-36, T-37
- **Arquivos provaveis:** `tests/unit/components/WeatherView.test.tsx`

### T-41 — Executar verificacoes de entrega
- **Tipo:** Infra
- **Descricao:** Confirmar que a implementacao esta pronta para entrega usando os comandos oficiais do projeto.
- **Criterios de aceite:** `pnpm lint`, `pnpm build`, `pnpm test` e `pnpm test:e2e` passam; nenhum teste depende da rede real; o build de producao e gerado sem erros TypeScript.
- **Dependencias:** T-22, T-23, T-24, T-25, T-26, T-27, T-28, T-29, T-30, T-31, T-32, T-33, T-34, T-35, T-36, T-37, T-38, T-39, T-40
- **Arquivos provaveis:** `package.json`, `playwright.config.ts`, arquivos de CI se necessarios

## Rastreabilidade

| Requisito | Tarefas principais |
| --- | --- |
| RF01 / AC01 — busca e selecao | T-05, T-08, T-10, T-12, T-15, T-16, T-26, T-29, T-31, T-34 |
| RF02 / AC02 — clima atual | T-03, T-06, T-09, T-13, T-17, T-24, T-27, T-32, T-34 |
| RF03 / AC03 — previsao de cinco dias | T-04, T-06, T-09, T-13, T-18, T-24, T-27, T-32, T-34 |
| RF04 / AC04 — unidade | T-02, T-13, T-19, T-29, T-33, T-34 |
| RF05 / AC05 — atualizacao e retry | T-07, T-09, T-13, T-14, T-20, T-21, T-27, T-30, T-33, T-34, T-39 |
| RF06 / AC06 — estados | T-01, T-12, T-13, T-14, T-20, T-21, T-29, T-31, T-33, T-34 |
| RNF01–RNF02, RNF05 — responsividade e acessibilidade | T-15, T-16, T-19, T-20, T-21, T-31, T-33, T-34, T-35, T-36, T-37 |
| RNF03–RNF04 — desempenho e confiabilidade | T-07, T-10, T-11, T-12, T-13, T-14, T-25, T-28, T-29, T-30, T-34, T-38, T-39 |
| RNF06–RNF07 — privacidade e separacao de camadas | T-01, T-07, T-12, T-13, T-20, T-21, T-25, T-26, T-27, T-38, T-40 |
| RNF08–RNF09 — disponibilidade e observabilidade | T-10, T-11, T-14, T-25, T-28, T-30, T-34, T-38, T-39 |