import { useEffect } from 'react'
import { useMap }from 'react-leaflet'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet-geosearch/dist/geosearch.css';
import './SearchNewMarker.css';

export const SearchNewMarker = ({handlerAddMarker}) => {
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