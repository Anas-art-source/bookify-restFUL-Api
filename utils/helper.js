

exports.transformedLocation = (locationObj) => {
    console.log(locationObj, "<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>>")
    const [lat, lng] = locationObj.coordinates;
    const locationTransformedObj = {
        ...locationObj,
        coordinates: [lng, lat]
    }

    return locationTransformedObj
}