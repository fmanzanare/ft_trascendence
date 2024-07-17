# Generated by Django 4.2.3 on 2024-07-17 14:41

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('pongue', '0006_alter_pongueuser_friends'),
        ('chat', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='chatmessage',
            old_name='is_deleted',
            new_name='isRead',
        ),
        migrations.RenameField(
            model_name='chatmessage',
            old_name='sender',
            new_name='senderId',
        ),
        migrations.RemoveField(
            model_name='chat',
            name='chat_members',
        ),
        migrations.RemoveField(
            model_name='chat',
            name='chat_name',
        ),
        migrations.RemoveField(
            model_name='chat',
            name='chat_type',
        ),
        migrations.AddField(
            model_name='chat',
            name='chatMembers',
            field=models.ForeignKey(default=None, on_delete=django.db.models.deletion.CASCADE, related_name='chatMembers', to='pongue.playerfriend'),
        ),
        migrations.AddField(
            model_name='chat',
            name='chatName',
            field=models.CharField(default=None, max_length=50),
        ),
        migrations.AddField(
            model_name='chat',
            name='chatType',
            field=models.CharField(default=None, max_length=50),
        ),
        migrations.DeleteModel(
            name='ChatMember',
        ),
    ]
