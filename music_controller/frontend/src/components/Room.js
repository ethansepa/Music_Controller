import React, { Component } from "react";
import { Grid, Button, Typography, List, Card } from "@material-ui/core";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";

export default class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      isHost: false,
      showSettings: false,
      spotifyAuthenticated: false,
      song: {},
      queue: []
    };
    this.roomCode = this.props.match.params.roomCode;
    this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.getRoomDetails = this.getRoomDetails.bind(this);
    this.authenticateSpotify = this.authenticateSpotify.bind(this);
    this.getCurrentSong = this.getCurrentSong.bind(this);
    this.getUserQueue = this.getUserQueue.bind(this);
    this.getMusicData = this.getMusicData.bind(this);
    this.getRoomDetails();
  }

  componentDidMount() {
    this.interval = setInterval(this.getMusicData, 1000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  getRoomDetails() {
    return fetch("/api/get-room" + "?code=" + this.roomCode)
      .then((response) => {
        if (!response.ok) {
          this.props.leaveRoomCallback();
          this.props.history.push("/");
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          isHost: data.is_host,
        });
        if (this.state.isHost) {
          this.authenticateSpotify();
        }
      });
  }

  authenticateSpotify() {
    fetch("/spotify/is-authenticated")
      .then((response) => response.json())
      .then((data) => {
        this.setState({ spotifyAuthenticated: data.status });
        if (!data.status) {
          fetch("/spotify/get-auth-url")
            .then((response) => response.json())
            .then((data) => {
              window.location.replace(data.url);
            });
        }
      });
  }

  getCurrentSong() {
    fetch("/spotify/current-song")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        this.setState({ song: data});
      });
  }

  getUserQueue() {
    fetch("/spotify/queue")
      .then((response) => {
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        this.setState({ queue: data});
      });
      
  }

  getMusicData() {
    this.getCurrentSong();
    this.getUserQueue();
  }

  renderQueue() {
    const queue = this.state.queue
    return(
    <Grid item xs={3} align="center">
      <List>
        <Card>
          <Typography component="h6" variant="h6" align="center">
          Queue
          </Typography>
        </Card>
        {queue.map(queue => 
          <Card>
            <Grid container alignItems="center">
              <Grid item align="left" xs={4}>
                <img src={queue.album_cover} height="100vh" width="100vw" />
              </Grid>
              <Grid item align="center" xs={8}>
                <Typography component="h6" variant="h6">
                  {queue.title}
                </Typography>
                <Typography color="textSecondary" variant="subtitle1">
                  {queue.artist}
                </Typography>
              </Grid>
            </Grid>
          </Card>
        )}
      </List>
    </Grid>);
  }

  leaveButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    };
    fetch("/api/leave-room", requestOptions).then((_response) => {
      this.props.leaveRoomCallback();
      this.props.history.push("/");
    });
  }

  updateShowSettings(value) {
    this.setState({
      showSettings: value,
    });
  }

  renderSettings() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <CreateRoomPage
            update={true}
            votesToSkip={this.state.votesToSkip}
            guestCanPause={this.state.guestCanPause}
            roomCode={this.roomCode}
            updateCallback={this.getRoomDetails}
          />
        </Grid>
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={() => this.updateShowSettings(false)}
          >
            Close
          </Button>
        </Grid>
      </Grid>
    );
  }

  renderSettingsButton() {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.updateShowSettings(true)}
        >
          Settings
        </Button>
      </Grid>
    );
  }

  render() {
    const backgroundAlbum={
      backgroundImage: `url('${this.state.song.image_url}')`,
      backgroundSize: 'cover', 
      backgroundPosition: 'center center',
      height: '100vh',
      width: '100vw',
    };
    if (this.state.showSettings) {
      return this.renderSettings();
    }
    return (
      <div style={backgroundAlbum}>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4" style={{color:'white'}}>
            Code: {this.roomCode}
          </Typography>
        </Grid>
        <Grid item xs={3} />
        <Grid item xs={6} align="center">
          <MusicPlayer {...this.state.song} />
        </Grid>
        {this.state.queue.length > 0 ? this.renderQueue() : null}
        {this.state.isHost ? this.renderSettingsButton() : null}
        <Grid item xs={12} align="center">
          <Button
            variant="contained"
            color="secondary"
            onClick={this.leaveButtonPressed}
          >
            Leave Room
          </Button>
        </Grid>
      </Grid>       
    </div>);
  }
}