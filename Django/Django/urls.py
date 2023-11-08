"""
URL configuration for Django project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from login import views, views2

urlpatterns = [
    path('admin/', admin.site.urls),
<<<<<<< HEAD
    path('', views.login, name='registrar_usuario'),
    path('registro_usuario/', views.registrar_usuario, name='registrar_usuario'),  # Cambié la URL a '/registro_usuario/'
    
=======
    path('registro/', views.login, name='registrar_usuario'),
    path('', views2.iniciar_sesion, name='iniciar_sesion'),
>>>>>>> 88140abe1f70a62e248b6d7cd3618bf008f70c69
]

