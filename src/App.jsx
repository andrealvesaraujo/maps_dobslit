import React from 'react';

import L from 'leaflet';
import { MapContainer, Popup, Tooltip, TileLayer, Marker } from 'react-leaflet'
import 'leaflet-arrowheads';
import 'leaflet/dist/leaflet.css';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { MdMenu, MdOutlineClose } from 'react-icons/md';
import { AiOutlinePlusCircle, AiOutlineMinusCircle } from "react-icons/ai";

import MyApiService from './services/MyApiService';
import Loading from './components/Loading'
import SearchNewMarker from './components/SearchNewMarker'
import Button from './components/Button';
import {startedMarker, targetMarker, normalMarker} from './utils/markersUtils'
import ArrowPolyLine from './components/ArrowPolyLine';

import './App.scss';

export default class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
        placesMarkerList: [],
        mainPathCoordinates: [],
        polyline: null,
        isLoading: true,
        centerOfMap: [],
        isEditing: false,
        editingMarker: null,
        menuIsOpen: false,
        inputAdressList : [''],
        isLogged: false,
        login: '',
        password: ''
    }
  }
  
  componentDidMount() {
    this.setState({
      ...this.state,
      isLogged: window.sessionStorage.getItem("isLogged"),
    })
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

  toogleMenu = () => {
    this.setState((state)=>({
      ...state,
      menuIsOpen: !state.menuIsOpen
    }))
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
        mainPathCoordinates: [],
        isEditing: false,
        editingMarker: null
      }), ()=>{
          toast.success('Endereço atualizado com sucesso', {
            theme: "colored", 
            autoClose: 2500
          })
      })
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
    }), ()=>{
      toast.success('Endereço adicionado com sucesso', {
        theme: "colored", 
        autoClose: 2500
      })
      this.state.map.setView(newPlaceMarker, this.state.map.getMaxZoom(), false)
    })
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
      document.querySelector('input.glass').value = `${address.country}, ${address.city}, ${address.road}, ${address.house_number}`
      document.querySelector('input.glass').focus()
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
    this.setState((state)=>({
      ...state,
      placesMarkerList: [],
      mainPathCoordinates: [],
    }))
  }

  handleAddressInputChange = (e, index)=>{
    const {inputAdressList} = this.state
    const updatedInputAdressList = [...inputAdressList].map((inputAdress, inputAdressIndex) =>{
        if(inputAdressIndex === index){
          return e.target.value
        }
        return inputAdress
    })
    this.setState((state)=>({
      ...state,
      inputAdressList: updatedInputAdressList
    }))
  }

  addInputAddress = ()=> {
    this.setState((state)=>({
      ...state,
      inputAdressList: [...state.inputAdressList, '']
    }))
  }

  removeInputAddress = (index)=> {
    const {inputAdressList} = this.state
    const updatedInputAdressList = [...inputAdressList].filter((inputAdress, inputAdressIndex) => {
      return inputAdressIndex !== index
    })
    this.setState((state)=>({
      ...state,
      inputAdressList: updatedInputAdressList
    }))
  }

  searchInputAddresses = () => {
    this.setState({
      placesMarkerList: [],
      mainPathCoordinates: [],
    })
    const {inputAdressList} = this.state
    inputAdressList.forEach((inputAddress)=>{
      fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${inputAddress}&addressdetails=1`)
        .then(res => res.json())
        .then(results => {
          if (results[0]) {
            this.addMarker(results[0].lat, results[0].lon, results[0].address)
          }
      });
    })
  }

  handleLoggin = (e)=> {
    e.preventDefault()
    if(!this.state.login || !this.state.password ){
      toast.error("Preencha o login e a senha", {
        theme: "colored", 
        autoClose: 2500
      })
      return
    }
    if(this.state.login === "dobslitmaps" && this.state.password === "dobslitmaps123"){
      this.setState({
        ...this.state,
        isLogged:true,
      })
      window.sessionStorage.setItem("isLogged", true);
      return
    }
    toast.error("Login e Senha incorretos", {
      theme: "colored", 
      autoClose: 2500
    })
  }

  handleOnInputChange = (e) =>{
    this.setState({
       ...this.state,
      [e.target.name] : e.target.value
    })
  }

  render(){
    return (
      <>
        <ToastContainer />
        {this.state.isLogged ? (
          this.state.isLoading 
            ? 
            (
              <Loading />
            )
            : 
            (
              <>
                <div className='main'>
                  <div className={`container-sidebar-menu ${this.state.menuIsOpen ? 'show' : '' }`}>
                    <div className='hamburger-icon' onClick={()=> this.toogleMenu()}>
                      {this.state.menuIsOpen ? (<MdOutlineClose />) : (<MdMenu />)}
                    </div>
                    <div className='container-adresses'>
                      {
                        this.state.inputAdressList.map((inputAddress, index)=>{
                            return (
                              <div className='container-input' key={`key_${index}_input`}>
                                <AiOutlineMinusCircle className={`removeInputAddressIcon ${this.state.inputAdressList.length === 1 ? 'hidden' : ''}`} onClick={()=>this.removeInputAddress(index)}/>
                                <input 
                                  type='text' 
                                  placeholder='Digite o endereço' 
                                  value={inputAddress} 
                                  onChange={(e)=>this.handleAddressInputChange(e, index)}
                                />
                                <AiOutlinePlusCircle className={'addInputAddressIcon'} onClick={()=>this.addInputAddress()}/>
                              </div>
                            )
                        })
                      }
                    </div>
                    <div className='container-buttons'>
                      <Button className="btn-info large" onClick={() => this.searchInputAddresses()}>Buscar Endereços</Button>
                      <Button className="btn-primary large" onClick={() => this.makePolylinePath()}>Criar Caminho</Button>
                      <Button className="btn-error large"  onClick={() => this.clearMap()}>Limpar Mapa</Button>
                    </div>
                  </div>
                  <MapContainer whenCreated={map => this.setState({ map })} center={this.state.centerOfMap} zoom={18}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | <a href="https://dobslit.com/">Dobslit</a>'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <SearchNewMarker handlerAddMarker={this.addMarker} />
                    <ArrowPolyLine polyLine={this.state.polyline} coords={this.state.mainPathCoordinates}/>
                    {this.state.placesMarkerList.map((marker, index, arr) => {
                      return (
                        <Marker key={`key_${index}`} position={marker.position} icon={index === 0 ? startedMarker : (index === arr.length - 1 ? targetMarker : normalMarker)}>
                          <Popup>
                            <div className='container-popup'>
                              <div className='popup-text'>
                                {marker.address.country ? `${marker.address.country} - `  : ' '}
                                {marker.address.city ? `${marker.address.city} - ` : ' '}
                                {marker.address.road ? `${marker.address.road} -  ` : ' '}
                                {marker.address.house_number? `${marker.address.house_number} - ` : ' '}
                                {marker.address.postcode? `${marker.address.postcode}` : ' '}
                              </div>
                              <Button className='btn-info small' onClick={() => this.handleEdit(marker)}>Editar</Button>
                              <Button className='btn-error small' onClick={() => this.handleDelete(index)}>Excluir</Button>

                            </div>                       
                          </Popup>
                          <Tooltip>Ponto {index+1}</Tooltip>
                        </Marker>
                      );
                    })}
                  </MapContainer>
                </div>
              </>
            )      
        ) : (
          <>
            <form method="post" className="container-login">
              <label>Login</label>
              <input type='text' name='login' onChange={(e)=> this.handleOnInputChange(e)} />
              <label>Senha</label>
              <input type='password' name='password' onChange={(e)=> this.handleOnInputChange(e)} />
              <Button className="btn-info" type='button' onClick={(e)=>this.handleLoggin(e)}>Logar</Button>        
            </form>
          </>
        )}        
      </>
    );
  }
}

