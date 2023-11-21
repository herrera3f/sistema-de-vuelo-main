import pika
import json
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from .models import User
from django.contrib.sessions.models import Session
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect, JsonResponse
from django.contrib.auth.models import User
import json
import pika
import urllib.request as urllib_request
import logging

def registrar_usuario(request):
    if request.method == 'POST':
        rut = request.POST['rut']
        nombre = request.POST['nombre']
        email = request.POST['email']
        contraseña = request.POST['contraseña']

        # Aquí deberías almacenar el "Rut" en la sesión
        request.session['usuario_rut'] = rut
        # Imprime el valor del Rut en la consola o registros
        print(f'Rut almacenado en la sesión: {rut}')
        logging.info(f'Rut almacenado en la sesión: {rut}')

        comando_registro = {
            'rut': rut,
            'nombre': nombre,
            'email': email,
            'contraseña': contraseña,
            'operacion': 'mysql',  # o 'mongodb'
        }
        comando_registro1 = {
            'rut': rut,
            'nombre': nombre,
            'email': email,
            'contraseña': contraseña,
            'operacion': 'mongodb',  # o 'mongodb'
        }

        # Enviar el comando a RabbitMQ
        enviar_comando_a_rabbitmq(comando_registro)
        enviar_comando_a_rabbitmq(comando_registro1)

        return HttpResponseRedirect('/registro_exitoso/')

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

        # Publica el mensaje en la cola
        channel.basic_publish(
            exchange=exchange_name,
            routing_key='escritura',
            body=json.dumps(comando),
        )

        connection.close()
    except Exception as e:
        print(f'Error al enviar el comando a RabbitMQ: {e}')



def listar_usuarios(request):
    request.method == 'GET'
    users = User.objects.all()
    lista_usuarios = [{'rut': user.rut, 'nombre': user.nombre, 'email': user.email} for user in users]
    return JsonResponse({'lista_usuarios': lista_usuarios})
    
