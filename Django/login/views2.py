from django import forms
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth import login
from django.shortcuts import render, redirect
import pika
import json
from django.conf import settings

<<<<<<< HEAD

def send_api_request(request):
=======
class EmailAuthenticationForm(AuthenticationForm):
    username = forms.EmailField(widget=forms.TextInput(attrs={'autofocus': True}), label="Email")

def iniciar_sesion(request):
>>>>>>> 9d2e6f0802eb4b603d638990a0fe31044988439c
    if request.method == 'POST':
        form = EmailAuthenticationForm(request, request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)

            # Datos del usuario autenticado
            username = user.username

            # Conexión a RabbitMQ
            connection = pika.BlockingConnection(pika.ConnectionParameters(
                host=settings.RABBITMQ_HOST,
                port=settings.RABBITMQ_PORT,
                credentials=pika.PlainCredentials(
                    settings.RABBITMQ_USERNAME,
                    settings.RABBITMQ_PASSWORD,
                ),
            ))
            channel = connection.channel()

            # Define un intercambio y envía un mensaje
            exchange_name = 'autenticacion_exchange'
            channel.exchange_declare(exchange=exchange_name, exchange_type='direct')

            comando_autenticacion = {
                'usuario': username,
                'evento': 'inicio_sesion',
                # Otros datos relacionados con el inicio de sesión que desees enviar
            }

            channel.basic_publish(
                exchange=exchange_name,
                routing_key='autenticacion',
                body=json.dumps(comando_autenticacion),
            )

            connection.close()

            # Redirigir al usuario a la página deseada después del inicio de sesión
            return redirect('pagina_de_inicio')  # Reemplaza 'pagina_de_inicio' con la URL deseada
    else:
        form = EmailAuthenticationForm()

    return render(request, 'login/iniciar_sesion.html', {'form': form})





