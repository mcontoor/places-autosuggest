import './App.css';
import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';

let autoComplete;

const libs = ['visualization', 'places'];

function handleScriptLoad(updateQuery, updateGeometry, autoCompleteRef) {
  setTimeout(() => {
    autoComplete = new window.google.maps.places.Autocomplete(
      autoCompleteRef.current,
      { componentRestrictions: { country: "in" } }
    );
    autoComplete.setFields(["address_components", "formatted_address", "name", "geometry"]);
    autoComplete.addListener("place_changed", () =>
      handlePlaceSelect(updateQuery, updateGeometry)
    );
  }, 1000)
}

async function handlePlaceSelect(updateQuery, updateGeometry) {
  const addressObject = autoComplete?.getPlace?.();
  const query = addressObject?.formatted_address;
  const geometry = addressObject?.geometry?.location;
  const name = addressObject?.name;
  updateQuery(`${name}, ${query}`);
  if (geometry) {
    updateGeometry(geometry);
  }
}

const containerStyle = {
  maxWidth: '400px',
  width: '100%',
  height: '300px'
};

function App() {
  const [address, updateAddress] = useState('');
  const [geometry, updateGeometry] = useState({});
  const autoCompleteRef = useRef(null);
  const [map, setMap] = useState(null)
  const [lat, updateLat] = useState(0);
  const [lng, updateLng] = useState(180);

  useEffect(() => {
    if(geometry.lat && geometry.lng) {
    updateLat(parseFloat(geometry?.lat?.() || 0));
    updateLng(parseFloat(geometry?.lng?.() || 180));
    }
  }, [geometry])

  const onLoad = useCallback(function callback(mapo) {
    const bounds = new window.google.maps.LatLngBounds();
    mapo?.fitBounds?.(bounds);
    setMap(mapo)
  }, [])

  const onUnmount = useCallback(function callback(map) {
    setMap(null)
  }, [])

  const success = (position) => {
    const latitude  = position.coords.latitude;
    const longitude = position.coords.longitude;
    updateLng(longitude);
    updateLat(latitude);
  }
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(success, (err) => console.log(err));
  }, [])

  return (
    <div className="App">
      <header className="App-header">
      <LoadScript
      id={'asdknla-32kjeqdouASDK'}
      googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}
      language={'en-US'}
      region='EN'
      version='weekly'
      onLoad={() => handleScriptLoad(updateAddress, updateGeometry, autoCompleteRef)}
      onError={(e) => console.log(e)}
      loadingElement={<h1>Loading...</h1>}
      libraries={libs}
      preventGoogleFontsLoading
    >
        <h1>Type an address or copy a link</h1>
        <div>
        <input
          ref={autoCompleteRef}
          type="text"
          value={address}
          onChange={(e) => updateAddress(e.target.value)}
          style={{width: '100%'}}
          placeholder="Enter anything"
          onKeyPress={(e) => {
            if(e.code === 'Enter') {
              e.preventDefault();
              return false
            }
          }}
          />
          <p>Latitude: {lat}</p> 
          <p>Longitude: {lng}</p>
        </div>
            <GoogleMap
              id="map"
              mapContainerStyle={containerStyle}
              clickableIcons={false}
              center={{
                lat: lat || 0,
                lng: lng || 180,
              }}
              zoom={18}
              onLoad={(map) => {
                onLoad(map)
              }}
              onUnmount={onUnmount}
              onCenterChanged={() => {
                if(!!map) {
                  updateLat(map.center.lat());
                  updateLng(map.center.lng());
                }
              }}
              options={{
                mapTypeControlOptions: {
                  mapTypeIds: ["ROADMAP"]
                },
                mapTypeControl: false,
                zoom: 18,
                fullScreenControl: false,
                gestureHandling: 'greedy',
              }}
            >
              <Marker 
                position={{ lat, lng }} 
                draggable onDragEnd={(e) => {
                  const lat = e.latLng.lat();
                  const lng = e.latLng.lng();
                  updateLat(lat);
                  updateLng(lng);
                }
              }/>
            </GoogleMap>
        </LoadScript>
      </header>
    </div>
  );
}

export default App;
