const loc = document.getElementById('userLoc');

function getGeo() {
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateLoc);
    } else {
        loc.innerHTML= "Can't grab location data..."
    }
}

function updateLoc(position) {
    loc.innerHTML = "Latitude: " + position.coords.latitude + 
                    ", Longitude: " + position.coords.longitude;
}

function deleteEntry() {
    console.log("Deleting")
    // Use fetch to delete from DB
}

getGeo()