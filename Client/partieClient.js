//Création du socket sur l'IP de la machine
const socket = new WebSocket("ws://10.16.25.4:3000"); //IP à changer selon l'ordinateur sur lequel on lance.

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

socket.addEventListener("open", () => {
  console.log("Connecté au serveur WebSocket");
});

socket.addEventListener("error", () => {
  console.log("Erreur WebSocket !");
});

socket.addEventListener("message", (event) => {
  const msg = document.createElement("div");
  msg.classList.add("message-bubble");
  msg.textContent = event.data;
  messagesDiv.appendChild(msg);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

sendBtn.addEventListener("click", () => {
  if (input.value.trim() !== "") {
    socket.send(input.value);
    input.value = "";
  }
});

input.addEventListener("keypress", (e) => {
  if (e.key === "Enter") sendBtn.click();
});



//partie mdp

// ─── Fonction : hacher une chaîne en SHA-256 (Web Crypto API, natif au navigateur) ───
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray  = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── INSCRIPTION ───────────────────────────────────────────────────────────────────
async function senduser() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const email    = document.getElementById('email').value.trim();

    if (!username || !password) {
        alert("Remplis tous les champs !");
        return;
    }

    // 1. On hache le mot de passe côté client AVANT de l'envoyer
    const hashedPassword = await sha256(password);

    // 2. On envoie au serveur PHP (le mdp en clair ne circule jamais)
    try {
        const response = await fetch('/inscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: hashedPassword, email })
        });

        const data = await response.json();

        if (data.success) {
            alert("Compte créé ! Tu peux te connecter.");
            window.location.href = "login.html"; // redirige vers la page de connexion
        } else {
            alert("Erreur : " + data.message);
        }
    } catch (err) {
        alert("Impossible de joindre le serveur.");
        console.error(err);
    }
}

// ─── CONNEXION ─────────────────────────────────────────────────────────────────────
async function login() {
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const email    = document.getElementById('email').value.trim();

    if (!username || !password || !email) {
        alert("Remplis tous les champs !");
        return;
    }

    // 1. Même hachage SHA-256 côté client
    const hashedPassword = await sha256(password);

    // 2. Envoi au serveur
    try {
        const response = await fetch('/connexion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password: hashedPassword, email }) 
        });

        const data = await response.json();

        if (data.success) {
            alert("Connecté ! Bienvenue " + data.username);
            window.location.href = "chat_general.html";
        } else {
            alert("Erreur : " + data.message);
        }
    } catch (err) {
        alert("Impossible de joindre le serveur.");
        console.error(err);
    }
}