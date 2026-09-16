import { describe, it, expect } from "vitest";
import { CancellationPolicy } from "../../src/domain/rules/CancellationPolicy.js";
import { PastReservationCancellationError } from "../../src/domain/errors/DomainError.js";

describe("Domain Rule: CancellationPolicy (RG-08, RG-09)", () => {
  it("applique 100% de remboursement sans pénalité si l'annulation a lieu plus de 24h avant", () => {
    const debut = new Date("2026-10-10T14:00:00Z");
    const dateAnnulation = new Date("2026-10-09T10:00:00Z"); // 28h avant

    const result = CancellationPolicy.evaluer(debut, 100.0, 2, dateAnnulation);

    expect(result.statutFinal).toBe("ANNULEE");
    expect(result.ratioRemboursement).toBe(1.0);
    expect(result.montantRembourse).toBe(100.0);
    expect(result.montantPenaliteConserve).toBe(0);
    expect(result.heuresQuotaRecreditees).toBe(2);
  });

  it("applique 50% de pénalité si l'annulation a lieu moins de 24h avant le début", () => {
    const debut = new Date("2026-10-10T14:00:00Z");
    const dateAnnulation = new Date("2026-10-10T08:00:00Z"); // 6h avant

    const result = CancellationPolicy.evaluer(debut, 100.0, 2, dateAnnulation);

    expect(result.statutFinal).toBe("ANNULEE_PENALITE");
    expect(result.ratioRemboursement).toBe(0.5);
    expect(result.montantRembourse).toBe(50.0);
    expect(result.montantPenaliteConserve).toBe(50.0);
    expect(result.heuresQuotaRecreditees).toBe(1);
  });

  it("rejette l'annulation si la réservation est déjà commencée ou passée", () => {
    const debut = new Date("2026-10-10T14:00:00Z");
    const dateAnnulation = new Date("2026-10-10T14:30:00Z"); // Après le début

    expect(() => CancellationPolicy.evaluer(debut, 100.0, 2, dateAnnulation)).toThrow(
      PastReservationCancellationError
    );
  });
});
