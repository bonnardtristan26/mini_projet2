//ATTENTION : COMMANDES A EXECUTER POUR LANCER LE SERVEUR (a executer dans l'invite de commande, dans le dossier Serveur)

//npm init -y
//npm install express ws
//node serveur.js

//NE PAS OUBLIER DE FAIRE LES COMMENTAIRES POUR EXPLIQUER CHAQUE PARTIES

// ══════════════════════════════════════════════════════════════════════════════════
// IMPORTS
// ══════════════════════════════════════════════════════════════════════════════════

import express from "express";
import { WebSocketServer, WebSocket } from "ws";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import bcrypt from "bcrypt";
import mysql from "mysql2/promise";
import session from "express-session";
import nodemailer from "nodemailer";
import fs from "fs";

// ══════════════════════════════════════════════════════════════════════════════════
// CONFIGURATION DE BASE
// ══════════════════════════════════════════════════════════════════════════════════

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Lire le JSON envoyé par le client
app.use(express.json());

// Sessions
app.use(session({
    secret: "ladiscorde_secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Servir le dossier Client
app.use(express.static(path.join(__dirname, "../Client")));

// Servir le dossier Ressource (pour les images, fonts, etc.)
app.use("/Ressource", express.static(path.join(__dirname, "../Ressource")));

// Connexion MariaDB
const db = await mysql.createPool({
    host:     "127.0.0.1",
    port:     3307,
    user:     "root",
    password: "",
    database: "ladiscorde",
    waitForConnections: true
});

console.log("Connecté à MariaDB");

// ── Config Gmail Brevo 
const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 465,
    secure: true,
    auth: {
        user: "a6844a001@smtp-brevo.com",
        pass: "xsmtpsib-7f7c0e038841866d3e7cf58567edc2b9bec46b3870d19c9245b8f9bc1a1742d6-YINoaJlLazUQpW9e"
    }
});

// ══════════════════════════════════════════════════════════════════════════════════
// WEBSOCKET — chat
// ══════════════════════════════════════════════════════════════════════════════════

const wss = new WebSocketServer({ server });

// Map pour tracker les clients connectés avec leur session
const clientSessions = new Map();

// Map pour tracker les utilisateurs en ligne (userId => { pseudo, ws })
const utilisateursEnLigne = new Map();

// Fonction pour diffuser la liste des utilisateurs en ligne à tous les clients
function getAvatarUrl(userId) {
  const base = path.join(__dirname, `../Ressource/Image/imageprofil/`);
  const exts = ["png", "jpg", "jpeg"];
  for (const ext of exts) {
    const file = path.join(base, `${userId}.${ext}`);
    if (fs.existsSync(file)) {
      return `/Ressource/Image/imageprofil/${userId}.${ext}`;
    }
  }
  return "/Ressource/Image/logo_LaDiscorde.png";
}

function diffuserUtilisateurs() {
  const users = Array.from(utilisateursEnLigne.values()).map(user => ({
    userId: user.userId,
    pseudo: user.pseudo,
    avatar: getAvatarUrl(user.userId)
  }));
  const message = JSON.stringify({
    type: "online_users",
    users: users
  });
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

wss.on("connection", (ws) => {
  console.log("Client connecté");
  
  let userConnected = false;
  let userId = null;
  let pseudo = null;
  
  // Récupérer les infos de session du client (envoyées à la connexion)
  ws.on("message", async (message) => {
    console.log("Message reçu :", message.toString());
    
    try {
      const data = JSON.parse(message.toString());
      
      // Message de connexion utilisateur
      if (data.type === "user_connect" && data.userId && data.pseudo) {
        userId = data.userId;
        pseudo = data.pseudo;
        userConnected = true;
        
        // Ajouter l'utilisateur à la liste des en ligne
        utilisateursEnLigne.set(userId, {
          userId: userId,
          pseudo: pseudo,
          ws: ws
        });
        
        console.log(`${pseudo} (ID: ${userId}) connecté`);
        
        // Diffuser la liste mise à jour à tous les clients
        diffuserUtilisateurs();
        return;
      }
      
      // Si c'est un message avec canal et type
      if (data.pseudo && data.texte && data.canal && data.type && data.userId) {
        // Sauvegarder dans la BDD
        await db.execute(
          "INSERT INTO messages (user_id, username, canal, type, texte) VALUES (?, ?, ?, ?, ?)",
          [data.userId, data.pseudo, data.canal, data.type, data.texte]
        );
        
        // Diffuser à tous les clients
        wss.clients.forEach((client) => {
          if (client.readyState === WebSocket.OPEN) {
            client.send(message.toString());
          }
        });
      }
    } catch (err) {
      console.error("Erreur traitement message :", err);
      // Diffuser quand même si c'est un message simple
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message.toString());
        }
      });
    }
  });
  
  // Gestion de la déconnexion
  ws.on("close", () => {
    if (userConnected && userId) {
      utilisateursEnLigne.delete(userId);
      console.log(`${pseudo} (ID: ${userId}) déconnecté`);
      
      // Diffuser la liste mise à jour à tous les clients
      diffuserUtilisateurs();
    }
  });
});

server.listen(3000, () => {
  console.log("Serveur lancé sur http://localhost:3000");
});

// ══════════════════════════════════════════════════════════════════════════════════
// ROUTES AUTHENTIFICATION
// ══════════════════════════════════════════════════════════════════════════════════

// Route inscription en gros pour envoyer mail

app.post("/inscription", async (req, res) => {
    const { username, password, email } = req.body;

    if (!username || !password || !email) return res.json({ success: false, message: "Champs manquants." });
    if (username.length < 3 || username.length > 30) return res.json({ success: false, message: "Pseudo entre 3 et 30 caractères." });
    if (!/^[a-f0-9]{64}$/.test(password)) return res.json({ success: false, message: "Format invalide." });
    if (!email.includes('@')) return res.json({ success: false, message: "Email invalide." });

    try {
        // Vérifier doublon pseudo ou email
        const [rows] = await db.execute(
            "SELECT id FROM utilisateurs WHERE username = ? OR email = ?", [username, email]
        );
        if (rows.length > 0) return res.json({ success: false, message: "Pseudo ou email déjà utilisé." });

        // Générer un token de vérification unique
        const token = crypto.randomUUID().replace(/-/g, '');

        const hashFinal = await bcrypt.hash(password, 12);
        await db.execute(
            "INSERT INTO utilisateurs (username, password_hash, email, token_verif, email_verifie) VALUES (?, ?, ?, ?, 0)",
            [username, hashFinal, email, token]
        );

        // Lien de vérification
        const lienVerif = `http://localhost:3000/verifier-email?token=${token}`;

        // Template HTML du mail style Discord/LaDiscorde
        const htmlMail = `
        <!DOCTYPE html>
        <html>
        <head><meta charset="UTF-8"></head>
        <body style="margin:0;padding:0;background:#0d0d0d;font-family:Arial,sans-serif;">
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
                <tr><td align="center">
                    <table width="480" cellpadding="0" cellspacing="0" style="background:#1a1a1a;border-radius:12px;border:1px solid rgba(200,0,0,0.4);overflow:hidden;">
                        
                        <!-- Header rouge -->
                        <tr>
                            <td style="background:linear-gradient(135deg,#8b0000,#c0000e);padding:32px;text-align:center;">
                                <h1 style="color:white;margin:0;font-size:28px;letter-spacing:3px;">LaDiscorde</h1>
                                <p style="color:rgba(255,255,255,0.75);margin:6px 0 0;font-size:13px;letter-spacing:1px;">PLATEFORME DE CHAT</p>
                            </td>
                        </tr>

                        <!-- Corps -->
                        <tr>
                            <td style="padding:36px 40px;">
                                <h2 style="color:white;font-size:20px;margin:0 0 12px;">Vérifie ton adresse email</h2>
                                <p style="color:#aaa;font-size:14px;line-height:1.6;margin:0 0 24px;">
                                    Salut <strong style="color:white;">${username}</strong> !<br><br>
                                    Merci de t'être inscrit sur <strong style="color:#c0000e;">LaDiscorde</strong>.
                                    Clique sur le bouton ci-dessous pour confirmer ton adresse email et activer ton compte.
                                </p>

                                <!-- Bouton -->
                                <table cellpadding="0" cellspacing="0" style="margin:0 auto 28px;">
                                    <tr>
                                        <td style="background:#c0000e;border-radius:8px;">
                                            <a href="${lienVerif}" style="display:inline-block;padding:14px 36px;color:white;text-decoration:none;font-weight:bold;font-size:15px;letter-spacing:1.5px;">
                                                VÉRIFIER MON EMAIL
                                            </a>
                                        </td>
                                    </tr>
                                </table>

                                <p style="color:#666;font-size:12px;text-align:center;margin:0;">
                                    Ce lien expire dans 24h. Si tu n'as pas créé de compte, ignore ce mail.
                                </p>
                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background:#111;padding:18px;text-align:center;border-top:1px solid rgba(200,0,0,0.2);">
                                <p style="color:#444;font-size:11px;margin:0;">
                                    © LaDiscorde — noreply.ladiscorde@gmail.com
                                </p>
                            </td>
                        </tr>

                    </table>
                </td></tr>
            </table>
        </body>
        </html>`;

//en voie mail
const brevoResponse = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "api-key": "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"
    },
    body: JSON.stringify({
        sender: { name: "LaDiscorde", email: "ztoxyu@gmail.com" },
        to: [{ email: email, name: username }],
        subject: "Vérifie ton adresse email — LaDiscorde",
        htmlContent: htmlMail
    })
});

const brevoResult = await brevoResponse.json();
console.log("Réponse Brevo :", JSON.stringify(brevoResult));

        console.log(`Mail de vérification envoyé à : ${email} (user: ${username})`);
        return res.json({ success: true, message: "Compte créé ! Vérifie tes emails." });

    } catch (err) {
        console.error("Erreur inscription :", err);
        return res.json({ success: false, message: "Erreur serveur." });
    }
});

// Route vérification email
app.get("/verifier-email", async (req, res) => {
    const { token } = req.query;

    if (!token) return res.send("Lien invalide.");

    try {
        const [rows] = await db.execute(
            "SELECT id, username FROM utilisateurs WHERE token_verif = ? AND email_verifie = 0",
            [token]
        );

        if (rows.length === 0) {
            return res.send("Lien invalide ou déjà utilisé.");
        }

        await db.execute(
            "UPDATE utilisateurs SET email_verifie = 1, token_verif = NULL WHERE id = ?",
            [rows[0].id]
        );

        console.log(`Email vérifié pour : ${rows[0].username}`);
        // Redirige vers la page de connexion avec un message
        return res.redirect("/login.html?verified=1");

    } catch (err) {
        console.error("Erreur vérification :", err);
        return res.send("Erreur serveur.");
    }
});



// Route connexion
app.post("/connexion", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.json({ success: false, message: "Champs manquants." });
    try {
        const [rows] = await db.execute("SELECT id, username, password_hash, email_verifie FROM utilisateurs WHERE username = ?", [username]);
        if (rows.length === 0) return res.json({ success: false, message: "Identifiants incorrects." });
        
        const user = rows[0];

        // Vérifier que l'email a bien été confirmé
        if (user.email_verifie === 0) {
            return res.json({ success: false, message: "Vérifie ton email avant de te connecter." });
        }

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


// Route pour vérifier si l'utilisateur est connecté
app.get("/verifier-session", (req, res) => {
    if (req.session.userId) {
        return res.json({ connecte: true, username: req.session.username, userId: req.session.userId });
    } else {
        return res.json({ connecte: false });
    }
});

// Route déconnexion
app.post("/deconnexion", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTES HISTORIQUE DES MESSAGES
// ═══════════════════════════════════════════════════════════════════════════════

// Route pour charger l'historique d'un canal
app.get("/historique/:canal/:type", async (req, res) => {
    const { canal, type } = req.params;
    
    // Vérifications
    if (!['public', 'private'].includes(type)) {
        return res.json({ success: false, message: "Type invalide." });
    }
    
    try {
        const [messages] = await db.execute(
            "SELECT id, username, texte, created_at FROM messages WHERE canal = ? AND type = ? ORDER BY created_at ASC",
            [canal, type]
        );
        
        return res.json({ 
            success: true, 
            messages: messages.map(msg => ({
                pseudo: msg.username,
                texte: msg.texte,
                timestamp: msg.created_at
            }))
        });
    } catch (err) {
        console.error("Erreur chargement historique :", err);
        return res.json({ success: false, message: "Erreur serveur." });
    }
});

// Route pour sauvegarder un message (fallback en cas de problème WebSocket)
app.post("/sauvegarder-message", async (req, res) => {
    if (!req.session.userId) return res.json({ success: false, message: "Non connecté." });
    
    const { texte, canal, type } = req.body;
    
    if (!texte || !canal || !type) {
        return res.json({ success: false, message: "Données manquantes." });
    }
    
    if (!['public', 'private'].includes(type)) {
        return res.json({ success: false, message: "Type invalide." });
    }
    
    try {
        await db.execute(
            "INSERT INTO messages (user_id, username, canal, type, texte) VALUES (?, ?, ?, ?, ?)",
            [req.session.userId, req.session.username, canal, type, texte]
        );
        
        return res.json({ success: true });
    } catch (err) {
        console.error("Erreur sauvegarde message :", err);
        return res.json({ success: false, message: "Erreur serveur." });
    }
});

// Route pour upload d'avatar (POST /upload-avatar)
app.post("/upload-avatar", async (req, res) => {
    try {
        const { userId, imageBase64, baseAvatar } = req.body;
        if (!userId) return res.status(400).json({ success: false, message: "Données manquantes" });
        // Si baseAvatar est fourni, copier l'image de base
        if (baseAvatar) {
            const ext = baseAvatar.split('.').pop();
            const dest = path.join(__dirname, `../Ressource/Image/imageprofil/${userId}.${ext}`);
            // Correction du chemin source
            const src = path.join(__dirname, `..${baseAvatar}`);
            if (!fs.existsSync(src)) return res.status(400).json({ success: false, message: "Fichier source introuvable" });
            fs.copyFileSync(src, dest);
            return res.json({ success: true, url: `/Ressource/Image/imageprofil/${userId}.${ext}` });
        }
        // Sinon, imageBase64 (upload personnalisé)
        if (!imageBase64) return res.status(400).json({ success: false, message: "Aucune image fournie" });
        const matches = imageBase64.match(/^data:image\/(png|jpeg|jpg);base64,(.+)$/);
        if (!matches) return res.status(400).json({ success: false, message: "Format image invalide" });
        const ext = matches[1] === "jpeg" ? "jpg" : matches[1];
        const buffer = Buffer.from(matches[2], "base64");
        const filePath = path.join(__dirname, `../Ressource/Image/imageprofil/${userId}.${ext}`);
        fs.writeFileSync(filePath, buffer);
        return res.json({ success: true, url: `/Ressource/Image/imageprofil/${userId}.${ext}` });
    } catch (err) {
        console.error("Erreur upload avatar:", err);
        return res.status(500).json({ success: false, message: "Erreur serveur" });
    }
});

