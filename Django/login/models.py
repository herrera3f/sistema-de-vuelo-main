from django.db import models

# Create your models here.
from django.db import models

class MiModelo(models.Model):
    campo1 = models.CharField(max_length=50)
    campo2 = models.IntegerField()

    class Meta:
        db_table = 'clientes'