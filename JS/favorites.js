const IMAGE_URL = "https://image.tmdb.org/t/p/w500"
const container = document.getElementById("favoriteMovies")
function loadFavorites(){
    const favorites = JSON.parse(localStorage.getItem("loqo_favorites")) || []
    container.innerHTML = ""
    if(favorites.length === 0){
        container.innerHTML = '<p class="empty-message">You have no favorite movies yet.</p>'
        return
    }
    favorites.forEach(movie => {
        const card = document.createElement("div")
        card.className = "movie-card"
        const poster = movie.poster_path
            ? IMAGE_URL + movie.poster_path
            : "https://via.placeholder.com/273x405/191919/ffffff?text=No+Image"
        card.innerHTML = `
            <img src="${poster}" alt="${movie.title}">
            <div class="movie-info">
                <h3>${movie.title}</h3>
            </div>
        `
        card.onclick = () => {
            window.location.href = `movie.html?id=${movie.id}`
        }
        container.appendChild(card)
    })
}
function goHome(){
    window.location.href = "index.html"
}
function goToSignOut(){
    window.location.href = "signinandup.html"
}
loadFavorites()