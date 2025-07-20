"""
Tests for the API models.
"""

import pytest
from django.test import TestCase
from django.utils import timezone
from api.models import Room, Player, Score


class RoomModelTest(TestCase):
    """Test cases for Room model."""

    def test_room_creation(self):
        """Test creating a room."""
        room = Room.objects.create(name="Test Room", game_type="yahtzee")

        self.assertEqual(room.name, "Test Room")
        self.assertEqual(room.game_type, "yahtzee")
        self.assertTrue(len(room.room_code) == 8)
        self.assertTrue(room.is_active)
        self.assertIsNotNone(room.created_at)

    def test_room_str_representation(self):
        """Test string representation of room."""
        room = Room.objects.create(name="Test Room", game_type="scrabble")

        expected = f"Test Room ({room.room_code})"
        self.assertEqual(str(room), expected)

    def test_room_code_uniqueness(self):
        """Test that room codes are unique."""
        room1 = Room.objects.create(name="Room 1", game_type="yahtzee")
        room2 = Room.objects.create(name="Room 2", game_type="scrabble")

        self.assertNotEqual(room1.room_code, room2.room_code)
        self.assertEqual(len(room1.room_code), 8)
        self.assertEqual(len(room2.room_code), 8)


class PlayerModelTest(TestCase):
    """Test cases for Player model."""

    def setUp(self):
        """Set up test data."""
        self.room = Room.objects.create(name="Test Room", game_type="yahtzee")

    def test_player_creation(self):
        """Test creating a player."""
        player = Player.objects.create(name="John Doe", room=self.room)

        self.assertEqual(player.name, "John Doe")
        self.assertEqual(player.room, self.room)
        self.assertTrue(player.is_active)
        self.assertIsNotNone(player.joined_at)

    def test_player_str_representation(self):
        """Test string representation of player."""
        player = Player.objects.create(name="Jane Smith", room=self.room)

        expected = f"Jane Smith in {self.room.name}"
        self.assertEqual(str(player), expected)


class ScoreModelTest(TestCase):
    """Test cases for Score model."""

    def setUp(self):
        """Set up test data."""
        self.room = Room.objects.create(name="Test Room", game_type="yahtzee")
        self.player = Player.objects.create(name="John Doe", room=self.room)

    def test_score_creation(self):
        """Test creating a score."""
        score = Score.objects.create(
            player=self.player,
            room=self.room,
            round_number=1,
            score_value=100,
            notes="Great round!",
        )

        self.assertEqual(score.player, self.player)
        self.assertEqual(score.room, self.room)
        self.assertEqual(score.round_number, 1)
        self.assertEqual(score.score_value, 100)
        self.assertEqual(score.notes, "Great round!")
        self.assertIsNotNone(score.created_at)

    def test_score_str_representation(self):
        """Test string representation of score."""
        score = Score.objects.create(
            player=self.player, room=self.room, round_number=2, score_value=150
        )

        expected = f"John Doe - Round 2: 150"
        self.assertEqual(str(score), expected)

    def test_score_unique_constraint(self):
        """Test that a player can only have one score per round per room."""
        Score.objects.create(
            player=self.player, room=self.room, round_number=1, score_value=100
        )

        # This should raise an IntegrityError
        with self.assertRaises(Exception):
            Score.objects.create(
                player=self.player, room=self.room, round_number=1, score_value=200
            )
