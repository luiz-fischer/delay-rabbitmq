# Proof of Concept: RabbitMQ com Delayed Messaging Plugin na API Node.js Express

Este projeto é uma prova de conceito de uma API Node.js Express que utiliza RabbitMQ com o plugin `rabbitmq_delayed_message_exchange` para controlar o fluxo de processamento de mensagens. Utilizamos o RabbitMQ para enfileirar as mensagens e controlar o ritmo de processamento, e `amqplib` para interagir com o RabbitMQ na nossa aplicação Node.js.

## Pré-requisitos

- Node.js
- Yarn
- Docker e Docker Compose
- RabbitMQ com o plugin rabbitmq_delayed_message_exchange ativado

## Instruções de instalação

1) Instale as dependências do projeto executando yarn install.
2) Build imagem: ```docker build -t rabbitmq:3.9-management-delayed .```w
3) V1: ```docker-compose up -d``` |  V2: ```docker compose up -d```
4) yarn start


### Observações
Esta POC é apenas um exemplo de como o RabbitMQ e seu plugin rabbitmq_delayed_message_exchange podem ser usados em uma API Express para controlar o fluxo de processamento de mensagens. Na implementação real, seria necessário tratar os erros e falhas de forma adequada, além de adicionar testes e logging.
Verificar se o plugin esta ativo:

```
docker compose exec rabbitmq rabbitmq-plugins list
```