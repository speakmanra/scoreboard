# Generated by Django 4.2.7 on 2025-07-19 02:29

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Room',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('game_type', models.CharField(choices=[('yahtzee', 'Yahtzee'), ('scrabble', 'Scrabble'), ('tally', 'Generic Tally')], max_length=20)),
                ('room_code', models.CharField(max_length=8, unique=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Player',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('name', models.CharField(max_length=100)),
                ('joined_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('is_active', models.BooleanField(default=True)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='players', to='api.room')),
            ],
            options={
                'ordering': ['joined_at'],
            },
        ),
        migrations.CreateModel(
            name='Score',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('round_number', models.PositiveIntegerField(default=1)),
                ('score_value', models.IntegerField()),
                ('notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(default=django.utils.timezone.now)),
                ('player', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scores', to='api.player')),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='scores', to='api.room')),
            ],
            options={
                'ordering': ['round_number', 'created_at'],
                'unique_together': {('player', 'room', 'round_number')},
            },
        ),
    ]
