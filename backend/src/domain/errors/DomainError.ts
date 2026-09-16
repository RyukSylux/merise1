export abstract class DomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class EntityNotFoundError extends DomainError {
  constructor(entityName: string, identifier: string | number) {
    super(`${entityName} avec l'identifiant ${identifier} est introuvable.`);
  }
}

export class RoomUnderMaintenanceError extends DomainError {
  constructor(salleNom: string) {
    super(`La salle "${salleNom}" est actuellement fermée pour maintenance (RG-04).`);
  }
}

export class OverlappingReservationError extends DomainError {
  constructor(message = "L'espace est déjà réservé sur cette plage horaire (RG-02).") {
    super(message);
  }
}

export class WorkshopFullError extends DomainError {
  constructor(titre: string) {
    super(`L'atelier "${titre}" a atteint sa jauge maximale de participants (RG-06).`);
  }
}

export class AlreadyRegisteredError extends DomainError {
  constructor(message = "L'utilisateur est déjà inscrit à cet atelier (RG-07).") {
    super(message);
  }
}

export class PastReservationCancellationError extends DomainError {
  constructor() {
    super("Impossible d'annuler une réservation dont l'heure de début est passée.");
  }
}

export class InvalidDateRangeError extends DomainError {
  constructor(message = "La date de fin doit être postérieure à la date de début.") {
    super(message);
  }
}
