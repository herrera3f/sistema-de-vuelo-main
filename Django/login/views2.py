from urllib import request as urllib_request, parse
from django.shortcuts import render, redirect
from django.http import HttpResponse

def iniciar_sesion(request):
    if request.method == 'POST':
        correo = request.POST['email']
        clave = request.POST['password']

        # Configurar la URL y los datos a enviar
        api_url = 'http://localhost:3001/autenticar-usuario'
        data = {'correo': correo, 'clave': clave}
        data = parse.urlencode(data).encode()

        # Realizar la solicitud POST utilizando urllib
        req = urllib_request.Request(api_url, data=data)
        try:
            with urllib_request.urlopen(req) as response:
                status_code = response.getcode()
                if status_code == 200:
                    # Autenticación exitosa, redirige al home
                    return redirect('/home')
                elif status_code == 401:
                    # Credenciales inválidas
                    return HttpResponse("Credenciales inválidas")
                else:
                    # Otro error
                    return HttpResponse("Error en la autenticación")
        except Exception as e:
            # Manejar errores de conexión
            return HttpResponse(f"Error en la conexión: {e}")

    return render(request, 'login/iniciar_sesion.html')












