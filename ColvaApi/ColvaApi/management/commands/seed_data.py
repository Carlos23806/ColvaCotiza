from django.core.management.base import BaseCommand
from ColvaApi.models import Producto

class Command(BaseCommand):
    help = 'Inicializa la base de datos con datos de ejemplo'

    def handle(self, *args, **kwargs):
        # Productos iniciales
        productos_data = [
            {
                'nombre': 'Google Assistant Nest',
                'unidades': 140,
                'costo': 223076.00,
            },
            {
                'nombre': 'Foco LED RGB Controlado',
                'unidades': 30,
                'costo': 61876.00,
            },
            {
                'nombre': 'Control Remoto Universal',
                'unidades': 25,
                'costo': 91636.00,
            },
        ]

        for producto in productos_data:
            Producto.objects.get_or_create(
                nombre=producto['nombre'],
                defaults={
                    'unidades': producto['unidades'],
                    'costo': producto['costo']
                }
            )
        
        self.stdout.write(self.style.SUCCESS('Datos iniciales creados exitosamente'))
