"""
Serializers for the scorecard API.
"""

from rest_framework import serializers
from .models import Room, Player, Score


class PlayerSerializer(serializers.ModelSerializer):
    """Serializer for Player model."""

    class Meta:
        model = Player
        fields = ["id", "name", "room", "joined_at", "is_active"]
        read_only_fields = ["id", "joined_at"]


class ScoreSerializer(serializers.ModelSerializer):
    """Serializer for Score model."""

    player_name = serializers.CharField(source="player.name", read_only=True)

    class Meta:
        model = Score
        fields = [
            "id",
            "player",
            "player_name",
            "room",
            "round_number",
            "score_value",
            "category",
            "notes",
            "created_at",
        ]
        read_only_fields = ["id", "created_at"]


class ScoreUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating Score model (partial updates allowed)."""

    class Meta:
        model = Score
        fields = [
            "id",
            "player",
            "room",
            "round_number",
            "score_value",
            "category",
            "notes",
            "created_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "player",
            "room",
            "round_number",
            "category",
        ]


class RoomSerializer(serializers.ModelSerializer):
    """Serializer for Room model."""

    players = PlayerSerializer(many=True, read_only=True)
    scores = ScoreSerializer(many=True, read_only=True)
    player_count = serializers.SerializerMethodField()

    class Meta:
        model = Room
        fields = [
            "id",
            "name",
            "game_type",
            "room_code",
            "created_at",
            "is_active",
            "players",
            "scores",
            "player_count",
        ]
        read_only_fields = ["id", "room_code", "created_at"]

    def get_player_count(self, obj):
        """Get the number of active players in the room."""
        return obj.players.filter(is_active=True).count()


class RoomCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new room."""

    class Meta:
        model = Room
        fields = ["name", "game_type", "room_code", "id", "created_at", "is_active"]
        read_only_fields = ["room_code", "id", "created_at"]

    def create(self, validated_data):
        """Create a room with a unique room code."""
        import random
        import string

        # Generate a unique 8-character room code
        while True:
            room_code = "".join(
                random.choices(string.ascii_uppercase + string.digits, k=8)
            )
            if not Room.objects.filter(room_code=room_code).exists():
                break

        validated_data["room_code"] = room_code
        return super().create(validated_data)
