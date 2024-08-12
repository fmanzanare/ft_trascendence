from django.db import models
from pongue.models import PongueUser, PlayerFriend

class Chat(models.Model):
	id = models.AutoField(primary_key=True)
	chatName = models.CharField(max_length=50, default=None)
	chatType = models.CharField(max_length=50, default=None)
	chatMembers = models.ForeignKey(PlayerFriend, on_delete=models.CASCADE, default=None, related_name="chatMembers")

	@classmethod
	def getChat(cls, chat_id):
		return cls.objects.get(id=chat_id)
	
	@classmethod
	def getChats(cls, user_id):
		return cls.objects.filter(chat_members__myUser=user_id)
	
	@classmethod
	def getChatMembers(cls, chat_id):
		chat = cls.objects.get(id=chat_id)
		return chat.chatMembers.all()

	@classmethod
	def createChat(cls, chatName, chatType, chatMembers):
		return cls.objects.create(chatName=chatName, chatType=chatType, chatMembers=chatMembers)
	
	@classmethod
	def addChatMember(cls, chat_id, chat_member):
		chat = cls.objects.get(id=chat_id)
		chat.chatMembers.add(chat_member)
		chat.save()

	@classmethod
	def removeChatMember(cls, chat_id, chat_member):
		chat = cls.objects.get(id=chat_id)
		chat.chatMembers.remove(chat_member)
		chat.save()

	@classmethod
	def deleteChat(cls, chat_id):
		chat = cls.objects.get(id=chat_id)
		chat.delete()

class ChatMessage(models.Model):
	id = models.AutoField(primary_key=True)
	chat = models.ForeignKey(PlayerFriend, on_delete=models.CASCADE)
	senderId = models.ForeignKey(PongueUser, on_delete=models.CASCADE)
	isRead = models.BooleanField(default=False)
	message = models.TextField()

	@classmethod
	def getMessages(cls, chat_id):
		return cls.objects.filter(chat_id=chat_id).order_by("-id")[:30]

	@classmethod
	def createMessage(cls, chat_id, senderId, message):
		return cls.objects.create(chat_id=chat_id, senderId=senderId, message=message)

	@classmethod
	def markRead(cls, chat_id):
		messages = cls.objects.filter(chat_id=chat_id, isRead=False)
		for message in messages:
			message.isRead = True
			message.save()

	@classmethod
	def deleteMessage(cls, message_id):
		message = cls.objects.get(id=message_id)
		message.delete()
