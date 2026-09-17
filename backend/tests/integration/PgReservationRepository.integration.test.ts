import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { pool } from "../../src/adapters/outbound/persistence/postgres/PgConnectionPool.js";
import { PgReservationRepository } from "../../src/adapters/outbound/persistence/postgres/repositories/PgReservationRepository.js";
import { Reservation } from "../../src/domain/entities/Reservation.js";

describe("TDD Palier 4 — Tests d'Intégration Réels PostgreSQL : PgReservationRepository", () => {
  const repo = new PgReservationRepository();

  beforeAll(async () => {
    // Nettoyer d'éventuelles réservations résiduelles sur l'espace 3 en 2027
    await pool.query(
      "DELETE FROM reservation WHERE id_espace = 3 AND date_heure_debut >= '2027-01-01'"
    );
  });

  afterAll(async () => {
    await pool.query(
      "DELETE FROM reservation WHERE id_espace = 3 AND date_heure_debut >= '2027-01-01'"
    );
  });

  it("sauvegarde une réservation réelle et la retrouve par son identifiant", async () => {
    const debut = new Date("2027-06-01T10:00:00Z");
    const fin = new Date("2027-06-01T12:00:00Z");

    const resa = new Reservation({
      idUtilisateur: 1, // Jean Dupont
      idEspace: 3,      // SALLE-LIL-A
      dateHeureDebut: debut,
      dateHeureFin: fin,
      statut: "CONFIRMEE",
      montantTotal: 50.0,
    });

    const saved = await repo.sauvegarder(resa);
    expect(saved.idReservation).toBeDefined();

    const retrieved = await repo.trouverParId(saved.idReservation!);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.idUtilisateur).toBe(1);
    expect(retrieved?.montantTotal).toBe(50.0);
    expect(retrieved?.statut).toBe("CONFIRMEE");
  });

  it("détecte avec exactitude les chevauchements temporels en SQL natif", async () => {
    const debut = new Date("2027-06-02T14:00:00Z");
    const fin = new Date("2027-06-02T16:00:00Z");

    const resa = await repo.sauvegarder(
      new Reservation({
        idUtilisateur: 1,
        idEspace: 3,
        dateHeureDebut: debut,
        dateHeureFin: fin,
        statut: "CONFIRMEE",
        montantTotal: 0,
      })
    );

    // Chevauchement partiel (15h - 17h)
    const chevauche = await repo.verifierChevauchement(
      3,
      new Date("2027-06-02T15:00:00Z"),
      new Date("2027-06-02T17:00:00Z")
    );
    expect(chevauche).toBe(true);

    // Plage disjointe (16h - 18h)
    const disjoint = await repo.verifierChevauchement(
      3,
      new Date("2027-06-02T16:00:00Z"),
      new Date("2027-06-02T18:00:00Z")
    );
    expect(disjoint).toBe(false);

    // Exclure la réservation elle-même (cas de mise à jour)
    const autoExclue = await repo.verifierChevauchement(3, debut, fin, resa.idReservation);
    expect(autoExclue).toBe(false);
  });

  it("agrège fidèlement les heures de salle consommées sur le mois civil pour les quotas", async () => {
    const d1 = new Date("2027-07-10T10:00:00Z");
    const f1 = new Date("2027-07-10T12:00:00Z"); // 2h
    const d2 = new Date("2027-07-12T14:00:00Z");
    const f2 = new Date("2027-07-12T16:00:00Z"); // 2h

    await repo.sauvegarder(new Reservation({ idUtilisateur: 1, idEspace: 3, dateHeureDebut: d1, dateHeureFin: f1, montantTotal: 0 }));
    await repo.sauvegarder(new Reservation({ idUtilisateur: 1, idEspace: 3, dateHeureDebut: d2, dateHeureFin: f2, montantTotal: 0 }));

    const totalHeures = await repo.calculerHeuresConsommeesMois(1, 2027, 7);
    expect(totalHeures).toBe(4);
  });
});
