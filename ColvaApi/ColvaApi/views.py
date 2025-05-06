from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.db import transaction, IntegrityError
from rest_framework.response import Response
from rest_framework import status
from .models import Usuario, Producto, Cotizacion, CotizacionDetalle
from .serializers import UsuarioSerializer, UsuarioCreateSerializer, ProductoSerializer, CotizacionSerializer, CotizacionDetalleSerializer
from django.utils import timezone
from rest_framework.exceptions import ValidationError

@api_view(['POST'])
def login_view(request):
    try:
        identificacion = request.data.get('identificacion')
        password = request.data.get('password')

        print(f"Login attempt with: {identificacion}")  # Debug log

        if not identificacion or not password:
            return Response({
                "success": False,
                "message": "Identificación y contraseña son requeridos"
            }, status=status.HTTP_400_BAD_REQUEST)

        try:
            usuario = Usuario.objects.get(identificacion=identificacion)
            if usuario.check_password(password):
                return Response({
                    "success": True,
                    "data": {
                        "id": usuario.id,
                        "identificacion": usuario.identificacion,
                        "role": usuario.role,
                        "email": usuario.email
                    }
                })
            return Response({
                "success": False,
                "message": "Contraseña incorrecta"
            }, status=status.HTTP_401_UNAUTHORIZED)
        except Usuario.DoesNotExist:
            return Response({
                "success": False,
                "message": "Usuario no encontrado"
            }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Login error: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error interno del servidor"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def productos_list(request):
    try:
        productos = Producto.objects.all()
        serializer = ProductoSerializer(productos, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Exception as e:
        return Response({
            "success": False,
            "message": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def producto_detalle(request, producto_id):
    try:
        print(f"Buscando producto con ID: {producto_id}")  # Debug log
        producto = Producto.objects.filter(id=producto_id).first()
        
        if not producto:
            return Response({
                "success": False,
                "message": f"Producto con ID {producto_id} no encontrado"
            }, status=status.HTTP_404_NOT_FOUND)
            
        serializer = ProductoSerializer(producto)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Exception as e:
        print(f"Error en producto_detalle: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al obtener el producto"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def usuarios_list(request):
    try:
        usuarios = Usuario.objects.all()
        serializer = UsuarioSerializer(usuarios, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Exception as e:
        print(f"User list error: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al obtener usuarios"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def usuario_detalle(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        serializer = UsuarioSerializer(usuario)
        return Response({
            "success": True,
            "data": serializer.data,
            "message": "Usuario encontrado exitosamente"
        })
    except Usuario.DoesNotExist:
        return Response({
            "success": False,
            "message": "Usuario no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error al obtener usuario: {str(e)}")
        return Response({
            "success": False,
            "message": "Error al obtener usuario"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def crear_usuario(request):
    try:
        serializer = UsuarioCreateSerializer(data=request.data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response({
                "success": True,
                "data": UsuarioSerializer(usuario).data,
                "message": "Usuario creado exitosamente"
            })
        return Response({
            "success": False,
            "message": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except IntegrityError:
        return Response({
            "success": False,
            "message": "El usuario ya existe"
        }, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({
            "success": False,
            "message": str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def actualizar_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        data = request.data.copy()
        
        # No permitir cambiar el rol a menos que sea admin
        if 'role' in data and not request.user.role == 'admin':
            del data['role']
            
        serializer = UsuarioSerializer(usuario, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "success": True,
                "data": serializer.data,
                "message": "Usuario actualizado exitosamente"
            })
        return Response({
            "success": False,
            "message": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    except Usuario.DoesNotExist:
        return Response({
            "success": False,
            "message": "Usuario no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['PUT'])
def desactivar_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        usuario.state = 2  # Marcar como inactivo
        usuario.save()
        return Response({
            "success": True,
            "message": "Usuario desactivado exitosamente"
        })
    except Usuario.DoesNotExist:
        return Response({
            "success": False,
            "message": "Usuario no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)

@api_view(['GET'])
def cotizaciones_list(request):
    try:
        cotizaciones = Cotizacion.objects.all().order_by('-fecha')
        serializer = CotizacionSerializer(cotizaciones, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Exception as e:
        print(f"Error en cotizaciones_list: {str(e)}")
        return Response({
            "success": False,
            "message": "Error al obtener cotizaciones"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def cotizacion_detalle(request, cotizacion_id):
    try:
        cotizacion = Cotizacion.objects.get(pk=cotizacion_id)
        serializer = CotizacionSerializer(cotizacion)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Cotizacion.DoesNotExist:
        return Response({
            "success": False,
            "message": f"Cotización {cotizacion_id} no encontrada"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en cotizacion_detalle: {str(e)}")
        return Response({
            "success": False,
            "message": "Error al obtener cotización"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def detalles_cotizacion_list(request):
    try:
        detalles = CotizacionDetalle.objects.all()
        serializer = CotizacionDetalleSerializer(detalles, many=True)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except Exception as e:
        print(f"Error en detalles_list: {str(e)}")
        return Response({
            "success": False,
            "message": "Error al obtener detalles"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def detalle_cotizacion_especifico(request, detalle_id):
    try:
        detalle = CotizacionDetalle.objects.get(pk=detalle_id)
        serializer = CotizacionDetalleSerializer(detalle)
        return Response({
            "success": True,
            "data": serializer.data
        })
    except CotizacionDetalle.DoesNotExist:
        return Response({
            "success": False,
            "message": f"Detalle {detalle_id} no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en detalle_especifico: {str(e)}")
        return Response({
            "success": False,
            "message": "Error al obtener detalle"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def insertar_usuario(request):
    try:
        # Datos predefinidos para pruebas
        data = {
            "identificacion": "123456789",
            "email": "usuario.prueba@ejemplo.com",
            "password": "Password123!",
            "role": "client"
        }
        
        print("Insertando usuario con datos:", data)  # Debug log

        serializer = UsuarioCreateSerializer(data=data)
        if serializer.is_valid():
            usuario = serializer.save()
            return Response({
                "success": True,
                "data": UsuarioSerializer(usuario).data,
                "message": "Usuario creado exitosamente"
            }, status=status.HTTP_201_CREATED)
        
        print("Errores de validación:", serializer.errors)  # Debug log
        return Response({
            "success": False,
            "message": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"Error en insertar_usuario: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al crear usuario"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def insertar_producto(request):
    try:
        # Datos predefinidos para pruebas
        data = {
            "nombre": "Smart TV 55 pulgadas",
            "unidades": 10,
            "costo": 2500000.00
        }
        
        print("Insertando producto con datos:", data)  # Debug log

        serializer = ProductoSerializer(data=data)
        if serializer.is_valid():
            producto = serializer.save()
            return Response({
                "success": True,
                "data": ProductoSerializer(producto).data,
                "message": "Producto creado exitosamente"
            }, status=status.HTTP_201_CREATED)
        
        print("Errores de validación:", serializer.errors)  # Debug log
        return Response({
            "success": False,
            "message": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"Error en insertar_producto: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al crear producto"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def insertar_cotizacion(request):
    try:
        # Datos predefinidos para pruebas de cotización
        data_cotizacion = {
            "fecha": timezone.now(),
            "cliente_tipo_doc": "CC",
            "cliente_num_doc": "123456789",
            "cliente_nombres": "Cliente",
            "cliente_apellidos": "Prueba",
            "cliente_telefono": "3001234567",
            "cliente_email": "cliente@ejemplo.com",
            "subtotal": "1000000.00",
            "iva": "190000.00",
            "total": "1190000.00",
            "usuario": 1  # ID del usuario que crea la cotización (asegúrate de que exista)
        }

        print("Insertando cotización con datos:", data_cotizacion)  # Debug log

        # Crear la cotización
        serializer = CotizacionSerializer(data=data_cotizacion)
        if serializer.is_valid():
            cotizacion = serializer.save()

            # Datos predefinidos para detalles de la cotización
            detalles = [
                {
                    "cotizacion": cotizacion.id,
                    "ambiente": "Sala",
                    "producto": 1,  # ID del producto (asegúrate de que exista)
                    "cantidad": 2,
                    "precio_unitario": "500000.00"
                },
                {
                    "cotizacion": cotizacion.id,
                    "ambiente": "Cocina",
                    "producto": 2,  # ID del producto (asegúrate de que exista)
                    "cantidad": 1,
                    "precio_unitario": "190000.00"
                }
            ]

            # Crear los detalles
            detalles_serializados = []
            for detalle in detalles:
                detalle_serializer = CotizacionDetalleSerializer(data=detalle)
                if detalle_serializer.is_valid():
                    detalle_serializer.save()
                    detalles_serializados.append(detalle_serializer.data)
                else:
                    print("Error en detalle:", detalle_serializer.errors)
                    raise ValidationError(detalle_serializer.errors)

            return Response({
                "success": True,
                "data": {
                    "cotizacion": serializer.data,
                    "detalles": detalles_serializados
                },
                "message": "Cotización creada exitosamente"
            }, status=status.HTTP_201_CREATED)

        print("Errores en cotización:", serializer.errors)  # Debug log
        return Response({
            "success": False,
            "message": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Exception as e:
        print(f"Error en insertar_cotizacion: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al crear la cotización"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def modificar_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        
        # Datos predefinidos para pruebas
        data = {
            "email": "usuario.modificados@ejemplo.com",
            "role": "admin",
            "state": 1
        }
        
        print(f"Modificando usuario {usuario_id} con datos:", data)  # Debug log

        # No permitir modificar la identificación
        if 'identificacion' in data:
            return Response({
                "success": False,
                "message": "No se puede modificar el número de identificación"
            }, status=status.HTTP_400_BAD_REQUEST)

        serializer = UsuarioSerializer(usuario, data=data, partial=True)
        if serializer.is_valid():
            usuario_actualizado = serializer.save()
            return Response({
                "success": True,
                "data": UsuarioSerializer(usuario_actualizado).data,
                "message": "Usuario modificado exitosamente"
            })

        print("Errores de validación:", serializer.errors)  # Debug log
        return Response({
            "success": False,
            "message": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Usuario.DoesNotExist:
        return Response({
            "success": False,
            "message": f"Usuario con ID {usuario_id} no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en modificar_usuario: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al modificar usuario"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def modificar_producto(request, producto_id):
    try:
        producto = Producto.objects.get(id=producto_id)
        
        # Datos predefinidos para pruebas
        data = {
            "nombre": "Smart TV 65 pulgadas",
            "unidades": 15,
            "costo": 3500000.00
        }
        
        print(f"Modificando producto {producto_id} con datos:", data)  # Debug log

        serializer = ProductoSerializer(producto, data=data, partial=True)
        if serializer.is_valid():
            producto_actualizado = serializer.save()
            return Response({
                "success": True,
                "data": ProductoSerializer(producto_actualizado).data,
                "message": "Producto modificado exitosamente"
            })

        print("Errores de validación:", serializer.errors)  # Debug log
        return Response({
            "success": False,
            "message": serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)

    except Producto.DoesNotExist:
        return Response({
            "success": False,
            "message": f"Producto con ID {producto_id} no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en modificar_producto: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al modificar producto"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def cambiar_estado_usuario(request, usuario_id):
    try:
        usuario = Usuario.objects.get(id=usuario_id)
        
        # Cambiar el estado del usuario (1: Activo, 2: Inactivo)
        nuevo_estado = 2 if usuario.state == 1 else 1
        
        print(f"Cambiando estado del usuario {usuario_id} de {usuario.state} a {nuevo_estado}")  # Debug log
        
        usuario.state = nuevo_estado
        usuario.save()
        
        return Response({
            "success": True,
            "data": {
                "id": usuario.id,
                "identificacion": usuario.identificacion,
                "state": usuario.state,
                "estado_texto": "Inactivo" if nuevo_estado == 2 else "Activo"
            },
            "message": f"Estado del usuario cambiado a {'Inactivo' if nuevo_estado == 2 else 'Activo'}"
        })

    except Usuario.DoesNotExist:
        return Response({
            "success": False,
            "message": f"Usuario con ID {usuario_id} no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en cambiar_estado_usuario: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al cambiar estado del usuario"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['DELETE'])
def eliminar_producto(request, producto_id):
    try:
        producto = Producto.objects.get(id=producto_id)
        
        # Cambiar el estado del producto (1: Activo, 2: Inactivo)
        nuevo_estado = 2 if producto.estado == 1 else 1
        
        print(f"Cambiando estado del producto {producto_id} de {producto.estado} a {nuevo_estado}")  # Debug log
        
        producto.estado = nuevo_estado
        producto.save()
        
        return Response({
            "success": True,
            "data": {
                "id": producto.id,
                "nombre": producto.nombre,
                "estado": producto.estado,
                "estado_texto": "Inactivo" if nuevo_estado == 2 else "Activo"
            },
            "message": f"Estado del producto cambiado a {'Inactivo' if nuevo_estado == 2 else 'Activo'}"
        })

    except Producto.DoesNotExist:
        return Response({
            "success": False,
            "message": f"Producto con ID {producto_id} no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en eliminar_producto: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al cambiar estado del producto"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['PUT'])
def cambiar_estado_producto(request, producto_id):
    try:
        producto = Producto.objects.get(id=producto_id)
        
        # Cambiar el estado del producto (1: Activo, 2: Inactivo)
        nuevo_estado = 2 if producto.estado == 1 else 1
        
        print(f"Cambiando estado del producto {producto_id} de {producto.estado} a {nuevo_estado}")  # Debug log
        
        producto.estado = nuevo_estado
        producto.save()
        
        return Response({
            "success": True,
            "data": {
                "id": producto.id,
                "nombre": producto.nombre,
                "estado": producto.estado,
                "estado_texto": "Inactivo" if nuevo_estado == 2 else "Activo"
            },
            "message": f"Estado del producto cambiado a {'Inactivo' if nuevo_estado == 2 else 'Activo'}"
        })

    except Producto.DoesNotExist:
        return Response({
            "success": False,
            "message": f"Producto con ID {producto_id} no encontrado"
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error en cambiar_estado_producto: {str(e)}")  # Debug log
        return Response({
            "success": False,
            "message": "Error al cambiar estado del producto"
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
