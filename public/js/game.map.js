function initMap() {
    const mapContainer = document.getElementById('map');
    const geocode = document.getElementById('autocomplete');
    if (mapContainer) {
        window.gameMap = new GameMap(mapContainer);
        window.gameMap.centerOnBrowser();
        window.gameMap.fetchGames();
    }
    if (geocode) {
        function initialize() {
            const autocomplete = new google.maps.places.Autocomplete(geocode, {
                types: ['geocode'],
                componentRestrictions: {'country' : ['ES', 'DE']},
                fields: ['place_id', 'geometry', 'name']
            });
              google.maps.event.addListener(autocomplete, 'place_changed', function () {
                  const place = autocomplete.getPlace();
                  document.getElementById('latitude').value = place.geometry.location.lat();
                  document.getElementById('longitude').value = place.geometry.location.lng();
              });
        }
        google.maps.event.addDomListener(window, 'load', initialize);
    }
    
}
class GameMap {
    constructor(container) {
        const center = {
            lat: 40.2085,
            lng: -3.7130
        };

        this.markers = [];

        this.map = new google.maps.Map(container, {
            zoom: 6,
            center
        });
    }

    centerOnBrowser() {
        if (!navigator.geolocation) return

        navigator.geolocation.getCurrentPosition((position) => {
            const center = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            this.map.setCenter(center)
        });
    }

    addGame(game) {
        const [lat, lng] = game.location.coordinates
        const gameMarker = new google.maps.Marker({
            position: {
                lat,
                lng
            },
            map: this.map
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
            <div style="width: 10rem">
            <img style="max-width: 10rem", src="${game.image}"/>
            <p><b>Title:</b> ${game.title}</p>
            <p><b>Price:</b> ${game.price}€</p>
            <p><b>Seller:</b> <em><a href="/game/${game._id}/message">${game.user.name}</a></em></p>
            </div>`
        });

        gameMarker.addListener('click', function () {
            infoWindow.open(this.map, gameMarker);
        });

        this.markers.push(gameMarker)
    }

    fetchGames() {
        axios.get('/games/locations')
            .then(response => {
                const games = response.data;
                console.log(games)
                games.forEach(game => {
                    this.addGame(game)
                })
            })
            .catch(err => console.error(err))
    }
}


