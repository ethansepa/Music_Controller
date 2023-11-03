import React, { Component } from "react";
import { TextField, Button, Grid, Typography, List, Card} from "@material-ui/core";
import { Link } from "react-router-dom";

export default class SearchMusic extends Component {
  constructor(props) {
    super(props);
    this.state = {
      search: "",
      error: false,
      errormsg: "",
      searchedSongs: []
    };
    this.handleTextFieldChange = this.handleTextFieldChange.bind(this);
    this.searchButtonPressed = this.searchButtonPressed.bind(this);
    this.renderSearch = this.renderSearch.bind(this)
  }

  handleTextFieldChange(e) {
    this.setState({
      search: e.target.value,
    });
  }

  searchButtonPressed() {
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
        if (!response.ok) {
          return {};
        } else {
          return response.json();
        }
      })
      .then((data) => {
        this.setState({ searchedSongs: data});
      });
  }


  renderSearch() {
    const searchedSongs = this.state.searchedSongs
    return(
    <Grid item xs={12} align="center">
      <List>
        <Card>
          <Typography component="h6" variant="h6" align="center">
          Search for {this.state.search}
          </Typography>
        </Card>
        {searchedSongs.map((s, index) => 
          <li key={index}>{
          <Card>
            <Grid container alignItems="center">
                <Grid item align="left" xs={4}>
                  <img src={s.album_cover} height="100vh" width="100vw" />
                </Grid>
              <Grid item align="center" xs={8}>
                  <Typography component="h6" variant="h6">
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

  render() {
    return (
      <Grid container spacing={1}>
        <Grid item xs={12} align="center">
          <Typography variant="h4" component="h4">
            Search Music
          </Typography>
        </Grid>
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