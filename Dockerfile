FROM rabbitmq:3.9-management

RUN apt-get update && apt-get install -y wget unzip

RUN wget https://github.com/rabbitmq/rabbitmq-delayed-message-exchange/releases/download/3.9.0/rabbitmq_delayed_message_exchange-3.9.0.ez
RUN mv rabbitmq_delayed_message_exchange-3.9.0.ez $RABBITMQ_HOME/plugins/

RUN rabbitmq-plugins enable --offline rabbitmq_delayed_message_exchange
