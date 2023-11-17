import React, { Component } from "react";
import { Grid, Button, Typography, List, Card } from "@mui/material";
import { withRouter } from "../../withRouter";
import CreateRoomPage from "./CreateRoomPage";
import MusicPlayer from "./MusicPlayer";
import SearchMusic from "./SearchMusic";

class Room extends Component {
  constructor(props) {
    super(props);
    this.state = {
      votesToSkip: 2,
      guestCanPause: false,
      guestCanAddSong: false,
      isHost: false,
      showSettings: false,
      showSearch: false,
      spotifyAuthenticated: false,
      song: {},
      queue: [{'title': "", 'aritst': "", 'album_cover': ""}]
    };
    this.roomCode = window.location.href.split('/')[4];
    this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    this.updateShowSettings = this.updateShowSettings.bind(this);
    this.updateShowSearch = this.updateShowSearch.bind(this);
    this.renderSettingsButton = this.renderSettingsButton.bind(this);
    this.renderSettings = this.renderSettings.bind(this);
    this.renderSearchButton = this.renderSearchButton.bind(this);
    this.renderSearch = this.renderSearch.bind(this);
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
          this.props.navigate("/");
        }
        return response.json();
      })
      .then((data) => {
        this.setState({
          votesToSkip: data.votes_to_skip,
          guestCanPause: data.guest_can_pause,
          guestCanAddSong: data.guest_can_add_song,
          isHost: data.is_host,
        });
        if (data.is_host) {
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
    <Grid item xs={12} align="center">
      <List>
        <Card>
          <Typography component="h6" variant="h6" align="center">
          Queue
          </Typography>
        </Card>
        {queue.map((s, index) => 
          <li key={index}>{
          <Card>
            <Grid container alignItems="center">
                <Grid item align="left" xs={4}>
                  <img src={s.album_cover} height="80vh" width="80vw" />
                </Grid>
              <Grid item align="center" xs={8}>
                  <Typography variant="subtitle1">
                    {s.title}
                  </Typography>
                  <Typography color="textSecondary" variant="subtitle1">
                    {s.artist}
                  </Typography>
              </Grid>
            </Grid>
          </Card>}
          </li>
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
      this.props.navigate("/");
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
            guestCanAddSong={this.state.guestCanAddSong}
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

  updateShowSearch(value) {
    this.setState({
      showSearch: value,
    });
  }

  renderSearch() {
    return (
        <Grid container spacing={1}>
          <Grid item xs={12} align="center">
            <SearchMusic code={this.roomCode} />
          </Grid>
          <Grid item xs={12} align="center">
            <Button
              variant="contained"
              color="secondary"
              onClick={() => this.updateShowSearch(false)}
            >
              Close
            </Button>
          </Grid>
        </Grid>
    );
  }

  renderSearchButton() {
    return (
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.updateShowSearch(true)}
        >
          Search Music
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
    if (this.state.showSearch) {
      return this.renderSearch();
    }
    return (
      <div style={backgroundAlbum}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} align="center">
            <Typography variant="h4" component="h4" style={{color:'white'}}>
              Code: {this.roomCode}
            </Typography>
          </Grid>
          <Grid item xs={12} align="center">
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={3} />
              <Grid item xs={6} align="center">
                <MusicPlayer {...this.state.song} />
              </Grid>
              <Grid item xs={3} align="center">
                {this.state.queue.length > 0 ? this.renderQueue() : null}
              </Grid>
            </Grid>
          </Grid>
          {this.state.isHost ? this.renderSettingsButton() : null}
          {this.state.isHost || this.state.guestCanAddSong ? this.renderSearchButton() : null}       
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
      </div>
    );
  }
}

export default withRouter(Room);