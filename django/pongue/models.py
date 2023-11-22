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

	def __str__(self):
		return self.username

	REQUIRED_FIELDS = ["display_name"]

