import { describe, it, expect } from "vitest";
import { Reservation } from "../../../src/domain/entities/Reservation.js";
import {
  InvalidDateRangeError,
  PastReservationCancellationError,
} from "../../../src/domain/errors/DomainError.js";

describe("TDD Palier 1 — Entité Domaine: Reservation", () => {
  it("doit refuser une réservation dont la date de fin est antérieure ou égale à la date de début", () => {
    const debut = new Date("2026-10-10T14:00:00Z");
    const finInvalide = new Date("2026-10-10T13:00:00Z");

    expect(
      () =>
        new Reservation({
          idUtilisateur: 1,
          idEspace: 5,
          dateHeureDebut: debut,
          dateHeureFin: finInvalide,
        })
    ).toThrow(InvalidDateRangeError);
  });

  it("calcule correctement la durée arrondie en heures", () => {
    const debut = new Date("2026-10-10T14:00:00Z");
    const fin2h = new Date("2026-10-10T16:00:00Z");

    const resa = new Reservation({
      idUtilisateur: 1,
      idEspace: 5,
      dateHeureDebut: debut,
      dateHeureFin: fin2h,
    });

    expect(resa.dureeEnHeures).toBe(2);
  });

  it("détecte correctement le chevauchement avec une autre plage horaire (RG-02)", () => {
    const debut = new Date("2026-10-10T14:00:00Z");
    const fin = new Date("2026-10-10T16:00:00Z");

    const resa = new Reservation({
      idUtilisateur: 1,
      idEspace: 5,
      dateHeureDebut: debut,
      dateHeureFin: fin,
    });

    // Cas qui se chevauchent
    expect(resa.chevauche(new Date("2026-10-10T15:00:00Z"), new Date("2026-10-10T17:00:00Z"))).toBe(true);
    expect(resa.chevauche(new Date("2026-10-10T13:00:00Z"), new Date("2026-10-10T15:00:00Z"))).toBe(true);
    expect(resa.chevauche(new Date("2026-10-10T14:30:00Z"), new Date("2026-10-10T15:30:00Z"))).toBe(true);

    // Cas disjoints (collés ou éloignés)
    expect(resa.chevauche(new Date("2026-10-10T12:00:00Z"), new Date("2026-10-10T14:00:00Z"))).toBe(false);
    expect(resa.chevauche(new Date("2026-10-10T16:00:00Z"), new Date("2026-10-10T18:00:00Z"))).toBe(false);
  });

  it("applique l'annulation selon le préavis (>24h sans pénalité, <24h avec 50% de pénalité)", () => {
    const debut = new Date("2026-10-10T14:00:00Z");
    const fin = new Date("2026-10-10T16:00:00Z");

    // Annulation > 24h
    const resa1 = new Reservation({
      idUtilisateur: 1,
      idEspace: 5,
      dateHeureDebut: debut,
      dateHeureFin: fin,
      montantTotal: 50.0,
    });
    const resAnnulation1 = resa1.annuler(new Date("2026-10-09T10:00:00Z"));
    expect(resAnnulation1.remboursementRatio).toBe(1.0);
    expect(resa1.statut).toBe("ANNULEE");

    // Annulation < 24h
    const resa2 = new Reservation({
      idUtilisateur: 1,
      idEspace: 5,
      dateHeureDebut: debut,
      dateHeureFin: fin,
      montantTotal: 50.0,
    });
    const resAnnulation2 = resa2.annuler(new Date("2026-10-10T08:00:00Z"));
    expect(resAnnulation2.remboursementRatio).toBe(0.5);
    expect(resa2.statut).toBe("ANNULEE_PENALITE");
  });

  it("rejette l'annulation si la réservation est déjà commencée ou passée", () => {
    const debut = new Date("2026-10-10T14:00:00Z");
    const fin = new Date("2026-10-10T16:00:00Z");

    const resa = new Reservation({
      idUtilisateur: 1,
      idEspace: 5,
      dateHeureDebut: debut,
      dateHeureFin: fin,
    });

    expect(() => resa.annuler(new Date("2026-10-10T15:00:00Z"))).toThrow(
      PastReservationCancellationError
    );
  });
});
