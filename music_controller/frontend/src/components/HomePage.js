import React, { Component } from "react";
import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import { Button, Grid, ButtonGroup, Typography } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
} from "react-router-dom";
import Info from "./Info";

export default class HomePage extends Component {
  constructor(props) {
    super(props);
    this.state = {
      roomCode: null,
    };
    this.clearRoomCode = this.clearRoomCode.bind(this);
  }

  async componentDidMount() {
    fetch("/api/user-in-room")
      .then((response) => response.json())
      .then((data) => {
        this.setState({
          roomCode: data.code,
        });
      });
  }

  renderHomePage() {
    return (
      <Grid container spacing={5} alignItems="center">
        <Grid item xs={12} align="center">
          <Typography variant="h3">House Party</Typography>
        </Grid>
        <Grid item xs={12} align="center">
          <ButtonGroup disableElevation variant="contained" color="primary">
            <Button color="secondary" component={Link} to="/join">
              Join a Room
            </Button>
            <Button color="primary" component={Link} to="/create">
              Create a Room
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={12} align="end">
          <Button variant="outlined" color="info" component={Link} to="/info">
            Info
          </Button>
        </Grid>
      </Grid>
    );
  }

  clearRoomCode() {
    this.setState({
      roomCode: null,
    });
  }

  render() {
    return (
      <Router>
        <Routes>
          <Route
            path="/"
            element={
              this.state.roomCode ? (
                <Navigate to={`/room/${this.state.roomCode}`} />
              ) : (
                this.renderHomePage()
              )
            }
          />
          <Route path="/join" element={<RoomJoinPage />} />
          <Route path="/create" element={<CreateRoomPage />} />
          <Route path="/info" element={<Info />} />
          <Route
            path="/room/:roomCode"
            element={<Room leaveRoomCallback={this.clearRoomCode} />}
          />
        </Routes>
      </Router>
    );
  }
}
