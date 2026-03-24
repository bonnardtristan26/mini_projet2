
// Initialiser le chat
function initChat() {
    // 👉 Cette fonction est le point de départ de ton application

    // Quand la page se lance, tu dois préparer ton chat :
    // - connecter l’utilisateur au serveur
    // - activer les boutons (ex : bouton envoyer)

    // 💡 Réflexe à avoir :
    // toujours centraliser le démarrage ici pour garder un code organisé
    //test
}


// Se connecter au serveur
function connectToServer() {
    // 👉 Ici tu mets en place la communication avec le serveur

    // Un chat fonctionne en temps réel → tu dois utiliser WebSocket
    // C’est une connexion ouverte en continu (contrairement à HTTP)

    // Tu dois penser à 4 situations importantes :
    // 1. La connexion réussit → tu peux envoyer/recevoir
    // 2. Tu reçois un message → tu dois le traiter
    // 3. Il y a une erreur → tu dois éviter que tout casse
    // 4. La connexion se ferme → tu peux prévenir l’utilisateur

    // 💡 Réflexe à avoir :
    // toujours gérer ces cas sinon ton appli sera instable
}


// Envoyer un message
function sendMessage() {
    // 👉 Cette fonction représente une action utilisateur

    // Quand quelqu’un écrit un message :
    // - tu récupères ce qu’il a tapé
    // - tu vérifies que ce n’est pas vide (très important)

    // Ensuite tu dois structurer les données :
    // Pourquoi ? → parce qu’il y a plusieurs utilisateurs

    // Exemple de réflexion :
    // “le serveur doit comprendre qui parle et quoi”
    // donc tu envoies :
    // - un type (message)
    // - un utilisateur (pseudo)
    // - un contenu (texte)

    // 💡 Réflexe à avoir :
    // toujours envoyer des données claires et organisées (souvent en JSON)
}


// Recevoir un message
function receiveMessage() {
    // 👉 Ici tu gères tout ce qui vient du serveur

    // Important :
    // ce que tu reçois est souvent du texte (JSON)
    // → tu dois le transformer en objet utilisable

    // Ensuite tu dois analyser :
    // “quel type de message j’ai reçu ?”

    // Pourquoi ?
    // Parce qu’un chat ne contient pas que des messages :
    // - message → afficher dans le chat
    // - join → quelqu’un arrive
    // - leave → quelqu’un part

    // 💡 Réflexe à avoir :
    // toujours traiter les données selon leur type
}


// Afficher un message
function displayMessage() {
    // 👉 Cette fonction gère uniquement l’affichage (très important)

    // Bonne pratique :
    // séparer la logique (réseau) de l’affichage (interface)

    // Ici tu dois :
    // - créer un élément visuel
    // - afficher le pseudo + message
    // - l’ajouter dans la zone de chat

    // 💡 Réflexe à avoir :
    // une fonction = un rôle précis
    // ici → uniquement afficher, rien d’autre

    // Option bonus :
    // améliorer l’expérience utilisateur :
    // - scroll automatique
    // - couleurs différentes selon l’utilisateur
}


// Se déconnecter
function disconnect() {
    // 👉 Cette fonction gère la sortie propre du chat

    // Pourquoi c’est important ?
    // Parce qu’un chat est multi-utilisateur

    // Si tu pars sans prévenir :
    // les autres ne savent pas que tu es parti

    // Donc tu dois :
    // - informer le serveur (type: leave)
    // - fermer la connexion

    // 💡 Réflexe à avoir :
    // toujours “nettoyer” une connexion avant de quitter
}


//Création du socket sur l'IP de la machine
const socket = new WebSocket("ws://10.16.26.17:3000"); //IP à changer selon l'ordinateur sur lequel on lance.

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
            body: JSON.stringify({ username, password: hashedPassword })
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
            body: JSON.stringify({ username, password: hashedPassword })
        });

        const data = await response.json();

        if (data.success) {
            alert("Connecté ! Bienvenue " + data.username);
            window.location.href = "chat_general.html";
        } else {
            alert("Identifiants incorrects.");
        }
    } catch (err) {
        alert("Impossible de joindre le serveur.");
        console.error(err);
    }
}