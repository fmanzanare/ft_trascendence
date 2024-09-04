from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _
from dataclasses import dataclass


# Create your models here.
class PongueUser(AbstractUser):

	class Status(models.TextChoices):
		ONLINE = 'ON', _('Online')
		OFFLINE = 'OFF', _('Offline')
		LGAME = 'L_GAME', _('Looking for a game')
		LTOURNAMENT ='L_TOURNAMENT', _('Looking for a tournament')
		INGAME = 'IN_GAME', _('Playing a game')
		INTOURNAMENT = 'IN_TOURNAMENT', _('Registered on a tournament')
		HTOURNAMENT = 'H_TOURNAMENT', _('Hosting a tournament')

	id = models.AutoField(primary_key=True)
	username = models.CharField(max_length=50, unique=True, verbose_name="Username")
	access_token = models.CharField(max_length=50, blank=True, verbose_name="Token")
	display_name = models.CharField(max_length=50, verbose_name="Display name")
	nickname = models.CharField(default="", blank=True, max_length=50, verbose_name="Tournaments nickname")
	created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
	updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")
	avatar_base64 = models.TextField(default="", blank=True, verbose_name="Avatar")
	status = models.CharField(max_length=25, choices=Status.choices, default=Status.OFFLINE, verbose_name="Status")
	games_won = models.IntegerField(default=0, verbose_name="Wins")
	games_lost = models.IntegerField(default=0, verbose_name="Losses")
	games_played = models.IntegerField(default=0, verbose_name="Games played")
	tournaments = models.IntegerField(default=0, verbose_name="Tournaments played")
	tournaments_won = models.IntegerField(default=0, verbose_name="Tournaments won")
	has_2fa = models.BooleanField(default=False, verbose_name="2FA activated")
	from_42 = models.BooleanField(default=False, verbose_name="42 User")
	friends = models.ManyToManyField('self', blank=True, through="PlayerFriend", verbose_name="Friends")
	points = models.BigIntegerField(default=0, verbose_name="Ranking points")

	class Meta:
		db_table = "Users"
		verbose_name = "User"
		verbose_name_plural = "Users"

	def __str__(self):
		return self.username

	REQUIRED_FIELDS = ["display_name"]

@dataclass
class RankingUserDTO:
	id = 0
	username = ""
	games_won = 0
	games_lost = 0
	games_played = 0
	tournaments = 0
	points = 0

	def toRankingUserDTO(user: PongueUser):
		userDto = RankingUserDTO()
		userDto.id = user.id
		userDto.username = user.username
		userDto.games_won = user.games_won
		userDto.games_lost = user.games_lost
		userDto.games_played = user.games_played
		userDto.tournaments = user.tournaments
		userDto.points = user.points
		return userDto

class GameResults(models.Model):
	id = models.AutoField(primary_key=True)
	player_1 = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="player_1")
	player_2 = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="player_2")
	player_1_score = models.IntegerField(verbose_name="Player 1 Score")
	player_2_score = models.IntegerField(verbose_name="Player 2 Score")
	created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
	updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")

	class Meta:
		db_table = "Results"
		verbose_name = "Result"
		verbose_name_plural = "Results"

	def __str__(self):
		return f"{self.player_1} vs {self.player_2} - {self.player_1_score} - {self.player_2_score}"

@dataclass
class UserHistoryDTO:
	id = 0
	idRival = 0
	rival = ""
	isWin = False
	myScore = 0
	date =""
	myRivalScore = 0

	def toUserHistoryDTO(user: PongueUser, gameResult: GameResults):
		print(gameResult)
		gameResultPlayer1 = PongueUser.objects.get(id=gameResult["player_1_id"])
		gameResultPlayer2 = PongueUser.objects.get(id=gameResult["player_2_id"])
		gameResultPlayer = gameResultPlayer1 if gameResultPlayer1.id == user.id else gameResultPlayer2
		gameResultRival = gameResultPlayer2 if gameResultPlayer1.id == user.id else gameResultPlayer1
		historyDTO = UserHistoryDTO()
		historyDTO.id = gameResultPlayer.id
		historyDTO.idRival = gameResultRival.id
		historyDTO.rival = gameResultRival.username
		historyDTO.date = gameResult["created_at"]
		if (gameResultPlayer.id == gameResult["player_1_id"]):
			historyDTO.isWin = True if gameResult["player_1_score"] > gameResult["player_2_score"] else False
			historyDTO.myScore = gameResult["player_1_score"]
			historyDTO.myRivalScore = gameResult["player_2_score"]
		else:
			historyDTO.isWin = True if gameResult["player_2_score"] > gameResult["player_1_score"] else False
			historyDTO.myScore = gameResult["player_2_score"]
			historyDTO.myRivalScore = gameResult["player_1_score"]
		return historyDTO

@dataclass
class UserProfile:
	nick: str = ""
	points: int = 0
	avatar: str = ""
	status: str = ""
	games: int = 0
	wins: int = 0
	tournaments: int = 0
	tournamentsWin: int = 0

	@staticmethod
	def toUseUserProfile(user: PongueUser):
		userProfile = UserProfile()
		userProfile.nick = user.username
		userProfile.points = user.points
		userProfile.avatar = user.avatar_base64
		userProfile.status = user.status
		userProfile.games = user.games_played
		userProfile.wins = user.games_won
		userProfile.tournaments = user.tournaments
		userProfile.tournamentsWin = user.tournaments_won
		return userProfile



class Tournament(models.Model):
	id = models.AutoField(primary_key=True)
	player_1 = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="tournament_player_1")
	player_2 = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="tournament_player_2")
	player_3 = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="tournament_player_3")
	player_4 = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="tournament_player_4")
	winner = models.ForeignKey(PongueUser, on_delete=models.CASCADE, related_name="winner")
	created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
	updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")

	class Meta:
		db_table = "Tournaments"
		verbose_name = "Tournaments"
		verbose_name_plural = "Tournaments"

	def __str__(self):
		return f"{self.player_1} | {self.player_2} | {self.player_3} | {self.player_4} | Winner: {self.winner}"

# Path: django/pongue/models.py
# This model represents the relationship between two players.
# It has the following fields:
# - id: The unique identifier of the player's friend.
# - myUser: The player who sent the friend request.
# - myFriend: The player who received the friend request.
# - status: The status of the friend request (PENDING, ACCEPTED, REJECTED, BLOCKED).
# - registerDate: The date when the friend request was sent.
class PlayerFriend(models.Model):
	class Status(models.TextChoices):
		PENDING = 'PENDING'
		ACCEPTED = 'ACCEPTED'
		REJECTED = 'REJECTED'
		BLOCKED = 'BLOCKED'
	
	id = models.AutoField(primary_key=True)
	myUser = models.ForeignKey("PongueUser", on_delete=models.DO_NOTHING, related_name = "my_user")
	myFriend = models.ForeignKey("PongueUser", on_delete=models.DO_NOTHING, related_name = "my_friend")
	status = models.CharField(max_length=10, choices=Status.choices, default=Status.PENDING)
	registerDate = models.DateField(auto_now_add = True)

	# Sets the status of the player's friend to BLOCKED and saves the changes.
	# Example usage:
	# friendship = PlayerFriend.objects.get(id=1)
	# friendship.blockFriend()
	def blockFriend(self):
		self.status = PlayerFriend.Status.BLOCKED
		self.save()

	# Sets the status of the player's friend to ACCEPTED and saves the changes.
	@classmethod
	def searchOrCreate(cls, player_a, player_b):

		player1 = PongueUser.objects.filter(username__exact=player_a).first()
		player2 = PongueUser.objects.filter(username__exact=player_b).first()

		if player1 is None or player2 is None:
			return None

		makeFriend = PlayerFriend.objects.filter(myUser__exact=player1, myFriend__exact=player2) | \
					 PlayerFriend.objects.filter(myUser__exact=player2, myFriend__exact=player1)

		if makeFriend.count() == 0:
			makeFriend = PlayerFriend.objects.create(myUser=player1, myFriend=player2)
		else:
			makeFriend = makeFriend.first()
		return makeFriend