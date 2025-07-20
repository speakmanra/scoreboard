"""
URL configuration for the API app.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RoomViewSet, PlayerViewSet, ScoreViewSet

router = DefaultRouter()
router.register(r"rooms", RoomViewSet)
router.register(r"players", PlayerViewSet)
router.register(r"scores", ScoreViewSet)

urlpatterns = [
    path("", include(router.urls)),
]
