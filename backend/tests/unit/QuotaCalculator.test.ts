import { describe, it, expect } from "vitest";
import { QuotaCalculator } from "../../src/domain/rules/QuotaCalculator.js";

describe("Domain Rule: QuotaCalculator (RG-03, RG-05)", () => {
  it("calcule 100% payant pour un coworker non-abonné", () => {
    const result = QuotaCalculator.calculerRepartition({
      estAbonne: false,
      quotaMensuelOffert: 0,
      heuresDejaConsommeesMois: 0,
      dureeDemandeeHeures: 3,
      tauxHoraireSalle: 25.0,
    });

    expect(result.heuresImputeesQuota).toBe(0);
    expect(result.heuresPayantes).toBe(3);
    expect(result.montantTotal).toBe(75.0);
    expect(result.quotaRestantApres).toBe(0);
  });

  it("impute la totalité sur le quota gratuit si l'abonné dispose de suffisamment d'heures", () => {
    const result = QuotaCalculator.calculerRepartition({
      estAbonne: true,
      quotaMensuelOffert: 4,
      heuresDejaConsommeesMois: 1, // Il lui reste 3h
      dureeDemandeeHeures: 2,
      tauxHoraireSalle: 25.0,
    });

    expect(result.heuresImputeesQuota).toBe(2);
    expect(result.heuresPayantes).toBe(0);
    expect(result.montantTotal).toBe(0.0);
    expect(result.quotaRestantApres).toBe(1);
  });

  it("scinde correctement entre heures gratuites et payantes lors d'un dépassement de quota", () => {
    const result = QuotaCalculator.calculerRepartition({
      estAbonne: true,
      quotaMensuelOffert: 4,
      heuresDejaConsommeesMois: 3, // Il ne reste que 1h offerte
      dureeDemandeeHeures: 3,     // Réservation demandée de 3h
      tauxHoraireSalle: 25.0,
    });

    expect(result.heuresImputeesQuota).toBe(1);
    expect(result.heuresPayantes).toBe(2);
    expect(result.montantTotal).toBe(50.0); // 2h * 25€
    expect(result.quotaRestantApres).toBe(0);
  });
});
