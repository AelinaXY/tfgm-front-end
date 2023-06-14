import React, { useState, useRef, useEffect} from "react";
import axios from "axios";
import { ScrollView } from "@cantonjs/react-scroll-view";



const TramDetailBox = (props) => {

    const tramStopName = props.name;

    let cleanTramStopName = "";

    const notScaled = useRef(true);
    const loaded = useRef(true);
    const [data, setData] = useState("");
    const [error, setError] = useState("");

    const request = ((url, setFunction) =>
  {
    const config = {
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
    };
    
    axios
      .get(url, config)
      .then((response) => {
        setError("");
        setFunction(response.data);
      })
      .catch((error) => {
        setError(error);
      });

  })

    useEffect(() =>
  {
    cleanTramStopName = tramStopName.replace(/\W/g, '');
    request("http://localhost:8080/trams/" + cleanTramStopName, setData);

  },[props]);



  if (loaded) {
    
    if (error !== "") {
        return (
            <div className="testDiv">
                <h1>{tramStopName}</h1>
                <p>{error.toString()}</p>
             </div>
          );
      
    } else if (data !== "") {
      
      
        return (
            <>

            <div className="tramBox">
                <div className="header">
                <h1>{tramStopName}</h1>
                </div>
                <div className="scroll">
                <p>{data} </p>
                </div>
             </div>
             </>
          );
    }
  } else{
    
  }
};

export default TramDetailBox;