"""
Tests for the API views.
"""

from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from api.models import Room, Player, Score


class RoomViewSetTest(TestCase):
    """Test cases for RoomViewSet."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.room = Room.objects.create(name="Test Room", game_type="yahtzee")

    def test_create_room(self):
        """Test creating a new room."""
        url = reverse("room-list")
        data = {"name": "New Room", "game_type": "scrabble"}

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Room.objects.count(), 2)

        room = Room.objects.get(name="New Room")
        self.assertEqual(room.game_type, "scrabble")
        self.assertTrue(len(room.room_code) == 8)

    def test_get_room_by_code(self):
        """Test getting a room by its room code."""
        url = reverse("room-by-code")
        response = self.client.get(f"{url}?code={self.room.room_code}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], "Test Room")
        self.assertEqual(response.data["room_code"], self.room.room_code)

    def test_get_room_by_invalid_code(self):
        """Test getting a room with invalid room code."""
        url = reverse("room-by-code")
        response = self.client.get(f"{url}?code=INVALID")

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_join_room_new_player(self):
        """Test joining a room as a new player."""
        url = reverse("room-join", kwargs={"pk": self.room.pk})
        data = {"name": "John Doe"}

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Player.objects.count(), 1)

        player = Player.objects.first()
        self.assertEqual(player.name, "John Doe")
        self.assertEqual(player.room, self.room)

    def test_join_room_existing_player(self):
        """Test joining a room as an existing player."""
        player = Player.objects.create(name="John Doe", room=self.room)

        url = reverse("room-join", kwargs={"pk": self.room.pk})
        data = {"name": "John Doe"}

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Player.objects.count(), 1)  # No new player created


class ScoreViewSetTest(TestCase):
    """Test cases for ScoreViewSet."""

    def setUp(self):
        """Set up test data."""
        self.client = APIClient()
        self.room = Room.objects.create(name="Test Room", game_type="yahtzee")
        self.player = Player.objects.create(name="John Doe", room=self.room)

    def test_create_score(self):
        """Test creating a new score."""
        url = reverse("score-list")
        data = {
            "player": self.player.pk,
            "room": self.room.pk,
            "round_number": 1,
            "score_value": 100,
            "notes": "Great round!",
        }

        response = self.client.post(url, data, format="json")

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Score.objects.count(), 1)

        score = Score.objects.first()
        self.assertEqual(score.score_value, 100)
        self.assertEqual(score.notes, "Great round!")

    def test_get_room_summary(self):
        """Test getting room summary."""
        # Create some scores
        Score.objects.create(
            player=self.player, room=self.room, round_number=1, score_value=100
        )
        Score.objects.create(
            player=self.player, room=self.room, round_number=2, score_value=150
        )

        url = reverse("score-room-summary")
        response = self.client.get(f"{url}?room_id={self.room.pk}")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["room_name"], "Test Room")
        self.assertEqual(response.data["player_totals"]["John Doe"], 250)
        self.assertEqual(response.data["total_rounds"], 2)
