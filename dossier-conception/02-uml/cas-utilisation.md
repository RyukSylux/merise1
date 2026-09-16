# Diagramme des Cas d'Utilisation et Matrice de Couverture — CoWork'In

## 1. Rendu Visuel (Diagramme Mermaid)

```mermaid
graph LR
    subgraph "Plateforme CoWork'In"
        UC1("UC-01: Réserver un poste")
        UC2("UC-02: Réserver une salle")
        UC3("UC-03: S'inscrire à un atelier")
        UC4("UC-04: Annuler une réservation")
        UC5("UC-05: Registre de présence")
        UC6("UC-06: Maintenance salle")
        UC7("UC-07: TdB occupation")
        UC8("UC-08: Facturation mensuelle")
        
        UC_Auth("UC-09: S'authentifier")
        UC_Dispo("UC-10: Vérifier disponibilité")
        UC_Pay("UC-11: Payer complément")

        UC1 -->|include| UC_Auth
        UC1 -->|include| UC_Dispo

        UC2 -->|include| UC_Auth
        UC2 -->|include| UC_Dispo
        UC_Pay -.->|extend| UC2

        UC3 -->|include| UC_Auth
        UC4 -->|include| UC_Auth
    end

    Coworker((Coworker)) --> UC1
    Coworker --> UC2
    Coworker --> UC3
    Coworker --> UC4

    RefSoc((Référent Société)) -.->|généralise| Coworker

    Hote((Hôte d'accueil)) --> UC5
    Hote --> UC6

    Gerant((Gérant)) --> UC7

    Anim((Animateur Atelier)) --> UC3

    Planif((Planificateur)) --> UC8

    UC_Pay --> PSP((PSP Payment))
    UC1 --> Email((Service E-mail))
    UC2 --> Email
    UC3 --> Email
    UC8 --> Email
```

---

## 2. Justification des Frontières et des Relations

- **Frontière Système** : Tout ce qui est dans le rectangle "Plateforme CoWork'In" relève de la responsabilité du logiciel à développer. Les acteurs externes (PSP, Service E-mail, utilisateurs) se situent à l'extérieur.
- **Inclusions (`<<include>>`)** :
  - `UC-09 S'authentifier` est inclus systématiquement dans les actions nécessitant l'accès au compte client.
  - `UC-10 Vérifier disponibilité` est inclus dans la réservation de postes et salles pour empêcher les collisions.
- **Extensions (`<<extend>>`)** :
  - `UC-11 Payer le complément` est une extension facultative de `UC-02` (déclenchée uniquement si le quota d'heures gratuites est dépassé ou si l'utilisateur n'est pas abonné).

---

## 3. Matrice de Couverture Acteur x Cas d'Usage

| Acteur / UC | UC-01<br>Réserver poste | UC-02<br>Réserver salle | UC-03<br>Atelier | UC-04<br>Annuler | UC-05<br>Présence | UC-06<br>Maintenance | UC-07<br>TdB | UC-08<br>Facturation |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **A1 Coworker** | X (Principal) | X (Principal) | X (Principal) | X (Principal) | - | - | - | - |
| **A2 Référent Société** | X (Hérité) | X (Hérité) | X (Hérité) | X (Hérité) | - | - | - | X (Lecture) |
| **A3 Hôte d'accueil** | - | - | - | - | X (Principal) | X (Principal) | - | - |
| **A4 Gérant** | - | - | - | - | - | - | X (Principal) | X (Validation) |
| **A5 Animateur** | - | - | X (Gestion) | - | - | - | - | - |
| **A6 PSP (Paiement)** | X (Option) | X (Option) | - | X (Remb.) | - | - | - | - |
| **A7 Service E-mail** | X (Notif) | X (Notif) | X (Notif) | X (Notif) | - | - | - | X (Facture) |
| **A8 Planificateur** | - | - | - | - | - | - | - | X (Déclencheur)|
