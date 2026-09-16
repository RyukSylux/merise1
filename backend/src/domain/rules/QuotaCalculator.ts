export interface QuotaComputationInput {
  estAbonne: boolean;
  quotaMensuelOffert: number; // Habituellement 4h
  heuresDejaConsommeesMois: number;
  dureeDemandeeHeures: number;
  tauxHoraireSalle: number; // Ex: 25.00 €/h
}

export interface QuotaComputationResult {
  heuresImputeesQuota: number;
  heuresPayantes: number;
  montantTotal: number;
  quotaRestantApres: number;
}

export class QuotaCalculator {
  /**
   * Calcule la répartition entre heures gratuites déduites du quota et heures payantes.
   * RG-03 : 4h offertes par mois civil pour les formules d'abonnés.
   */
  static calculerRepartition(input: QuotaComputationInput): QuotaComputationResult {
    const {
      estAbonne,
      quotaMensuelOffert,
      heuresDejaConsommeesMois,
      dureeDemandeeHeures,
      tauxHoraireSalle,
    } = input;

    if (!estAbonne) {
      // Non-abonné : 100% payant au tarif horaire
      const montant = Math.round(dureeDemandeeHeures * tauxHoraireSalle * 100) / 100;
      return {
        heuresImputeesQuota: 0,
        heuresPayantes: dureeDemandeeHeures,
        montantTotal: montant,
        quotaRestantApres: 0,
      };
    }

    // Abonné : calcul du solde restant
    const soldeDisponible = Math.max(0, quotaMensuelOffert - heuresDejaConsommeesMois);
    const heuresImputees = Math.min(soldeDisponible, dureeDemandeeHeures);
    const heuresPayantes = Math.max(0, dureeDemandeeHeures - heuresImputees);
    const montantTotal = Math.round(heuresPayantes * tauxHoraireSalle * 100) / 100;
    const quotaRestantApres = Math.max(0, soldeDisponible - heuresImputees);

    return {
      heuresImputeesQuota: heuresImputees,
      heuresPayantes,
      montantTotal,
      quotaRestantApres,
    };
  }
}
