import json
import logging
from django.shortcuts import render, redirect
from urllib import request as urllib_request, parse

def iniciar_sesion(request):
    if request.method == 'POST':
        email = request.POST['email']
        password = request.POST['contraseña']

        # Enviar credenciales al servidor de Node.js para la autenticación
        nodejs_api_url = 'http://localhost:3001/autenticar-usuario'  # Reemplaza con la URL correcta
        data = {'email': email, 'contraseña': password}

        # Codificar los datos en formato JSON
        data = json.dumps(data).encode('utf-8')

        # Realizar la solicitud POST con urllib
        req = urllib_request.Request(nodejs_api_url, data=data, headers={'Content-Type': 'application/json'})

        try:
            response = urllib_request.urlopen(req)
            response_data = json.loads(response.read().decode('utf-8'))

            if response_data.get('usuario'):
                # Autenticación exitosa

                # Aquí deberías almacenar el "Rut" en la sesión
                request.session['usuario_rut'] = response_data['usuario']['rut']
                print(f'Rut almacenado en la sesión: {response_data["usuario"]["rut"]}')
                logging.info(f'Rut almacenado en la sesión: {response_data["usuario"]["rut"]}')

                username = response_data['usuario']['nombre']
                logging.info(f'Sesión iniciada para el usuario: {username}')

                # Redirigir al usuario a la página deseada después del inicio de sesión
                return render(request,'Home/Home_usuario.html')  # Reemplaza 'pagina_de_inicio' con la URL deseada
            else:
                # Manejar el caso de autenticación fallida desde la API de Node.js
                logging.error('Error en la autenticación desde la API de Node.js')
                return render(request, 'login/iniciar_sesion.html', {'login_error': True})
        except Exception as e:
            # Manejar otras excepciones, como problemas de conexión
            logging.error(f'Error en la solicitud a la API de Node.js: {str(e)}')
            return render(request, 'login/iniciar_sesion.html', {'login_error': True})
    else:
        # Renderizar el formulario de inicio de sesión
        return render(request, 'login/iniciar_sesion.html')