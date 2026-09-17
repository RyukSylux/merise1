import { describe, it, expect } from "vitest";
import { Facture, LigneFacture } from "../../../src/domain/entities/Facture.js";

describe("TDD Palier 1 — Entités Domaine: Facture & LigneFacture", () => {
  it("impose la règle d'exclusion mutuelle : soit utilisateur individuel, soit société", () => {
    // Cas invalide 1 : ni utilisateur, ni société
    expect(
      () =>
        new Facture({
          reference: "FACT-001",
          montantHt: 100,
          montantTva: 20,
          montantTtc: 120,
        })
    ).toThrow("Une facture doit être adressée SOIT à un utilisateur individuel, SOIT à une société (exclusion mutuelle).");

    // Cas invalide 2 : les deux en même temps
    expect(
      () =>
        new Facture({
          reference: "FACT-002",
          montantHt: 100,
          montantTva: 20,
          montantTtc: 120,
          idUtilisateur: 1,
          idSociete: 2,
        })
    ).toThrow("Une facture doit être adressée SOIT à un utilisateur individuel, SOIT à une société (exclusion mutuelle).");

    // Cas valide utilisateur
    const factUser = new Facture({
      reference: "FACT-USER-01",
      montantHt: 100,
      montantTva: 20,
      montantTtc: 120,
      idUtilisateur: 1,
    });
    expect(factUser.idUtilisateur).toBe(1);
    expect(factUser.idSociete).toBeNull();

    // Cas valide société
    const factSoc = new Facture({
      reference: "FACT-SOC-01",
      montantHt: 500,
      montantTva: 100,
      montantTtc: 600,
      idSociete: 42,
    });
    expect(factSoc.idSociete).toBe(42);
    expect(factSoc.idUtilisateur).toBeNull();
  });

  it("recalcule automatiquement le montant HT, TVA (20%) et TTC lors de l'ajout de lignes", () => {
    const facture = new Facture({
      reference: "FACT-AUTO-01",
      montantHt: 0,
      montantTva: 0,
      montantTtc: 0,
      idUtilisateur: 5,
    });

    facture.ajouterLigne(
      new LigneFacture({
        numLigne: 1,
        description: "Réservation salle Tourcoing (2h)",
        quantite: 1,
        prixUnitaireHt: 50.0,
        montantHt: 50.0,
      })
    );

    expect(facture.montantHt).toBe(50.0);
    expect(facture.montantTva).toBe(10.0); // 20% de 50
    expect(facture.montantTtc).toBe(60.0);

    facture.ajouterLigne(
      new LigneFacture({
        numLigne: 2,
        description: "Forfait atelier jeudi soir",
        quantite: 1,
        prixUnitaireHt: 25.0,
        montantHt: 25.0,
      })
    );

    expect(facture.montantHt).toBe(75.0);
    expect(facture.montantTva).toBe(15.0);
    expect(facture.montantTtc).toBe(90.0);
  });
});
