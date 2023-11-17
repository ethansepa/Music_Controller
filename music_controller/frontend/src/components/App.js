import React, { Component } from "react";
import { createRoot } from "react-dom/client";
import HomePage from "./HomePage";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { lightBlue, blueGrey, blue, deepPurple } from '@mui/material/colors';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const theme = createTheme({
      palette: {
        primary: {
          main: lightBlue[500],
        },
        secondary: {
          main: blueGrey[500],
        },
      },
    });
    return (
      <div className="center">
        <ThemeProvider theme={theme}>
          <HomePage />
        </ThemeProvider>
      </div>
    );
  }
}

const appDiv = document.getElementById("app");
const root = createRoot(appDiv);
root.render(<App />);