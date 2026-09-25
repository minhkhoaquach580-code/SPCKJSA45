const PROFILE_KEY = "loqo_profile";
const FAVORITES_KEY = "loqo_favorites";
const WATCHED_KEY = "loqo_watched";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const profileName = document.getElementById("profileName");
const profileEmail = document.getElementById("profileEmail");
const profileAvatar = document.getElementById("profileAvatar");
const favoriteMovies = document.getElementById("favoriteMovies");
const watchedMovies = document.getElementById("watchedMovies");
const userComments = document.getElementById("userComments");
const favoriteCount = document.getElementById("favoriteCount");
const watchedCount = document.getElementById("watchedCount");
const commentCount = document.getElementById("commentCount");
function getProfile() {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
        try {
            return JSON.parse(savedProfile);
        } catch (error) {
            console.error("Profile error:", error);
        }
    }
    return {
        name: "LOQO User",
        email: "user@example.com",
        avatar: ""
    };
}
function saveProfileData(profile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
function loadProfile() {
    const profile = getProfile();
    profileName.textContent = profile.name;
    profileEmail.textContent = profile.email;
    if (profile.avatar) {
        profileAvatar.innerHTML = `<img src="${escapeHTML(profile.avatar)}" alt="Profile picture">`;
    } else {
        profileAvatar.innerHTML = `<i class="fa-solid fa-user"></i>`;
    }
}
function getFavorites() {
    const saved = localStorage.getItem(FAVORITES_KEY);
    if (!saved) return [];
    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error("Favorites error:", error);
        return [];
    }
}
function getWatched() {
    const saved = localStorage.getItem(WATCHED_KEY);
    if (!saved) return [];
    try {
        return JSON.parse(saved);
    } catch (error) {
        console.error("Watched movies error:", error);
        return [];
    }
}
function displayMovies(movies, container, type) {
    container.innerHTML = "";
    if (movies.length === 0) {
        container.innerHTML = `
            <div class="empty-message">
                No movies here yet.
            </div>
        `;
        return;
    }
    movies.forEach(movie => {
        const card = document.createElement("div");
        card.className = "movie-card";
        const poster = movie.poster_path
            ? IMAGE_URL + movie.poster_path
            : "https://via.placeholder.com/300x450/191919/ffffff?text=No+Image";
        card.innerHTML = `
            <img src="${poster}" alt="${escapeHTML(movie.title || "Movie")}">
            <div class="movie-info">
                <h3>${escapeHTML(movie.title || "Unknown Movie")}</h3>
                ${
                    type === "favorite"
                    ? `
                        <button class="remove-favorite"
                            onclick="removeFavorite(event, ${movie.id})">
                            <i class="fa-solid fa-trash"></i>
                            Remove
                        </button>
                    `
                    : ""
                }
            </div>
        `;
        card.addEventListener("click", () => {
            window.location.href = `movie.html?id=${movie.id}`;
        });
        container.appendChild(card);
    });
}
function loadFavorites() {
    const favorites = getFavorites();
    favoriteCount.textContent = favorites.length;
    displayMovies(
        favorites,
        favoriteMovies,
        "favorite"
    );
}
function loadWatched() {
    const watched = getWatched();
    watchedCount.textContent = watched.length;
    displayMovies(
        watched,
        watchedMovies,
        "watched"
    );
}
function removeFavorite(event, movieId) {
    event.stopPropagation();
    let favorites = getFavorites();
    favorites = favorites.filter(movie => movie.id !== movieId);
    localStorage.setItem(
        FAVORITES_KEY,
        JSON.stringify(favorites)
    );
    loadFavorites();
}
function loadComments() {
    const profile = getProfile();
    const comments = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith("loqo_comments_")) {
            continue;
        }
        try {
            const movieComments = JSON.parse(
                localStorage.getItem(key)
            );
            if (!Array.isArray(movieComments)) {
                continue;
            }
            movieComments.forEach(comment => {
                if (
                    comment.name &&
                    profile.name &&
                    comment.name.toLowerCase() ===
                    profile.name.toLowerCase()
                ) {
                    const movieId = key.replace(
                        "loqo_comments_",
                        ""
                    );
                    comments.push({
                        ...comment,
                        movieId: movieId
                    });
                }
            });
        } catch (error) {
            console.error("Comment error:", error);
        }
    }
    commentCount.textContent = comments.length;
    userComments.innerHTML = "";
    if (comments.length === 0) {
        userComments.innerHTML = `
            <div class="empty-message">
                You haven't posted any comments yet.
            </div>
        `;
        return;
    }
    comments.forEach(comment => {
        const element = document.createElement("div");
        element.className = "comment-card";
        element.innerHTML = `
            <h3>
                <i class="fa-solid fa-film"></i>
                Movie ID: ${escapeHTML(comment.movieId)}
            </h3>
            <p>${escapeHTML(comment.text)}</p>
            <small>${escapeHTML(comment.date)}</small>
        `;
        element.addEventListener("click", () => {
            window.location.href =
                `movie.html?id=${comment.movieId}`;
        });
        element.style.cursor = "pointer";
        userComments.appendChild(element);
    });
}
function openEditProfile() {
    const profile = getProfile();
    document.getElementById("editName").value =
        profile.name || "";
    document.getElementById("editEmail").value =
        profile.email || "";
    document.getElementById("editAvatar").value =
        profile.avatar || "";
    document
        .getElementById("editProfileModal")
        .classList.add("active");
}
function closeEditProfile() {
    document
        .getElementById("editProfileModal")
        .classList.remove("active");
}
function saveProfile() {
    const name =
        document.getElementById("editName").value.trim();
    const email =
        document.getElementById("editEmail").value.trim();
    const avatar =
        document.getElementById("editAvatar").value.trim();
    if (name === "") {
        alert("Please enter a username.");
        return;
    }
    if (email === "") {
        alert("Please enter an email.");
        return;
    }
    const oldProfile = getProfile();
    const profile = {
        name: name,
        email: email,
        avatar: avatar
    };
    saveProfileData(profile);
    updateCommentNames(oldProfile.name, name);
    loadProfile();
    loadComments();
    closeEditProfile();
}
function updateCommentNames(oldName, newName) {
    if (!oldName || oldName === newName) {
        return;
    }
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || !key.startsWith("loqo_comments_")) {
            continue;
        }
        try {
            const comments = JSON.parse(
                localStorage.getItem(key)
            );
            if (!Array.isArray(comments)) {
                continue;
            }
            let changed = false;
            comments.forEach(comment => {
                if (
                    comment.name &&
                    comment.name.toLowerCase() ===
                    oldName.toLowerCase()
                ) {
                    comment.name = newName;
                    changed = true;
                }
            });
            if (changed) {
                localStorage.setItem(
                    key,
                    JSON.stringify(comments)
                );
            }
        } catch (error) {
            console.error("Comment update error:", error);
        }
    }
}
function signOut() {
    const confirmSignOut =
        confirm("Are you sure you want to sign out?");
    if (!confirmSignOut) {
        return;
    }
    localStorage.removeItem(PROFILE_KEY);
    window.location.href = "signinandup.html";
}
function goHome() {
    window.location.href = "index.html";
}
function escapeHTML(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
}
function initializeProfile() {
    loadProfile();
    loadFavorites();
    loadWatched();
    loadComments();
}
function goToProfile() {
    window.location.href = "profile.html";
}
document.addEventListener(
    "DOMContentLoaded",
    initializeProfile
);