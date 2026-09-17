import { describe, it, expect } from "vitest";
import { Atelier, Inscription } from "../../../src/domain/entities/Atelier.js";
import { WorkshopFullError } from "../../../src/domain/errors/DomainError.js";

describe("TDD Palier 1 — Entités Domaine: Atelier & Inscription", () => {
  it("interdit la création d'un atelier avec une jauge placesMax <= 0", () => {
    expect(
      () =>
        new Atelier({
          titre: "Atelier Test",
          dateHeure: new Date("2026-10-15T18:00:00Z"),
          placesMax: 0,
          idSite: 1,
        })
    ).toThrow("Le nombre de places maximum d'un atelier doit être supérieur à zéro.");
  });

  it("gère l'inscription des participants et lève WorkshopFullError quand la jauge est atteinte (RG-06)", () => {
    const atelier = new Atelier({
      idAtelier: 1,
      titre: "Pitch & Networking",
      dateHeure: new Date("2026-10-15T18:00:00Z"),
      placesMax: 2,
      nbInscrits: 0,
      idSite: 1,
    });

    expect(atelier.placesRestantes).toBe(2);
    expect(atelier.estComplet).toBe(false);

    // 1ère inscription
    atelier.inscrireParticipant();
    expect(atelier.nbInscrits).toBe(1);
    expect(atelier.placesRestantes).toBe(1);

    // 2ème inscription
    atelier.inscrireParticipant();
    expect(atelier.nbInscrits).toBe(2);
    expect(atelier.placesRestantes).toBe(0);
    expect(atelier.estComplet).toBe(true);

    // 3ème tentative -> Doit échouer avec l'erreur du domaine
    expect(() => atelier.inscrireParticipant()).toThrow(WorkshopFullError);
  });

  it("décrémente le nombre d'inscrits lors d'une désinscription sans descendre sous zéro", () => {
    const atelier = new Atelier({
      titre: "Atelier Dev",
      dateHeure: new Date("2026-10-15T18:00:00Z"),
      placesMax: 5,
      nbInscrits: 1,
      idSite: 1,
    });

    atelier.desinscrireParticipant();
    expect(atelier.nbInscrits).toBe(0);

    atelier.desinscrireParticipant(); // Ne doit pas être négatif
    expect(atelier.nbInscrits).toBe(0);
  });

  it("gère l'annulation d'une inscription", () => {
    const inscription = new Inscription({
      idUtilisateur: 10,
      idAtelier: 1,
      statutInscription: "CONFIRMEE",
    });

    expect(inscription.statutInscription).toBe("CONFIRMEE");
    inscription.annuler();
    expect(inscription.statutInscription).toBe("ANNULEE");
  });
});
