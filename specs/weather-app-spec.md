# Weather App — Especificação de Produto

## Overview

A aplicação permite consultar o clima atual e a previsão de cinco dias de uma cidade selecionada por meio de uma interface simples, responsiva e acessível. A versão inicial foi definida para uso principal em dispositivos móveis, com suporte funcional em desktop, priorizando velocidade, legibilidade e recuperação segura de falhas em conexões instáveis.

Objetivo do produto:
- permitir busca por cidade em até 10 resultados relevantes;
- permitir desambiguar cidades com o mesmo nome antes de consultar o clima;
- exibir clima atual e previsão de cinco dias para uma cidade selecionada;
- alternar entre Celsius e Fahrenheit sem requerer nova busca;
- manter a interface utilizável mesmo com falhas de rede, respostas incompletas ou ausência de dados.

Personas principais:
- Marina, viajante frequente, precisa localizar rapidamente o clima de um destino antes de viajar.
- Diego, profissional que trabalha na rua, precisa verificar temperatura e condição climática em poucos segundos.
- Beatriz, analista, precisa consultar uma cidade por vez e manter consistência de unidades e valores durante a sessão.

A solução usa Open-Meteo como provedor de geocodificação e previsão, sem autenticação ou chave de API. A primeira versão suporta uma cidade selecionada por vez; comparação entre múltiplas cidades está fora do escopo.

## Functional Requirements

### RF01 — Buscar cidade

O usuário deve informar um texto de busca e receber cidades compatíveis com esse termo. A busca deve ser acionada por envio do formulário ou por pausa de 300 ms após digitação, o que ocorrer primeiro.

Regras de negócio:
- o termo deve conter no mínimo 2 caracteres após trim;
- busca com texto vazio, somente espaços ou menor que 2 caracteres não deve disparar requisição;
- a aplicação deve exibir no máximo 10 resultados por busca;
- cada resultado deve apresentar, no mínimo, nome da cidade e contexto geográfico relevante, como país, estado ou região, quando disponível;
- resultados duplicados para o mesmo termo devem ser evitados no mesmo ciclo de busca;
- cidades com nomes repetidos devem ser diferenciadas por contexto geográfico;
- quando houver mais de um resultado, a aplicação deve apresentar uma lista de desambiguação para que o usuário selecione explicitamente uma cidade;
- enquanto houver mais de um resultado e nenhuma cidade tiver sido selecionada, a aplicação não deve iniciar a consulta do clima;
- a seleção de uma cidade deve iniciar imediatamente a consulta do clima dessa cidade;
- a lista de desambiguação deve ser navegável por teclado e cada opção deve ser identificável por nome e contexto geográfico.

Dados mínimos esperados da busca:
- nome da cidade;
- país ou região;
- identificador geográfico para distinguir cidades com mesmo nome;
- latitude e longitude, quando disponíveis.

Critérios de aceite:
- Given que o usuário informa um termo válido, When envia a busca, Then a aplicação lista até 10 cidades compatíveis em até 5 segundos em rede 4G estável.
- Given que a busca retorna mais de uma cidade, When os resultados são exibidos, Then a aplicação apresenta uma lista de desambiguação com no máximo 10 opções, cada uma com nome e contexto geográfico disponível, e aguarda a seleção do usuário antes de consultar o clima.
- Given que a busca retorna exatamente uma cidade, When o resultado é processado, Then a aplicação permite selecioná-la e inicia a consulta do clima somente após a seleção.
- Given que o usuário seleciona uma opção da lista de desambiguação, When a seleção é confirmada, Then a aplicação identifica a cidade selecionada e inicia a consulta do clima correspondente.
- Given que o termo não corresponde a nenhuma cidade, When a busca termina, Then a interface exibe a mensagem “Nenhuma cidade encontrada para “X”.”
- Given que a geocodificação falha, When a busca é concluída, Then a aplicação exibe a mensagem “Não foi possível localizar cidades. Tente novamente.” e mantém os controles acessíveis.
- Given que o usuário repete a mesma busca consecutivamente, When a segunda requisição é disparada, Then a aplicação não envia uma segunda requisição redundante para o mesmo termo.

### RF02 — Exibir clima atual

Após a seleção de uma cidade, a aplicação deve renderizar as informações climáticas atuais mais relevantes, sem quebrar a interface quando alguns campos não vierem preenchidos.

Campos obrigatórios para exibição da seção principal:
- cidade;
- país ou região;
- temperatura atual;
- unidade ativa;
- condição climática;
- representação visual da condição.

Campos opcionais, exibidos quando disponíveis:
- sensação térmica;
- umidade;
- velocidade do vento;
- precipitação;
- pressão.

Critérios de aceite:
- Given que a consulta meteorológica returnou dados válidos, When a cidade é selecionada, Then a interface exibe cidade, país ou região, temperatura e unidade ativa.
- Given que a resposta contém um código de condição climática, When a seção é renderizada, Then o texto e a representação visual da condição são exibidos.
- Given que sensação térmica, umidade ou vento estão disponíveis, When a seção é renderizada, Then esses campos são exibidos em texto legível.
- Given que qualquer campo obrigatório ou opcional estiver ausente, When a seção é renderizada, Then o sistema exibe o estado “indisponível” sem quebrar a interface.

### RF03 — Exibir previsão de cinco dias

A aplicação deve apresentar a previsão para os próximos cinco dias, incluindo o dia atual e mais quatro dias seguintes. A previsão deve ser renderizada como blocos diários independentes.

Regras de negócio:
- a previsão deve conter exatamente cinco entradas diárias, quando os dados estiverem disponíveis;
- cada item deve exibir, no mínimo, data ou dia da semana, temperatura mínima, temperatura máxima e condição climática;
- os valores devem seguir a unidade ativa no momento da renderização;
- dados inválidos ou ausentes em um dia não devem interromper a renderização dos demais dias.

Critérios de aceite:
- Given que a previsão retornou dados válidos, When a seção é renderizada, Then a interface mostra cinco blocos diários, começando no dia atual.
- Given que um bloco diário contém dados válidos, When ele é renderizado, Then mostra data ou dia da semana, mínima, máxima e condição climática.
- Given que um dia não possui dados completos, When a previsão é renderizada, Then o item indica indisponibilidade sem apresentar valores inválidos.
- Given que a unidade ativa é Celsius ou Fahrenheit, When a previsão é renderizada, Then todas as temperaturas usam a unidade ativa.

### RF04 — Alternar unidade de temperatura

O usuário deve poder alternar entre Celsius e Fahrenheit sem recarregar a página ou perder a cidade selecionada. A unidade ativa permanece válida durante a sessão atual.

Regra de conversão e arredondamento:
- a conversão deve ocorrer apenas na camada de apresentação;
- a fonte de dados não deve ser reconsultada ao trocar a unidade;
- todas as temperaturas exibidas devem ser arredondadas para o inteiro mais próximo;
- ao alternar para Celsius e depois para Fahrenheit e voltar, o valor deve coincidir com a conversão original respeitando o arredondamento.

Critérios de aceite:
- Given que uma cidade foi selecionada, When o usuário alterna a unidade, Then a cidade permanece selecionada e todas as temperaturas visíveis são convertidas imediatamente.
- Given que a unidade ativa foi definida, When o usuário consulta outra cidade na mesma sessão, Then a unidade selecionada continua ativa.
- Given que a temperatura foi exibida em Celsius, When o usuário alterna para Fahrenheit e retorna a Celsius, Then o valor exibido volta ao valor original, conforme arredondamento.

### RF05 — Atualizar dados meteorológicos

O usuário deve poder disparar atualização manual dos dados da cidade selecionada. A ação deve indicar claramente o estado de carregamento.

Regras de negócio:
- a ação de atualização deve estar disponível enquanto houver cidade selecionada;
- a cidade atual deve ser mantida durante a atualização;
- em caso de falha na atualização, a última previsão válida deve continuar visível;
- uma nova tentativa deve poder ser iniciada manualmente após falha.

Critérios de aceite:
- Given que existe uma cidade selecionada, When o usuário visualiza a tela, Then a ação de atualização aparece como visível e acionável.
- Given que existe uma cidade selecionada, When o usuário aciona atualização, Then a interface exibe spinner ou equivalente e mantém a cidade identificada.
- Given que a atualização falhou, When a resposta retorna erro, Then a aplicação preserva a última previsão válida e exibe a mensagem “Não foi possível atualizar os dados. Mostrando a última previsão disponível.”
- Given que a primeira consulta falhou, When o usuário tenta novamente, Then a interface oferece a ação de retry de forma explícita.

### RF06 — Estados da aplicação

A aplicação deve tratar de forma explícita os seguintes estados: inicial, busca em andamento, carregamento de clima, sucesso, sem resultado, erro e dados incompletos.

Critérios de aceite:
- Given que o usuário ainda não selecionou uma cidade, When a aplicação é aberta, Then o estado inicial exibe campo de busca e sem dados meteorológicos.
- Given que uma busca ou consulta foi iniciada, When a resposta ainda não chegou, Then a interface mostra indicador de carregamento com texto equivalente.
- Given que a consulta retornou resultado válido, When o processamento termina, Then os dados são renderizados.
- Given que a busca não encontrou cidades compatíveis, When a busca termina, Then a interface exibe mensagem de ausência de resultados.
- Given que ocorre falha de serviço ou rede, When o erro é retornado, Then a interface informa a falha e mantém controles principais acessíveis.
- Given que a resposta contém dados incompletos, When os dados são processados, Then a interface indica indisponibilidade sem deixar tela em branco ou travada.

## Data contract and validation

A camada de serviço deve validar e mapear as respostas do provedor antes da renderização.

Geocoding requirements:
- o provedor pode retornar uma lista de cidades equivalentes;
- cada item deve conter nome da cidade e contexto geográfico suficiente para distinguir duplicatas;
- a camada de serviço deve retornar no máximo 10 cidades válidas e distintas para a interface;
- a interface deve preservar a lista de resultados para permitir a desambiguação quando houver mais de uma cidade;
- se a lista retornar vazia, a aplicação deve tratar como “nenhuma cidade encontrada”;
- se a resposta falhar ou o timeout ocorrer, a aplicação deve tratar como erro de serviço.

Weather requirements:
- a consulta do clima atual exige temperatura e código de condição;
- a previsão diária exige data, temperatura mínima, temperatura máxima e código de condição;
- campos ausentes ou inválidos devem ser tratados como indisponíveis e não devem quebrar o restante da interface;
- a aplicação deve rejeitar payloads inválidos antes de renderizar valores em tela.

## User Stories

- Como Marina, quero buscar uma cidade por nome para encontrar rapidamente o clima do destino da viagem. (RF01)
- Como Marina, quero escolher a cidade correta quando houver mais de uma correspondência para o nome informado, para consultar o clima do destino certo. (RF01)
- Como Marina, quero visualizar o clima atual com temperatura, condição e dados adicionais para decidir o que levar na mala. (RF02)
- Como Marina, quero consultar a previsão de cinco dias para planejar atividades e rotas durante a viagem. (RF03)
- Como Diego, quero verificar rapidamente a temperatura e a condição climática da minha cidade para me organizar sem distrações. (RF02)
- Como Diego, quero alternar entre Celsius e Fahrenheit na mesma tela para interpretar melhor as temperaturas em qualquer contexto. (RF04)
- Como Diego, quero atualizar manualmente os dados meteorológicos da cidade selecionada para confirmar condições recentes antes de sair para a rua. (RF05)
- Como Beatriz, quero que a unidade de temperatura e os valores da sessão permaneçam consistentes para evitar erros de análise. (RF04)

## Acceptance Criteria

### AC01 — Busca e seleção
- Given que o usuário informa um termo válido, When envia a busca, Then recebe até 10 resultados relevantes.
- Given que existem múltiplas cidades compatíveis, When os resultados são exibidos, Then recebe uma lista de desambiguação com no máximo 10 opções identificadas por nome e contexto geográfico, sem consulta meteorológica automática.
- Given que o usuário seleciona uma cidade da lista, When a seleção é realizada, Then a consulta meteorológica usa o identificador e as coordenadas da cidade selecionada.
- Given que o termo não corresponde a nenhuma cidade, When a busca termina, Then a aplicação exibe a mensagem “Nenhuma cidade encontrada para “X”.”
- Given que o serviço de geocodificação falha, When a busca termina, Then a aplicação exibe mensagem de erro e mantém a busca acessível.

### AC02 — Clima atual
- Given que uma cidade foi selecionada e os dados são válidos, When a seção de clima atual é renderizada, Then exibe cidade, país ou região, temperatura e unidade ativa.
- Given que a resposta contém condição climática, When a seção é exibida, Then o texto da condição e sua representação visual aparecem juntos.
- Given que sensação térmica, umidade ou vento estão disponíveis, When a seção é renderizada, Then esses valores também são exibidos.

### AC03 — Previsão de cinco dias
- Given que a previsão retornou dados válidos, When a seção é exibida, Then aparecem cinco blocos diários começando no dia atual.
- Given que um dia possui dados válidos, When seu bloco é renderizado, Then exibe data ou dia da semana, mínima, máxima e condição climática.
- Given que um dia não possui dados completos, When a previsão é renderizada, Then o item indica indisponibilidade sem valores inválidos.

### AC04 — Unidade de temperatura
- Given que a tela exibe temperaturas, When o usuário troca a unidade, Then todas as temperaturas visíveis refletem a unidade ativa sem recarregar a página.
- Given que a unidade selecionada é mantida na sessão, When o usuário consulta outra cidade, Then a unidade permanece ativa.

### AC05 — Atualização manual
- Given que existe uma cidade selecionada, When o usuário aciona atualizar, Then a ação mostra estado de carregamento e mantém a cidade identificada.
- Given que a última previsão válida existe, When a atualização falha, Then a aplicação preserva a previsão e informa a falha explicitamente.
- Given que a primeira consulta falha, When o erro é apresentado, Then a interface oferece uma ação explícita para tentar novamente.

### AC06 — Estados de interface
- Given que a aplicação está em qualquer estado do fluxo, When esse estado é exibido, Then os estados inicial, carregamento, erro, vazio e dados incompletos são distinguíveis e a tela não fica em branco.
- Given que ocorreu falha ou ausência de dados, When o estado correspondente é exibido, Then os elementos principais permanecem acessíveis e a mensagem informa a situação de forma compreensível.

## Non-Functional Requirements

### RNF01 — Responsividade
A aplicação deve funcionar em dispositivos móveis, tablets e desktops a partir de 320 px de largura. A interface deve evitar rolagem horizontal, sobreposição de conteúdo e dificuldades de uso em retrato e paisagem.

### RNF02 — Acessibilidade
A interface deve usar labels acessíveis, foco visível, navegação por teclado e estados semânticos. Informações críticas não devem depender apenas de cor; ícones devem ter texto descritivo e contraste compatível com WCAG AA, quando aplicável.

### RNF03 — Desempenho
A interface deve apresentar resposta em até 1 segundo após uma ação do usuário. Em 4G estável, 95% das buscas e consultas devem retornar resultado ou erro em até 5 segundos, desconsiderando indisponibilidade do provedor externo. Debounce e cache em memória durante a sessão devem ser utilizados quando tecnicamente viáveis.

### RNF04 — Confiabilidade
Falhas de rede, respostas inválidas e indisponibilidade do provedor não devem travar a aplicação. Todas as requisições devem ter timeout explícito de 5 segundos e tratamento de erro com possibilidade de nova tentativa manual. A última previsão válida deve permanecer visível enquanto a atualização está em andamento.

### RNF05 — Compatibilidade
A aplicação deve ser compatível com os navegadores modernos atuais em desktop e mobile, com comportamento consistente nos principais ambientes suportados.

### RNF06 — Segurança e privacidade
A aplicação não deve solicitar dados pessoais ou localização do usuário. Entradas do usuário devem ser tratadas com segurança antes de serem usadas em requisições ou exibidas na UI. A primeira versão não usa GPS nem coleta localização do usuário.

### RNF07 — Manutenibilidade
A solução deve separar interface, negócio e acesso ao provedor meteorológico para permitir evolução independente, testes e manutenção mais simples.

### RNF08 — Disponibilidade
A aplicação deve atingir disponibilidade mensal mínima de 99,5%, excluindo manutenções programadas. Quando o provedor externo estiver indisponível, a interface deve continuar utilizável e informar claramente que os dados mais recentes não puderam ser obtidos.

### RNF09 — Observabilidade
A aplicação deve registrar erros de comunicação, respostas inválidas e falhas de conversão sem armazenar dados pessoais ou localização precisa do usuário. Métricas de tempo de busca, tempo de consulta, taxa de erro e indisponibilidade do provedor devem ser coletadas quando disponíveis.

## Tabela de rastreabilidade

A matriz abaixo relaciona cada User Story aos critérios de aceite que verificam
seu comportamento e aos requisitos não funcionais que condicionam sua entrega.

| ID | User Story | Acceptance Criteria | RNFs relevantes |
| --- | --- | --- | --- |
| US01 | Como Marina, quero buscar uma cidade por nome para encontrar rapidamente o clima do destino da viagem. | AC01, AC06 | RNF01, RNF02, RNF03, RNF04, RNF06, RNF07, RNF08, RNF09 |
| US02 | Como Marina, quero visualizar o clima atual com temperatura, condição e dados adicionais para decidir o que levar na mala. | AC02, AC06 | RNF01, RNF02, RNF03, RNF04, RNF05, RNF07 |
| US03 | Como Marina, quero consultar a previsão de cinco dias para planejar atividades e rotas durante a viagem. | AC03, AC06 | RNF01, RNF02, RNF03, RNF04, RNF05, RNF07 |
| US04 | Como Diego, quero verificar rapidamente a temperatura e a condição climática da minha cidade para me organizar sem distrações. | AC02, AC06 | RNF01, RNF02, RNF03, RNF04, RNF05 |
| US05 | Como Diego, quero alternar entre Celsius e Fahrenheit na mesma tela para interpretar melhor as temperaturas em qualquer contexto. | AC04, AC06 | RNF01, RNF02, RNF03, RNF05, RNF07 |
| US06 | Como Diego, quero atualizar manualmente os dados meteorológicos da cidade selecionada para confirmar condições recentes antes de sair para a rua. | AC05, AC06 | RNF01, RNF02, RNF03, RNF04, RNF05, RNF07, RNF08, RNF09 |
| US07 | Como Beatriz, quero que a unidade de temperatura e os valores da sessão permaneçam consistentes para evitar erros de análise. | AC04, AC06 | RNF01, RNF02, RNF03, RNF04, RNF05, RNF07 |

## Edge Cases

- busca com texto vazio, somente espaços ou menor que 2 caracteres;
- cidade inexistente ou muito genérica;
- cidades com nome duplicado em diferentes países ou regiões;
- busca que retorna entre 2 e 10 cidades e exige escolha explícita;
- busca que retorna mais de 10 cidades e deve exibir somente as 10 primeiras segundo a ordenação do provedor;
- falha temporária de rede;
- provedor lento ou indisponível;
- resposta incompleta, inválida ou nula;
- timeout de consulta;
- previsão com algum dia ausente ou incompleto;
- conversão para Fahrenheit seguida de arredondamento;
- perda de conexão durante atualização manual;
- telas muito pequenas ou orientações diferentes;
- múltiplas cliques em atualizar ou busca repetida no mesmo termo.

## Assumptions

- a aplicação será entregue em português do Brasil;
- Open-Meteo será o provedor oficial de geocodificação e previsão;
- não haverá autenticação na primeira versão;
- o usuário seleciona manualmente a cidade por meio da busca;
- quando houver múltiplas correspondências, o usuário deverá selecionar explicitamente uma opção de uma lista limitada a 10 resultados;
- a ordenação dos resultados de desambiguação será a ordem relevante retornada pelo provedor;
- a previsão será exibida em formato diário, com cinco dias, começando no dia atual;
- Celsius será a unidade padrão inicial;
- Fahrenheit será uma alternativa de visualização, sem alterar a fonte de dados;
- a unidade escolhida não será persistida entre sessões;
- a aplicação dependerá de conexão com a internet para consultar dados atualizados;
- a atualização manual será suficiente para a primeira versão;
- o layout priorizará mobile first; sem histórico persistente, favoritos ou GPS.

## Risks

- provedor externo pode ficar indisponível ou responder com lentidão;
- cidades com mesmo nome podem gerar ambiguidades;
- dados meteorológicos podem estar incompletos ou inconsistentes;
- limites de requisição podem afetar o uso da aplicação;
- conversão de unidades pode gerar pequenas variações visuais ao arredondar;
- a interface pode ter dificuldade em telas muito pequenas ou baixa luminosidade.

Mitigações:
- exibir mensagens de erro claras e manter a última previsão válida disponível;
- mostrar contexto geográfico e exigir seleção explícita para distinguir cidades;
- limitar a lista de desambiguação a 10 resultados para preservar legibilidade e tempo de escolha;
- validar campos e tratar dados incompletos explicitamente;
- aplicar debounce e cache em memória durante a sessão;
- priorizar legibilidade e contraste em layouts pequenos.

## Out of Scope

A primeira versão não inclui:
- autenticação, cadastro ou perfis;
- favoritos, histórico persistido ou cidades salvas entre sessões;
- previsão horária detalhada;
- localização automática via GPS;
- alertas avançados, recomendações de uso ou mapas interativos;
- persistência de unidade de temperatura em armazenamento local;
- atualização automática periódica sem ação do usuário;
- suporte multilíngue além do idioma inicial;
- comparação de múltiplas cidades;
- funcionalidade offline completa;
- notificações push ou exportação de previsões;
- instalação como PWA;
- painel administrativo ou observabilidade avançada além do mínimo funcional.

## Open Questions

Não há bloqueadores para a implementação da primeira versão. Decisões futuras sobre persistência entre sessões, idiomas adicionais, funcionamento offline e troca de provedor podem ser tratadas em versões posteriores.

## Decisão de Escopo

- a versão inicial suporta uma cidade selecionada por vez;
- a comparação de múltiplas cidades fica fora do escopo;
- o produto prioriza consultas rápidas de clima atual e previsão de cinco dias;
- a primeira versão não inclui autenticação, favoritos, histórico persistente ou GPS.
