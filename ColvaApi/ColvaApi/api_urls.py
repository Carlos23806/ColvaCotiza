from django.urls import path
from .views import (
    login_view, usuarios_list, usuario_detalle, 
    crear_usuario, actualizar_usuario, desactivar_usuario,
    productos_list, producto_detalle,
    cotizaciones_list, cotizacion_detalle,
    detalles_cotizacion_list, detalle_cotizacion_especifico,
    insertar_usuario, insertar_producto, insertar_cotizacion,
    modificar_usuario, modificar_producto,
    cambiar_estado_usuario, eliminar_producto,
    cambiar_estado_producto,
)

urlpatterns = [
    path('auth/login/', login_view, name='auth-login'),
    path('usuarios/', usuarios_list, name='usuarios-list'),
    path('usuarios/<int:usuario_id>/', usuario_detalle, name='usuario-detalle'),
    path('usuarios/crear/', crear_usuario, name='crear-usuario'),
    path('usuarios/<int:usuario_id>/actualizar/', actualizar_usuario, name='actualizar-usuario'),
    path('usuarios/<int:usuario_id>/desactivar/', desactivar_usuario, name='desactivar-usuario'),
    path('usuarios/insertar/', insertar_usuario, name='insertar-usuario'),
    path('usuarios/modificar/<int:usuario_id>/', modificar_usuario, name='modificar-usuario'),
    path('usuarios/estado/<int:usuario_id>/', cambiar_estado_usuario, name='cambiar-estado-usuario'),
    
    # Rutas de productos
    path('productos/<int:producto_id>/', producto_detalle, name='producto-detalle'),
    path('productos/', productos_list, name='productos-list'),
    path('productos/insertar/', insertar_producto, name='insertar-producto'),
    path('productos/modificar/<int:producto_id>/', modificar_producto, name='modificar-producto'),
    path('productos/eliminar/<int:producto_id>/', eliminar_producto, name='eliminar-producto'),
    path('productos/estado/<int:producto_id>/', cambiar_estado_producto, name='cambiar-estado-producto'),

    # Rutas de cotizaciones
    path('cotizaciones/', cotizaciones_list, name='cotizaciones-list'),
    path('cotizaciones/<int:cotizacion_id>/', cotizacion_detalle, name='cotizacion-detalle'),
    path('cotizaciones/detalles/', detalles_cotizacion_list, name='detalles-list'),
    path('cotizaciones/detalles/<int:detalle_id>/', detalle_cotizacion_especifico, name='detalle-especifico'),
    path('cotizaciones/insertar/', insertar_cotizacion, name='insertar-cotizacion'),
]
