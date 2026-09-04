const API_KEY = "ee7c6528a0989bb2eaac4b10da50bf86"
const BASE_URL = "https://api.themoviedb.org/3"
const IMAGE_URL = "https://image.tmdb.org/t/p/w500"
const BACKDROP_URL = "https://image.tmdb.org/t/p/original"
const movieId = new URLSearchParams(window.location.search).get("id")
const movieHero = document.getElementById("movieHero")
const moviePoster = document.getElementById("moviePoster")
const movieTitle = document.getElementById("movieTitle")
const movieYear = document.getElementById("movieYear")
const movieRuntime = document.getElementById("movieRuntime")
const movieRating = document.getElementById("movieRating")
const movieGenres = document.getElementById("movieGenres")
const movieOverview = document.getElementById("movieOverview")
const movieVideo = document.getElementById("movieVideo")
const videoSource = document.getElementById("videoSource")
const videoMessage = document.getElementById("videoMessage")
async function getMovie() {
    if (!movieId) {
        movieTitle.textContent = "Movie Not Found"
        movieOverview.textContent = "No movie ID was provided."
        return
    }
    try {
        const response = await fetch(
            `${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&language=en-US`
        )
        if (!response.ok) {
            throw new Error(`TMDB Error: ${response.status}`)
        }
        const movie = await response.json()
        displayMovie(movie)
        getMovieAge(movie.id)
        setupVideo(movie.id)
        localStorage.setItem(
            "loqo_selectedMovie",
            JSON.stringify(movie)
        )
    } catch (error) {
        console.error("Movie error:", error)
        movieTitle.textContent = "Unable to Load Movie"
        movieOverview.textContent = "Something went wrong while loading this movie."
    }
}
function displayMovie(movie) {
    movieTitle.textContent = movie.title || "Unknown Movie"
    movieOverview.textContent =
        movie.overview || "No description available."
    if (movie.poster_path) {
        moviePoster.src = IMAGE_URL + movie.poster_path
    } else {
        moviePoster.src =
            "https://via.placeholder.com/320x470/191919/ffffff?text=No+Image"
    }
    if (movie.backdrop_path) {
        movieHero.style.backgroundImage =
            `url("${BACKDROP_URL}${movie.backdrop_path}")`
    }
    if (movie.release_date) {
        movieYear.textContent =
            new Date(movie.release_date).getFullYear()
    } else {
        movieYear.textContent = "Unknown"
    }
    if (movie.runtime) {
        movieRuntime.textContent =
            `${movie.runtime} min`
    } else {
        movieRuntime.textContent = "Unknown"
    }
    if (movie.vote_average) {
        movieRating.textContent =
            `⭐ ${movie.vote_average.toFixed(1)}`
    } else {
        movieRating.textContent = "⭐ --"
    }
    movieGenres.innerHTML = ""
    if (movie.genres && movie.genres.length > 0) {
        movie.genres.forEach(genre => {
            const span = document.createElement("span")
            span.className = "genre"
            span.textContent = genre.name
            movieGenres.appendChild(span)
        })
    }
    document.title = `${movie.title} - LOQO Cinema`
}
async function getMovieAge(id) {
    const ageElement = document.getElementById("movieAge")
    try {
        const response = await fetch(`${BASE_URL}/movie/${id}/release_dates?api_key=${API_KEY}`)
        if (!response.ok) throw new Error("Failed to get release dates")
        const data = await response.json()
        const countries = data.results || []
        const preferredCountries = ["US", "GB", "AU", "CA", "DE", "FR", "JP", "KR"]
        for (const countryCode of preferredCountries) {
            const country = countries.find(item => item.iso_3166_1 === countryCode)
            if (!country) continue
            const certification = country.release_dates
                ?.map(release => release.certification?.trim())
                .find(cert => cert)
            const age = convertToAge(certification)
            if (age) {
                ageElement.textContent = age
                return
            }
        }
        ageElement.textContent = "NR"
    } catch (error) {
        console.error("Age rating error:", error)
        ageElement.textContent = "NR"
    }
}
function convertToAge(certification) {
    if (!certification) return null
    const rating = certification.toUpperCase().trim()
    if (rating === "G") return "P"
    if (rating === "PG") return "K"
    if (rating === "PG-13") return "T13"
    if (rating === "R") return "T18"
    if (rating === "NC-17") return "T18"
    if (rating === "U") return "P"
    if (rating === "12" || rating === "12A") return "T13"
    if (rating === "15") return "T16"
    if (rating === "18") return "T18"
    if (rating === "E" || rating === "G") return "P"
    if (rating === "PG") return "K"
    if (rating === "M") return "T13"
    if (rating === "MA15+") return "T16"
    if (rating === "R18+") return "T18"
    if (rating === "G") return "P"
    if (rating === "PG12") return "T13"
    if (rating === "R15+") return "T16"
    if (rating === "R18+") return "T18"
    if (rating === "ALL") return "P"
    if (rating === "12") return "T13"
    if (rating === "15") return "T16"
    if (rating === "18") return "T18"
    return null
}
function setupVideo(id) {
    videoSource.src = `movies/${id}.mp4`
    movieVideo.load()
    movieVideo.addEventListener("error", () => {
        videoMessage.textContent =
            "This movie video is not available yet."
        videoMessage.style.display = "block"
    })
}
function watchMovie() {
    const videoSection =
        document.getElementById("videoSection")
    videoSection.scrollIntoView({
        behavior: "smooth"
    })
    setTimeout(() => {
        movieVideo.play().catch(() => {})
    }, 500)
}
function goHome() {
    window.location.href = "index.html"
}
function goToSignIn() {
    window.location.href = "signinandup.html"
}
getMovie()
