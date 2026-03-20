// Démarrer le serveur
function startServer() {
    // 👉 Cette fonction lance ton serveur de chat

    // C’est ici que tu :
    // - crées ton serveur (Node.js par exemple)
    // - actives WebSocket
    // - choisis un port (ex : 3000)

    // 💡 Réflexe à avoir :
    // le serveur est le “centre” du chat
    // tous les utilisateurs passent par lui

    // Sans serveur → pas de communication entre utilisateurs
}


// Gérer une nouvelle connexion
function handleConnection() {
    // 👉 Cette fonction est appelée quand un utilisateur se connecte

    // À ce moment-là, tu dois :
    // - ajouter l’utilisateur à une liste (clients connectés)
    // - préparer la réception de ses messages

    // Tu peux aussi :
    // - lui donner un identifiant
    // - prévenir les autres qu’un utilisateur a rejoint

    // 💡 Réflexe à avoir :
    // toujours garder une trace des utilisateurs connectés
}


// Envoyer un message à tout le monde
function broadcastMessage() {
    // 👉 Cette fonction est le cœur du chat

    // Quand un utilisateur envoie un message :
    // le serveur le reçoit, puis doit le renvoyer à TOUS les autres

    // Tu dois :
    // - parcourir la liste des clients connectés
    // - envoyer le message à chacun

    // ⚠️ Important :
    // ne pas renvoyer seulement à un utilisateur → sinon ce n’est pas un chat

    // 💡 Réflexe à avoir :
    // le serveur = “diffuseur” (comme une radio)
}


// Gérer une déconnexion
function handleDisconnection() {
    // 👉 Cette fonction est appelée quand un utilisateur quitte

    // Tu dois :
    // - retirer l’utilisateur de la liste des clients
    // - libérer les ressources (nettoyage)

    // Tu peux aussi :
    // - informer les autres utilisateurs (message "leave")

    // 💡 Réflexe à avoir :
    // toujours nettoyer les connexions pour éviter :
    // - bugs
    // - utilisateurs “fantômes”
}

//ATTENTION : COMMANDES A EXECUTER POUR LANCER LE SERVEUR (a executer dans l'invite de commande, dans le dossier Serveur)

//npm init -y
//npm install express ws
//node serveur.js

//NE PAS OUBLIER DE FAIRE LES COMMENTAIRES POUR EXPLIQUER CHAQUE PARTIES

import express from "express";
import { WebSocketServer } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Servir le dossier Client
app.use(express.static(path.join(__dirname, "../Client")));

const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("Client connecté");

  ws.on("message", (message) => {
    console.log("Message reçu :", message.toString());

    // Diffusion à tous les clients
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message.toString());
      }
    });
  });
});

server.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});
