from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Usuario
from ..serializers import UsuarioSerializer

@api_view(['POST'])
def login(request):
    try:
        email = request.data.get('email')
        password = request.data.get('password')
        
        usuario = Usuario.objects.get(email=email)
        if usuario.check_password(password):
            serializer = UsuarioSerializer(usuario)
            return Response(serializer.data)
        return Response(
            {'error': 'Credenciales inválidas'}, 
            status=status.HTTP_401_UNAUTHORIZED
        )
    except Usuario.DoesNotExist:
        return Response(
            {'error': 'Usuario no encontrado'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['POST'])
def register(request):
    serializer = UsuarioSerializer(data=request.data)
    if serializer.is_valid():
        usuario = serializer.save()
        usuario.set_password(request.data.get('password'))
        usuario.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
