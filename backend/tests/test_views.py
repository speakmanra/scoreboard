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

    def test_room_starts_in_lobby_status(self):
        """A freshly created room should begin in the lobby state."""
        self.assertEqual(self.room.status, "lobby")

    def test_first_player_to_join_becomes_host(self):
        """The first player to join a room is recorded as its host."""
        url = reverse("room-join", kwargs={"pk": self.room.pk})

        first = self.client.post(url, {"name": "Host"}, format="json")
        self.client.post(url, {"name": "Guest"}, format="json")

        self.room.refresh_from_db()
        self.assertEqual(str(self.room.host_id), first.data["id"])

    def test_host_can_start_game(self):
        """The host can start the game, moving the room to active."""
        join_url = reverse("room-join", kwargs={"pk": self.room.pk})
        host = self.client.post(join_url, {"name": "Host"}, format="json")

        start_url = reverse("room-start", kwargs={"pk": self.room.pk})
        response = self.client.post(
            start_url, {"player_id": host.data["id"]}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.room.refresh_from_db()
        self.assertEqual(self.room.status, "active")

    def test_non_host_cannot_start_game(self):
        """A non-host player attempting to start the game is forbidden."""
        join_url = reverse("room-join", kwargs={"pk": self.room.pk})
        self.client.post(join_url, {"name": "Host"}, format="json")
        guest = self.client.post(join_url, {"name": "Guest"}, format="json")

        start_url = reverse("room-start", kwargs={"pk": self.room.pk})
        response = self.client.post(
            start_url, {"player_id": guest.data["id"]}, format="json"
        )

        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.room.refresh_from_db()
        self.assertEqual(self.room.status, "lobby")

    def test_start_game_requires_player_id(self):
        """Starting a game without a player_id returns a 400 error."""
        join_url = reverse("room-join", kwargs={"pk": self.room.pk})
        self.client.post(join_url, {"name": "Host"}, format="json")

        start_url = reverse("room-start", kwargs={"pk": self.room.pk})
        response = self.client.post(start_url, {}, format="json")

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


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
