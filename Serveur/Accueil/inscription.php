<?php
// ─── inscription.php ───────────────────────────────────────────────────────────────
// Reçoit : { username, password (sha256 côté client) }
// Stocke : bcrypt(sha256) dans la BDD  →  double hachage, le vrai mdp ne touche jamais le serveur

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');            // à restreindre en production
header('Access-Control-Allow-Headers: Content-Type');

// ── Config BDD (WampServer / MariaDB) ──────────────────────────────────────────────
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'ladiscorde');     // ← nom de ta base
define('DB_USER', 'root');           // ← user MariaDB (root par défaut sur Wamp)
define('DB_PASS', '');               // ← mot de passe MariaDB (vide par défaut sur Wamp)

// ── Lecture du body JSON ───────────────────────────────────────────────────────────
$body    = json_decode(file_get_contents('php://input'), true);
$username = trim($body['username'] ?? '');
$hashClient = trim($body['password'] ?? '');   // déjà en SHA-256

// ── Validation basique ─────────────────────────────────────────────────────────────
if (empty($username) || empty($hashClient)) {
    echo json_encode(['success' => false, 'message' => 'Champs manquants.']);
    exit;
}

if (strlen($username) < 3 || strlen($username) > 30) {
    echo json_encode(['success' => false, 'message' => 'Pseudo entre 3 et 30 caractères.']);
    exit;
}

// On vérifie que c'est bien un hash SHA-256 (64 caractères hex)
if (!preg_match('/^[a-f0-9]{64}$/', $hashClient)) {
    echo json_encode(['success' => false, 'message' => 'Format de mot de passe invalide.']);
    exit;
}

// ── Connexion PDO ──────────────────────────────────────────────────────────────────
try {
    $pdo = new PDO(
        'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8',
        DB_USER, DB_PASS,
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );
} catch (PDOException $e) {
    echo json_encode(['success' => false, 'message' => 'Connexion BDD impossible.']);
    exit;
}

// ── Vérifier si le pseudo existe déjà ─────────────────────────────────────────────
$stmt = $pdo->prepare('SELECT id FROM utilisateurs WHERE username = :username');
$stmt->execute([':username' => $username]);
if ($stmt->fetch()) {
    echo json_encode(['success' => false, 'message' => 'Ce pseudo est déjà pris.']);
    exit;
}

// ── Double hachage : bcrypt(sha256_client) ─────────────────────────────────────────
// Le sha256 a déjà été fait côté client.
// On ajoute un bcrypt serveur : même si la BDD fuite, les hashs sont inutilisables.
$hashFinal = password_hash($hashClient, PASSWORD_BCRYPT, ['cost' => 12]);

// ── Insertion ──────────────────────────────────────────────────────────────────────
$stmt = $pdo->prepare('INSERT INTO utilisateurs (username, password_hash) VALUES (:username, :hash)');
$stmt->execute([
    ':username' => $username,
    ':hash'     => $hashFinal
]);

echo json_encode(['success' => true, 'message' => 'Compte créé !']);
