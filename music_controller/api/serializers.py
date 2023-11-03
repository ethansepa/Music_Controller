from rest_framework import serializers
from .models import Room, Search


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('id', 'code', 'host', 'guest_can_pause',
                  'guest_can_add_song', 'votes_to_skip', 'created_at')
        
class CreateRoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = ('guest_can_pause', 'guest_can_add_song', 'votes_to_skip')

class UpdateRoomSerializer(serializers.ModelSerializer):
    code = serializers.CharField(validators=[])

    class Meta:
        model = Room
        fields = ('guest_can_pause', 'guest_can_add_song', 'votes_to_skip', 'code')

class SearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Search
        fields = ('code', 'search')
    