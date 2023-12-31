# Music_Controller
Music Controller is a full stack web application for listening to music with friends. <br>
Utilizes the Django and React frameworks. <br>
Interfaces with the Spotify API to control the music. <br>
Allows multiple people to control the spotify playback state, vote to skip songs, and add songs to queue.

## Prerequisites
Room hosts must have a spotify premium acount.

## Run Using Docker Image

### Setup Instructions

#### [Install Docker](https://docs.docker.com/engine/install/)

#### Run Music Controller Image

First pull the music controller image from Docker.
```bash
docker pull ethansepa/music-controller:music-controller
```

Next run the image and publish port 8000.
```bash
docker run -p 8000:8000 ethansepa/music-controller:music-controller
```

Open Docker. <br>
Click on Container tab. <br>
Click on the Port of the Running ```music-controller``` Image.

## Run Using Code from GitHub

### Setup Instructions

#### Clone Repository
Clone the Music Controller repo.
```bash
git clone https://github.com/ethansepa/Music_Controller.git
```

#### Install Required Python Modules

To install the required python pacakges you need to cd into ```music_controller``` directory.
```bash 
cd Music_Controller/music_controller
```
Next pip install the requirements.
```bash
pip install -r requirements.txt
```

#### [Install Node.js](https://nodejs.org/en/)

#### Install Node Modules

Open another Terminal. <br>
First cd into the ```frontend``` folder.
```bash
cd Music_Controller/music_controller/frontend
```
Next install all dependicies.
```bash
npm i
```

#### Compile the Front-End

Run the production compile script.
```bash
npm run build
```

#### Start Web Server

Go back up to the parent directory.
```bash
cd ..
```
Start the django web server.
```bash
python3 manage.py runserver
```
Open the web app ```(cmd + click)``` the link.

## Troubleshooting
Make sure you have a Spotify Premium Account. <br>
If the Music Controller is displaying the default spotify card, open Spotify in another tab and start playing music. The Music Controller will update with the current song.