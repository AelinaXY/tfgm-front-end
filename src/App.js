import React, { useState } from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import { GeoJsonLayer } from '@deck.gl/layers';
import dataLines from './data/Metrolink_Lines_Functional.json'
import dataPoints from './data/Metrolink_Stops_Functional.json'
import "./App.css";
import TramDetailBox from './components/TramDetailGetter';


const INITIAL_VIEW_STATE = {
  longitude: -2.2449,
  latitude: 53.4820,
  zoom: 13,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

// const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';
const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json';

export default function App({
  intensity = 1,
  threshold = 0.03,
  radiusPixels = 30,
  mapStyle = MAP_STYLE
}) {
  
  const layers = [new GeoJsonLayer({
    id: 'geojson-layer',
    data: dataPoints,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    pointType: 'circle+text',
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getLineColor: [255, 255, 255, 250],
    getFillColor: [226, 40, 102, 255],
    getPointRadius: 45,
    getLineWidth: 0.5,
    getElevation: 30,
    getText: f=> f.properties.name,
    getTextColor: [255,255,255,255],
    textFontSettings:{sdf: true},
    textOutlineWidth: 3,
    textOutlineColor: [26,26,26],
    getTextSize: 20,
    getTextAlignmentBaseline: 'top',
    onClick: (event) => setTramStop(event.object.properties.name)
  }),new GeoJsonLayer({
    id: 'geojson-layer',
    data: dataLines,
    pickable: true,
    stroked: false,
    filled: true,
    extruded: true,
    pointType: 'circle',
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getLineColor: [183, 253, 254, 255],
    getPointRadius: 100,
    getLineWidth: 1,
    getElevation: 30,
  }),
  new GeoJsonLayer({
    id: 'geojson-layer',
    data: dataPoints,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: true,
    pointType: 'circle+text',
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getLineColor: [255, 255, 255, 250],
    getFillColor: [226, 40, 102, 255],
    getPointRadius: 45,
    getLineWidth: 0.5,
    getElevation: 30,
    getText: f=> f.properties.name,
    getTextColor: [255,255,255,255],
    textFontSettings:{sdf: true},
    textOutlineWidth: 3,
    textOutlineColor: [26,26,26],
    getTextSize: 20,
    getTextAlignmentBaseline: 'top',
  })
  
];

  console.log(dataLines);

  const [tramStop,setTramStop] = useState("Deansgate-Castlefield");

  return (
    <>
    <DeckGL initialViewState={INITIAL_VIEW_STATE} controller={true} layers={layers}
    getTooltip={({object}) => object && `${object.properties.name}`}>

      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />

      <TramDetailBox name={tramStop}/>
    </DeckGL>
    </>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}