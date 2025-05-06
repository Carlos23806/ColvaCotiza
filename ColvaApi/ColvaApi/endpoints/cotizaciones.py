from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.db import transaction
from ..models import Cotizacion, CotizacionDetalle
from ..serializers import CotizacionSerializer

@api_view(['POST'])
@transaction.atomic
def create_cotizacion(request):
    serializer = CotizacionSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=201)
    return Response(serializer.errors, status=400)

@api_view(['GET'])
def get_cotizaciones_usuario(request, usuario_id):
    cotizaciones = Cotizacion.objects.filter(usuario_id=usuario_id)
    serializer = CotizacionSerializer(cotizaciones, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def get_cotizacion_detalle(request, cotizacion_id):
    try:
        cotizacion = Cotizacion.objects.get(id=cotizacion_id)
        serializer = CotizacionSerializer(cotizacion)
        return Response(serializer.data)
    except Cotizacion.DoesNotExist:
        return Response({'error': 'Cotización no encontrada'}, status=404)
