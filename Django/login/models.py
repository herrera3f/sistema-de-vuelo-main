from django.db import models

# Create your models here.

class User(models.Model):
    # Definir campos y métodos del modelo aquí
    rut = models.CharField(max_length=20)
    nombre = models.CharField(max_length=255)
    email = models.EmailField()
    contraseña = models.CharField(max_length=255)

    def __str__(self):
        return self.nombre