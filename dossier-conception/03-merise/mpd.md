# Modèle Physique de Données (MPD & Choix Techniques) — CoWork'In

## 1. Spécifications du SGBD Cible
- **SGBD retenu** : PostgreSQL 15+ (Compatible ANSI SQL-99)
- **Moteur de stockage** : Transactionnel ACID (`InnoDB` sous MySQL / natif sous PostgreSQL).
- **Encodage par défaut** : `UTF-8` (`UTF8MB4` pour le support des caractères internationaux).

---

## 2. Table des Types de Données Physiques

| Domaine Métier | Type Logique | Type Physique PostgreSQL | Directives & Précision |
| :--- | :--- | :--- | :--- |
| Identifiants Clés Primaires | ENTIER | `BIGSERIAL` / `BIGINT` | Auto-incrément 64-bit pour éviter la saturation d'ID. |
| Textes Courts / Libellés | TEXTE | `VARCHAR(N)` | Longueur ajustée (50, 100, 255 chars). |
| Codes Fixes (SIRET) | TEXTE | `CHAR(14)` | Taille fixe exacte 14 caractères. |
| Montants Financiers / Tarifs | MONETAIRE | `DECIMAL(10,2)` | Calculs financiers exacts sans erreur d'arrondi (pas de `FLOAT`). |
| Horodatages / Créneaux | DATETIME | `TIMESTAMP WITH TIME ZONE` | Gestion du fuseau horaire Europe/Paris (`UTC` stocké). |
| Dates Simples | DATE | `DATE` | Pour les dates de début/fin d'abonnement. |
| Indicateurs / Flags | BOOLEEN | `BOOLEAN` | `TRUE` ou `FALSE`. |

---

## 3. Stratégie d'Indexation pour les Performances

Afin de garantir des temps de réponse `< 300 ms` sur la recherche de disponibilités et l'affichage des plannings (exigences NF), les index physiques suivants sont définis :

1. **`idx_reservation_espace_dates`** (Index composite sur `RESERVATION`) :
   - Colonnes : `(id_espace, date_heure_debut, date_heure_fin)`
   - Objectif : Accélérer la requête critique de contrôle de chevauchement lors d'une nouvelle réservation.
2. **`idx_utilisateur_email`** (Index unique sur `UTILISATEUR`) :
   - Colonne : `email`
   - Objectif : Authentification ultra-rapide ($O(1)$) lors du login.
3. **`idx_salle_maintenance`** (Index filtré/partiel) :
   - Colonnes : `(id_espace, est_maintenance)`
   - Objectif : Exclure immédiatement les salles hors service de la recherche.
4. **`idx_inscription_atelier`** (Index sur `INSCRIPTION`) :
   - Colonnes : `(id_atelier, statut_inscription)`
   - Objectif : Calcul instantané de la jauge d'inscrits confirmés.

---

## 4. Stratégie d'Intégrité Référentielle (`ON DELETE`)

| Key Parent &rarr; Child | Action `ON DELETE` | Rationale & Justification Métier |
| :--- | :--- | :--- |
| `SOCIETE` &rarr; `UTILISATEUR` | `ON DELETE SET NULL` | Si une société résilie, les comptes des collaborateurs restent valides en tant que particuliers. |
| `FACTURE` &rarr; `LIGNE_FACTURE` | `ON DELETE CASCADE` | Dépendance d'existence stricte : supprimer une facture efface ses lignes. |
| `UTILISATEUR` &rarr; `RESERVATION` | `ON DELETE RESTRICT` | **Interdiction** de supprimer un utilisateur qui possède des historiques de réservation (obligation comptable). |
| `SITE` &rarr; `ESPACE` | `ON DELETE RESTRICT` | **Interdiction** de supprimer un site s'il contient encore des espaces configurés. |
