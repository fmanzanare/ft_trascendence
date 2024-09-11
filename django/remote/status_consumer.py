import json
import asyncio
from channels.generic.websocket import AsyncWebsocketConsumer
from pongue.models import PongueUser
from django.db import close_old_connections
from channels.db import database_sync_to_async

class StatusConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        if (self.scope["user"].is_authenticated):
            self.accept()
        else:
            self.close()

        self.room_name = self.scope["url_route"]["kwargs"]["user_id"]
        self.room_group_name = f"status_{self.room_name}"

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def receive(self, text_data):
        data = json.loads(text_data)

        if ("register" in data.keys()):
            try:
                self.userId = int(data["userId"])
                user: PongueUser = await self.getUser(self.userId)
                user.status = PongueUser.Status.ONLINE
                await self.saveUserChanges(user)
            except:
                print("issue with userId")
    
    async def disconnect(self, close_code):
        user: PongueUser = await self.getUser(self.userId)
        user.status = PongueUser.Status.OFFLINE
        await self.saveUserChanges(user)

    @database_sync_to_async
    def getUser(self, userId):
        close_old_connections()
        return PongueUser.objects.get(id=userId)
    
    @database_sync_to_async
    def saveUserChanges(self, user):
        close_old_connections()
        user.save()
