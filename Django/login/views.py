import pika
import json
from django.conf import settings
from django.http import HttpResponseRedirect
from django.shortcuts import render
from django.contrib.auth.forms import UserCreationForm
from django.http import JsonResponse
from .models import User


def registrar_usuario(request):
    if request.method == 'POST':
        rut = request.POST['rut']
        nombre = request.POST['nombre']
        correo = request.POST['correo']
        clave = request.POST['clave']

        comando_registro = {
            'rut': rut,
            'nombre': nombre,
            'correo': correo,
            'clave': clave,
            'operacion': 'mysql',  # o 'mongodb'
        }
        comando_registro1 = {
            'rut': rut,
            'nombre': nombre,
            'correo': correo,
            'clave': clave,
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
    lista_usuarios = [{'rut': user.rut, 'nombre': user.nombre, 'correo': user.correo} for user in users]
    return JsonResponse({'lista_usuarios': lista_usuarios})
    
