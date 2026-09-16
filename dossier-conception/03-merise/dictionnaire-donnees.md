# Dictionnaire des Données — CoWork'In (MERISE)

Le dictionnaire des données recense l'ensemble des propriétés brutes et dérivées nécessaires au fonctionnement du système CoWork'In.

| Code Propriété | Nom Logique | Nom Physique | Type de Donnée | Taille / Format | Nullable | Description & Règles de Gestion |
| :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| **SITE_ID** | Identifiant Site | `id_site` | ENTIER | BIGINT | Non | Clé primaire synthétique du site. |
| **SITE_NOM** | Nom du Site | `nom` | TEXTE | VARCHAR(50) | Non | Nom usuel (Lille, Roubaix, Tourcoing). |
| **SITE_VILLE** | Ville du Site | `ville` | TEXTE | VARCHAR(50) | Non | Ville d'implantation. |
| **SITE_ADR** | Adresse du Site | `adresse` | TEXTE | VARCHAR(255) | Non | Adresse postale complète. |
| **SITE_CAP** | Capacité Max ERP | `capacite_max` | ENTIER | INT | Non | Capacité d'accueil maximale autorisée (sécurité). |
| **ESP_ID** | Identifiant Espace | `id_espace` | ENTIER | BIGINT | Non | Clé primaire d'un espace (poste ou salle). |
| **ESP_CODE** | Code Espace | `code` | TEXTE | VARCHAR(20) | Non | Identifiant visuel (ex: "POSTE-LIL-102", "SALLE-ROU-A"). |
| **ESP_ETAGE** | Étage | `etage` | ENTIER | INT | Non | Étage de l'espace (0=RDC, 1=1er, etc.). |
| **POS_ELEC** | Prise Électrique | `est_electrique` | BOOLEEN | BOOLEAN | Non | Vrai si le poste est équipé d'une prise dédiée. |
| **POS_ECRAN** | Écran Externe | `a_ecran_externe` | BOOLEEN | BOOLEAN | Non | Vrai si le poste comporte un moniteur. |
| **SAL_NOM** | Nom de la Salle | `nom_salle` | TEXTE | VARCHAR(50) | Non | Nom de la salle de réunion (ex: "Baudelaire"). |
| **SAL_CAP** | Capacité Personnes | `capacite_personnes` | ENTIER | INT | Non | Nombre maximal de personnes assises. |
| **SAL_EQUIP** | Équipements | `equipements` | TEXTE | TEXT | Oui | Liste des équipements (ex: "Visioconférence, Tableau blanc"). |
| **SAL_MAINT** | Statut Maintenance | `est_maintenance` | BOOLEEN | BOOLEAN | Non | Vrai si la salle est fermée pour travaux (RG-04). |
| **UTIL_ID** | Identifiant Utilisateur | `id_utilisateur` | ENTIER | BIGINT | Non | Clé primaire d'un utilisateur. |
| **UTIL_NOM** | Nom | `nom` | TEXTE | VARCHAR(50) | Non | Nom de famille. |
| **UTIL_PRENOM**| Prénom | `prenom` | TEXTE | VARCHAR(50) | Non | Prénom. |
| **UTIL_EMAIL** | Email / Login | `email` | TEXTE | VARCHAR(100) | Non | Identifiant unique de connexion (`UNIQUE`). |
| **UTIL_TEL** | Téléphone | `telephone` | TEXTE | VARCHAR(20) | Oui | Numéro de téléphone portable. |
| **UTIL_ROLE** | Rôle Système | `role` | ENTIER / ENUM | VARCHAR(30) | Non | `COWORKER`, `REFERENT`, `HOTE`, `GERANT`, `ANIMATEUR`. |
| **SOC_ID** | Identifiant Société | `id_societe` | ENTIER | BIGINT | Non | Clé primaire de l'entreprise cliente. |
| **SOC_RAISON** | Raison Sociale | `raison_sociale` | TEXTE | VARCHAR(100) | Non | Nom légal de la société. |
| **SOC_SIRET** | Numéro SIRET | `siret` | TEXTE | CHAR(14) | Non | Numéro SIRET à 14 chiffres (`UNIQUE`). |
| **FORM_ID** | Identifiant Formule | `id_formule` | ENTIER | BIGINT | Non | Clé primaire de l'offre tarifaire. |
| **FORM_LIB** | Libellé Formule | `libelle` | TEXTE | VARCHAR(50) | Non | Nom de la formule (`Nomade`, `Résident`, `Team`). |
| **FORM_PRIX** | Tarif Mensuel | `tarif_mensuel` | MONETAIRE | DECIMAL(10,2) | Non | Prix HT de l'abonnement par mois. |
| **FORM_QUOTA**| Quota Heures Salle | `quota_salle_heures` | ENTIER | INT | Non | Heures gratuites de salle offertes/mois (ex: 4). |
| **ABO_ID** | Identifiant Abonnement| `id_abonnement` | ENTIER | BIGINT | Non | Clé primaire de l'abonnement souscrit. |
| **ABO_DEBUT** | Date Début Abonnement | `date_debut` | DATE | DATE | Non | Date de prise d'effet du contrat. |
| **ABO_FIN** | Date Fin Abonnement | `date_fin` | DATE | DATE | Oui | Date de résiliation ou d'échéance. |
| **RESA_ID** | Identifiant Réservation| `id_reservation` | ENTIER | BIGINT | Non | Clé primaire de la réservation. |
| **RESA_DEBUT**| Date/Heure Début | `date_heure_debut` | DATETIME | TIMESTAMP | Non | Horodatage du début du créneau réservé. |
| **RESA_FIN** | Date/Heure Fin | `date_heure_fin` | DATETIME | TIMESTAMP | Non | Horodatage de fin (`date_heure_fin > date_heure_debut`). |
| **RESA_STAT** | Statut Réservation | `statut` | TEXTE / ENUM | VARCHAR(20) | Non | `CONFIRMEE`, `ANNULEE`, `TERMINEE`. |
| **RESA_PRIX** | Montant Total HT | `montant_total` | MONETAIRE | DECIMAL(10,2) | Non | Montant facturable de la réservation. |
| **ATEL_ID** | Identifiant Atelier | `id_atelier` | ENTIER | BIGINT | Non | Clé primaire d'un atelier du jeudi soir. |
| **ATEL_TITRE**| Titre de l'Atelier | `titre` | TEXTE | VARCHAR(100) | Non | Thématique de l'événement. |
| **ATEL_MAX** | Jauge Maximale | `places_max` | ENTIER | INT | Non | Nombre maximal d'inscrits autorisés (RG-06). |
| **ATEL_INS** | Nombre d'Inscrits | `nb_inscrits` | ENTIER | INT | Non | Compteur de places réservées (`nb_inscrits <= places_max`). |
| **INSC_DATE** | Date d'Inscription | `date_inscription` | DATETIME | TIMESTAMP | Non | Propriété porteuse de la relation Utilisateur-Atelier. |
| **FACT_ID** | Identifiant Facture | `id_facture` | ENTIER | BIGINT | Non | Clé primaire de la facture comptable. |
| **FACT_REF** | Référence Facture | `reference` | TEXTE | VARCHAR(30) | Non | Numéro séquentiel immuable (ex: "FAC-2026-09-00123"). |
| **FACT_EMIS** | Date d'Émission | `date_emission` | DATE | DATE | Non | Date d'édition officielle de la facture. |
| **FACT_TTC** | Montant TTC | `montant_ttc` | MONETAIRE | DECIMAL(10,2) | Non | Calculé : `montant_ht + montant_tva`. |
