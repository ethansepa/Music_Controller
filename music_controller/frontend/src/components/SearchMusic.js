import React, { Component } from "react";
import {  TextField, Button, Grid, Typography, 
          List, Card, Collapse, Alert} from "@mui/material";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { blueGrey, lightBlue } from '@mui/material/colors';

export default class SearchMusic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      error: false,
      errorMsg: "",
      successMsg: "",
      searchedSongs: [],
      lastSearch: "",
    };
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.searchButtonPressed = this.searchButtonPressed.bind(this);
    this.renderSearch = this.renderSearch.bind(this);
    this.addToQueueButtonPressed = this.addToQueueButtonPressed.bind(this);
  }

  handleTextFieldChange(e) {
    this.setState({
      search: e.target.value,
    });
  }

  addToQueueButtonPressed(uri) {
    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        code: this.props.code,
        uri: uri,
      }),
    };
    
    fetch("../spotify/add-to-queue", requestOptions).then((response) => {
      if (response.ok) {
        this.setState({
          successMsg: "Song added to queue!",
        });
      } else {
        this.setState({
          errorMsg: "Error adding song to queue...",
        });
      }
    });
  }

  searchButtonPressed() {
    this.setState({
      lastSearch: this.state.search,
    });
    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({
        code: this.props.code,
        search: this.state.search,

      }),
    };
    
    fetch("../spotify/search", requestOptions)
      .then((response) => {
        if (response.ok) {
          return response.json();
        } else {
          this.setState({
            errorMsg: "Song not found.",
          });
          return {};
        }
      }).then((data) => {
        this.setState({searchedSongs: data});
        if(data.length == 0) {
          this.setState({
            errorMsg: "Song not found.",
          });
        }
      });
  }


  renderSearch() {
    const searchedSongs = this.state.searchedSongs;
    const alt = createTheme({
      palette: {
        grey: {
          main: blueGrey[200],
          dark: lightBlue[200],
          contrastText: '#242105',
        },
      },
    });

    return(
      <ThemeProvider theme={alt}>
        <Grid item xs={12} align="center">
          <List>
            <Card>
              <Typography component="h6" variant="h6" align="center">
              Search for {this.state.lastSearch}
              </Typography>
            </Card>
            {searchedSongs.map((s, index) => 
              <li key={index}>{
              <Card>
                <Grid container alignItems="center">
                  <Grid item align="left" xs={4}>
                    <img src={s.album_cover} height="100vh" width="100vw" />
                  </Grid>
                  <Grid item align="center" xs={6}>
                      <Typography component="h6" variant="h6">
                        {s.title}
                      </Typography>
                      <Typography color="textSecondary" variant="subtitle1">
                        {s.artist}
                      </Typography>
                  </Grid>
                  <Grid item xs={2} align="center">
                    <Button
                      variant="contained"
                      color= "grey"
                      onClick={() => {
                        this.addToQueueButtonPressed(s.uri);
                      }}
                    >
                      Add to Queue
                    </Button>
                  </Grid>
                </Grid>
              </Card>
              }
              </li>
            )}
          </List>
        </Grid>
      </ThemeProvider>
    );
  }

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Search Music
          </Typography>
        </Grid>
        <Collapse
            in={this.state.errorMsg != "" || this.state.successMsg != ""}
          >
            {this.state.successMsg != "" ? (
              <Alert
                severity="success"
                onClose={() => {
                  this.setState({ successMsg: "" });
                }}
              >
                {this.state.successMsg}
              </Alert>
            ) : (
              <Alert
                severity="error"
                onClose={() => {
                  this.setState({ errorMsg: "" });
                }}
              >
                {this.state.errorMsg}
              </Alert>
            )}
        </Collapse>
        <Grid item xs={9} align="center">
          <TextField
            errormsg={this.state.errormsg}
            error={this.state.error}
            label="Song"
            placeholder="Search for a Song"
            value={this.state.search}
            helperText={this.state.errormsg}
            variant="outlined"
            onChange={this.handleTextFieldChange}
          />
        </Grid>
        <Grid item xs={3} align="center">
          <Button
            variant="contained"
            color="primary"
            onClick={this.searchButtonPressed}
          >
            Search
          </Button>
        </Grid>
        {this.state.searchedSongs.length > 0 ? this.renderSearch() : null}
      </Grid>
    );
  }
}