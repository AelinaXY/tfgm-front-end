import React, { useState, useRef, useEffect} from "react";
import axios from "axios";
import { ScrollView } from "@cantonjs/react-scroll-view";

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import InfoIcon from '@mui/icons-material/Info';
import { createTheme } from "@mui/material";
import { ThemeProvider } from "@emotion/react";



const TramDetailBoxLive = (props) => {

    const tramStopName = props.name;
    const [error, setError] = useState("");
    const [tramStopData, setTramStopData] = useState("");
    const TENSECOND_MS = 10000;
    const timestamps = useRef([]);

    const [open, setOpen] = React.useState(false);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


    const setTimestamps = (timestampsRaw) => {
        timestamps.current = timestampsRaw;
      };

    const requestAsync = (url, setFunction) => {
        let returnData;
    
        const config = {
          headers: {
            "Access-Control-Allow-Origin": "*",
          },
        };
    
        return new Promise((resolve) => {
          axios
            .get(url, config)
            .then((response) => {
              setError("");
              setFunction(response.data);
              resolve("");
            })
            .catch((error) => {
              setError(error);
            });
        });
      };
    
    const requestAsyncPost = (url, setFunction,bodyParam) => {
        let returnData;
    
    
        const config = {
          headers: {
            "Access-Control-Allow-Origin": "*",
          }
        };
    
        // console.log(config)
    
        return new Promise((resolve) => {
          axios
            .post(url, bodyParam,config)
            .then((response) => {
              setError("");
              setFunction(response.data);
              resolve("");
            })
            .catch((error) => {
              setError(error);
            });
        });
      };

      
  useEffect(() => {
    const fetchData = async () => {
        console.log("IM LIVE");
        await requestAsync(
          "http://localhost:8080/trams/timestamps",
          setTimestamps
        );

        if (timestamps.current.length > 0) {
          const finalIndex = timestamps.current.length - 1;
          await requestAsyncPost(
            "http://localhost:8080/journey/calculateNextTrams",
            setTramStopData,
            {"stopname": tramStopName,
            "timestamp": timestamps.current[finalIndex]}
          );
        }
    };

    const interval = setInterval(() => {
      fetchData();
    }, TENSECOND_MS);

    fetchData();

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [tramStopName]);


    if (tramStopData !== "" && tramStopName !== ""){
        
        tramStopData["Incoming"] = tramStopData["Incoming"].sort(function (a,b) {return a.timeToArrival > b.timeToArrival;});
        tramStopData["Outgoing"] = tramStopData["Outgoing"].sort(function (a,b) {return a.timeToArrival > b.timeToArrival;});


        console.log(tramStopData);

        return (
            <>

            <div className="tramBox">
                <div className="header">
                <h1>{tramStopName}:</h1>
                <Button variant="inherit" onClick={handleClickOpen} className="infoButton">
                    <InfoIcon/>
      </Button>
                </div>
                <div className="scroll">
                {tramStopData["Incoming"].length !== 0 ? <><h2>Incoming Trams:</h2>
                {tramStopData["Incoming"].map((m) => {return <> {m.timeToArrival <= 0 ? <h3>Tram at stop or late. Headed to {m.endOfLine}. Late by {Math.abs(m.timeToArrival)}s</h3>:
                <h3>Tram heading to {m.endOfLineDisplay} in {new Date(m.timeToArrival * 1000).toISOString().substring(14, 19)}</h3>}</>
                })}</>: <></>}
                {tramStopData["Outgoing"].length !== 0? <><h2>Outgoing Trams:</h2>
                {tramStopData["Outgoing"].map((m) => {return <> {m.timeToArrival <= 0 ? <h3>Tram at stop or late. Headed to {m.endOfLine}. Late by {Math.abs(m.timeToArrival)}s</h3>:
                <h3>Tram heading to {m.endOfLineDisplay} in {new Date(m.timeToArrival * 1000).toISOString().substring(14, 19)}</h3>}</>
                })}</>: <></>}
                {tramStopData["Outgoing"].length === 0 && tramStopData["Incoming"].length === 0 ? <h3>No Trams going to stop</h3> : <></>}
                </div>
             </div>


<ThemeProvider theme={theme}>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className="dialogBox"
      >
        <DialogTitle id="alert-dialog-title">
          {"Disclaimer about the TFGM Prototype"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            This application uses a mix of both live data and historical data to create routes and to predict trams. Due to this fact, data may not be 100% reliable.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            Close
          </Button>
        </DialogActions>
      </Dialog>
      </ThemeProvider>
             </>
          );
    }

    else{
        return;
    }
};

export default TramDetailBoxLive;

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