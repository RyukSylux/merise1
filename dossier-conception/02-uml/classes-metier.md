# Diagramme des Classes Métier — Domain Model CoWork'In

## 1. Diagramme de Classes Métier (Mermaid)

```mermaid
classDiagram
    class Site {
        +Long id_site
        +String nom
        +String ville
        +String adresse
        +Integer capacite_max
    }

    class Espace {
        <<abstract>>
        +Long id_espace
        +String code
        +Integer etage
    }

    class Poste {
        +Boolean est_electrique
        +Boolean a_ecran_externe
    }

    class SalleReunion {
        +String nom_salle
        +Integer capacite_personnes
        +String equipements
        +Boolean est_maintenance
    }

    class Utilisateur {
        +Long id_utilisateur
        +String nom
        +String prenom
        +String email
        +String telephone
        +String role
        +DateTime date_creation
    }

    class Societe {
        +Long id_societe
        +String raison_sociale
        +String siret
        +String adresse_facturation
    }

    class Formule {
        +Long id_formule
        +String libelle
        +Decimal tarif_mensuel
        +Integer quota_salle_heures
    }

    class Abonnement {
        +Long id_abonnement
        +Date date_debut
        +Date date_fin
        +String statut
    }

    class Reservation {
        +Long id_reservation
        +DateTime date_heure_debut
        +DateTime date_heure_fin
        +String statut
        +Decimal montant_total
    }

    class Atelier {
        +Long id_atelier
        +String titre
        +String description
        +DateTime date_heure
        +Integer places_max
        +Integer nb_inscrits
        +Decimal tarif
    }

    class Inscription {
        +DateTime date_inscription
        +String statut_inscription
    }

    class Facture {
        +Long id_facture
        +String reference
        +Date date_emission
        +Decimal montant_ht
        +Decimal montant_tva
        +Decimal montant_ttc
        +String statut_paiement
    }

    class LigneFacture {
        +Long id_ligne
        +String description
        +Decimal quantite
        +Decimal prix_unitaire_ht
        +Decimal montant_ht
    }

    Espace <|-- Poste
    Espace <|-- SalleReunion

    Site "1" -- "1..*" Espace : contient
    Site "1" -- "0..*" Atelier : heberge

    Utilisateur "0..*" -- "0..1" Societe : appartient
    Utilisateur "1" -- "0..*" Abonnement : souscrit
    Formule "1" -- "0..*" Abonnement : definit

    Utilisateur "1" -- "0..*" Reservation : effectue
    Espace "1" -- "0..*" Reservation : concerne

    Utilisateur "0..*" -- "0..*" Atelier : s_inscrit
    (Utilisateur, Atelier) .. Inscription

    Utilisateur "0..1" -- "0..*" Facture : adresse_a
    Societe "0..1" -- "0..*" Facture : adresse_societe

    Facture "1" *-- "1..*" LigneFacture : compose_de
    Reservation "0..1" -- "0..1" LigneFacture : genere
```

---

## 2. Description des Entités du Domaine (13 Entités)

1. **Site** : Représente un établissement CoWork'In (Lille, Roubaix, Tourcoing).
2. **Espace** *(Classe abstraite)* : Entité générique pour toute ressource physique réservable d'un site.
3. **Poste** *(Spécialisation d'Espace)* : Bureau individuel (open space, bureau individuel electrifié).
4. **SalleReunion** *(Spécialisation d'Espace)* : Salle fermée équipée (visioconférence, capacité variable).
5. **Utilisateur** : Personne physique (coworker, référent, hôte d'accueil, gérant).
6. **Societe** : Entreprise cliente ayant rattaché un ou plusieurs collaborateurs.
7. **Formule** : Offre tarifaire (Nomade, Résident, Team) définissant le tarif et les quotas (4h/mois gratuites).
8. **Abonnement** : Contrat d'abonnement actif liant un utilisateur à une formule pour une période donnée.
9. **Reservation** : Acte de réservation d'un espace (poste ou salle) pour un créneau temporel précis.
10. **Atelier** : Événement communautaire organisé le jeudi soir avec une jauge maximale.
11. **Inscription** *(Classe d'association)* : Lien porteur de données (`date_inscription`) entre `Utilisateur` et `Atelier`.
12. **Facture** : Document comptable mensuel émis pour un utilisateur ou consolidé pour une société.
13. **LigneFacture** : Détail individuel des consommations (abonnements, dépassements de quota salle, ateliers).

---

## 3. Choix de Modélisation Importants

- **Héritage `Espace` -> `Poste` / `SalleReunion`** : Permet une gestion unifiée du calendrier de réservation (`Reservation` pointe sur `Espace`) tout en préservant les attributs spécifiques (équipements pour les salles, spécificités électriques pour les postes).
- **Gestion Particulier vs Société** : Préférence pour l'association optionnelle `Utilisateur` -- `Societe` plutôt qu'un héritage. Un utilisateur particulier qui crée son entreprise reste la même entité en base sans changement de classe.
- **Classe d'Association `Inscription`** : Porte la date d'inscription et le statut (Confirmé / Liste d'attente).
