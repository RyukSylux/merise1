# Matrice de Traçabilité Bidirectionnelle — CoWork'In

Ce document garantit la **traçabilité complète et bidirectionnelle** du besoin initial jusqu'au script SQL final. 

> **Principe d'Acceptation** : Chaque colonne et chaque table de la base de données dérive d'une règle de gestion ou d'une phrase explicite de l'expression de besoin. Inversement, chaque besoin du client est couvert par une entité et une table SQL.

---

## Matrice Principale : Besoin &rarr; Cas d'Usage &rarr; Classe &rarr; MCD / MLD &rarr; Table SQL

| Exigence / Phrase du Verbatim | Cas d'Usage Associé | Classe Métier | Entité MCD / Relation MLD | Table SQL & Colonne Physiques | Règle de Gestion (RG) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| « gérons trois espaces de coworking, à Lille, Roubaix et Tourcoing » | UC-01, UC-02 | `Site` | `SITE` | `site (id_site, nom, ville, adresse, capacite_max)` | RG-Site |
| « voient les postes libres ... et réservent à l'heure ou à la journée » | UC-01 | `Espace`, `Poste`, `Reservation` | `ESPACE`, `POSTE`, `RESERVATION` | `poste (id_espace, est_electrique, a_ecran_externe)`, `reservation (...)` | RG-01, RG-02 |
| « et les salles de réunion en temps réel » | UC-02 | `SalleReunion` | `SALLE_REUNION` | `salle_reunion (id_espace, nom_salle, capacite_personnes, est_maintenance)` | RG-03, RG-04 |
| « Les abonnés — formules Nomade, Résident, Team » | UC-01, UC-02 | `Formule`, `Abonnement` | `FORMULE`, `ABONNEMENT` | `formule (libelle, tarif_mensuel, quota_salle_heures)`, `abonnement (...)` | RG-01, RG-03 |
| « ne paient pas les postes, mais paient les salles au-delà de 4 h par mois » | UC-02 | `Abonnement`, `Reservation` | `RESERVATION` | `formule.quota_salle_heures`, `reservation.montant_total` | RG-01, RG-03 |
| « À la fin du mois, il faut sortir une facture par client ; pour les sociétés, une facture globale avec le détail par collaborateur » | UC-08 | `Facture`, `LigneFacture`, `Societe`, `Utilisateur` | `FACTURE`, `LIGNE_FACTURE`, `SOCIETE` | `facture (reference, id_utilisateur, id_societe)`, `ligne_facture (...)` | RG-05 |
| « L'équipe d'accueil doit pouvoir fermer une salle pour maintenance » | UC-06 | `SalleReunion` | `SALLE_REUNION` | `salle_reunion.est_maintenance` | RG-04 |
| « et voir qui est présent en cas d'évacuation » | UC-05 | `Reservation`, `Utilisateur`, `Site` | `RESERVATION`, `UTILISATEUR` | Requête SQL filtrée sur `reservation.date_heure_debut` / `fin` | RG-Evacuation |
| « Le gérant veut un tableau de bord du taux d'occupation par site » | UC-07 | `Site`, `Espace`, `Reservation` | `SITE`, `ESPACE`, `RESERVATION` | Requête d'agrégation `COUNT(id_reservation)` groupée par `id_site` | RG-Statistiques |
| « on organise des ateliers le jeudi soir, avec inscription en ligne et places limitées » | UC-03 | `Atelier`, `Inscription` | `ATELIER`, `INCRIPTION` | `atelier (places_max, nb_inscrits)`, `inscription (date_inscription, statut)` | RG-06, RG-07 |

---

## Traçabilité Inverse : Table SQL &rarr; Justification Métier

- **`site`** : Requis pour la gestion multi-sites (Lille, Roubaix, Tourcoing).
- **`societe`** : Requis pour le rattachement des collaborateurs et la facturation globale entreprise.
- **`utilisateur`** : Requis pour l'authentification et l'historique personnel.
- **`formule` & `abonnement`** : Requis pour appliquer la différenciation tarifaire et les 4h/mois offertes.
- **`espace` / `poste` / `salle_reunion`** : Requis pour modéliser le patrimoine physique réservable.
- **`reservation`** : Requis pour bloquer les créneaux et empêcher les double-réservations.
- **`atelier` & `inscription`** : Requis pour la gestion des événements du jeudi soir et le contrôle des jauges.
- **`facture` & `ligne_facture`** : Requis pour l'immuabilité fiscale et la comptabilité mensuelle.
