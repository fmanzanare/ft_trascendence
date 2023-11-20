from django.contrib.auth.forms import UserCreationForm
from .models import PongueUser
from django import forms

class CreateUserForm(UserCreationForm):
	class Meta:
		model = PongueUser
		fields = ["display_name", "username", "password1", "password2"]
