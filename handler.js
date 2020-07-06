'use strict';

const axios = require('axios');

const possibleProfiles = {
    walking: "walking",
    cycling: "cycling",
    driving: "driving"
}

/**
 * Calculate the distance between 2 coordinates through the mapbox API
 * 
 * More info on the API options can be found [here](https://docs.mapbox.com/api/navigation/#directions)
 * 
 * @param {string} accessToken mapbox API token
 * @param {'walking' | 'driving' | 'cycling'} profile the way of travel
 * @param {string} coordinateA format: lon,lat
 * @param {string} coordinateB format: lon,lat
 * 
 * @returns {Promise} Promise object that represents the shortest distance between the 2 given coordinates in meters, and duration in seconds, or an error response with an errorcode and a message property
 * 
 */
const calcDistance = (accessToken, profile, coordinateA, coordinateB) => {
    if (!possibleProfiles[profile]) {
        return Promise.reject({ errorCode: 1, message: `Wrong profile, use one of these: (${Object.values(possibleProfiles)})` })
    }
    if (!accessToken) {
        return Promise.reject({ errorCode: 2, message: "Missing accessToken" })
    }
    if (!coordinateA || !coordinateB) {
        return Promise.reject({ errorCode: 3, message: "Missing coordinates" })
    }
    if (
        coordinateA.split(";").length !== 1 // should not contain ;
        || coordinateB.split(";").length !== 1 // should not contain ;
        || coordinateA.split(",").length !== 2 // must contain ,
        || coordinateB.split(",").length !== 2 // must contain ,
    ) {
        return Promise.reject({ errorCode: 4, message: "Wrong coordinates" })
    }

    const mapboxApiURL = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${coordinateA};${coordinateB}?access_token=${accessToken}`
    return axios.get(mapboxApiURL)
        .then(response => {
            //console.log(response.data)
            if (response.data && (!response.data.routes || !response.data.routes.length)) {
                return { errorCode: 5, message: "No route found" }
            }
            const routes = response.data.routes[0]
            return {
                distance: routes.distance, // metres
                duration: routes.duration, // seconds
            }
        })
        .catch(error => {
            //console.error(error)
            return { errorCode: 6, message: "mapbox API error: " + error }
        })
}


module.exports.calcDistance = async event => {

    const body = JSON.parse(event.body);

    return await Promise.all(

        body.data.map((row) => calcDistance(process.env.MAPBOX_ACCESS_TOKEN, row[1], row[2], row[3]))

    ).then((ret) => {

        return {
            statusCode: 200,
            body: JSON.stringify(
                {
                    data: ret.map((v, idx) => [idx, v])
                },
                null,
                2
            ),
        }
    }).catch(error => { 
        return {
            statusCode: 500,
            body: JSON.stringify(error)
        }
    })

};
