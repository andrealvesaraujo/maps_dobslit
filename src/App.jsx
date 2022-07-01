import React from 'react';
import L from 'leaflet';
import { 
  MapContainer, Polyline,
  Popup, Tooltip, TileLayer, 
  Marker, useMap
} from 'react-leaflet'

import { ToastContainer, toast } from 'react-toastify';
import MyApiService from './services/MyApiService';
import Spinner from './components/Spinner'
import {SearchNewMarker} from './components/SearchNewMarker'
import {startedMarker, targetMarker, normalMarker} from './utils/markersUtils'
import 'leaflet-arrowheads';

import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import './App.css';

function ArrowPolyLine({polyLine, coords}) {
  const map = useMap()
  if (!polyLine) return null
  coords.length > 0 ? polyLine.arrowheads({frequency: 'endonly', size: '20px'}).addTo(map) : polyLine.arrowheads().remove()
  return null
}

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        placesMarkerList: [],
        mainPathCoordinates: [],
        polyline: null,
        isLoading: true,
        centerOfMap: [],
        mainPathOptions: { color: 'black' },
        isEditing: false,
        editingMarker: 0
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

  addMarker = (pointLat, pointLng, address) => {
      let newPlaceMarker = [pointLat, pointLng]
      const hasMarkerInList = this.state.placesMarkerList.some((marker)=>{
        return marker.position[0] === newPlaceMarker[0] && marker.position[1] === newPlaceMarker[1]
      })
      
      if(hasMarkerInList){
        toast.error("Esse endereço já foi adicionado", {
          theme: "colored", 
          autoClose: 2500
        })
        return
      }

      if(this.state.isEditing){
        const editedPlacesMarkerList = [...this.state.placesMarkerList].map((marker) => {
          if(marker === this.state.editingMarker){
              const editedMarker = {
                  ...marker,
                  position: newPlaceMarker,
                  address,
              }
              return editedMarker
          }
          return marker
        })
        this.setState((state)=> ({
          ...state,
          placesMarkerList: editedPlacesMarkerList,
          mainPathCoordinates: []
        }))
        return
      }

      this.setState((state)=> ({
        ...state,
        placesMarkerList: [
          ...state.placesMarkerList,
          {
            position: newPlaceMarker,
            address
          },
        ],
        mainPathCoordinates: []
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
            mainPathCoordinates: markerPath,
            polyline: L.polyline(markerPath, {color: 'black'})
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

  handleEdit = (marker)=>{
      const address = marker.address;
      document.querySelector('input').value = `${address.country}, ${address.city}, ${address.road}, ${address.house_number}`
      document.querySelector('input').focus()
      this.setState((state) => ({
        ...state,
        isEditing: true,
        editingMarker: marker
      }))
  }

  handleDelete = (markerIndex)=>{
      const filteredPlacesMarkerList = this.state.placesMarkerList.filter((marker, idx)=> idx !== markerIndex )
      this.setState((state)=>({
        ...state,
        placesMarkerList: filteredPlacesMarkerList,
        mainPathCoordinates: []
      }), ()=>{
          toast.success('Endereço apagado com sucesso', {
            theme: "colored", 
            autoClose: 2500
          })
      })
  }

  clearMap = ()=> {
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
                {/* <Polyline pathOptions={this.state.mainPathOptions} positions={this.state.mainPathCoordinates} /> */}
                <ArrowPolyLine polyLine={this.state.polyline} coords={this.state.mainPathCoordinates}/>
                {this.state.placesMarkerList.map((marker, index, arr) => {
                  return (
                    <Marker key={`key_${index}`} position={marker.position} icon={index === 0 ? startedMarker : (index === arr.length - 1 ? targetMarker : normalMarker)}>
                      <Popup>
                        <div className='result-popup-container'>
                          <div className='result-popup-adress-text'>
                            {marker.address.country ? `${marker.address.country} - `  : ' '}
                            {marker.address.city ? `${marker.address.city} - ` : ' '}
                            {marker.address.road ? `${marker.address.road} -  ` : ' '}
                            {marker.address.house_number? `${marker.address.house_number} - ` : ' '}
                            {marker.address.postcode? `${marker.address.postcode}` : ' '}
                          </div>
                          <button className='btn-edit' onClick={() => this.handleEdit(marker)}>Editar</button>
                          <button className='btn-delete' onClick={() => this.handleDelete(index)}>Excluir</button>
                        </div>                       
                      </Popup>
                      <Tooltip>Ponto {index+1}</Tooltip>
                    </Marker>
                  );
                })}
              </MapContainer>
              <button className="primary" onClick={() => this.makePolylinePath()}>Criar Caminho</button>
              <button className="clearMap" onClick={() => this.clearMap()}>Limpar Mapa</button>
            </>
          )
        }
      </>
    );
  }
}

