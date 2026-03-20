const socket = new WebSocket("ws://localhost:8080");

// Initialiser le chat
function initChat() {
    // 👉 Cette fonction est le point de départ de ton application

    // Quand la page se lance, tu dois préparer ton chat :
    // - connecter l’utilisateur au serveur
    // - activer les boutons (ex : bouton envoyer)

    // 💡 Réflexe à avoir :
    // toujours centraliser le démarrage ici pour garder un code organisé
    socket.addEventListener("open", () => {
        console.log("Connecté au serveur WebSocket");
        socket.send("Bonjour serveur !");
    });
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