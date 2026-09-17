import { describe, it, expect } from "vitest";
import { Poste, SalleReunion } from "../../../src/domain/entities/Espace.js";

describe("TDD Palier 1 — Entités Domaine: Espace, Poste et SalleReunion", () => {
  it("interdit la création d'une salle de réunion avec une capacité inférieure ou égale à zéro", () => {
    expect(
      () =>
        new SalleReunion({
          code: "SALLE-01",
          etage: 1,
          idSite: 1,
          nomSalle: "Salle Invalide",
          capacitePersonnes: 0,
        })
    ).toThrow("La capacité d'une salle de réunion doit être strictement positive.");
  });

  it("gère correctement le cycle de maintenance d'une salle de réunion (RG-04)", () => {
    const salle = new SalleReunion({
      idEspace: 10,
      code: "LIL-SR-01",
      etage: 1,
      idSite: 1,
      nomSalle: "Salle Vauban",
      capacitePersonnes: 8,
      estMaintenance: false,
    });

    expect(salle.estDisponiblePourReservation()).toBe(true);

    salle.mettreEnMaintenance();
    expect(salle.estMaintenance).toBe(true);
    expect(salle.estDisponiblePourReservation()).toBe(false);

    salle.retirerDeMaintenance();
    expect(salle.estMaintenance).toBe(false);
    expect(salle.estDisponiblePourReservation()).toBe(true);
  });

  it("crée un poste de travail avec ses attributs matériels spécifiques", () => {
    const poste = new Poste({
      idEspace: 101,
      code: "LIL-P-01",
      etage: 0,
      idSite: 1,
      estElectrique: true,
      aEcranExterne: true,
    });

    expect(poste.code).toBe("LIL-P-01");
    expect(poste.estElectrique).toBe(true);
    expect(poste.aEcranExterne).toBe(true);
  });
});
