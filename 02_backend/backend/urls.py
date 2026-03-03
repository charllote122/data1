from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/predictions/', include('predictions.urls')),
    path('api/health/', include('health.urls')),
    path('api/medications/', include('user_medications.urls')),
    path('api/symptoms/', include('user_symptoms.urls')),
    path('api/resources/', include('health_resources.urls')),
    path('api/dashboard/', include('user_dashboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)