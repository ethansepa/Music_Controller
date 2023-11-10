from django.shortcuts import render, redirect
from .credentials import REDIRECT_URI, CLIENT_SECRET, CLIENT_ID
from rest_framework.views import APIView
from requests import Request, post
from rest_framework import status
from rest_framework.response import Response
from .util import *
from api.models import Room
from api.serializers import SearchSerializer, QueueSerializer
from .models import Vote


class AuthURL(APIView):
    def get(self, request, format=None):
        scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing'

        url = Request('GET', 'https://accounts.spotify.com/authorize', params={
            'scope': scopes,
            'response_type': 'code',
            'redirect_uri': REDIRECT_URI,
            'client_id': CLIENT_ID
        }).prepare().url

        return Response({'url': url}, status=status.HTTP_200_OK)


def spotify_callback(request, format=None):
    code = request.GET.get('code')
    error = request.GET.get('error')

    response = post('https://accounts.spotify.com/api/token', data={
        'grant_type': 'authorization_code',
        'code': code,
        'redirect_uri': REDIRECT_URI,
        'client_id': CLIENT_ID,
        'client_secret': CLIENT_SECRET
    }).json()

    access_token = response.get('access_token')
    token_type = response.get('token_type')
    refresh_token = response.get('refresh_token')
    expires_in = response.get('expires_in')
    error = response.get('error')

    if not request.session.exists(request.session.session_key):
        request.session.create()

    update_or_create_user_tokens(
        request.session.session_key, access_token, token_type, expires_in, refresh_token)

    return redirect('frontend:')


class IsAuthenticated(APIView):
    def get(self, request, format=None):
        is_authenticated = is_spotify_authenticated(
            self.request.session.session_key)
        return Response({'status': is_authenticated}, status=status.HTTP_200_OK)


class CurrentSong(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/currently-playing"
        response = execute_spotify_api_request(host, endpoint)

        if 'error' in response or 'item' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        item = response.get('item')
        duration = item.get('duration_ms')
        progress = response.get('progress_ms')
        album_cover = item.get('album').get('images')[0].get('url')
        is_playing = response.get('is_playing')
        song_id = item.get('id')

        artist_string = ""

        for i, artist in enumerate(item.get('artists')):
            if i > 0:
                artist_string += ", "
            name = artist.get('name')
            artist_string += name

        votes = len(Vote.objects.filter(room=room, song_id=song_id))
        song = {
            'title': item.get('name'),
            'artist': artist_string,
            'duration': duration,
            'time': progress,
            'image_url': album_cover,
            'is_playing': is_playing,
            'votes': votes,
            'votes_to_skip': room.votes_to_skip,
            'id': song_id
        }

        self.update_room_song(room, song_id)

        return Response(song, status=status.HTTP_200_OK)
    
    def update_room_song(self, room, song_id):
        current_song = room.current_song

        if current_song != song_id:
            room.current_song = song_id
            room.save(update_fields=['current_song'])
            votes = Vote.objects.filter(room=room).delete()

class UserQueue(APIView):
    def get(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)
        if room.exists():
            room = room[0]
        else:
            return Response({}, status=status.HTTP_404_NOT_FOUND)
        host = room.host
        endpoint = "player/queue"
        response = execute_spotify_api_request(host, endpoint)

        if 'error' in response or 'queue' not in response:
            return Response({}, status=status.HTTP_204_NO_CONTENT)

        queue = response.get('queue')
        user_queue = []

        for i, song in enumerate(queue):
            if i >= 5:
                # Only want to send over the first 5 songs in the queue
                return Response(user_queue, status=status.HTTP_200_OK)
            artist_string = ""
            for j, artist in enumerate(song.get('artists')):
                if j > 0:
                    artist_string += ", "
                name = artist.get('name')
                artist_string += name
            queue_song = {
            'title': song.get('name'),
            'artist': artist_string,
            'album_cover': song.get('album').get('images')[0].get('url')
            }
            user_queue.append(queue_song)

        return Response(user_queue, status=status.HTTP_200_OK)

class PauseSong(APIView):
    def put(self, response, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if self.request.session.session_key == room.host or room.guest_can_pause:
            pause_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)
    
class PlaySong(APIView):
    def put(self, response, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if self.request.session.session_key == room.host or room.guest_can_pause:
            play_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)
        
        return Response({}, status=status.HTTP_403_FORBIDDEN)
    
class SkipSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]
        votes = Vote.objects.filter(room=room, song_id=room.current_song)
        votes_to_skip = room.votes_to_skip
        #TODO:This check if user already voted should maybe be in the else case
        if self.request.session.session_key == room.host or (len(votes) + 1 >= votes_to_skip and len(Vote.objects.filter(user=self.request.session.session_key, 
                        room=room, song_id=room.current_song)) == 0):
            votes.delete()
            skip_song(room.host)
        else:
            vote = Vote(user=self.request.session.session_key, 
                        room=room, song_id=room.current_song)
            vote.save()

        return Response({}, status.HTTP_204_NO_CONTENT)
    
class PreviousSong(APIView):
    def post(self, request, format=None):
        room_code = self.request.session.get('room_code')
        room = Room.objects.filter(code=room_code)[0]

        if self.request.session.session_key == room.host:
            previous_song(room.host)
            return Response({}, status=status.HTTP_204_NO_CONTENT)     

        return Response({}, status.HTTP_403_FORBIDDEN)
    
    
class QueueSong(APIView):
    serializer_class = QueueSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            code = serializer.data.get('code')
            uri = serializer.data.get('uri')
            room = Room.objects.filter(code=code)
            if room.exists():
                room = room[0]
            else:
                return Response({'Bad Request' : 'Room Not Found'}, status=status.HTTP_404_NOT_FOUND)

            if self.request.session.session_key == room.host or room.guest_can_add_song == True:
                queue_song(room.host, uri)
                return Response({}, status=status.HTTP_204_NO_CONTENT)  
            return Response({}, status.HTTP_403_FORBIDDEN)
        
        return Response({}, status=status.HTTP_400_BAD_REQUEST)

class SearchSong(APIView): 
    serializer_class = SearchSerializer

    def post(self, request, format=None):
        if not self.request.session.exists(self.request.session.session_key):
            self.request.session.create()

        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            code = serializer.data.get('code')
            search = serializer.data.get('search')
            room = Room.objects.filter(code=code)
            if room.exists():
                room = room[0]
            else:
                return Response({'Bad Request' : 'Room Not Found'}, status=status.HTTP_404_NOT_FOUND)
            
            if self.request.session.session_key == room.host or room.guest_can_add_song == True:                        
                response = execute_spotify_search_request(room.host, search)
                if 'error' in response or 'tracks' not in response:
                    return Response({}, status=status.HTTP_204_NO_CONTENT)

                items = response.get('tracks').get('items')
                songs = []

                for item in items:
                    artist_string = ""

                    for i, artist in enumerate(item.get('artists')):
                        if i > 0:
                            artist_string += ", "
                        name = artist.get('name')
                        artist_string += name

                    song = {
                        'title': item.get('name'),
                        'artist': artist_string,
                        'album_cover': item.get('album').get('images')[0].get('url'),
                        'uri': item.get('uri')
                    }
                    songs.append(song)

                return Response(songs, status=status.HTTP_200_OK)
            
            return Response({}, status.HTTP_403_FORBIDDEN)
        
        return Response({}, status=status.HTTP_400_BAD_REQUEST)