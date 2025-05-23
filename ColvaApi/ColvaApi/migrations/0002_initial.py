# Generated by Django 4.2.20 on 2025-05-05 09:55

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('ColvaApi', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Cotizacion',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('fecha', models.DateTimeField(verbose_name='Fecha')),
                ('cliente_tipo_doc', models.CharField(max_length=50, verbose_name='Tipo de documento')),
                ('cliente_num_doc', models.CharField(max_length=50, verbose_name='Número de documento')),
                ('cliente_nombres', models.CharField(max_length=255, verbose_name='Nombres')),
                ('cliente_apellidos', models.CharField(max_length=255, verbose_name='Apellidos')),
                ('cliente_telefono', models.CharField(max_length=50, verbose_name='Teléfono')),
                ('cliente_email', models.EmailField(max_length=255, verbose_name='Email')),
                ('subtotal', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Subtotal')),
                ('iva', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='IVA')),
                ('total', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Total')),
            ],
            options={
                'verbose_name': 'Cotización',
                'verbose_name_plural': 'Cotizaciones',
                'db_table': 'cotizaciones',
            },
        ),
        migrations.CreateModel(
            name='Producto',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('nombre', models.CharField(max_length=255, verbose_name='Nombre')),
                ('unidades', models.BigIntegerField(verbose_name='Unidades')),
                ('costo', models.DecimalField(decimal_places=2, max_digits=10, verbose_name='Costo')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Última actualización')),
            ],
            options={
                'verbose_name': 'Producto',
                'verbose_name_plural': 'Productos',
                'db_table': 'productos',
            },
        ),
        migrations.CreateModel(
            name='Usuario',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('identificacion', models.CharField(max_length=20, unique=True, verbose_name='Número de Identificación')),
                ('email', models.EmailField(max_length=254, verbose_name='Correo electrónico')),
                ('role', models.CharField(choices=[('client', 'Cliente'), ('admin', 'Administrador')], default='client', max_length=50, verbose_name='Rol')),
                ('state', models.IntegerField(choices=[(1, 'Activo'), (2, 'Inactivo')], default=1, verbose_name='Estado')),
                ('is_active', models.BooleanField(default=True, verbose_name='Activo')),
                ('is_staff', models.BooleanField(default=False, verbose_name='Staff')),
                ('is_superuser', models.BooleanField(default=False, verbose_name='Superusuario')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='Fecha de registro')),
            ],
            options={
                'verbose_name': 'Usuario',
                'verbose_name_plural': 'Usuarios',
                'db_table': 'usuarios',
            },
        ),
        migrations.CreateModel(
            name='CotizacionDetalle',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('ambiente', models.CharField(max_length=255, verbose_name='Ambiente')),
                ('cantidad', models.BigIntegerField(verbose_name='Cantidad')),
                ('precio_unitario', models.DecimalField(decimal_places=2, max_digits=12, verbose_name='Precio unitario')),
                ('cotizacion', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='detalles', to='ColvaApi.cotizacion')),
                ('producto', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='en_cotizaciones', to='ColvaApi.producto')),
            ],
            options={
                'verbose_name': 'Detalle de Cotización',
                'verbose_name_plural': 'Detalles de Cotización',
                'db_table': 'cotizacion_detalles',
            },
        ),
        migrations.AddField(
            model_name='cotizacion',
            name='usuario',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='cotizaciones', to=settings.AUTH_USER_MODEL),
        ),
    ]
