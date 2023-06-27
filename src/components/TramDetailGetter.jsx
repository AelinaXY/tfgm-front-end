import React, { useState, useRef, useEffect} from "react";
import axios from "axios";
import { ScrollView } from "@cantonjs/react-scroll-view";



const TramDetailBox = (props) => {

    const tramStopName = props.name;
    const tramStopData = props.data;
    const notScaled = useRef(true);
    const loaded = useRef(true);
    const [data, setData] = useState("");
    const [error, setError] = useState("");

    const cleanTramStopName = tramStopName.replace(/\W/g, '');
    const incomingName = cleanTramStopName + "Incoming";
    const outgoingName = cleanTramStopName + "Outgoing";

    let tramData = {};

    if(!(tramStopData[incomingName] === undefined))
    {
        tramData["Incoming"] = tramStopData[incomingName];


    }

    if(!(tramStopData[outgoingName] === undefined))
    {
        tramData["Outgoing"] = tramStopData[outgoingName];

    }

  if (tramStopName !== "") {

        return (
            <>

            <div className="tramBox">
                <div className="header">
                <h1>{tramStopName}:</h1>
                </div>
                <div className="scroll">
                {tramData["Incoming"] !== undefined ? <><h2>Incoming Trams:</h2>
                {tramData["Incoming"].map((m) => {return <>
                <h3>Tram heading to {JSON.parse(m)["endOfLine"]}</h3>
                </>})
                } </>: <></>}
                {tramData["Outgoing"] !== undefined ? <><h2>Outgoing Trams:</h2>
                {tramData["Outgoing"].map((m) => {return <>
                <h3>Tram heading to {JSON.parse(m)["endOfLine"]}</h3>
                </>})
                } </>: <></>}
                {tramData["Outgoing"] === undefined && tramData["Incoming"] === undefined  ? <h3>No Trams at Stop</h3> : <></>}
                </div>
             </div>
             </>
          );
    }

    else{
        return;
    }
};

export default TramDetailBox;