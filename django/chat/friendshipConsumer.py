from channels.generic.websocket import AsyncWebsocketConsumer
import json
from pongue.models import PlayerFriend, PongueUser
from asgiref.sync import sync_to_async

class FriendshipConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Conectar al grupo de amistad
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.room_group_name = f"{self.room_name}"
        self.userId = -1

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Desconectar del grupo de amistad
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive(self, text_data):
        # Recibir y procesar la solicitud de amistad
        data = json.loads(text_data)
        if (data.get('register') == "register"):
            try:
                self.userId = int(data["userId"])
            except:
                await self.disconnect(4001)

        action = data.get('action')
        if action == 'add':
            # Procesar la solicitud de amistad
            sender = data.get('sender')
            receiver = data.get('receiver')

            await sync_to_async(PlayerFriend.searchOrCreate)(sender, receiver)
            
            await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "friendship.request.notification",
                    "action": "add",
					"sender": sender,
					"receiver": receiver
				}
			)
        elif action == 'accept':
            sender = data.get('sender')
            receiver = data.get('receiver')

            friendship: PlayerFriend = await sync_to_async(PlayerFriend.searchOrCreate)(sender, receiver)
            friendship.status = PlayerFriend.Status.ACCEPTED
            await sync_to_async(friendship.save)()

            await self.channel_layer.group_send(
				self.room_group_name, {
					"type": "accept.friendship.request",
                    "action": "accept",
					"sender": sender,
					"receiver": receiver
                }
			)

    async def friendship_request_notification(self, event):
        # Enviar notificación de solicitud de amistad al receptor
        if ("receiver" in event.keys()):
            receiver: PongueUser = await sync_to_async(PongueUser.objects.get)(username=event["receiver"])
            if (receiver.id == self.userId):
                await self.send(text_data=json.dumps(event))
    
    async def accept_friendship_request(self, event):
        # TODO: Finish this method!
        if ("receiver" in event.keys()):
            receiver: PongueUser = await sync_to_async(PongueUser.objects.get)(username=event["receiver"])
            if (receiver.id == self.userId):
                await self.send(text_data=json.dumps(event))
