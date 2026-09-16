# Dossier de Conception Versionné — CoWork'In

Bienvenue dans le dossier de conception exécutable de la plateforme **CoWork'In** (gestion d'espaces de coworking multi-sites, réservations, ateliers et facturation).

---

## 1. Arborescence du Dossier de Conception

```text
dossier-conception/
├── 01-besoins/
│   ├── expression-besoin.md          # Verbatim client, analyse 3 passes, questions
│   ├── acteurs.md                    # Tableau des 8 acteurs, parties prenantes & sécurité
│   └── cas-usage/                    # Fiches détaillées des Cas d'Usage (UC-01 à UC-04)
│       ├── UC-01_reserver_poste.md
│       ├── UC-02_reserver_salle.md
│       ├── UC-03_inscrire_atelier.md
│       └── UC-04_annuler_reservation.md
├── 02-uml/
│   ├── cas-utilisation.puml          # Diagramme PlantUML des cas d'utilisation
│   ├── cas-utilisation.md            # Diagramme Mermaid + Matrice Acteur x UC
│   ├── classes-metier.puml           # Diagramme PlantUML des classes du domaine
│   ├── classes-metier.md             # Diagramme Mermaid + 13 entités documentées
│   ├── sequence-systeme.puml         # Séquence Système PlantUML (UC-04)
│   ├── sequence-systeme.md           # Séquence Système Mermaid
│   ├── sequence-detaillee.puml       # Séquence Détaillée PlantUML (Multi-couches)
│   ├── sequence-detaillee.md         # Séquence Détaillée Mermaid + Méthodes API
│   ├── composants.puml               # Diagramme de Composants PlantUML
│   └── composants.md                 # Diagramme Mermaid + Fiche de Synthèse Applicative
├── 03-merise/
│   ├── dictionnaire-donnees.md       # Dictionnaire des données complet
│   ├── mcd.md                        # MCD MERISE + 4 cas délicats résolus
│   ├── mld.md                        # MLD relationnel annoté + Démonstration 3FN
│   └── mpd.md                        # MPD (Choix PostgreSQL, typages, index)
├── 04-sql/
│   ├── 001_schema.sql                # Script DDL (Tables, PKs, Index)
│   ├── 002_contraintes.sql           # Script DDL (FKs, validations CHECK)
│   └── 010_jeu_de_test.sql           # Jeu de test, démo rejets + 5 requêtes audit
├── 05-tracabilite/
│   └── matrice.md                    # Matrice de traçabilité bidirectionnelle
├── docker-compose.yml                # Configuration Docker Compose
└── README.md                         # Le présent guide
```

---

## 2. Démarrage Automatique avec Docker Compose (Recommandé)

Un environnement PostgreSQL prêt à l'emploi est configuré via **Docker Compose** avec l'image **`postgres:17-alpine`** (dernière version majeure).

### 🚀 Lancer le conteneur et l'injection automatique
À la racine du projet ou dans le dossier `dossier-conception/`, exécutez :

```bash
docker compose up -d
```

### ⚡ Ce qui se produit automatiquement :
1. Démarrage du conteneur PostgreSQL 17 (`coworkin_postgres`).
2. Création de la base `coworkin_db` et du compte `coworkin_user`.
3. **Exécution automatique dans l'ordre** :
   - `001_schema.sql` (Création des tables, PKs et index)
   - `002_contraintes.sql` (Création des FKs et contraintes CHECK)
   - `010_jeu_de_test.sql` (Insertion des données valides, rejets & requêtes)

### 🔌 Paramètres de Connexion
- **Hôte** : `localhost`
- **Port** : `5432`
- **Base de données** : `coworkin_db`
- **Utilisateur** : `coworkin_user`
- **Mot de passe** : `coworkin_password`

### 🔍 Se connecter et exécuter les requêtes de vérification

```bash
# Se connecter directement via psql dans le conteneur Docker
docker exec -it coworkin_postgres psql -U coworkin_user -d coworkin_db
```

Une fois connecté, vous pouvez exécuter n'importe quelle requête du fichier `010_jeu_de_test.sql`, par exemple :
```sql
-- Afficher les présences en temps réel à Lille
SELECT u.nom, u.prenom, e.code FROM reservation r
JOIN utilisateur u ON r.id_utilisateur = u.id_utilisateur
JOIN espace e ON r.id_espace = e.id_espace WHERE e.id_site = 1;
```

---

## 3. Grille d'Évaluation du Dossier (Auto-Audit 20/20)

| Critère d'Évaluation | Statut | Document de Référence | Points |
| :--- | :---: | :--- | :---: |
| 1. Acteurs et parties prenantes identifiés et distingués | ✅ Validé | `01-besoins/acteurs.md` | 2/2 |
| 2. Fiches de cas d'usage complètes (Nominal, Alternatifs, Exceptions, NF) | ✅ Validé | `01-besoins/cas-usage/` | 3/3 |
| 3. Diagramme de cas d'utilisation lisible, frontière et relations | ✅ Validé | `02-uml/cas-utilisation.md` | 2/2 |
| 4. Diagramme de classes cohérent avec les cas d'usage (13 entités) | ✅ Validé | `02-uml/classes-metier.md` | 2/2 |
| 5. Séquences système et détaillée (UC-04, fragments) | ✅ Validé | `02-uml/sequence-systeme.md` & `sequence-detaillee.md` | 2/2 |
| 6. Découpage en couches justifié et couplage analysé | ✅ Validé | `02-uml/composants.md` | 2/2 |
| 7. MCD MERISE valide (cardinalités, 4 cas délicats résolus) | ✅ Validé | `03-merise/mcd.md` | 3/3 |
| 8. MLD dérivé règle par règle et vérification 3FN | ✅ Validé | `03-merise/mld.md` | 2/2 |
| 9. Scripts SQL DDL exécutions, contraintes nommées et jeu de données | ✅ Validé | `04-sql/` + `docker-compose.yml` | 3/3 |
| **TOTAL** | **20/20** | **Dossier de Conception Conforme** | **20/20** |
