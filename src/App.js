import './App.css';
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';

let autoComplete;

const loadScript = (url, callback) => {
  let script = document.createElement("script");
  script.type = "text/javascript";

  if (script.readyState) {
    script.onreadystatechange = function() {
      if (script.readyState === "loaded" || script.readyState === "complete") {
        script.onreadystatechange = null;
        callback();
      }
    };
  } else {
    script.onload = () => callback();
  }

  script.src = url;
  document.getElementsByTagName("head")[0].appendChild(script);
};

function handleScriptLoad(updateQuery, updateGeometry,  autoCompleteRef) {
  autoComplete = new window.google.maps.places.Autocomplete(
    autoCompleteRef.current,
    { componentRestrictions: { country: "in" } }
  );
  autoComplete.setFields(["address_components", "formatted_address", "geometry"]);
  autoComplete.addListener("place_changed", () =>
    handlePlaceSelect(updateQuery, updateGeometry)
  );
}

async function handlePlaceSelect(updateQuery, updateGeometry) {
  const addressObject = autoComplete.getPlace();
  const query = addressObject.formatted_address;
  const geometry = addressObject.geometry.location;
  updateQuery(query);
  updateGeometry(geometry);
}

const containerStyle = {
  width: '400px',
  height: '300px'
};


// var options = {
//   enableHighAccuracy: true,
//   timeout: 5000,
//   maximumAge: 0
// };

function App() {
  const [address, updateAddress] = useState('');
  const [geometry, updateGeometry] = useState({});
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_API_KEY,
  })
  const autoCompleteRef = useRef(null);
  const [map, setMap] = useState(null)
  const [lat, updateLat] = useState(0);
  const [lng, updateLng] = useState(180);
  
  // useEffect(() => {
  //   navigator.geolocation.getCurrentPosition((pos) => {updateLng(pos.coords.longitude); updateLng(pos.coords.latitude)}, (err) => console.log('err', err), options);
  // }, []);

  useEffect(() => {
    if(geometry.lat && geometry.lng) {
    updateLat(parseFloat(geometry?.lat?.() || 0));
    updateLng(parseFloat(geometry?.lng?.() || 180));
    }
  }, [geometry])

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_API_KEY}&libraries=places`,
      () => handleScriptLoad(updateAddress, updateGeometry, autoCompleteRef)
    );
  }, []);

  const onLoad = useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map?.fitBounds?.(bounds);
    setMap(map)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <h1>Type an address or copy a link</h1>
        <div>
        <input
          ref={autoCompleteRef}
          type="text"
          value={address}
          onChange={(e) => updateAddress(e.target.value)}
          style={{width: '100%'}}
          placeholder="Enter anything"/>
          <p>Latitude: {lat}</p> 
          <p>Longitude: {lng}</p>
        </div>
        {
          (isLoaded) ? (
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={{
                lat: lat || 0,
                lng: lng || 180,
              }}
              zoom={18}
              onLoad={onLoad}
              onUnmount={onUnmount}
              onCenterChanged={() => {
                if(!!map) {
                  updateLat(map.center.lat());
                  updateLng(map.center.lng());
                }
              }}
            >
              { /* Child components, such as markers, info windows, etc. */ }
              {lat && lng && <Marker position={{ lat, lng }} />}
            </GoogleMap>
        ) : <></>
        }
      </header>
    </div>
  );
}

export default App;
