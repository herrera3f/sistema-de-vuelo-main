import pika
from django.http import JsonResponse


def send_api_request(request):
    if request.method == 'POST':
        data = {
            'username': request.POST['username'],
            'password': request.POST['password'],
            # Otras datos necesarios para la solicitud a la API en Node.js
        }
        message = json.dumps(data)

        # Publica el mensaje en la cola de RabbitMQ
        channel.basic_publish(exchange='',
                              routing_key='api_request_queue',
                              body=message)
        return JsonResponse({'message': 'Solicitud enviada a la API en Node.js'})

# Define la ruta en Django
urlpatterns = [
    path('send_api_request/', send_api_request, name='send_api_request'),
    # Otras rutas
]
