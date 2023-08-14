import * as React from "react";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import { TextField, Autocomplete } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import axios from "axios";

const TramRoutePlanner = (props) => {
  const [state, setState] = React.useState({
    right: false,
  });
  const [openState, setOpen] = React.useState(false);

  const checked = props.checked;

  const timestamp = props.timestamp;

  const [firstStop, setFirstStop] = React.useState("");
  const [secondStop, setSecondStop] = React.useState("");
  const [result, setResult] = React.useState("");
  const [error, setError] = React.useState("");

  const toggleDrawer = (anchor, open) => (event) => {
    if (
      event.type === "keydown" &&
      (event.key === "Tab" || event.key === "Shift")
    ) {
      return;
    }

    setState({ ...state, [anchor]: open });
    setOpen(open);
  };

  const requestAsyncPost = (url, setFunction, bodyParam) => {
    let returnData;

    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };

    // console.log(config)

    return new Promise((resolve) => {
      axios
        .post(url, bodyParam, config)
        .then((response) => {
          setError("");
          setFunction(response.data);
          console.log(result);
          resolve("");
        })
        .catch((error) => {
          setError(error);
        });
    });
  };

  const list = (anchor) => (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          width: anchor === "top" || anchor === "bottom" ? "auto" : "25vw",
        }}
        role="presentation"
        //   onClick={toggleDrawer(anchor, false)}
        //   onKeyDown={toggleDrawer(anchor, false)}
      >
        <List>
          <ListItem>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              value={firstStop}
              onChange={(event, newValue) => {
                setFirstStop(newValue);
              }}
              options={tramstops}
              sx={{ width: "90%", margin: "auto", textAlign: "center" }}
              renderInput={(params) => (
                <TextField {...params} label="Departure Tramstop" />
              )}
            />
          </ListItem>
          <ListItem>
            <Autocomplete
              disablePortal
              id="combo-box-demo"
              value={secondStop}
              onChange={(event, newValue) => {
                setSecondStop(newValue);
              }}
              options={tramstops}
              sx={{ width: "90%", margin: "auto", textAlign: "center" }}
              renderInput={(params) => (
                <TextField {...params} label="Arrival Tramstop" />
              )}
            />
          </ListItem>
        </List>
        <Divider />

        <div className="outputBox">
          <Button
            variant="contained"
            color="success"
            onClick={async () => {
              if (firstStop !== "" && secondStop !== "") {
                await requestAsyncPost(
                  "http://localhost:8080/journey/calculateJourney",
                  setResult,
                  {
                    startStop: firstStop,
                    endStop: secondStop,
                    timestamp: timestamp,
                  }
                );
              }
            }}
          >
            Calculate Route
          </Button>
          {console.log(result)}
          {result !== "" && error === "" ? 
          <>{result.secondTramArrivalTime == null ?<>
          <h3>Tram arriving in {new Date(result.firstTramArrivalTime * 1000).toISOString().substring(14, 19)}</h3>
          <h3>No changes needed</h3>
          <h3>Journey will take {new Date((result.journeyLength + result.firstTramArrivalTime)  * 1000).toISOString().substring(12, 19)} </h3></>:
          <>
          <h3>First Tram arriving in {new Date(result.firstTramArrivalTime * 1000).toISOString().substring(14, 19)}</h3>
          <h3>Change at <b>{result.changeStop}</b></h3>
          <h3>Second Tram Arriving in {new Date(result.secondTramArrivalTime * 1000).toISOString().substring(14, 19)}</h3>
          <h3>Journey will take {new Date((result.journeyLength + result.firstTramArrivalTime + result.secondTramArrivalTime) * 1000).toISOString().substring(12, 19)}</h3></>}
          </> 
          : <h3>{JSON.stringify(error)}</h3>}
        </div>
        <Divider />
        <div className="insideSwitch">
          <h3 className="drawerSwitchLabel">Close Route Planner</h3>

          <label class="drawerSwitch">
            <input
              type="checkbox"
              onChange={toggleDrawer("right", !openState)}
              checked={openState}
            />
            <span class="drawerSlider round"></span>
          </label>
        </div>
      </Box>
    </ThemeProvider>
  );

  return (
    <div>
      {["right"].map((anchor) => (
        <React.Fragment key={anchor}>
          {checked ? (
            <span className="planBox">
              <h1 className="planName">Plan</h1>
              <label class="switch">
                <input
                  type="checkbox"
                  onChange={toggleDrawer("right", !openState)}
                  checked={openState}
                />
                <span class="slider round"></span>
              </label>
            </span>
          ) : (
            <></>
          )}

          <ThemeProvider theme={theme}>
            <Drawer
              anchor={anchor}
              open={state[anchor]}
              onClose={toggleDrawer(anchor, false)}
              transitionDuration={400}
            >
              {list(anchor)}
            </Drawer>
          </ThemeProvider>
        </React.Fragment>
      ))}
    </div>
  );
};

export default TramRoutePlanner;

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3b90ba",
    },
    secondary: {
      main: "#AD1F4E",
    },
    background: {
      default: "#0c0c0c",
      paper: "#0c0c0c",
    },
    text: {
      primary: "#ececee",
    },
    success: {
      main: "#4B9211",
    },
  },
  typography: {
    fontFamily: "IBM Plex Mono",
  },
});

const tramstops = [
  "Abraham Moss",
  "Altrincham",
  "Anchorage",
  "Ashton Moss",
  "Ashton West",
  "Ashton-Under-Lyne",
  "Audenshaw",
  "Baguley",
  "Barlow Moor Road",
  "Barton Dock Road",
  "Benchill",
  "Besses O' Th' Barn",
  "Bowker Vale",
  "Broadway",
  "Brooklands",
  "Burton Road",
  "Bury",
  "Cemetery Road",
  "Central Park",
  "Chorlton",
  "Clayton Hall",
  "Cornbrook",
  "Crossacres",
  "Crumpsall",
  "Dane Road",
  "Deansgate - Castlefield",
  "Derker",
  "Didsbury Village",
  "Droylsden",
  "East Didsbury",
  "Eccles",
  "Edge Lane",
  "Etihad Campus",
  "Exchange Quay",
  "Exchange Square",
  "Failsworth",
  "Firswood",
  "Freehold",
  "Harbour City",
  "Heaton Park",
  "Hollinwood",
  "Holt Town",
  "Imperial War Museum",
  "Kingsway Business Park",
  "Ladywell",
  "Langworthy",
  "Manchester Airport",
  "Market Street",
  "Martinscroft",
  "MediaCityUK",
  "Milnrow",
  "Monsall",
  "Moor Road",
  "Navigation Road",
  "New Islington",
  "Newbold",
  "Newhey",
  "Newton Heath and Moston",
  "Northern Moor",
  "Old Trafford",
  "Oldham Central",
  "Oldham King Street",
  "Oldham Mumps",
  "Parkway",
  "Peel Hall",
  "Piccadilly",
  "Piccadilly Gardens",
  "Pomona",
  "Prestwich",
  "Queens Road",
  "Radcliffe",
  "Robinswood Road",
  "Rochdale Railway Station",
  "Rochdale Town Centre",
  "Roundthorn",
  "Sale",
  "Sale Water Park",
  "Salford Quays",
  "Shadowmoss",
  "Shaw and Crompton",
  "Shudehill",
  "South Chadderton",
  "St Peter's Square",
  "St Werburgh's Road",
  "Stretford",
  "The Trafford Centre",
  "Timperley",
  "Trafford Bar",
  "Velopark",
  "Victoria",
  "Village",
  "Weaste",
  "West Didsbury",
  "Westwood",
  "Wharfside",
  "Whitefield",
  "Withington",
  "Wythenshawe Park",
  "Wythenshawe Town Centre",
];
