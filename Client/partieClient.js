const estPageChat = !!document.getElementById("messages");

if (estPageChat) {

const socket = new WebSocket(`ws://${window.location.hostname}:3000`);

const messagesDiv = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const channelHeader = document.querySelector(".chat-header");
const usersList = document.getElementById("users-list");
const welcomeZone = document.getElementById("welcome-zone");
const inputZone = document.getElementById("input-zone");
const mpList = document.getElementById("mp-list");
const serversIcons = document.getElementById("servers-icons");
const channelsList = document.getElementById("channels-list");
const sidebarHeader = document.getElementById("sidebar-header");
const centerSidebar = document.getElementById("center-sidebar");
const logo = document.getElementById('logo_la_discorde');
const musique = document.getElementById('musique-easter-egg');

let monPseudo = "";
let monUserId = "";
let canalActuel = null;
let typeCanal = null;
let utilisateursEnLigne = new Map();
let serveurActuel = null;

// Structure des serveurs avec leurs salons
const serveurs = [
  {
    id: 1,
    nom: "Gaming",
    image: "/Ressource/Image/logo_LaDiscorde.png",
    salons: [
      { id: 1, nom: "general", emoji: "💬" },
      { id: 2, nom: "fps", emoji: "🎯" },
      { id: 3, nom: "rpg", emoji: "⚔️" }
    ]
  },
  {
    id: 2,
    nom: "Art & Créativité",
    image: "/Ressource/Image/logo_LaDiscorde.png",
    salons: [
      { id: 1, nom: "galerie", emoji: "🖼️" },
      { id: 2, nom: "critique", emoji: "💭" },
      { id: 3, nom: "partage", emoji: "📸" }
    ]
  },
  {
    id: 3,
    nom: "Musique",
    image: "/Ressource/Image/logo_LaDiscorde.png",
    salons: [
      { id: 1, nom: "recommandations", emoji: "🎧" },
      { id: 2, nom: "playlists", emoji: "📻" },
      { id: 3, nom: "discussions", emoji: "💬" }
    ]
  }
];

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

    // Avatar : utiliser l'URL reçue du serveur
    let avatarSrc = user.avatar || "/Ressource/Image/logo_LaDiscorde.png";

    const userItem = document.createElement("div");
    userItem.classList.add("user-item");
    userItem.id = `user-${userId}`;
    userItem.innerHTML = `
      <div class="user-avatar">
        <img src="${avatarSrc}" alt="avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
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
// AFFICHAGE DES SERVEURS
// ═════════════════════════════════════════════════════════════════════════════

function afficherServeurs() {
  serversIcons.innerHTML = "";
  
  // Bouton pour retourner aux MP
  const mpButton = document.createElement("div");
  mpButton.classList.add("server-icon", "mp-icon", "active");
  mpButton.setAttribute("title", "Messages privés");
  
  const mpImg = document.createElement("img");
  mpImg.src = "/Ressource/Image/logo_LaDiscorde.png";
  mpImg.alt = "Messages privés";
  mpButton.appendChild(mpImg);
  
  mpButton.addEventListener("click", () => {
    afficherMessagePrives();
  });
  
  serversIcons.appendChild(mpButton);
  
  // Ajouter une ligne de séparation
  const separator = document.createElement("div");
  separator.style.height = "1px";
  separator.style.background = "rgba(200,0,0,0.2)";
  separator.style.margin = "10px 0";
  serversIcons.appendChild(separator);
  
  serveurs.forEach(serveur => {
    const serverIcon = document.createElement("div");
    serverIcon.classList.add("server-icon");
    serverIcon.setAttribute("data-server-id", serveur.id);
    serverIcon.setAttribute("title", serveur.nom);
    
    // Vérifier si c'est une URL d'image ou un emoji
    if (serveur.image.startsWith("/") || serveur.image.startsWith("http")) {
      // C'est une image
      const img = document.createElement("img");
      img.src = serveur.image;
      img.alt = serveur.nom;
      serverIcon.appendChild(img);
    } else {
      // C'est un emoji
      serverIcon.innerHTML = serveur.image;
    }
    
    serverIcon.addEventListener("click", () => {
      selectionnerServeur(serveur.id);
    });
    
    serversIcons.appendChild(serverIcon);
  });
}

function selectionnerServeur(serveurId) {
  serveurActuel = serveurId;
  const serveur = serveurs.find(s => s.id === serveurId);
  
  // Mise à jour visuelle des serveurs
  document.querySelectorAll(".server-icon").forEach(icon => {
    icon.classList.remove("active");
    if (parseInt(icon.dataset.serverId) === serveurId) {
      icon.classList.add("active");
    }
  });
  
  // Afficher les salons du serveur et cacher les MP
  afficherSalons(serveur.salons, serveur.nom);
}

function afficherSalons(salons, nomServeur) {
  // Masquer les MP
  mpList.style.display = "none";
  
  // Afficher les salons
  channelsList.style.display = "flex";
  channelsList.innerHTML = "";
  
  // Mettre à jour le header
  sidebarHeader.innerHTML = nomServeur;
  
  salons.forEach(salon => {
    const salonItem = document.createElement("div");
    salonItem.classList.add("salon-item");
    salonItem.setAttribute("data-salon-id", salon.id);
    salonItem.setAttribute("data-salon-nom", salon.nom);
    salonItem.innerHTML = `<span>${salon.emoji}</span> ${salon.nom}`;
    
    salonItem.addEventListener("click", () => {
      selectionnerSalon(salon, serveurActuel);
    });
    
    channelsList.appendChild(salonItem);
  });
}

function afficherMessagePrives() {
  serveurActuel = null;
  
  // Masquer les salons
  channelsList.style.display = "none";
  channelsList.innerHTML = "";
  
  // Afficher les MP
  mpList.style.display = "flex";
  mpList.style.flexDirection = "column";
  
  // Mettre à jour le header
  sidebarHeader.innerHTML = "Messages privés";
  
  // Mise à jour visuelle des serveurs
  document.querySelectorAll(".server-icon").forEach(icon => {
    icon.classList.remove("active");
    if (icon.classList.contains("mp-icon")) {
      icon.classList.add("active");
    }
  });
}

function selectionnerSalon(salon, serveurId) {
  const serveur = serveurs.find(s => s.id === serveurId);
  const nomCanal = `${serveur.nom}_${salon.nom}`;
  
  changerCanal(nomCanal, "public", `${salon.emoji} ${salon.nom}`);
  
  // Mise à jour visuelle des salons
  document.querySelectorAll(".salon-item").forEach(item => {
    item.classList.remove("active");
    if (parseInt(item.dataset.salonId) === salon.id) {
      item.classList.add("active");
    }
  });
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
    mpItem.innerHTML = `<img src="/Ressource/Image/logo_LaDiscorde.png" alt="MP" class="mp-logo"> ${pseudo}`;
    mpList.appendChild(mpItem);

    mpItem.addEventListener("click", () => {
      changerCanal(canalMP, "private");
    });
  }
  
  // Switcher vers le MP
  changerCanal(canalMP, "private");
}

async function changerCanal(canal, type, titrePersonnalise = null) {
  canalActuel = canal;
  typeCanal = type;
  
  // Mise à jour du header
  const symbole = type === 'private' ? '👤' : '#';
  
  // Pour les MPs, afficher le pseudo de l'autre personne
  let titre = titrePersonnalise || canal;
  if (type === 'private' && !titrePersonnalise) {
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
    : `Écris un message dans ${titrePersonnalise || '#' + canal}...`;
  
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
      utilisateursEnLigne.set(user.userId, { pseudo: user.pseudo, avatar: user.avatar });
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

// Afficher la bienvenue et les serveurs au chargement
afficherBienvenue();
afficherServeurs();
afficherMessagePrives();

// Initialiser l'état du channelsList
channelsList.style.display = "none";

// PARAMÈTRES PROFIL (modal)
const btnSettings = document.getElementById("btn-settings");
const modalSettings = document.getElementById("modal-settings");
const closeSettings = document.getElementById("close-settings");
const avatarChoices = document.querySelectorAll(".avatar-choice");
const avatarDiv = document.querySelector(".sidebar-footer .avatar");
const avatarUpload = document.getElementById("avatar-upload");
const importedAvatarPreview = document.getElementById("imported-avatar-preview");
const userDescription = document.getElementById("user-description");

btnSettings.addEventListener("click", () => {
  modalSettings.style.display = "flex";
  // Charger description si déjà enregistrée
  userDescription.value = localStorage.getItem("userDescription") || "";
});
closeSettings.addEventListener("click", () => {
  modalSettings.style.display = "none";
  localStorage.setItem("userDescription", userDescription.value);
});
window.addEventListener("click", (e) => {
  if (e.target === modalSettings) {
    modalSettings.style.display = "none";
    localStorage.setItem("userDescription", userDescription.value);
  }
});
userDescription.addEventListener("input", () => {
  localStorage.setItem("userDescription", userDescription.value);
});
avatarChoices.forEach(img => {
  img.addEventListener("click", async () => {
    avatarChoices.forEach(i => i.classList.remove("selected"));
    img.classList.add("selected");
    // Envoi au serveur même pour un avatar de base
    try {
      const res = await fetch("/upload-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: monUserId, baseAvatar: img.dataset.avatar })
      });
      const data = await res.json();
      if (data.success && data.url) {
        avatarDiv.innerHTML = `<img src='${data.url}' alt='Avatar' style='width:32px;height:32px;border-radius:50%;object-fit:cover;'>`;
        localStorage.setItem("userAvatar", data.url);
      } else {
        alert("Erreur lors du choix de l'avatar");
      }
    } catch (err) {
      alert("Erreur lors du choix de l'avatar");
    }
    modalSettings.style.display = "none";
  });
});
// Import d'image personnalisée (synchronisation serveur)
avatarUpload.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async function(ev) {
    importedAvatarPreview.src = ev.target.result;
    importedAvatarPreview.style.display = "inline-block";
    importedAvatarPreview.classList.add("selected");
    avatarChoices.forEach(i => i.classList.remove("selected"));
    // Envoi au serveur
    try {
      const res = await fetch("/upload-avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: monUserId, imageBase64: ev.target.result })
      });
      const data = await res.json();
      if (data.success && data.url) {
        avatarDiv.innerHTML = `<img src='${data.url}' alt='Avatar' style='width:32px;height:32px;border-radius:50%;object-fit:cover;'>`;
        // Optionnel : stocker l'URL pour affichage local immédiat
        localStorage.setItem("userAvatar", data.url);
      } else {
        alert("Erreur lors de l'upload de l'avatar");
      }
    } catch (err) {
      alert("Erreur lors de l'upload de l'avatar");
    }
    modalSettings.style.display = "none";
  };
  reader.readAsDataURL(file);
});
// Affichage avatar/description au chargement
window.addEventListener("DOMContentLoaded", () => {
  const savedAvatar = localStorage.getItem("userAvatar");
  if (savedAvatar) {
    avatarDiv.innerHTML = `<img src='${savedAvatar}' alt='Avatar' style='width:32px;height:32px;border-radius:50%;object-fit:cover;'>`;
  }
  const savedDesc = localStorage.getItem("userDescription");
  if (savedDesc) userDescription.value = savedDesc;
});

} //fin du if(estPageChat)


//partie mdp

// ─── Fonction : hacher une chaîne en SHA-256 (Web Crypto API, natif au navigateur) ───
async function sha256(message) {
    // Compatible HTTP et HTTPS
    if (window.crypto && window.crypto.subtle) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray  = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } else {
        // Fallback si crypto.subtle non disponible (HTTP)
        let hash = 5381;
        const str = message + "laDiscordeSalt2024xZ9";
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
            hash = hash & hash;
        }
        let hex = Math.abs(hash).toString(16);
        while (hex.length < 64) hex = (hex + hex + hex).substring(0, 64);
        return hex.substring(0, 64);
    }
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

// ─── EASTER EGG ─────────────────────────────────────────────────────────────────────
logo.addEventListener('click', () => {
  if (musique.paused) {
    // Si la musique est en pause, on commence à la jouer dès que le logo est cliqué
    musique.play();
  } else {
    // Sinon, on la met en pause
    musique.pause();
    musique.currentTime = 0; 
  }
});
