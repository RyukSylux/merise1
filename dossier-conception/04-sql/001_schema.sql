-- =============================================================================
-- CoWork'In — Script DDL 001 : Structure du Schéma, Tables et Index (PostgreSQL)
-- Version : 1.0.0
-- =============================================================================

-- Nettoyage préalable si ré-exécution
DROP TABLE IF EXISTS ligne_facture CASCADE;
DROP TABLE IF EXISTS facture CASCADE;
DROP TABLE IF EXISTS inscription CASCADE;
DROP TABLE IF EXISTS atelier CASCADE;
DROP TABLE IF EXISTS reservation CASCADE;
DROP TABLE IF EXISTS salle_reunion CASCADE;
DROP TABLE IF EXISTS poste CASCADE;
DROP TABLE IF EXISTS espace CASCADE;
DROP TABLE IF EXISTS abonnement CASCADE;
DROP TABLE IF EXISTS formule CASCADE;
DROP TABLE IF EXISTS utilisateur CASCADE;
DROP TABLE IF EXISTS societe CASCADE;
DROP TABLE IF EXISTS site CASCADE;

-- -----------------------------------------------------------------------------
-- Table : SITE
-- -----------------------------------------------------------------------------
CREATE TABLE site (
    id_site BIGSERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    ville VARCHAR(50) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    capacite_max INT NOT NULL
);

-- -----------------------------------------------------------------------------
-- Table : SOCIETE
-- -----------------------------------------------------------------------------
CREATE TABLE societe (
    id_societe BIGSERIAL PRIMARY KEY,
    raison_sociale VARCHAR(100) NOT NULL,
    siret CHAR(14) NOT NULL UNIQUE,
    adresse_facturation VARCHAR(255) NOT NULL
);

-- -----------------------------------------------------------------------------
-- Table : UTILISATEUR
-- -----------------------------------------------------------------------------
CREATE TABLE utilisateur (
    id_utilisateur BIGSERIAL PRIMARY KEY,
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    role VARCHAR(30) NOT NULL DEFAULT 'COWORKER',
    date_creation TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    id_societe BIGINT
);

-- -----------------------------------------------------------------------------
-- Table : FORMULE
-- -----------------------------------------------------------------------------
CREATE TABLE formule (
    id_formule BIGSERIAL PRIMARY KEY,
    libelle VARCHAR(50) NOT NULL,
    tarif_mensuel DECIMAL(10,2) NOT NULL,
    quota_salle_heures INT NOT NULL DEFAULT 4
);

-- -----------------------------------------------------------------------------
-- Table : ABONNEMENT
-- -----------------------------------------------------------------------------
CREATE TABLE abonnement (
    id_abonnement BIGSERIAL PRIMARY KEY,
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut VARCHAR(20) NOT NULL DEFAULT 'ACTIF',
    id_utilisateur BIGINT NOT NULL,
    id_formule BIGINT NOT NULL
);

-- -----------------------------------------------------------------------------
-- Table : ESPACE (Classe Mère)
-- -----------------------------------------------------------------------------
CREATE TABLE espace (
    id_espace BIGSERIAL PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    etage INT NOT NULL DEFAULT 0,
    id_site BIGINT NOT NULL
);

-- -----------------------------------------------------------------------------
-- Table : POSTE (Classe Fille)
-- -----------------------------------------------------------------------------
CREATE TABLE poste (
    id_espace BIGINT PRIMARY KEY,
    est_electrique BOOLEAN NOT NULL DEFAULT TRUE,
    a_ecran_externe BOOLEAN NOT NULL DEFAULT FALSE
);

-- -----------------------------------------------------------------------------
-- Table : SALLE_REUNION (Classe Fille)
-- -----------------------------------------------------------------------------
CREATE TABLE salle_reunion (
    id_espace BIGINT PRIMARY KEY,
    nom_salle VARCHAR(50) NOT NULL,
    capacite_personnes INT NOT NULL,
    equipements TEXT,
    est_maintenance BOOLEAN NOT NULL DEFAULT FALSE
);

-- -----------------------------------------------------------------------------
-- Table : RESERVATION
-- -----------------------------------------------------------------------------
CREATE TABLE reservation (
    id_reservation BIGSERIAL PRIMARY KEY,
    date_heure_debut TIMESTAMP WITH TIME ZONE NOT NULL,
    date_heure_fin TIMESTAMP WITH TIME ZONE NOT NULL,
    statut VARCHAR(20) NOT NULL DEFAULT 'CONFIRMEE',
    montant_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    id_utilisateur BIGINT NOT NULL,
    id_espace BIGINT NOT NULL
);

-- -----------------------------------------------------------------------------
-- Table : ATELIER
-- -----------------------------------------------------------------------------
CREATE TABLE atelier (
    id_atelier BIGSERIAL PRIMARY KEY,
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    date_heure TIMESTAMP WITH TIME ZONE NOT NULL,
    places_max INT NOT NULL,
    nb_inscrits INT NOT NULL DEFAULT 0,
    tarif DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    id_site BIGINT NOT NULL
);

-- -----------------------------------------------------------------------------
-- Table : INSCRIPTION (Table de Liaison Porteuse)
-- -----------------------------------------------------------------------------
CREATE TABLE inscription (
    id_utilisateur BIGINT NOT NULL,
    id_atelier BIGINT NOT NULL,
    date_inscription TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    statut_inscription VARCHAR(20) NOT NULL DEFAULT 'CONFIRMEE',
    PRIMARY KEY (id_utilisateur, id_atelier)
);

-- -----------------------------------------------------------------------------
-- Table : FACTURE
-- -----------------------------------------------------------------------------
CREATE TABLE facture (
    id_facture BIGSERIAL PRIMARY KEY,
    reference VARCHAR(30) NOT NULL UNIQUE,
    date_emission DATE NOT NULL DEFAULT CURRENT_DATE,
    montant_ht DECIMAL(10,2) NOT NULL,
    montant_tva DECIMAL(10,2) NOT NULL,
    montant_ttc DECIMAL(10,2) NOT NULL,
    statut_paiement VARCHAR(20) NOT NULL DEFAULT 'EN_ATTENTE',
    id_utilisateur BIGINT,
    id_societe BIGINT
);

-- -----------------------------------------------------------------------------
-- Table : LIGNE_FACTURE (Entité Faible)
-- -----------------------------------------------------------------------------
CREATE TABLE ligne_facture (
    id_facture BIGINT NOT NULL,
    num_ligne INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantite DECIMAL(10,2) NOT NULL DEFAULT 1.00,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    montant_ht DECIMAL(10,2) NOT NULL,
    id_reservation BIGINT,
    PRIMARY KEY (id_facture, num_ligne)
);

-- =============================================================================
-- CRÉATION DES INDEX DE PERFORMANCE
-- =============================================================================

CREATE INDEX idx_reservation_espace_dates ON reservation(id_espace, date_heure_debut, date_heure_fin);
CREATE INDEX idx_utilisateur_email ON utilisateur(email);
CREATE INDEX idx_salle_maintenance ON salle_reunion(id_espace) WHERE est_maintenance = TRUE;
CREATE INDEX idx_inscription_atelier ON inscription(id_atelier, statut_inscription);
