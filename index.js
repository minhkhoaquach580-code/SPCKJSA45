const API_KEY = "ee7c6528a0989bb2eaac4b10da50bf86"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_URL = "https://image.tmdb.org/t/p/w500"
const BACKDROP_URL = "https://image.tmdb.org/t/p/original"
const STORAGE_KEYS = { 
    trending: "loqo_trending", popular: "loqo_popular", topRated: "loqo_topRated", upcoming: "loqo_upcoming", search: "loqo_search", selectedMovie: "loqo_selectedMovie", heroMovie: "loqo_heroMovie" 
};
const trendingContainer = document.getElementById("trendingMovies"); 
const popularContainer = document.getElementById("popularMovies"); 
const topRatedContainer = document.getElementById("topRatedMovies"); 
const upcomingContainer = document.getElementById("upcomingMovies");
async function fetchMovies(endpoint) {
    try {
        const separator = endpoint.includes("?") ? "&" : "?";
        const response = await fetch(`${BASE_URL}${endpoint}${separator}api_key=${API_KEY}`);
        if (!response.ok) {
            throw new Error(`TMDB Error: ${response.status}`);
        }
        const data = await response.json();
        return data.results || [];
    } catch (error) {
        console.error("Failed to fetch movies:", error);
        return [];
    }
}
async function loadTrending() { 
    const movies = 
        await fetchMovies( 
            "/trending/movie/week?language=en-US" 
        ); 
        if (movies.length > 0) { 
            localStorage.setItem( 
                STORAGE_KEYS.trending, 
                JSON.stringify(movies) 
            ); 
            renderMovies( 
                movies, 
                trendingContainer 
            ); 
        } 
        else { 
            loadCachedMovies( 
                STORAGE_KEYS.trending, 
                trendingContainer 
            ); 
        } 
    }
async function loadPopular() {
    const movies = 
        await fetchMovies( 
            "/movie/popular?language=en-US&page=1" 
        ); 
        if (movies.length > 0) { 
            localStorage.setItem( 
                STORAGE_KEYS.popular, 
                JSON.stringify(movies) 
            ); 
            renderMovies( 
                movies, 
                popularContainer 
            ); 
        } 
        else { 
            loadCachedMovies( 
                STORAGE_KEYS.popular, 
                popularContainer 
            ); 
        } 
    }
async function loadTopRated() {
    const movies =
        await fetchMovies(
            "/movie/top_rated?language=en-US&page=1"
        );
    if (movies.length > 0) {
        localStorage.setItem(
            STORAGE_KEYS.topRated,
            JSON.stringify(movies)
        );
        renderMovies(
            movies,
            topRatedContainer
        );
    }
    else {
        loadCachedMovies(
            STORAGE_KEYS.topRated,
            topRatedContainer
        );
    }
}
async function loadUpcoming() {
    const movies =
        await fetchMovies(
            "/movie/upcoming?language=en-US&page=1"
        )
    if (movies.length > 0) {
        localStorage.setItem(
            STORAGE_KEYS.upcoming,
            JSON.stringify(movies)
        );
        renderMovies(
            movies,
            upcomingContainer
        );
    }
    else {
        loadCachedMovies(
            STORAGE_KEYS.upcoming,
            upcomingContainer
        );
    }
}
function loadCachedMovies(key,container) {
    const cached =
        localStorage.getItem(key)
    if (!cached) {
        container.innerHTML = `
            <p class="no-movies">
                No movies available
            </p>
        `;
        return;
    }
    try {
        const movies = 
            JSON.parse(cached);
        renderMovies(
            movies,
            container
        );
    }
    catch (error) {
        console.error(
            "LocalStorage error:",
            error
        );
    }
}
function renderMovies(movies,container) {
    container.innerHTML = "";
    movies.forEach(movie => {
        const card =
            createMovieCard(movie);
        container.appendChild(card)
    });
}
function createMovieCard(movie) {
    const card = document.createElement("div");
    card.className = "movie-card";
    const poster = movie.poster_path
        ? IMAGE_URL + movie.poster_path
        : "https://via.placeholder.com/273x405/191919/ffffff?text=No+Image";
    const title = movie.title || "Unknown Movie";
    card.innerHTML = `
        <img src="${poster}" alt="${title}" loading="lazy">
        <div class="movie-info">
            <h3>${title}</h3>
        </div>
    `;
    card.addEventListener("click", () => {
    selectMovie(movie);
    window.location.href = `movie.html?id=${movie.id}`;
    });
    return card;
}
function selectMovie(movie) {
    localStorage.setItem(
        STORAGE_KEYS.selectedMovie,
        JSON.stringify(movie)
    );
    updateHero(movie);
}
function updateHero(movie) {
    const heroTitle = document.getElementById("heroTitle");
    const heroDescription = document.getElementById("heroDescription");
    const heroPoster = document.getElementById("heroPoster");
    if (!movie) {
        return;
    }
    heroTitle.textContent = movie.title || "Unknown Movie";
    heroDescription.textContent = movie.overview || "No description available";
    if (movie.poster_path) {
        heroPoster.src = IMAGE_URL + movie.poster_path;
    }
    if (movie.backdrop_path) {
        document.getElementById("hero").style.backgroundImage = `url("${BACKDROP_URL}${movie.backdrop_path}")`;
    }
    localStorage.setItem(
        STORAGE_KEYS.heroMovie,
        JSON.stringify(movie)
    );
}
function loadSavedHero() {
    const saved = localStorage.getItem(
        STORAGE_KEYS.heroMovie
    );
    if (!saved) {
        return;
    }
    try {
        const movie = JSON.parse(saved);
        updateHero(movie);
    }
    catch (error) {
        console.error(
            "Hero localStorage error:",
            error
        );
    }
}
async function searchMovies() {
    const input = document.getElementById("searchInput").value.trim();
    localStorage.setItem(
        STORAGE_KEYS.search,
        input
    );
    if (input === "") {
        loadAllSections();
        return;
    }
    try {
        const movies = await fetchMovies( `/search/movie?query=${encodeURIComponent(input)}&language=en-US&page=1` );
        displaySearchResults(movies);
    }
    catch (error) {
        console.error(
            "Search error:",
            error
        );
    }     
}
function displaySearchResults(movies) {
    const container = trendingContainer;
    container.innerHTML = "";
    if (movies.length === 0) {
        container.innerHTML = `
            <p class="no-movies">
                No results found.
            </p>
        `;
        return;
    }
    movies.forEach(movie => {
        container.appendChild(createMovieCard(movie));
    });
    document.querySelectorAll(".movie-section").forEach(section => {
        if (section.id !== "trending") {
            section.style.display = "none";
        }
    });
    document.querySelector("#trending h2").textContent = "Search Results";
}
function openSearch() {
    const search = document.getElementById("searchContainer");
    search.classList.add("active");
    const input = document.getElementById("searchInput");
    input.focus();
    const savedSearch = localStorage.getItem(STORAGE_KEYS.search);
    if (savedSearch) {
        input.value = savedSearch;
    }
}
function closeSearch() {
    const search = document.getElementById("searchContainer");
    search.classList.remove("active");
    document.getElementById("searchInput").value = "";
    localStorage.removeItem(STORAGE_KEYS.search);
    loadAllSections();
}
function loadAllSections() {
    document.querySelectorAll(".movie-section").forEach(section => {
        section.style.display = "block";
    });
    document.querySelector("#trending h2").textContent = "Trending Movies";
    loadCachedMovies(STORAGE_KEYS.trending, trendingContainer);
    loadCachedMovies(STORAGE_KEYS.popular, popularContainer);
    loadCachedMovies(STORAGE_KEYS.topRated, topRatedContainer);
    loadCachedMovies(STORAGE_KEYS.upcoming, upcomingContainer);
}
function scrollMovies( elementId, direction ) {
    const container = document.getElementById(elementId);
    container.scrollBy({left: direction * 700, behavior: "smooth"});
}
function watchMovie() {
    const movie = localStorage.getItem(STORAGE_KEYS.selectedMovie);
    if (!movie) {
        alert("No movie selected.");
        return;
    }
    const selectedMovie = JSON.parse(movie);
    window.location.href = `movie.html?id=${selectedMovie.id}`;
}

function movieInfo() {
    const movie = localStorage.getItem(STORAGE_KEYS.selectedMovie);
    if (!movie) {
        alert("No movie selected.");
        return;
    }
    const selectedMovie = JSON.parse(movie);
    window.location.href = `movie.html?id=${selectedMovie.id}`;
}
function goToSignIn() {window.location.href = "signinandup.html";}
function openChatbot() {alert("Chatbot opened!");}
async function initializePage() {
    console.log( "LOQO Cinema loading..." );
    await Promise.all([
        loadTrending(),
        loadPopular(),
        loadTopRated(),
        loadUpcoming()
    ]);
    loadSavedHero();
    const savedSearch = localStorage.getItem(STORAGE_KEYS.search);
    if (savedSearch) {
        document.getElementById("searchInput").value = savedSearch;
    }
    console.log("LOQO Cinema loaded.");
}
function goHome() {
    window.location.href = "index.html";
}
document.addEventListener("DOMContentLoaded", initializePage);