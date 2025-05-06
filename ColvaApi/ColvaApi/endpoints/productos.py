from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from ..models import Producto
from ..serializers import ProductoSerializer

@api_view(['GET'])
def get_productos(request):
    try:
        productos = [
            {"id": 1, "nombre": "Producto Test", "unidades": 10, "costo": 1000}
        ]
        return Response(productos, status=status.HTTP_200_OK)
    except Exception as e:
        print(f"Error: {str(e)}")
        return Response(
            {"error": "Error interno del servidor"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )