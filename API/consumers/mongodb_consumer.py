import pika
import json
from django.contrib.auth.models import User  # Asegúrate de importar el modelo correcto

# Configuración de RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Cola de RabbitMQ para MongoDB
queue_name = 'escritura_queue_mongodb'
channel.queue_declare(queue=queue_name, durable=True)

def procesarMensajeDeEscrituraMongoDB(msg):
    comando = json.loads(msg.body)

    # Procesa el comando y realiza la escritura en MongoDB
    try:
        User.objects.create(
            username=comando['nombre'],
            email=comando['correo'],
            password=comando['clave'],
            rut=comando['rut']  # Agregar el campo "rut"
        )
        print('Cliente agregado en MongoDB.')
    except Exception as e:
        print(f'Error al crear usuario en MongoDB: {e}')

def iniciarConsumidorMongoDB():
    channel.basic_consume(queue=queue_name, on_message_callback=procesarMensajeDeEscrituraMongoDB, auto_ack=True)
    channel.queue_declare(queue=queue_name, durable=True)
    channel.basic_consume(queue=queue_name, on_message_callback=procesarMensajeDeEscrituraMongoDB, auto_ack=True)
    print('Consumidor de escritura para MongoDB iniciado. Esperando mensajes...')
    channel.start_consuming()

iniciarConsumidorMongoDB()