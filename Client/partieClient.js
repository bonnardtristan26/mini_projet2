const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const channelHeader = document.querySelector(".chat-header");
const usersList = document.getElementById("users-list");
const welcomeZone = document.getElementById("welcome-zone");
const inputZone = document.getElementById("input-zone");
const mpList = document.getElementById("mp-list");

let monPseudo = "";
let monUserId = "";
let canalActuel = "général";
let typeCanal = "public";
let utilisateursEnLigne = new Map();

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

// ═════════════════════════════════════════════════════════════════════════════
// AFFICHAGE DES UTILISATEURS EN LIGNE
// ═════════════════════════════════════════════════════════════════════════════

function afficherUtilisateurs() {
  usersList.innerHTML = "";
  utilisateursEnLigne.forEach((user, userId) => {
    // Ne pas afficher soi-même
    if (userId === monUserId) return;
    
    const userItem = document.createElement("div");
    userItem.classList.add("user-item");
    userItem.id = `user-${userId}`;
    userItem.innerHTML = `
      <div class="user-avatar">
        ${user.pseudo.charAt(0).toUpperCase()}
        <div class="online-badge"></div>
      </div>
      <div class="user-name">${user.pseudo}</div>
    `;
    
    userItem.addEventListener("click", () => {
      ouvrirMessagePrive(user.pseudo, userId);
    });
    
    usersList.appendChild(userItem);
  });
  
  // Mettre à jour le compteur
  document.getElementById("online-count").textContent = utilisateursEnLigne.size - 1;
}

function afficherBienvenue() {
  messagesDiv.style.display = "none";
  inputZone.style.display = "none";
  welcomeZone.style.display = "flex";
}

function afficherChat() {
  messagesDiv.style.display = "flex";
  inputZone.style.display = "flex";
  welcomeZone.style.display = "none";
}

// ═════════════════════════════════════════════════════════════════════════════
// OUVERTURE D'UN MESSAGE PRIVÉ
// ═════════════════════════════════════════════════════════════════════════════

function ouvrirMessagePrive(pseudo, userId) {
  // Vérifier si le MP existe déjà
  const canalMP = `MP_${Math.min(monUserId, userId)}_${Math.max(monUserId, userId)}`;
  
  // Vérifier si un item avec ce pseudo existe déjà
  const existant = mpList.querySelector(`[data-mp-user-id="${userId}"]`);
  
  if (!existant) {
    const mpItem = document.createElement("div");
    mpItem.classList.add("channel-item");
    mpItem.setAttribute("data-channel", canalMP);
    mpItem.setAttribute("data-type", "private");
    mpItem.setAttribute("data-mp-user-id", userId);
    mpItem.innerHTML = `👤 ${pseudo}`;
    mpList.appendChild(mpItem);
    
    mpItem.addEventListener("click", () => {
      changerCanal(canalMP, "private");
    });
  }
  
  // Switcher vers le MP
  changerCanal(canalMP, "private");
}

async function changerCanal(canal, type) {
  canalActuel = canal;
  typeCanal = type;
  
  // Mise à jour du header
  const symbole = type === 'private' ? '👤' : '#';
  
  // Pour les MPs, afficher le pseudo de l'autre personne
  let titre = canal;
  if (type === 'private') {
    // Format du canal: MP_[id1]_[id2]
    const parts = canal.split('_');
    if (parts.length === 3) {
      const id1 = parseInt(parts[1]);
      const id2 = parseInt(parts[2]);
      const otherUserId = id1 === monUserId ? id2 : id1;
      const user = utilisateursEnLigne.get(otherUserId);
      if (user) titre = user.pseudo;
    }
  }
  
  channelHeader.innerHTML = `<span>${symbole}</span> ${titre}`;
  
  // Changement placeholder
  input.placeholder = type === 'private' 
    ? `Envoie un message privé à ${titre}...` 
    : `Écris un message dans #${canal}...`;
  
  // Afficher le chat ou la bienvenue
  if (type === 'public') {
    afficherChat();
  } else {
    afficherChat();
  }
  
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
  
  // Mise à jour visuelle des utilisateurs
  document.querySelectorAll(".user-item").forEach(item => {
    item.classList.remove("active");
    if (type === 'private') {
      const parts = canal.split('_');
      if (parts.length === 3) {
        const id1 = parseInt(parts[1]);
        const id2 = parseInt(parts[2]);
        const otherUserId = id1 === monUserId ? id2 : id1;
        if (item.id === `user-${otherUserId}`) {
          item.classList.add("active");
        }
      }
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
// INITIALISATION DE LA SESSION ET WEBSOCKET
// ═════════════════════════════════════════════════════════════════════════════

// Charger les infos de session
let sessionLoaded = false;
fetch('/verifier-session')
  .then(r => r.json())
  .then(data => { 
    if (data.connecte) {
      monPseudo = data.username;
      monUserId = data.userId;
      sessionLoaded = true;
      
      // Envoyer les infos au serveur si la connection WebSocket est déjà établie
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({
          type: "user_connect",
          userId: monUserId,
          pseudo: monPseudo
        }));
      }
    }
  });

socket.addEventListener("open", () => {
  console.log("Connecté au serveur WebSocket");
  
  // Envoyer les infos de l'utilisateur au serveur
  if (sessionLoaded) {
    socket.send(JSON.stringify({
      type: "user_connect",
      userId: monUserId,
      pseudo: monPseudo
    }));
  }
});

socket.addEventListener("error", () => console.log("Erreur WebSocket !"));

// ═════════════════════════════════════════════════════════════════════════════
// RÉCEPTION DES MESSAGES ET MISE À JOUR DES UTILISATEURS
// ═════════════════════════════════════════════════════════════════════════════

socket.addEventListener("message", (event) => {
  let data;
  try { 
    data = JSON.parse(event.data); 
  } catch { 
    data = { pseudo: "Inconnu", texte: event.data };
  }

  // Si c'est une mise à jour des utilisateurs en ligne
  if (data.type === "online_users") {
    utilisateursEnLigne = new Map();
    data.users.forEach(user => {
      utilisateursEnLigne.set(user.userId, { pseudo: user.pseudo });
    });
    afficherUtilisateurs();
    return;
  }
  
  // Vérifier que c'est un message pour le canal actuel
  if (data.canal !== canalActuel || data.type !== typeCanal) {
    return;
  }

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

// ═════════════════════════════════════════════════════════════════════════════
// ENVOI DE MESSAGES
// ═════════════════════════════════════════════════════════════════════════════

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

// Afficher la bienvenue au chargement
afficherBienvenue();




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