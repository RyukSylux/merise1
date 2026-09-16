import { InvalidDateRangeError, PastReservationCancellationError } from "../errors/DomainError.js";

export type StatutReservation = "CONFIRMEE" | "ANNULEE" | "ANNULEE_PENALITE" | "TERMINEE";

export interface ReservationProps {
  idReservation?: number;
  dateHeureDebut: Date;
  dateHeureFin: Date;
  statut?: StatutReservation;
  montantTotal?: number;
  idUtilisateur: number;
  idEspace: number;
}

export class Reservation {
  readonly idReservation?: number;
  readonly dateHeureDebut: Date;
  readonly dateHeureFin: Date;
  statut: StatutReservation;
  montantTotal: number;
  readonly idUtilisateur: number;
  readonly idEspace: number;

  constructor(props: ReservationProps) {
    if (props.dateHeureFin <= props.dateHeureDebut) {
      throw new InvalidDateRangeError("La date de fin doit être strictement postérieure à la date de début.");
    }
    this.idReservation = props.idReservation;
    this.dateHeureDebut = props.dateHeureDebut;
    this.dateHeureFin = props.dateHeureFin;
    this.statut = props.statut ?? "CONFIRMEE";
    this.montantTotal = Number(props.montantTotal ?? 0);
    this.idUtilisateur = props.idUtilisateur;
    this.idEspace = props.idEspace;
  }

  get dureeEnHeures(): number {
    const diffMs = this.dateHeureFin.getTime() - this.dateHeureDebut.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60));
  }

  get estActive(): boolean {
    return this.statut === "CONFIRMEE";
  }

  chevauche(autreDebut: Date, autreFin: Date): boolean {
    return this.dateHeureDebut < autreFin && this.dateHeureFin > autreDebut;
  }

  /**
   * Annulation de la réservation selon les règles RG-08 / RG-09.
   * @param dateAnnulation Date à laquelle la demande d'annulation est traitée
   * @returns Le pourcentage de remboursement ou recrédit (1.0 = 100%, 0.5 = 50%)
   */
  annuler(dateAnnulation: Date = new Date()): { remboursementRatio: number; penaliteAppliquee: boolean } {
    if (dateAnnulation >= this.dateHeureDebut) {
      throw new PastReservationCancellationError();
    }

    const diffHours = (this.dateHeureDebut.getTime() - dateAnnulation.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      // RG-08 : Annulation > 24h avant = sans pénalité (100% recrédit/remboursement)
      this.statut = "ANNULEE";
      return { remboursementRatio: 1.0, penaliteAppliquee: false };
    } else {
      // RG-09 : Annulation < 24h avant = pénalité 50%
      this.statut = "ANNULEE_PENALITE";
      return { remboursementRatio: 0.5, penaliteAppliquee: true };
    }
  }
}
