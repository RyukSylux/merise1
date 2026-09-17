import { describe, it, expect, beforeEach } from "vitest";
import {
  BasculerMaintenanceUseCase,
  CloturerFacturationUseCase,
} from "../../../src/application/use-cases/AdministrationUseCases.js";
import {
  InMemoryEspaceRepository,
  InMemoryReservationRepository,
  InMemoryUtilisateurRepository,
  InMemoryFactureRepository,
} from "../../fakes/InMemoryRepositories.js";
import { SalleReunion } from "../../../src/domain/entities/Espace.js";
import { Utilisateur } from "../../../src/domain/entities/Utilisateur.js";
import { Reservation } from "../../../src/domain/entities/Reservation.js";

describe("TDD Palier 3 — Cas d'Usage Administration : Maintenance & Facturation", () => {
  let espaceRepo: InMemoryEspaceRepository;
  let resaRepo: InMemoryReservationRepository;
  let userRepo: InMemoryUtilisateurRepository;
  let factureRepo: InMemoryFactureRepository;

  beforeEach(() => {
    espaceRepo = new InMemoryEspaceRepository();
    resaRepo = new InMemoryReservationRepository();
    userRepo = new InMemoryUtilisateurRepository();
    factureRepo = new InMemoryFactureRepository();
  });

  it("met une salle de réunion en maintenance puis la remet en service", async () => {
    const salle = new SalleReunion({
      idEspace: 20,
      code: "ROU-SR-01",
      etage: 2,
      idSite: 2,
      nomSalle: "Salle Robespierre",
      capacitePersonnes: 12,
      estMaintenance: false,
    });
    espaceRepo.espaces.push(salle);

    const useCase = new BasculerMaintenanceUseCase(espaceRepo);

    // Act 1: Fermer pour maintenance
    const resFermee = await useCase.executer({ idSalle: 20, estMaintenance: true });
    expect(resFermee.estMaintenance).toBe(true);
    expect(salle.estMaintenance).toBe(true);

    // Act 2: Rouvrir
    const resOuverte = await useCase.executer({ idSalle: 20, estMaintenance: false });
    expect(resOuverte.estMaintenance).toBe(false);
    expect(salle.estMaintenance).toBe(false);
  });

  it("clôture le mois et génère automatiquement les factures individuelles et entreprises", async () => {
    const userIndiv = new Utilisateur({
      idUtilisateur: 1,
      nom: "Dupont",
      prenom: "Jean",
      email: "jean.dupont@coworkin.fr",
      idSociete: null,
    });

    const userCompany = new Utilisateur({
      idUtilisateur: 2,
      nom: "Smith",
      prenom: "Alice",
      email: "alice@techcorp.fr",
      idSociete: 42, // Rattachée à TechCorp
    });

    userRepo.utilisateurs.push(userIndiv, userCompany);

    // Réservation payante pour l'indépendant
    const resa1 = new Reservation({
      idReservation: 101,
      idUtilisateur: 1,
      idEspace: 5,
      dateHeureDebut: new Date("2026-10-05T09:00:00Z"),
      dateHeureFin: new Date("2026-10-05T11:00:00Z"),
      montantTotal: 60.0, // TTC
      statut: "CONFIRMEE",
    });

    // Réservation payante pour la collaboratrice
    const resa2 = new Reservation({
      idReservation: 102,
      idUtilisateur: 2,
      idEspace: 6,
      dateHeureDebut: new Date("2026-10-06T14:00:00Z"),
      dateHeureFin: new Date("2026-10-06T16:00:00Z"),
      montantTotal: 120.0, // TTC
      statut: "CONFIRMEE",
    });

    resaRepo.reservations.push(resa1, resa2);

    const useCase = new CloturerFacturationUseCase(resaRepo, userRepo, factureRepo);

    const bilan = await useCase.cloturerMois(2026, 10);

    expect(bilan.nbFacturesCreees).toBe(2);
    expect(factureRepo.factures.length).toBe(2);

    // Facture 1 : Utilisateur individuel
    const f1 = factureRepo.factures.find((f) => f.idUtilisateur === 1);
    expect(f1).toBeDefined();
    expect(f1?.idSociete).toBeNull();
    expect(f1?.lignes.length).toBe(1);

    // Facture 2 : Entreprise TechCorp
    const f2 = factureRepo.factures.find((f) => f.idSociete === 42);
    expect(f2).toBeDefined();
    expect(f2?.idUtilisateur).toBeNull();
    expect(f2?.lignes.length).toBe(1);
  });
});
