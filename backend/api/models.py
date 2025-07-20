"""
Models for the scorecard API.
"""

import uuid
from django.db import models
from django.utils import timezone


class Room(models.Model):
    """A room where players can join to play games together."""

    GAME_TYPES = [
        ("yahtzee", "Yahtzee"),
        ("scrabble", "Scrabble"),
        ("tally", "Generic Tally"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    game_type = models.CharField(max_length=20, choices=GAME_TYPES)
    room_code = models.CharField(max_length=8, unique=True, blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):
        if not self.room_code:
            import random
            import string

            while True:
                self.room_code = "".join(
                    random.choices(string.ascii_uppercase + string.digits, k=8)
                )
                if not Room.objects.filter(room_code=self.room_code).exists():
                    break
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} ({self.room_code})"


class Player(models.Model):
    """A player in a room."""

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="players")
    joined_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["joined_at"]

    def __str__(self):
        return f"{self.name} in {self.room.name}"


class Score(models.Model):
    """A score entry for a player in a room."""

    YAHTZEE_CATEGORIES = [
        ("ones", "Ones"),
        ("twos", "Twos"),
        ("threes", "Threes"),
        ("fours", "Fours"),
        ("fives", "Fives"),
        ("sixes", "Sixes"),
        ("three_of_a_kind", "Three of a Kind"),
        ("four_of_a_kind", "Four of a Kind"),
        ("full_house", "Full House"),
        ("small_straight", "Small Straight"),
        ("large_straight", "Large Straight"),
        ("yahtzee", "Yahtzee"),
        ("chance", "Chance"),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name="scores")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="scores")
    round_number = models.PositiveIntegerField(default=1)
    score_value = models.IntegerField()
    category = models.CharField(
        max_length=20, choices=YAHTZEE_CATEGORIES, blank=True, null=True
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["round_number", "created_at"]
        unique_together = ["player", "room", "round_number", "category"]

    def __str__(self):
        return f"{self.player.name} - Round {self.round_number}: {self.score_value}"
