-- ─── À exécuter dans phpMyAdmin (WampServer) ─────────────────────────────────────

-- 1. Créer la base de données
CREATE DATABASE IF NOT EXISTS ladiscorde
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE ladiscorde;

-- 2. Créer la table utilisateurs
CREATE TABLE IF NOT EXISTS utilisateurs (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    username      VARCHAR(30)     NOT NULL,
    password_hash VARCHAR(255)    NOT NULL,   -- bcrypt fait ~60 chars, on garde de la marge
    created_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uq_username (username)         -- empêche les doublons de pseudo
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;