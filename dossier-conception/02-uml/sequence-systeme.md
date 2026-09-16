# Diagramme de Séquence Système — UC-04 : Annuler une réservation

## 1. Rendu Visuel (Diagramme Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor C as Coworker
    participant S as Système CoWork'In
    participant PSP as PSP (Paiement)
    participant E as Service E-mail

    C->>S: 1. Demander la liste des réservations à venir
    S-->>C: 2. Afficher les réservations actives

    C->>S: 3. Sélectionner "Annuler la réservation" (idReservation)
    
    alt Délai > 24h (Nominal)
        S->>S: 4. Vérifier délai (>24h) -> Restitution 100%
        opt Payé par CB
            S->>PSP: 5. Ordonner remboursement (100%)
            PSP-->>S: 6. Confirmation remboursement OK
        end
        S->>S: 7. Passer statut à "ANNULEE" & Libérer créneau
        S->>E: 8. Déclencher e-mail de confirmation d'annulation
        S-->>C: 9. Message de succès (Remboursement intégral)

    else Délai <= 24h (Pénalité RG-09)
        S-->>C: 4b. Notification pénalité 50% & demande de confirmation
        C->>S: 5b. Confirmer annulation malgré la pénalité
        S->>S: 6b. Restitution 50% quota/montant
        opt Payé par CB
            S->>PSP: 7b. Ordonner remboursement (50%)
            PSP-->>S: 8b. Confirmation remboursement OK
        end
        S->>S: 9b. Passer statut à "ANNULEE_PENALITE" & Libérer créneau
        S->>E: 10b. Déclencher e-mail avec détail de la pénalité
        S-->>C: 11b. Message de succès (Avec retenue 50%)
    end
```

---

## 2. Analyse des Échanges Système

- **Entrées** : `idReservation`, identifiant de l'utilisateur authentifié.
- **Sorties** : Statut mis à jour, ordre de remboursement vers le PSP, notification d'annulation envoyée par mail, libération du créneau horaire de l'espace.
- **Opérations système identifiées** :
  1. `getReservationsAvenir(utilisateurId)`
  2. `annulerReservation(reservationId)`
  3. `calculerPenaliteAnnulation(reservationId)`
  4. `restituerQuotaAbonnement(utilisateurId, nbHeures)`
