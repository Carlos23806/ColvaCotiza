from django.urls import path, include
from django.http import JsonResponse

def health_check(request):
    return JsonResponse({"status": "ok"})

urlpatterns = [
    path('health/', health_check, name='health'),
    path('api/', include('ColvaApi.api_urls')),  # Todas las rutas API
]
