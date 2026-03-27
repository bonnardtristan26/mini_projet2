<?php
// ─── connexion.php ─────────────────────────────────────────────────────────────────
// Reçoit : { username, password (sha256 côté client) }
// Vérifie : password_verify(sha256_client, bcrypt_bdd)

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type');

// ── Config BDD ─────────────────────────────────────────────────────────────────────
define('DB_HOST', '127.0.0.1');
define('DB_NAME', 'ladiscorde');
define('DB_USER', 'root');
define('DB_PASS', '');

// ── Lecture body JSON ──────────────────────────────────────────────────────────────
$body       = json_decode(file_get_contents('php://input'), true);
$username   = trim($body['username'] ?? '');
$hashClient = trim($body['password'] ?? '');

if (empty($username) || empty($hashClient)) {
    echo json_encode(['success' => false, 'message' => 'Champs manquants.']);
    exit;
}

if (!preg_match('/^[a-f0-9]{64}$/', $hashClient)) {
    echo json_encode(['success' => false, 'message' => 'Format invalide.']);
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

// ── Récupérer l'utilisateur ────────────────────────────────────────────────────────
$stmt = $pdo->prepare('SELECT id, username, password_hash FROM utilisateurs WHERE username = :username');
$stmt->execute([':username' => $username]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

// ── Vérification (password_verify compare le sha256 client avec le bcrypt BDD) ────
// Note : on utilise hash_equals implicitement via password_verify → pas de timing attack
if (!$user || !password_verify($hashClient, $user['password_hash'])) {
    // Message volontairement vague : ne pas indiquer si c'est le pseudo ou le mdp
    echo json_encode(['success' => false, 'message' => 'Identifiants incorrects.']);
    exit;
}

// ── Succès : démarrer une session ──────────────────────────────────────────────────
session_start();
session_regenerate_id(true);   // protection contre la fixation de session
$_SESSION['user_id']   = $user['id'];
$_SESSION['username']  = $user['username'];

echo json_encode([
    'success'  => true,
    'username' => $user['username']
]);
