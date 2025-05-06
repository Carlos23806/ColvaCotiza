from django.core.management.base import BaseCommand
from ColvaApi.models import Producto

class Command(BaseCommand):
    help = 'Inicializa datos de prueba'

    def handle(self, *args, **kwargs):
        self.stdout.write('Creando productos de prueba...')
        
        productos = [
            {
                'nombre': 'Producto 1',
                'unidades': 100,
                'costo': 150000.00,
            },
            {
                'nombre': 'Producto 2',
                'unidades': 50,
                'costo': 75000.00,
            },
        ]

        for data in productos:
            producto = Producto.objects.create(**data)
            self.stdout.write(f'Creado: {producto.nombre}')
