# Diagramme de Séquence Détaillée — UC-04 : Annuler une réservation

## 1. Rendu Visuel Multi-Couches (Diagramme Mermaid)

```mermaid
sequenceDiagram
    autonumber
    actor C as Coworker
    participant Ctrl as ReservationController
    participant Svc as ReservationService
    participant Quota as QuotaService
    participant Pay as PaymentService
    participant Repo as ReservationRepository
    participant DB as Base de Données
    participant Notif as NotificationService

    C->>Ctrl: DELETE /api/v1/reservations/{id}
    Ctrl->>Svc: cancelReservation(reservationId, userId)
    
    Svc->>Repo: findById(reservationId)
    Repo->>DB: SELECT * FROM reservation WHERE id = ?
    DB-->>Repo: reservationData
    Repo-->>Svc: Reservation entity

    Svc->>Svc: checkOwnershipAndStatus()
    Svc->>Svc: calculateDelayHours()

    alt Délai > 24h
        Svc->>Svc: set refundPercentage = 1.00
    else Délai <= 24h (Pénalité RG-09)
        Svc->>Svc: set refundPercentage = 0.50
    end

    alt Quota Utilisé
        Svc->>Quota: restoreQuota(userId, hours * refundPercentage)
        Quota->>DB: UPDATE abonnement SET quota_restant = quota_restant + ?
        DB-->>Quota: OK
        Quota-->>Svc: quotaUpdated
    else Payé par CB
        Svc->>Pay: refundPayment(transactionId, amount * refundPercentage)
        Pay-->>Svc: refundSuccess
    end

    Svc->>Repo: updateStatus(reservationId, "ANNULEE")
    Repo->>DB: UPDATE reservation SET statut = 'ANNULEE'
    DB-->>Repo: OK
    Repo-->>Svc: entityUpdated

    Svc->>Notif: sendCancellationEmail(userId, reservationDetails)
    Notif-->>Svc: emailEnqueued

    Svc-->>Ctrl: CancellationResultDTO
    Ctrl-->>C: 200 OK (Statut mis à jour)
```

---

## 2. Opérations Méthodes Extraites pour le Diagramme de Classes

Le déroulement de ce scénario détaillé fait émerger les **méthodes et responsabilités** suivantes qui enrichissent notre modèle applicatif :

1. `ReservationService::cancelReservation(reservationId: Long, userId: Long): CancellationResultDTO`
2. `QuotaService::restoreQuota(userId: Long, hoursToRestore: Integer): Boolean`
3. `PaymentService::refundPayment(transactionId: String, amount: Decimal): PaymentStatus`
4. `ReservationRepository::updateStatus(reservationId: Long, newStatus: String): Boolean`
