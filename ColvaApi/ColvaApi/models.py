from django.db import models
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.utils import timezone


class UsuarioManager(BaseUserManager):
    def create_user(self, identificacion, email, password=None, **extra_fields):
        if not identificacion:
            raise ValueError('El número de identificación es obligatorio')
        user = self.model(
            identificacion=identificacion,
            email=email,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, identificacion, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(identificacion, email, password, **extra_fields)


class Usuario(AbstractBaseUser):
    ROLES = (
        ('client', 'Cliente'),
        ('admin', 'Administrador')
    )
    ESTADOS = (
        (1, 'Activo'),
        (2, 'Inactivo')
    )

    identificacion = models.CharField('Número de Identificación', max_length=20, unique=True)
    email = models.EmailField('Correo electrónico')
    role = models.CharField('Rol', max_length=50, choices=ROLES, default='client')
    state = models.IntegerField('Estado', choices=ESTADOS, default=1, null=False)
    is_active = models.BooleanField('Activo', default=True)
    is_staff = models.BooleanField('Staff', default=False)
    is_superuser = models.BooleanField('Superusuario', default=False)  # Campo requerido
    date_joined = models.DateTimeField('Fecha de registro', default=timezone.now)

    objects = UsuarioManager()

    USERNAME_FIELD = 'identificacion'
    REQUIRED_FIELDS = ['email']

    class Meta:
        db_table = 'usuarios'
        app_label = 'ColvaApi'
        verbose_name = 'Usuario'
        verbose_name_plural = 'Usuarios'

    def __str__(self):
        return self.email

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    @property
    def supabase_auth_id(self):
        return f'auth.users.{self.id}'

    def verify_password(self, password):
        # Implementar verificación de contraseña segura aquí
        return self.check_password(password)


class Producto(models.Model):
    """
    Tabla de productos.
    """
    nombre      = models.CharField('Nombre', max_length=255)
    unidades    = models.BigIntegerField('Unidades')
    costo       = models.DecimalField('Costo', max_digits=10, decimal_places=2)
    updated_at  = models.DateTimeField('Última actualización', auto_now=True)
    estado      = models.IntegerField('Estado', default=1)

    class Meta:
        db_table = 'productos'
        verbose_name = 'Producto'
        verbose_name_plural = 'Productos'

    def __str__(self):
        return self.nombre


class Cotizacion(models.Model):
    """
    Cabecera de cotización.
    """
    fecha              = models.DateTimeField('Fecha')
    cliente_tipo_doc   = models.CharField('Tipo de documento', max_length=50)
    cliente_num_doc    = models.CharField('Número de documento', max_length=50)
    cliente_nombres    = models.CharField('Nombres', max_length=255)
    cliente_apellidos  = models.CharField('Apellidos', max_length=255)
    cliente_telefono   = models.CharField('Teléfono', max_length=50)
    cliente_email      = models.EmailField('Email', max_length=255)
    subtotal           = models.DecimalField('Subtotal', max_digits=12, decimal_places=2)
    iva                = models.DecimalField('IVA', max_digits=12, decimal_places=2)
    total              = models.DecimalField('Total', max_digits=12, decimal_places=2)
    usuario            = models.ForeignKey(
                           Usuario,
                           on_delete=models.CASCADE,
                           related_name='cotizaciones'
                         )

    class Meta:
        db_table = 'cotizaciones'
        verbose_name = 'Cotización'
        verbose_name_plural = 'Cotizaciones'

    def __str__(self):
        return f'Cotización {self.id} - {self.cliente_nombres}'


class CotizacionDetalle(models.Model):
    """
    Detalles de cada cotización.
    """
    cotizacion      = models.ForeignKey(
                         Cotizacion,
                         on_delete=models.CASCADE,
                         related_name='detalles'
                       )
    ambiente        = models.CharField('Ambiente', max_length=255)
    producto        = models.ForeignKey(
                         Producto,
                         on_delete=models.CASCADE,
                         related_name='en_cotizaciones'
                       )
    cantidad        = models.BigIntegerField('Cantidad')
    precio_unitario = models.DecimalField('Precio unitario', max_digits=12, decimal_places=2)

    class Meta:
        db_table = 'cotizacion_detalles'
        verbose_name = 'Detalle de Cotización'
        verbose_name_plural = 'Detalles de Cotización'

    def __str__(self):
        return f'{self.cantidad}×{self.producto.nombre} en Cotización {self.cotizacion.id}'
