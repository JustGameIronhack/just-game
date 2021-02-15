
function initMap() {
    const mapContainer = document.getElementById('map');

    if (mapContainer) {
        window.gameMap = new GameMap(mapContainer);
        window.gameMap.centerOnBrowser();
        window.gameMap.fetchGames();
    };
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

        navigator.geolocation.getCurrentPosition( (position) => {
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
            position: { lat, lng },
            map: this.map
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
            <div style="width: 10rem">
            <img style="max-width: 150px", src="${game.image}"/>
            <p>Title: ${game.title}</p>
            <p>Price: ${game.price}€</p>
            <p><em>Seller: ${game.user.name}</em></p>
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

