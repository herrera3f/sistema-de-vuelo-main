# consumers/mysql_consumer.py
import pika
import json
import mysql.connector

# Configuración de RabbitMQ
connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
channel = connection.channel()

# Cola de RabbitMQ para MySQL
queue_name = 'escritura_queue_mysql'
channel.queue_declare(queue=queue_name, durable=True)

# Conexión a MySQL
mysql_config = {
    'host': 'db4free.net',
    'user': 'herrera3f',
    'password': 'Bsmh.7700',
    'database': 'bd_brandon',
}

def procesarMensajeDeEscrituraMySQL(msg):
    comando = json.loads(msg.body)

    # Procesa el comando y realiza la escritura en MySQL
    connection = mysql.connector.connect(**mysql_config)
    cursor = connection.cursor()
    
    try:
        sql = 'INSERT INTO clientes (rut, nombre, correo, clave) VALUES (%s, %s, %s, %s)'
        values = (comando['rut'], comando['nombre'], comando['correo'], comando['clave'])
        cursor.execute(sql, values)
        connection.commit()
        print(f'Cliente agregado en MySQL. ID: {cursor.lastrowid}')
    except Exception as e:
        print(f'Error al insertar en MySQL: {e}')
        connection.rollback()
    finally:
        cursor.close()
        connection.close()

def iniciarConsumidorMySQL():
    channel.basic_consume(queue=queue_name, on_message_callback=procesarMensajeDeEscrituraMySQL, auto_ack=True)
    channel.queue_declare(queue=queue_name, durable=True)
    channel.basic_consume(queue=queue_name, on_message_callback=procesarMensajeDeEscrituraMySQL, auto_ack=True)
    print('Consumidor de escritura para MySQL iniciado. Esperando mensajes...')
    channel.start_consuming()

iniciarConsumidorMySQL()