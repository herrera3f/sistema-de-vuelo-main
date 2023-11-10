# views.py en tu aplicación Django

from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
import pika
import json
from django.conf import settings
from django.contrib.auth.forms import UserCreationForm

def registrar_usuario(request):
    if request.method == 'POST':
        # Procesar el formulario de registro y obtener los datos del usuario
        rut = request.POST['rut']
        nombre = request.POST['nombre']
        correo = request.POST['correo']
        clave = request.POST['clave']

        # Crear el comando de registro
        comando_registro = {
            'operacion':'agregar_usuario',
            'rut': rut,
            'nombre': nombre,
            'correo': correo,
            'clave': clave,
        }

        # Enviar el comando a RabbitMQ
        enviar_comando_a_rabbitmq(comando_registro)

        # Redireccionar a la página de inicio de sesión
        return redirect('iniciar_sesion')

    # Renderizar el formulario de registro
    return render(request, 'login/registro.html')

def enviar_comando_a_rabbitmq(comando):
    try:
        connection = pika.BlockingConnection(pika.ConnectionParameters(
            host=settings.RABBITMQ_HOST,
            port=settings.RABBITMQ_PORT,
            credentials=pika.PlainCredentials(
                settings.RABBITMQ_USERNAME,
                settings.RABBITMQ_PASSWORD,
            ),
        ))
        channel = connection.channel()

        exchange_name = 'escritura_exchange'
        
        channel.exchange_declare(exchange=exchange_name, exchange_type='direct', durable=True)

        # Publica el mensaje en el exchange
        channel.basic_publish(
            exchange=exchange_name,
            routing_key='escritura',
            body=json.dumps(comando),
        )

        connection.close()
    except Exception as e:
        print(f'Error al enviar el comando a RabbitMQ: {e}')



