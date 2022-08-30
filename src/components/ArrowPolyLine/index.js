import { useMap } from "react-leaflet"

export default function ArrowPolyLine({polyLine, coords}) {
    const map = useMap()
    if (!polyLine) return null
    coords.length > 0 ? polyLine.arrowheads({frequency: 'endonly', size: '20px'}).addTo(map) : polyLine.arrowheads().remove()
    return null
}