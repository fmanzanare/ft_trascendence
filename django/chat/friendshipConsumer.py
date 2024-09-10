from channels.generic.websocket import AsyncWebsocketConsumer
import json

class FriendshipConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Conectar al grupo de amistad
        await self.channel_layer.group_add("friendship_group", self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        # Desconectar del grupo de amistad
        await self.channel_layer.group_discard("friendship_group", self.channel_name)

    async def receive(self, text_data):
        # Recibir y procesar la solicitud de amistad
        data = json.loads(text_data)
        action = data.get('action')
        if action == 'send_friend_request':
            # Procesar la solicitud de amistad
            sender = data.get('sender')
            receiver = data.get('receiver')
            # Lógica para enviar la solicitud de amistad y notificar al receptor

    async def friendship_request_notification(self, event):
        # Enviar notificación de solicitud de amistad al receptor
        await self.send(text_data=json.dumps(event))