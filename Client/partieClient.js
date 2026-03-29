const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const channelHeader = document.querySelector(".chat-header");

let monPseudo = "";
let monUserId = "";
let canalActuel = "général";
let typeCanal = "public";

// ═════════════════════════════════════════════════════════════════════════════
// HISTORIQUE DES MESSAGES (Base de données)
// ═════════════════════════════════════════════════════════════════════════════

async function chargerHistorique(canal, type) {
  try {
    const response = await fetch(`/historique/${canal}/${type}`);
    const data = await response.json();
    
    if (data.success) {
      return data.messages;
    } else {
      console.error("Erreur chargement historique :", data.message);
      return [];
    }
  } catch (err) {
    console.error("Erreur requête historique :", err);
    return [];
  }
}

function afficherMessages(messages) {
  messagesDiv.innerHTML = "";
  
  messages.forEach(msg => {
    const estMoi = msg.pseudo === monPseudo;
    const div = document.createElement("div");
    div.classList.add("message-row");
    div.classList.add(estMoi ? "moi" : "autre");

    div.innerHTML = `
      <div class="msg-pseudo">${msg.pseudo}</div>
      <div class="msg-bubble">${msg.texte}</div>`;

    messagesDiv.appendChild(div);
  });
  
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function changerCanal(canal, type) {
  canalActuel = canal;
  typeCanal = type;
  
  // Mise à jour du header
  const symbole = type === 'private' ? '👤' : '#';
  channelHeader.innerHTML = `<span>${symbole}</span> ${canal}`;
  
  // Changement placeholder
  input.placeholder = type === 'private' 
    ? `Envoie un message privé à ${canal}...` 
    : `Écris un message dans #${canal}...`;
  
  // Charger l'historique depuis la BDD
  const messages = await chargerHistorique(canal, type);
  afficherMessages(messages);
  
  // Mise à jour visuelle des canaux
  document.querySelectorAll(".channel-item").forEach(item => {
    item.classList.remove("active");
    if (item.dataset.channel === canal && item.dataset.type === type) {
      item.classList.add("active");
    }
  });
}

// ═════════════════════════════════════════════════════════════════════════════
// ÉVÉNEMENTS DES CANAUX
// ═════════════════════════════════════════════════════════════════════════════

document.querySelectorAll(".channel-item").forEach(item => {
  item.addEventListener("click", () => {
    const canal = item.dataset.channel;
    const type = item.dataset.type;
    changerCanal(canal, type);
  });
});

// ═════════════════════════════════════════════════════════════════════════════

// Charger les infos de session
fetch('/verifier-session')
  .then(r => r.json())
  .then(data => { 
    if (data.connecte) {
      monPseudo = data.username;
      monUserId = data.userId;
    }
  });

socket.addEventListener("open", () => console.log("Connecté au serveur WebSocket"));
socket.addEventListener("error", () => console.log("Erreur WebSocket !"));

// Pour les box de texte
socket.addEventListener("message", (event) => {
  let data;
  try { data = JSON.parse(event.data); }
  catch { data = { pseudo: "Inconnu", texte: event.data }; }

  const estMoi = data.pseudo === monPseudo;
  const div = document.createElement("div");
  div.classList.add("message-row");
  div.classList.add(estMoi ? "moi" : "autre");

  div.innerHTML = `
    <div class="msg-pseudo">${data.pseudo}</div>
    <div class="msg-bubble">${data.texte}</div>`;

  messagesDiv.appendChild(div);
  messagesDiv.scrollTop = messagesDiv.scrollHeight;
});

sendBtn.addEventListener("click", () => {
  if (input.value.trim() !== "") {
    const message = {
      pseudo: monPseudo,
      userId: monUserId,
      texte: input.value.trim(),
      canal: canalActuel,
      type: typeCanal
    };
    
    socket.send(JSON.stringify(message));
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

    if (!username || !password) {
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
            body: JSON.stringify({ username, password: hashedPassword}) 
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