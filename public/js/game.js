const socket = io();
const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "index.html";
}

socket.emit("joinGame", { username });

socket.on("roomJoined", ({ roomId }) => {
  document.getElementById(
    "status"
  ).innerText = `You joined ${roomId}. Waiting for another player...`;
});

socket.on("roomFull", ({ players }) => {
  document.getElementById(
    "status"
  ).innerText = `Room ready! Players: ${players.join(" vs ")}`;
});

socket.on("roomLeft", () => {
  document.getElementById(
    "status"
  ).innerText = `The other player left the game. Waiting for another player...`;
});

const buttons = document.querySelectorAll("#choices button");
let selected;

buttons.forEach((btn) => {
  btn.addEventListener("click", () => {
    buttons.forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selected = btn.dataset.choice;

    socket.emit("makeChoice", { choice: selected });
  });
});

socket.on("gameResult", ({ p1, p2 }) => {
    const player = p1.id === socket.id ? p1 : p2;
    const opponent = p1.id === socket.id ? p2 : p1;

    const choiceMap = {
        1: "Rock",
        0: "Paper",
        3: "Scissors"
    };

    const diff = (player.choice - opponent.choice);

    if (diff === 0) {
        document.getElementById("status").innerHTML = `It's a <b>tie</b>! You both chose ${choiceMap[player.choice]}. <br> Select another hand to play again.`;
    } else if (diff > 0 && diff !== 2 || diff === -2) {
        document.getElementById("status").innerHTML = `You <b>lose</b>! You chose <b>${choiceMap[player.choice]}</b> and ${opponent.username} chose <b>${choiceMap[opponent.choice]}</b>. <br><br> Select another hand to play again.`;
    } else {
        document.getElementById("status").innerHTML = `You <b>lose</b>! You chose <b>${choiceMap[player.choice]}</b> and ${opponent.username} chose <b>${choiceMap[opponent.choice]}</b>. <br><br> Select another hand to play again.`;
    }
});
