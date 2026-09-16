-- =============================================================================
-- CoWork'In — Script 010 : Jeu de Données de Test, Validation & Rejets
-- Version : 1.0.0
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. INSERTIONS DES DONNÉES VALIDES
-- -----------------------------------------------------------------------------

-- Sites CoWork'In
INSERT INTO site (id_site, nom, ville, adresse, capacite_max) VALUES
(1, 'CoWork''In Lille Centre', 'Lille', '12 rue Nationale, 59000 Lille', 150),
(2, 'CoWork''In Roubaix Eurotéléport', 'Roubaix', '45 boulevard du Général de Gaulle, 59100 Roubaix', 80),
(3, 'CoWork''In Tourcoing Gare', 'Tourcoing', '8 place Pierre Semard, 59200 Tourcoing', 60);

-- Formules d'Abonnement
INSERT INTO formule (id_formule, libelle, tarif_mensuel, quota_salle_heures) VALUES
(1, 'Nomade', 99.00, 4),
(2, 'Résident', 249.00, 4),
(3, 'Team', 499.00, 10);

-- Sociétés Client
INSERT INTO societe (id_societe, raison_sociale, siret, adresse_facturation) VALUES
(1, 'TechNord SAS', '12345678901234', '100 avenue de la Recherche, 59000 Lille');

-- Utilisateurs
INSERT INTO utilisateur (id_utilisateur, nom, prenom, email, telephone, role, id_societe) VALUES
(1, 'Dupont', 'Jean', 'jean.dupont@email.com', '0601020304', 'COWORKER', NULL),
(2, 'Martin', 'Sophie', 'sophie.martin@technord.fr', '0611223344', 'REFERENT', 1),
(3, 'Bernard', 'Lucas', 'lucas.bernard@technord.fr', '0655667788', 'COWORKER', 1),
(4, 'Salma', 'Hôtesse', 'salma.accueil@coworkin.fr', '0699887766', 'HOTE', NULL),
(5, 'Lefebvre', 'Marc', 'marc.gerant@coworkin.fr', '0677889900', 'GERANT', NULL);

-- Abonnements Actifs
INSERT INTO abonnement (id_abonnement, date_debut, date_fin, statut, id_utilisateur, id_formule) VALUES
(1, '2026-01-01', '2026-12-31', 'ACTIF', 1, 1), -- Jean (Nomade)
(2, '2026-01-01', '2026-12-31', 'ACTIF', 2, 3); -- Sophie / TechNord (Team)

-- Espaces (Base + Subtypes)
INSERT INTO espace (id_espace, code, etage, id_site) VALUES
(1, 'POSTE-LIL-01', 1, 1),
(2, 'POSTE-LIL-02', 1, 1),
(3, 'SALLE-LIL-A', 2, 1),
(4, 'SALLE-ROU-B', 1, 2);

INSERT INTO poste (id_espace, est_electrique, a_ecran_externe) VALUES
(1, TRUE, TRUE),
(2, TRUE, FALSE);

INSERT INTO salle_reunion (id_espace, nom_salle, capacite_personnes, equipements, est_maintenance) VALUES
(3, 'Baudelaire', 10, 'Visioconférence 4K, Écran 75 pouces, Tableau blanc', FALSE),
(4, 'Verlaine', 6, 'Écran 55 pouces', FALSE);

-- Réservations
INSERT INTO reservation (id_reservation, date_heure_debut, date_heure_fin, statut, montant_total, id_utilisateur, id_espace) VALUES
(1, '2026-09-15 09:00:00+02', '2026-09-15 18:00:00+02', 'CONFIRMEE', 0.00, 1, 1), -- Poste gratuit pour abonné Jean
(2, '2026-09-16 14:00:00+02', '2026-09-16 16:00:00+02', 'CONFIRMEE', 0.00, 1, 3), -- Salle 2h (sous quota 4h)
(3, '2026-09-20 10:00:00+02', '2026-09-20 15:00:00+02', 'CONFIRMEE', 40.00, 1, 3); -- Salle 5h (1h sous quota + 4h payantes à 10€/h)

-- Ateliers du Jeudi Soir
INSERT INTO atelier (id_atelier, titre, description, date_heure, places_max, nb_inscrits, tarif, id_site) VALUES
(1, 'Introduction à Merise & PostgreSQL', 'Atelier pratique de modélisation', '2026-09-24 18:30:00+02', 15, 2, 0.00, 1);

-- Inscriptions
INSERT INTO inscription (id_utilisateur, id_atelier, date_inscription, statut_inscription) VALUES
(1, 1, '2026-09-10 10:15:00+02', 'CONFIRMEE'),
(3, 1, '2026-09-11 14:30:00+02', 'CONFIRMEE');

-- Factures & Lignes de Facture
INSERT INTO facture (id_facture, reference, date_emission, montant_ht, montant_tva, montant_ttc, statut_paiement, id_utilisateur, id_societe) VALUES
(1, 'FAC-2026-09-001', '2026-09-01', 99.00, 19.80, 118.80, 'PAYEE', 1, NULL),
(2, 'FAC-2026-09-002', '2026-09-01', 499.00, 99.80, 598.80, 'PAYEE', NULL, 1);

INSERT INTO ligne_facture (id_facture, num_ligne, description, quantite, prix_unitaire_ht, montant_ht, id_reservation) VALUES
(1, 1, 'Abonnement Formule Nomade - Septembre 2026', 1.00, 99.00, 99.00, NULL),
(2, 1, 'Abonnement Formule Team - Septembre 2026', 1.00, 499.00, 499.00, NULL);

-- Reset des séquences
SELECT setval('site_id_site_seq', (SELECT MAX(id_site) FROM site));
SELECT setval('societe_id_societe_seq', (SELECT MAX(id_societe) FROM societe));
SELECT setval('utilisateur_id_utilisateur_seq', (SELECT MAX(id_utilisateur) FROM utilisateur));
SELECT setval('formule_id_formule_seq', (SELECT MAX(id_formule) FROM formule));
SELECT setval('espace_id_espace_seq', (SELECT MAX(id_espace) FROM espace));
SELECT setval('reservation_id_reservation_seq', (SELECT MAX(id_reservation) FROM reservation));
SELECT setval('atelier_id_atelier_seq', (SELECT MAX(id_atelier) FROM atelier));
SELECT setval('facture_id_facture_seq', (SELECT MAX(id_facture) FROM facture));


-- -----------------------------------------------------------------------------
-- 2. DÉMONSTRATION DES REJETS PAR VIOLATION DE CONTRAINTES (TESTS INVALIDES)
-- -----------------------------------------------------------------------------

/*
-- TEST INVALID 1 : Violation de la contrainte chk_reservation_dates_coherentes
-- (Date de fin antérieure à la date de début)
INSERT INTO reservation (date_heure_debut, date_heure_fin, statut, montant_total, id_utilisateur, id_espace)
VALUES ('2026-09-18 14:00:00+02', '2026-09-18 10:00:00+02', 'CONFIRMEE', 10.00, 1, 1);
-- ERREUR ATTENDUE : new row for relation "reservation" violates check constraint "chk_reservation_dates_coherentes"

-- TEST INVALID 2 : Violation de la contrainte chk_facture_destinataire_exclusif
-- (Attribution simultanée à un utilisateur ET à une société)
INSERT INTO facture (reference, date_emission, montant_ht, montant_tva, montant_ttc, statut_paiement, id_utilisateur, id_societe)
VALUES ('FAC-INVALID-01', '2026-09-01', 100.00, 20.00, 120.00, 'EN_ATTENTE', 1, 1);
-- ERREUR ATTENDUE : new row for relation "facture" violates check constraint "chk_facture_destinataire_exclusif"

-- TEST INVALID 3 : Violation d'unicité d'email
INSERT INTO utilisateur (nom, prenom, email, role)
VALUES ('Test', 'Doublon', 'jean.dupont@email.com', 'COWORKER');
-- ERREUR ATTENDUE : duplicate key value violates unique constraint "utilisateur_email_key"
*/


-- -----------------------------------------------------------------------------
-- 3. REQUÊTES SQL DE VÉRIFICATION MÉTIER (AUDIT & PILOTAGE)
-- -----------------------------------------------------------------------------

-- Requête 1 : Tableau de bord du taux d'occupation par site (Demande du Gérant)
SELECT 
    s.nom AS site_nom,
    s.ville,
    COUNT(DISTINCT e.id_espace) AS nb_espaces_total,
    COUNT(DISTINCT r.id_reservation) AS nb_reservations_actives
FROM site s
LEFT JOIN espace e ON s.id_site = e.id_site
LEFT JOIN reservation r ON e.id_espace = r.id_espace AND r.statut = 'CONFIRMEE'
GROUP BY s.id_site, s.nom, s.ville;

-- Requête 2 : Liste des présences en temps réel sur le site de Lille (Évacuation / Hôte d'accueil)
SELECT 
    u.nom, 
    u.prenom, 
    u.telephone, 
    e.code AS espace_code, 
    r.date_heure_debut, 
    r.date_heure_fin
FROM reservation r
JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
JOIN espace e ON r.id_espace = e.id_espace
WHERE e.id_site = 1 -- Site Lille
  AND r.statut = 'CONFIRMEE'
  AND CURRENT_TIMESTAMP BETWEEN r.date_heure_debut AND r.date_heure_fin;

-- Requête 3 : Consommation de quota de salle de réunion par abonné ce mois-ci
SELECT 
    u.id_utilisateur,
    u.nom,
    u.prenom,
    f.libelle AS formule_libelle,
    f.quota_salle_heures AS quota_mensuel_offert,
    COALESCE(SUM(EXTRACT(EPOCH FROM (r.date_heure_fin - r.date_heure_debut))/3600), 0) AS heures_salle_consommees
FROM utilisateur u
JOIN abonnement a ON u.id_utilisateur = a.id_utilisateur AND a.statut = 'ACTIF'
JOIN formule f ON a.id_formule = f.id_formule
LEFT JOIN reservation r ON u.id_utilisateur = r.id_utilisateur 
    AND r.id_espace IN (SELECT id_espace FROM salle_reunion)
    AND r.statut = 'CONFIRMEE'
    AND r.date_heure_debut >= '2026-09-01'
GROUP BY u.id_utilisateur, u.nom, u.prenom, f.libelle, f.quota_salle_heures;

-- Requête 4 : Facturation consolidée pour les Sociétés (Détail par collaborateur)
SELECT 
    soc.raison_sociale,
    u.nom AS nom_collaborateur,
    u.prenom AS prenom_collaborateur,
    f.reference AS ref_facture,
    lf.description,
    lf.montant_ht
FROM societe soc
JOIN utilisateur u ON soc.id_societe = u.id_societe
JOIN facture f ON soc.id_societe = f.id_societe
JOIN ligne_facture lf ON f.id_facture = lf.id_facture
ORDER BY soc.raison_sociale, u.nom;

-- Requête 5 : Vérification de la jauge et liste des inscrits à l'atelier du jeudi soir
SELECT 
    a.titre,
    a.date_heure,
    a.places_max,
    a.nb_inscrits,
    (a.places_max - a.nb_inscrits) AS places_restantes,
    u.nom AS nom_participant,
    u.prenom AS prenom_participant,
    i.date_inscription
FROM atelier a
JOIN inscription i ON a.id_atelier = i.id_atelier
JOIN utilisateur u ON i.id_utilisateur = u.id_utilisateur
WHERE a.id_atelier = 1;
