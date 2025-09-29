const socket = io();

const joinForm = document.getElementById("join-form");
const usernameInput = document.getElementById("username");

const username = localStorage.getItem("username");

if (username) {
    window.location.href = "game.html";
}

joinForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const username = usernameInput.value.trim();
    
    if (username) {
        localStorage.setItem("username", username);
        window.location.href = "game.html";
    }
});