import { PastReservationCancellationError } from "../errors/DomainError.js";

export interface CancellationResult {
  statutFinal: "ANNULEE" | "ANNULEE_PENALITE";
  ratioRemboursement: number; // 1.0 (100%) ou 0.5 (50%)
  montantRembourse: number;
  montantPenaliteConserve: number;
  heuresQuotaRecreditees: number;
  message: string;
}

export class CancellationPolicy {
  /**
   * Évalue la politique d'annulation selon le préavis (RG-08 / RG-09).
   * @param dateHeureDebut Début de la réservation
   * @param montantTotal Montant réglé pour la réservation
   * @param heuresQuotaImputees Heures de quota débitées lors de la réservation
   * @param dateAnnulation Date à laquelle l'annulation est soumise
   */
  static evaluer(
    dateHeureDebut: Date,
    montantTotal: number,
    heuresQuotaImputees: number,
    dateAnnulation: Date = new Date()
  ): CancellationResult {
    if (dateAnnulation >= dateHeureDebut) {
      throw new PastReservationCancellationError();
    }

    const diffHours = (dateHeureDebut.getTime() - dateAnnulation.getTime()) / (1000 * 60 * 60);

    if (diffHours >= 24) {
      // RG-08 : Annulation > 24h avant -> 100% recrédit/remboursement sans pénalité
      return {
        statutFinal: "ANNULEE",
        ratioRemboursement: 1.0,
        montantRembourse: montantTotal,
        montantPenaliteConserve: 0,
        heuresQuotaRecreditees: heuresQuotaImputees,
        message: "Annulation effectuée dans les délais (> 24h). Remboursement / recrédit intégral.",
      };
    } else {
      // RG-09 : Annulation < 24h avant -> pénalité de 50%
      const montantRembourse = Math.round(montantTotal * 0.5 * 100) / 100;
      const montantPenalite = Math.round((montantTotal - montantRembourse) * 100) / 100;
      const heuresRecreditees = Math.floor(heuresQuotaImputees * 0.5);

      return {
        statutFinal: "ANNULEE_PENALITE",
        ratioRemboursement: 0.5,
        montantRembourse,
        montantPenaliteConserve: montantPenalite,
        heuresQuotaRecreditees: heuresRecreditees,
        message: "Annulation tardive (< 24h). Une pénalité de 50% est appliquée.",
      };
    }
  }
}
