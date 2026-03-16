# backend/ai/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.ChatView.as_view(), name='ai-chat'),
    path('chat/history/', views.ChatHistoryView.as_view(), name='ai-chat-history'),  # Make sure this exists
    path('meal-plan/', views.DietPlanView.as_view(), name='ai-meal-plan'),
    path('analyze-symptoms/', views.SymptomAnalysisView.as_view(), name='ai-symptom-analysis'),
]