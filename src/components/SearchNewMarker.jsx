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
      searchLabel: 'Digite o novo endereço',
      maxSuggestions: 3,
      autoComplete: true,
      autoClose: true,
      keepResult: false,
      notFoundMessage: 'Desculpe, esse endereço não foi encontrado',
      resultFormat: ({ result }) => {
        return result.label
      }, 
      provider: provider,
      style: 'bar',
    });
  
    searchControl.onSubmit = (query) => {
      if(query.data){
        handlerAddMarker(query.data.raw.lat, query.data.raw.lon, query.data.raw.address)
        return searchControl.showResult(query.data)
      }else{
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query.query}&addressdetails=1`)
          .then(res => res.json())
          .then(json => {
            return provider.parse({data: json[0] || []})
          })
          .then((results) => {
            if (results && results.length > 0) {
              handlerAddMarker(results[0].raw.lat, results[0].raw.lon, results[0].raw.address)
              searchControl.showResult(results[0], query);
            }
        });
      }
      
    };

    const map = useMap();
  
    useEffect(() => {
      map.addControl(searchControl);
      return () => map.removeControl(searchControl);
    }, []);
  
    return null;
  };