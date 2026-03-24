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

// ══════════════════════════════════════════════════════════════════════════════════
// WEBSOCKET — chat (code original intact)
// ══════════════════════════════════════════════════════════════════════════════════

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



//partie chiffrement du mdp 

import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import session from "express-session";

// Lire le JSON envoyé par le client
app.use(express.json());

// Sessions
app.use(session({
    secret: "ladiscorde_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Connexion MariaDB
const db = await mysql.createPool({
    host:     "127.0.0.1",
    port:     3307,          // ← ajoute cette ligne
    user:     "root",
    password: "",
    database: "ladiscorde",
    waitForConnections: true
});

console.log("Connecté à MariaDB");

// Servir le dossier Client
app.use(express.static(path.join(__dirname, "../Client")));

// Servir le dossier Ressource (pour les images, fonts, etc.)
app.use("/Ressource", express.static(path.join(__dirname, "../Ressource")));

// Route inscription
app.post("/inscription", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: "Champs manquants." });
    if (username.length < 3 || username.length > 30) return res.json({ success: false, message: "Pseudo entre 3 et 30 caractères." });
    if (!/^[a-f0-9]{64}$/.test(password)) return res.json({ success: false, message: "Format invalide." });
    try {
        const [rows] = await db.execute("SELECT id FROM utilisateurs WHERE username = ?", [username]);
        if (rows.length > 0) return res.json({ success: false, message: "Pseudo déjà pris." });
        const hashFinal = await bcrypt.hash(password, 12);
        await db.execute("INSERT INTO utilisateurs (username, password_hash) VALUES (?, ?)", [username, hashFinal]);
        return res.json({ success: true, message: "Compte créé !" });
    } catch (err) {
        console.error("Erreur inscription :", err);
        return res.json({ success: false, message: "Erreur serveur." });
    }
});

// Route connexion
app.post("/connexion", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: "Champs manquants." });
    try {
        const [rows] = await db.execute("SELECT id, username, password_hash FROM utilisateurs WHERE username = ?", [username]);
        if (rows.length === 0) return res.json({ success: false, message: "Identifiants incorrects." });
        const user = rows[0];
        const ok = await bcrypt.compare(password, user.password_hash);
        if (!ok) return res.json({ success: false, message: "Identifiants incorrects." });
        req.session.userId   = user.id;
        req.session.username = user.username;
        return res.json({ success: true, username: user.username });
    } catch (err) {
        console.error("Erreur connexion :", err);
        return res.json({ success: false, message: "Erreur serveur." });
    }
});