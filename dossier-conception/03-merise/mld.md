# Modèle Logique de Données (MLD Relationnel Annoté) & Normalisation 3FN

## 1. Schéma Relationnel Annoté (MLD MERISE)

Chaque table est issue de l'application rigoureuse des règles de passage du MCD au MLD.

```text
SITE (
    id_site INT [PK],
    nom VARCHAR(50) NOT NULL,
    ville VARCHAR(50) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    capacite_max INT NOT NULL
)
Règle MERISE : R1 (Entité normale -> Table)

SOCIETE (
    id_societe INT [PK],
    raison_sociale VARCHAR(100) NOT NULL,
    siret CHAR(14) NOT NULL UNIQUE,
    adresse_facturation VARCHAR(255) NOT NULL
)
Règle MERISE : R1 (Entité normale -> Table)

UTILISATEUR (
    id_utilisateur INT [PK],
    nom VARCHAR(50) NOT NULL,
    prenom VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    telephone VARCHAR(20),
    role VARCHAR(30) NOT NULL,
    date_creation TIMESTAMP NOT NULL,
    id_societe INT [FK -> SOCIETE.id_societe NULLABLE]
)
Règle MERISE : R2 (Association 0,N - 0,1 : Migration id_societe en FK)

FORMULE (
    id_formule INT [PK],
    libelle VARCHAR(50) NOT NULL,
    tarif_mensuel DECIMAL(10,2) NOT NULL,
    quota_salle_heures INT NOT NULL
)
Règle MERISE : R1 (Entité normale -> Table)

ABONNEMENT (
    id_abonnement INT [PK],
    date_debut DATE NOT NULL,
    date_fin DATE,
    statut VARCHAR(20) NOT NULL,
    id_utilisateur INT NOT NULL [FK -> UTILISATEUR.id_utilisateur],
    id_formule INT NOT NULL [FK -> FORMULE.id_formule]
)
Règle MERISE : R2 (Associations 1,1 -> Migration des FKs Utilisateur et Formule)

ESPACE (
    id_espace INT [PK],
    code VARCHAR(20) NOT NULL UNIQUE,
    etage INT NOT NULL,
    id_site INT NOT NULL [FK -> SITE.id_site]
)
Règle MERISE : R1 + R2 (Migration id_site)

POSTE (
    id_espace INT [PK, FK -> ESPACE.id_espace],
    est_electrique BOOLEAN NOT NULL DEFAULT TRUE,
    a_ecran_externe BOOLEAN NOT NULL DEFAULT FALSE
)
Règle MERISE : R4 (Héritage par classe fille - Clé primaire partagée avec la table mère)

SALLE_REUNION (
    id_espace INT [PK, FK -> ESPACE.id_espace],
    nom_salle VARCHAR(50) NOT NULL,
    capacite_personnes INT NOT NULL,
    equipements TEXT,
    est_maintenance BOOLEAN NOT NULL DEFAULT FALSE
)
Règle MERISE : R4 (Héritage par classe fille - Clé primaire partagée avec la table mère)

RESERVATION (
    id_reservation INT [PK],
    date_heure_debut TIMESTAMP NOT NULL,
    date_heure_fin TIMESTAMP NOT NULL,
    statut VARCHAR(20) NOT NULL,
    montant_total DECIMAL(10,2) NOT NULL,
    id_utilisateur INT NOT NULL [FK -> UTILISATEUR.id_utilisateur],
    id_espace INT NOT NULL [FK -> ESPACE.id_espace]
)
Règle MERISE : R2 (Migration des FKs Utilisateur et Espace)

ATELIER (
    id_atelier INT [PK],
    titre VARCHAR(100) NOT NULL,
    description TEXT,
    date_heure TIMESTAMP NOT NULL,
    places_max INT NOT NULL,
    nb_inscrits INT NOT NULL DEFAULT 0,
    tarif DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    id_site INT NOT NULL [FK -> SITE.id_site]
)
Règle MERISE : R1 + R2 (Migration id_site)

INSCRIPTION (
    id_utilisateur INT [PK, FK -> UTILISATEUR.id_utilisateur],
    id_atelier INT [PK, FK -> ATELIER.id_atelier],
    date_inscription TIMESTAMP NOT NULL,
    statut_inscription VARCHAR(20) NOT NULL DEFAULT 'CONFIRMEE'
)
Règle MERISE : R3 (Association N,N porteuse -> Table de liaison avec clé primaire composée)

FACTURE (
    id_facture INT [PK],
    reference VARCHAR(30) NOT NULL UNIQUE,
    date_emission DATE NOT NULL,
    montant_ht DECIMAL(10,2) NOT NULL,
    montant_tva DECIMAL(10,2) NOT NULL,
    montant_ttc DECIMAL(10,2) NOT NULL,
    statut_paiement VARCHAR(20) NOT NULL,
    id_utilisateur INT [FK -> UTILISATEUR.id_utilisateur NULLABLE],
    id_societe INT [FK -> SOCIETE.id_societe NULLABLE]
)
Règle MERISE : R2 (Migration des FKs optionnelles Utilisateur ou Société)

LIGNE_FACTURE (
    id_facture INT [PK, FK -> FACTURE.id_facture ON DELETE CASCADE],
    num_ligne INT [PK],
    description VARCHAR(255) NOT NULL,
    quantite DECIMAL(10,2) NOT NULL,
    prix_unitaire_ht DECIMAL(10,2) NOT NULL,
    montant_ht DECIMAL(10,2) NOT NULL,
    id_reservation INT [FK -> RESERVATION.id_reservation NULLABLE]
)
Règle MERISE : R5 (Entité faible -> Clé primaire composée englobant la FK de la facture parente)
```

---

## 2. Démonstration de la Normalisation (Passage de 0FN à 3FN)

### Situation Initiale (Tableau Brut 0FN issue du Tableur Excel)
`RESERVATION_BRUTE(nom_coworker, email, nom_societe, siret, nom_site, ville_site, code_salle, nom_salle, capacite_salle, date_reservation, heures, prix_heure, formule_abonne, quota_restant)`

- **Problèmes de la 0FN** : Doublons massifs, anomalies d'insertion (impossible d'ajouter une salle sans réservation), anomalies de suppression (supprimer la dernière réservation efface l'existence de la salle).

### Passage en 1ère Forme Normale (1FN)
- **Condition** : Tous les attributs sont atomiques (indivisibles) et une clé primaire candidate est définie.
- **Action** : Séparation des champs composés (ex: `nom_coworker` décomposé en `nom` et `prenom`, dates structurées).

### Passage en 2ème Forme Normale (2FN)
- **Condition** : Être en 1FN et tout attribut n'appartenant pas à la clé doit dépendre de la **totalité** de la clé (dépendance fonctionnelle pleine).
- **Action** : Extraction des dépendances partielles :
  - `nom_site`, `ville_site` dépendent de `id_site` (et non de la réservation).
  - `siret`, `nom_societe` dépendent de `id_societe`.
  - `capacite_salle` dépend de `id_espace`.

### Passage en 3ème Forme Normale (3FN)
- **Condition** : Être en 2FN et tout attribut non-clé ne doit pas dépendre d'un autre attribut non-clé (absence de dépendance transitive : $X \rightarrow Y \rightarrow Z$).
- **Action** : Extraction des formules d'abonnement :
  - `quota_salle_heures` et `tarif_mensuel` dépendent du libellé de la `FORMULE` et non directement de l'utilisateur.
  - Séparation de `FORMULE` et `ABONNEMENT`.

> [!TIP]
> **Conclusion** : Le MLD relationnel dérivé du MCD MERISE vérifie la **3ème Forme Normale (3FN)** sur l'intégralité de ses 13 relations.
