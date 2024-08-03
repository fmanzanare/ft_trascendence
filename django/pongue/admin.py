from django.contrib import admin
from .models import PongueUser, GameResults

# Admin site customization.
admin.site.site_header = "Pong3D Admin Panel"
admin.site.index_title = "Pong3D Admin Panel"

# PongueUser registration in Django Admin Panel.
@admin.register(PongueUser)
class PongeUserAdmin(admin.ModelAdmin):
	list_display = ["username", "display_name"]

@admin.register(GameResults)
class GameResultsAdmin(admin.ModelAdmin):
	list_display = ["player_1", "player_1_score", "player_2", "player_2_score"]
