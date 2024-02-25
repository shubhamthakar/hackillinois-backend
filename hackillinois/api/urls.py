# urls.py
from django.urls import path
from .views import generate_url

urlpatterns = [
    path('generate-url/', generate_url, name='generate_url'),
]
