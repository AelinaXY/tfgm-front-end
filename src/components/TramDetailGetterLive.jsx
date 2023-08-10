import React, { useState, useRef, useEffect} from "react";
import axios from "axios";
import { ScrollView } from "@cantonjs/react-scroll-view";



const TramDetailBoxLive = (props) => {

    const tramStopName = props.name;
    const [error, setError] = useState("");
    const [tramStopData, setTramStopData] = useState("");
    const TENSECOND_MS = 10000;
    const timestamps = useRef([]);

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
                </div>
                <div className="scroll">
                {tramStopData["Incoming"].length !== 0 ? <><h2>Incoming Trams:</h2>
                {tramStopData["Incoming"].map((m) => {return <> {m.timeToArrival <= 0 ? <h3>Tram at stop or late. Headed to {m.endOfLine}</h3>:
                <h3>Tram heading to {m.endOfLine} in {new Date(m.timeToArrival * 1000).toISOString().substring(14, 19)}</h3>}</>
                })}</>: <></>}
                {tramStopData["Outgoing"].length !== 0? <><h2>Outgoing Trams:</h2>
                {tramStopData["Outgoing"].map((m) => {return <> {m.timeToArrival <= 0 ? <h3>Tram at stop or late. Headed to {m.endOfLine}</h3>:
                <h3>Tram heading to {m.endOfLine} in {new Date(m.timeToArrival * 1000).toISOString().substring(14, 19)}</h3>}</>
                })}</>: <></>}
                {tramStopData["Outgoing"].length === 0 && tramStopData["Incoming"].length === 0 ? <h3>No Trams going to stop</h3> : <></>}
                </div>
             </div>
             </>
          );
    }

    else{
        return;
    }
};

export default TramDetailBoxLive;