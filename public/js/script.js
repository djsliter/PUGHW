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

async function deleteEntry(ele) {
    // Store/populate object representing a Blog entry
    let data = {}
    data.title = ele.getElementsByClassName("title")[0].innerText;
    data.author = ele.getElementsByClassName("author")[0].innerText;
    // Log entry to see format is correct
    console.log(data);
    // Use FETCH to pass object along with DELETE request to the server (index.js)
    const response = await fetch(`http://localhost:3000/web/delete/${data.title}/${data.author}`, {method: 'DELETE'});
    
    if(response) {
        // Change content of deleted blog post
        ele.innerHTML = "<p>Blog post deleted...</p>";
    }
    
    // Server recieves delete request to specified URL, parses into object, then attempts to delete from DB
}

getGeo()