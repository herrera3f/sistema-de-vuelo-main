import pika

def login_view(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)

            # Conexión a RabbitMQ
            connection = pika.BlockingConnection(pika.ConnectionParameters('localhost'))
            channel = connection.channel()

            # Publicar un mensaje en la cola
            channel.queue_declare(queue='auth_queue')  # Asegúrate de que la cola existe
            channel.basic_publish(exchange='', routing_key='auth_queue', body=f'User {username} logged in.')

            connection.close()

            # Redirigir al usuario a la página deseada después del inicio de sesión
            return redirect('pagina_de_inicio')  # Reemplaza 'pagina_de_inicio' con la URL deseada

        else:
            # Mostrar un mensaje de error o redirigir de nuevo a la página de inicio de sesión
            return render(request, 'iniciar_sesion.html', {'error_message': 'Credenciales inválidas'})

    # Renderizar la plantilla de inicio de sesión (GET request)
    return render(request, 'iniciar_sesion.html')

