from django.db import models
from pongue.models import PongueUser

# Create your models here.
class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    chat_name = models.CharField(max_length=50)
    chat_type = models.CharField(max_length=50)
    chat_members = models.ManyToManyField(PongueUser, blank=True, null=True, through="ChatMember")


class ChatMember(models.Model):
    id = models.AutoField(primary_key=True)
    chat = models.ForeignKey('Chat', on_delete=models.CASCADE)
    member = models.ForeignKey(PongueUser, on_delete=models.CASCADE)
    is_admin = models.BooleanField(default=False)
    is_muted = models.BooleanField(default=False)
    is_blocked = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)

class ChatMessage(models.Model):
    id = models.AutoField(primary_key=True)
    chat = models.ForeignKey('Chat', on_delete=models.CASCADE)
    sender = models.ForeignKey(PongueUser, on_delete=models.CASCADE)
    message = models.TextField()
    is_deleted = models.BooleanField(default=False)

