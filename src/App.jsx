import React from 'react';
import { 
  MapContainer, Polyline,
  Popup, Tooltip, TileLayer, 
  Marker
} from 'react-leaflet'

import { ToastContainer, toast } from 'react-toastify';
import MyApiService from './services/MyApiService';
import Spinner from './components/Spinner'
import {SearchNewMarker} from './components/SearchNewMarker'
import {startedMarker, targetMarker, normalMarker} from './utils/markersUtils'

import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import './App.css';

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
                    <Marker key={`key_${index}`} position={marker.position} icon={index === 0 ? startedMarker : (index === arr.length - 1 ? targetMarker : normalMarker)}>
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

