"""
Views for the scorecard API.
"""

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Room, Player, Score
from .serializers import (
    RoomSerializer,
    RoomCreateSerializer,
    PlayerSerializer,
    ScoreSerializer,
    ScoreUpdateSerializer,
)


class RoomViewSet(viewsets.ModelViewSet):
    """ViewSet for Room model."""

    queryset = Room.objects.all()

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == "create":
            return RoomCreateSerializer
        return RoomSerializer

    @action(detail=False, methods=["get"])
    def by_code(self, request):
        """Get a room by its room code."""
        room_code = request.query_params.get("code")
        if not room_code:
            return Response(
                {"error": "Room code is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            room = Room.objects.get(room_code=room_code, is_active=True)
            serializer = self.get_serializer(room)
            return Response(serializer.data)
        except Room.DoesNotExist:
            return Response(
                {"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=["post"])
    def join(self, request, pk=None):
        """Join a room as a player."""
        room = self.get_object()
        player_name = request.data.get("name")

        if not player_name:
            return Response(
                {"error": "Player name is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Check if player already exists in room
        existing_player = room.players.filter(name=player_name, is_active=True).first()

        if existing_player:
            serializer = PlayerSerializer(existing_player)
            return Response(serializer.data)

        # Create new player
        player = Player.objects.create(name=player_name, room=room)
        serializer = PlayerSerializer(player)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class PlayerViewSet(viewsets.ModelViewSet):
    """ViewSet for Player model."""

    queryset = Player.objects.all()
    serializer_class = PlayerSerializer

    def get_queryset(self):
        """Filter players by room if room_id is provided."""
        queryset = Player.objects.all()
        room_id = self.request.query_params.get("room_id")
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        return queryset


class ScoreViewSet(viewsets.ModelViewSet):
    """ViewSet for Score model."""

    queryset = Score.objects.all()
    serializer_class = ScoreSerializer

    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action in ["update", "partial_update"]:
            return ScoreUpdateSerializer
        return ScoreSerializer

    def get_queryset(self):
        """Filter scores by room if room_id is provided."""
        queryset = Score.objects.all()
        room_id = self.request.query_params.get("room_id")
        if room_id:
            queryset = queryset.filter(room_id=room_id)
        return queryset

    @action(detail=False, methods=["get"])
    def room_summary(self, request):
        """Get a summary of scores for a room."""
        room_id = request.query_params.get("room_id")
        if not room_id:
            return Response(
                {"error": "Room ID is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            room = Room.objects.get(id=room_id)
            scores = room.scores.all()

            # Group scores by player and calculate totals
            player_totals = {}
            for score in scores:
                player_name = score.player.name
                if player_name not in player_totals:
                    player_totals[player_name] = 0
                player_totals[player_name] += score.score_value

            return Response(
                {
                    "room_name": room.name,
                    "game_type": room.game_type,
                    "player_totals": player_totals,
                    "total_rounds": scores.values("round_number").distinct().count(),
                }
            )
        except Room.DoesNotExist:
            return Response(
                {"error": "Room not found"}, status=status.HTTP_404_NOT_FOUND
            )
