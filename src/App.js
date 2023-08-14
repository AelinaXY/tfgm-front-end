import React, { useState, useEffect, useRef, useLayoutEffect} from "react";
import { createRoot } from "react-dom/client";
import { Map } from "react-map-gl";
import maplibregl, { GeoJSONFeature } from "maplibre-gl";
import DeckGL from "@deck.gl/react";
import { GeoJsonLayer } from "@deck.gl/layers";
import dataLines from "./data/Metrolink_Lines_Functional.json";
import dataPoints from "./data/Metrolink_Stops_Functional.json";
import "./App.css";
import TramDetailBox from "./components/TramDetailGetter";
import TramDetailBoxLive from "./components/TramDetailGetterLive";
import axios from "axios";
import { render } from "react-dom";
import { Slider, Box, Button, ButtonGroup, Grid, createTheme } from "@mui/material";
import moment from "moment";
import TramRoutePlanner from "./components/TramRoutePlanner";

const INITIAL_VIEW_STATE = {
  longitude: -2.2449,
  latitude: 53.482,
  zoom: 13,
  maxZoom: 16,
  pitch: 0,
  bearing: 0,
};

const MAP_STYLE =
  "https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json";

moment.globalFormat = "D MMM YYYY";

export default function App({
  intensity = 1,
  threshold = 0.03,
  radiusPixels = 30,
  mapStyle = MAP_STYLE,
}) {
  const [tramStop, setTramStop] = useState("Deansgate-Castlefield");
  const [error, setError] = useState("");
  const [tramStopData, setTramStopData] = useState("");
  const timestamps = useRef([]);
  const liveData = useRef(true);
  const [checked, setChecked] = useState(true);
  const [nonLiveTimestamp, setNonLiveTimestamp] = useState(0);

  const TENSECOND_MS = 10000;

  const layers = [
    new GeoJsonLayer({
      id: "geojson-layer",
      data: dataPoints,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: true,
      pointType: "circle",
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getLineColor: [255, 255, 255, 0],
      getFillColor: [226, 40, 102, 0],
      getPointRadius: 45,
      getLineWidth: 0.5,
      getElevation: 30,
      getText: (f) => f.properties.name,
      getTextColor: [255, 255, 255, 0],
      textFontSettings: { sdf: true },
      textOutlineWidth: 3,
      textOutlineColor: [26, 26, 26],
      getTextSize: 20,
      getTextAlignmentBaseline: "top",
      onClick: (event) => {
        if (event.object.geometry.type === "Point") {
          setTramStop(event.object.properties.name);
        } else {
          setTramStop("");
        }
      },
    }),
    new GeoJsonLayer({
      id: "geojson-layer",
      data: dataLines,
      pickable: true,
      stroked: false,
      filled: true,
      extruded: true,
      pointType: "circle",
      lineWidthScale: 20,
      lineWidthMinPixels: 2,
      getLineColor: [59, 144, 186, 255],
      getPointRadius: 100,
      getLineWidth: 1,
      getElevation: 30,
    }),
    new GeoJsonLayer({
      id: "geojson-layer",
      data: dataPoints,
      pickable: true,
      stroked: true,
      filled: true,
      extruded: true,
      pointType: "circle",
      lineWidthScale: 2,
      lineWidthMinPixels: 2,
      getLineColor: [236, 236, 238, 250],
      getFillColor: (d) => calculateColor(d.properties.name),
      getPointRadius: 45,
      getLineWidth: 0.5,
      getElevation: 30,
      updateTriggers: {
        getFillColor: tramStopData,
      },
    }),
  ];

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

    console.log(config)

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



  const calculateColor = (tramStopName) => {
    let runningCount = 0;
    const cleanTramStopName = tramStopName.replace(/\W/g, "");
    const incomingName = cleanTramStopName + "Incoming";
    const outgoingName = cleanTramStopName + "Outgoing";

    if (!(tramStopData[incomingName] == undefined)) {
      runningCount += tramStopData[incomingName].length;
    }

    if (!(tramStopData[outgoingName] == undefined)) {
      runningCount += tramStopData[outgoingName].length;
    }

    console.log("updating Colours!");
    if (runningCount > 0) {
      return [78, 146, 17, 255];
    } else {
      return [173, 31, 78, 255];
    }
  };

  const setTimestamps = (timestampsRaw) => {
    timestamps.current = timestampsRaw;
  };

  useLayoutEffect(() => {
    const fetchData = async () => {
      if (checked) {
        console.log("IM LIVE");
        await requestAsync(
          "http://localhost:8080/trams/timestamps",
          setTimestamps
        );
        if (timestamps.current.length > 0) {
          const finalIndex = timestamps.current.length - 1;
          await requestAsync(
            "http://localhost:8080/trams/alltramsatstop/" + timestamps.current[finalIndex],
            setTramStopData
          );
        }
      } else {
        if (nonLiveTimestamp !== 0) {
          console.log("IM NONT LIVE");

          await requestAsync(
            "http://localhost:8080/trams/alltramsatstop/" + nonLiveTimestamp,
            setTramStopData
          );
        }
      }
    };

    const interval = setInterval(async () => {
      await fetchData();
    }, TENSECOND_MS);

    fetchData();

    return () => clearInterval(interval); // This represents the unmount function, in which you need to clear your interval to prevent memory leaks.
  }, [nonLiveTimestamp, checked]);

  const liveBox = () => {
    console.log("liveBoxCheck");
    setChecked(!checked);
  };

  const nonZeroTimestamp = () => {
    if (nonLiveTimestamp === 0 && timestamps.current.length > 0) {
      setNonLiveTimestamp(timestamps.current[0]);
    }
  };

  const mapUnixToNormal = (unixTimestamp) => {
    var formatted = moment
      .unix(unixTimestamp)
      .format("dddd, MMMM Do YYYY, h:mm:ss a");
    return formatted;
  };

  function compareNumbers(a,b)
  {
    return a-b;
  }

  const findClosestTimestamp = (timestamp, change, timestampArray, sign) => {

    var timestampArraySorted = timestampArray.sort(compareNumbers);

    const optimalTimestamp = timestamp + change;



    if(sign === "min" && optimalTimestamp <= timestampArraySorted[0])
    {
      return timestampArraySorted[0];
    }
    if(sign === "pos" && optimalTimestamp >= timestampArraySorted[timestampArraySorted.length-1])
    {
      return timestampArraySorted[timestampArraySorted.length-1];
    }


    var current = 0;

    if(sign === "pos")
    {
      var diff = 10000000;
    }
    else
    {
      var diff = -10000000;
    }
    

    for(var val = 0 ; val < timestampArray.length; val++)
    {
      var newDiff = timestampArray[val] - optimalTimestamp;

      if(sign === "min" && newDiff < 0 && timestampArray[val] !== timestamp)
      {
        if (newDiff > diff)
        {
          diff = newDiff;
          current = timestampArray[val];
        }
      }

      if(sign === "pos" && newDiff > 0 && timestampArray[val] !== timestamp)
      {
        if (newDiff < diff)
        {
          diff = newDiff;
          current = timestampArray[val];
        }
      }
    }
    return current;
  }

  const buttonStylingBack =
  {
    fontFamily:"monospace", bgcolor:"#AD1F4E", color:"#ececee", "&:hover": {
      bgcolor: "#8B183F"
  },
  mr:3,
  mb:0.5,
  }

  const buttonStylingForward =
  {
    fontFamily:"monospace", bgcolor:"#4B9211", color:"#ececee", "&:hover": {
      bgcolor: "#386E0D"
  },
  ml:3,
  mb:0.5,
}

  return (
    <>
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        getTooltip={({ object }) => object && `${object.properties.name}`}
      >
        <Map
          reuseMaps
          mapLib={maplibregl}
          mapStyle={mapStyle}
          preventStyleDiffing={true}
        />

        {checked ? (
          <>
            <TramDetailBoxLive name={tramStop}/>
          </>
        ) : (
          <><TramDetailBox name={tramStop} data={tramStopData} checked={checked} /></>
        )}
        

        {!checked ? (
          <>
            {nonZeroTimestamp}
          </>
        ) : (
          <></>
        )}

        
      </DeckGL>

      {!checked ? (
          <>
            <Box
              sx={{ width: 750 }}
              className="timeLineBox"
              justifyContent="center"
              alignItems="center"
              display="flex"
            >
              <Grid container spacing={1}>
                <Grid item xs={12} justifyItems="center">
                  <h1 className="tempTimestamp">
                    {mapUnixToNormal(nonLiveTimestamp)}
                  </h1>
                  
                </Grid>
                <Grid container justifyContent="center" xs={12}>
                    <Button sx={buttonStylingBack} onClick={() => setNonLiveTimestamp(findClosestTimestamp(nonLiveTimestamp,-86400,timestamps.current,"min"))}>-1 Day</Button>
                    <Button sx={buttonStylingBack} onClick={() => setNonLiveTimestamp(findClosestTimestamp(nonLiveTimestamp,-3600,timestamps.current,"min"))}>-1 Hour</Button>
                    <Button sx={buttonStylingBack} onClick={() => setNonLiveTimestamp(findClosestTimestamp(nonLiveTimestamp,-30,timestamps.current,"min"))}>-30 Seconds</Button>
                    <Button sx={buttonStylingForward} onClick={() => setNonLiveTimestamp(findClosestTimestamp(nonLiveTimestamp,30,timestamps.current,"pos"))}>+30 Seconds</Button>
                    <Button sx={buttonStylingForward} onClick={() => setNonLiveTimestamp(findClosestTimestamp(nonLiveTimestamp,3600,timestamps.current,"pos"))}>+1 Hour</Button>
                    <Button sx={buttonStylingForward} onClick={() => setNonLiveTimestamp(findClosestTimestamp(nonLiveTimestamp,86400,timestamps.current,"pos"))}>+1 Day</Button>
                </Grid>
              </Grid>
            </Box>
          </>
        ) : (
          <></>
        )}
 
      <span className="liveBox">
        <h1 className="liveName">Live</h1>
        <label class="switch">
          <input type="checkbox" onChange={liveBox} checked={checked} />
          <span class="slider round"></span>
        </label>
      </span>

      <TramRoutePlanner checked={checked} timestamp={timestamps.current.length > 0 ? timestamps.current[timestamps.current.length-1] : 0}/>

      
    </>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
