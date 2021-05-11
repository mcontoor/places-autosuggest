import './App.css';
import { useState, useRef, useEffect } from 'react';

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
  console.log(autoComplete)
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
  console.log(addressObject)
}

function App() {
  const [address, updateAddress] = useState('');
  const [geometry, updateGeometry] = useState({});
  const autoCompleteRef = useRef(null);

  useEffect(() => {
    loadScript(
      `https://maps.googleapis.com/maps/api/js?key=AIzaSyBs7I26Y6yTv8p602DeTFBXlhs_ClmKv2k&libraries=places`,
      () => handleScriptLoad(updateAddress, updateGeometry, autoCompleteRef)
    );
  }, []);

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
          <p>Latitude: {geometry?.lat?.()}</p> 
          <p>Longitude: {geometry?.lng?.()}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
