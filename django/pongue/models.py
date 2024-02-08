from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class PongueUser(AbstractUser):
	id = models.AutoField(primary_key=True)
	username = models.CharField(max_length=50, unique=True)
	access_token = models.CharField(max_length=50, blank=True)
	display_name = models.CharField(max_length=50)
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)
	avatar_base64 = models.TextField(default="", blank=True)
	status = models.CharField(max_length=50, default="offline")
	games_won = models.IntegerField(default=0)
	games_lost = models.IntegerField(default=0)
	games_played = models.IntegerField(default=0)
	has_2fa = models.BooleanField(default=False)
	from_42 = models.BooleanField(default=False)
	friends = models.CharField(max_length=1000, default="")

	def __str__(self):
		return self.username

	REQUIRED_FIELDS = ["display_name"]

class GameResults(models.Model):
	id = models.AutoField(primary_key=True)
	player_1 = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="player_1")
	player_2 = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="player_2")
	player_1_score = models.IntegerField()
	player_2_score = models.IntegerField()
	created_at = models.DateTimeField(auto_now_add=True)
	updated_at = models.DateTimeField(auto_now=True)

	def __str__(self):
		return f"{self.player_1} vs {self.player_2} - {self.player_1_score} - {self.player_2_score}"

