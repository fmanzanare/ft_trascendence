from django.db import models
from pongue.models import PongueUser, PlayerFriend

class Chat(models.Model):
    id = models.AutoField(primary_key=True)
    chat_name = models.CharField(max_length=50)
    chat_type = models.CharField(max_length=50)
    chat_members = models.ForeignKey(PlayerFriend, on_delete=models.CASCADE)



# class ChatMember(models.Model):
#     id = models.AutoField(primary_key=True)
#     chat = models.ForeignKey('Chat', on_delete=models.CASCADE)
#     member = models.ForeignKey(PongueUser, on_delete=models.CASCADE)
#     is_admin = models.BooleanField(default=False)
#     is_muted = models.BooleanField(default=False)
#     is_blocked = models.BooleanField(default=False)
#     is_deleted = models.BooleanField(default=False)

class ChatMessage(models.Model):
    id = models.AutoField(primary_key=True)
    chat = models.ForeignKey('Chat', on_delete=models.CASCADE)
    sender = models.ForeignKey(PongueUser, on_delete=models.CASCADE)
    # receiver = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="receiver")
    is_read = models.BooleanField(default=False)
    message = models.TextField()

    @classmethod
    def get_messages(cls, chat_id):
        return cls.objects.filter(chat_id=chat_id).order_by("-id")[:30]

    @classmethod
    def create_message(cls, chat_id, sender, message):
        return cls.objects.create(chat_id=chat_id, sender=sender, message=message)
