import React, {useEffect} from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Polyline,
  Popup,
  Tooltip,
  TileLayer,
  Marker,
  useMap,
} from 'react-leaflet'
import { ToastContainer, toast } from 'react-toastify';
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import MyApiService from './services/MyApiService';

import 'leaflet-geosearch/dist/geosearch.css';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import './App.css';

import Spinner from './components/Spinner'

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const sharedMarkerProps = {
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  tooltipAnchor: [16, -28],
}

const startedMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  ...sharedMarkerProps,
});

const targetMarker = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  ...sharedMarkerProps,
});

const SearchNewMarker = ({handlerAddMarker}) => {
  const provider = new OpenStreetMapProvider (
    {
      params: {
        addressdetails: 1,
      },
    }
  );

  // @ts-ignore
  const searchControl = new GeoSearchControl({
    searchLabel: 'New Address',
    maxSuggestions: 3,
    autoComplete: true,
    autoClose: true,
    keepResult: false,
    notFoundMessage: 'Sorry, that address could not be found.',
    resultFormat: ({ result }) => {
      return result.label
    }, 
    provider: provider,
    style: 'bar',
  });

  searchControl.onSubmit = (query) => {
    if(query.data){
      return searchControl.showResult(query.data)
    }else{
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query.query}&addressdetails=1`)
        .then(res => res.json())
        .then(json => {
          return provider.parse({data: json[0]})
        })
        .then((results) => {
          if (results && results.length > 0) {
            searchControl.showResult(results[0], query);
          }
      });
    }
    
  };
  
  const map = useMap();

  map.on('geosearch/showlocation', ((searchResult)=> {
    const valueLatitude = Number(searchResult.location.raw.lat)
    const valueLongitude = Number(searchResult.location.raw.lon)
    const address = searchResult.location.raw.address
    if(valueLatitude && valueLongitude){
      handlerAddMarker(valueLatitude, valueLongitude, address)
    }
  }));

  useEffect(() => {
    map.addControl(searchControl);
    return () => map.removeControl(searchControl);
  }, []);

  return null;
};

const center = [-22.8066667, -43.2105167]
const mainPathLineOptions = { color: 'black' }

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        placesMarkerList: [],
        mainPolyline: [],
        isLoading: true,
        centerOfMap: []
    }
  }
  
  componentDidMount() {
    navigator.geolocation.getCurrentPosition((position) => {
        this.setState((state) => ({
          ...state,
          centerOfMap: [position.coords.latitude, position.coords.longitude]
        }), () => {
          this.setState((state) => ({
            ...state,
            isLoading: false
          }));
        });
    }, (error)=>{
      console.error("Error Code = " + error.code + " - " + error.message);
    }, {
      timeout:10000
    });    
  }  

  addMarker = (pointLat,pointLng, address) => {
      let newPlaceMarker = [pointLat,pointLng]
      const hasMarkerInList = this.state.placesMarkerList.some((marker)=>{
        return marker.position[0] === newPlaceMarker[0] && marker.position[1] === newPlaceMarker[1]
      })
      
      if(hasMarkerInList){
        return
      }
      this.setState((state)=> ({
        placesMarkerList: [
          ...state.placesMarkerList,
          {
            position: newPlaceMarker,
            address
          }
        ],
      }))
  }
  
  makePolylinePath = async ()=>{
    const {placesMarkerList} = this.state
    if(placesMarkerList && placesMarkerList.length >= 2){
      const positionsPlacesMarkerList = [...placesMarkerList.map(marker=> marker.position)]

      const markerPathResponse = await MyApiService.updateMarkerPath(positionsPlacesMarkerList)
      
      if(markerPathResponse.status === 200) {
        const markerPath = await MyApiService.getMarkerPath()
        this.setState(()=>({
            mainPolyline: markerPath
        }))
      }else{
        toast.error("Não foi possivel adicionar os endereços", 
          {
            theme: "colored", 
            autoClose: 2500
          }
        )
      }
      return
    }
    toast.error("Erro: Precisa escolher pelo menos 2 endereços", 
      {
        theme: "colored", 
        autoClose: 2500
      }
    )
  }

  resetMap = ()=> {
    document.location.reload(true);
  }

  render(){
    return (
      <>
        { this.state.isLoading 
          ? 
          (
            <Spinner />
          )
          : 
          (
            <>
              <ToastContainer />
              <MapContainer center={this.state.centerOfMap} zoom={18}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://dobslit.com/">Dobslit</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <SearchNewMarker handlerAddMarker={this.addMarker} />
                <Polyline pathOptions={mainPathLineOptions} positions={this.state.mainPolyline} />
                {this.state.placesMarkerList.map((marker, index, arr) => {
                  return (
                    <Marker key={`key_${index}`} position={marker.position} icon={index === 0 ? startedMarker : (index === arr.length - 1 ? targetMarker : new L.Icon.Default())}>
                      <Popup>
                        {marker.address.country ? `${marker.address.country} - `  : ' '}
                        {marker.address.city ? `${marker.address.city} - ` : ' '}
                        {marker.address.road ? `${marker.address.road} -  ` : ' '}
                        {marker.address.house_number? `${marker.address.house_number} - ` : ' '}
                        {marker.address.postcode? `${marker.address.postcode}` : ' '}
                      </Popup>
                      <Tooltip>Tooltip of Marker</Tooltip>
                    </Marker>
                  );
                })}
              </MapContainer>
              <button className="primary" onClick={() => this.makePolylinePath()}>Make Path</button>
              <button className="resetMap" onClick={() => this.resetMap()}>Reset Map</button>
            </>
          )
        }
      </>
    );
  }
}

