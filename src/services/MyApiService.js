const TEST_API = "https://jh8nd3cgxb.execute-api.us-east-2.amazonaws.com/Beta"
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
                headers: {
                    'Content-Type': 'application/json',
                }
            }
        )
        return result
    }
}