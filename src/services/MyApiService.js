import { TEST_API } from "./config"

export default class MyApiService {

    static getMarkerPath = async () => {
        const result = await fetch(
            `${TEST_API}/apig-demo-06-04-2022/Path.json`,
          )
        const data = await result.json()
        return data
    }

    static updateMarkerPath = async (positionsList) => {
        const result = await fetch(
            `${TEST_API}/apig-demo-06-04-2022/Path.json`, 
            {
                method: 'PUT', 
                body: JSON.stringify(positionsList),
                headers: {'Content-Type': 'application/json'}
            }
        )
        return result
    }
}