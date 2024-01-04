from django.contrib import admin
from .models import PongueUser, Room, Message

# Register your models here.
admin.site.register(PongueUser)
admin.site.register(Room)
admin.site.register(Message)
