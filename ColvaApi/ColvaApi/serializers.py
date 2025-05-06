from rest_framework import serializers
from .models import Usuario, Producto, Cotizacion, CotizacionDetalle

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id', 'identificacion', 'email', 'role', 'state']
        read_only_fields = ['id']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    role = serializers.ChoiceField(choices=Usuario.ROLES, default='client')

    class Meta:
        model = Usuario
        fields = ['identificacion', 'email', 'password', 'role']

    def validate_identificacion(self, value):
        if Usuario.objects.filter(identificacion=value).exists():
            raise serializers.ValidationError("Esta identificación ya está registrada")
        return value

    def validate_email(self, value):
        if Usuario.objects.filter(email=value).exists():
            raise serializers.ValidationError("Este email ya está registrado")
        return value

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = Usuario(**validated_data)
        user.set_password(password)
        user.save()
        return user

class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Producto
        fields = ['id', 'nombre', 'unidades', 'costo', 'updated_at']

class CotizacionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cotizacion
        fields = '__all__'

class CotizacionDetalleSerializer(serializers.ModelSerializer):
    class Meta:
        model = CotizacionDetalle
        fields = '__all__'
