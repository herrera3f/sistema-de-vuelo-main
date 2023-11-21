from django.contrib import admin
from django.urls import path
from login import views, views2
from Home import Home
from Home.Home import buscar_vuelos
from Reserva import Reserva




urlpatterns = [
    path('admin/', admin.site.urls),
    path('', views2.iniciar_sesion, name='iniciar_sesion'),
    path('registro_usuario/', views.registrar_usuario, name='registrar_usuario'),
    path('home/', Home.home, name='home'),
    path('obtener-aviones', Home.obtener_aviones, name='obtener_aviones'),
    path('buscar-vuelos/', buscar_vuelos, name='buscar_vuelos'),
    path('reserva/', Reserva.reserva, name='reserva'),
]