import { describe, it, expect } from "vitest";
import { ReserverSalleUseCase } from "../../src/application/use-cases/ReserverSalleUseCase.js";
import { SalleReunion } from "../../src/domain/entities/Espace.js";
import { Utilisateur } from "../../src/domain/entities/Utilisateur.js";
import { Formule, Abonnement } from "../../src/domain/entities/Abonnement.js";
import {
  RoomUnderMaintenanceError,
  OverlappingReservationError,
} from "../../src/domain/errors/DomainError.js";

describe("Application Use Case: ReserverSalleUseCase (UC-02)", () => {
  const dummyUser = new Utilisateur({
    idUtilisateur: 1,
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@email.fr",
  });

  const dummySalle = new SalleReunion({
    idEspace: 10,
    code: "LIL-SR-01",
    etage: 1,
    idSite: 1,
    nomSalle: "Salle Vauban",
    capacitePersonnes: 8,
    estMaintenance: false,
  });

  const mockPayment = {
    debiter: async () => ({ succes: true, transactionId: "TX1", message: "ok" }),
    rembourser: async () => ({ succes: true, transactionId: "TX2", message: "ok" }),
  };

  const mockNotifier = {
    envoyerNotification: async () => {},
  };

  it("bloque immédiatement la réservation si la salle est en maintenance (RG-04)", async () => {
    const salleEnMaintenance = new SalleReunion({
      idEspace: 10,
      code: "LIL-SR-01",
      etage: 1,
      idSite: 1,
      nomSalle: "Salle Vauban",
      capacitePersonnes: 8,
      estMaintenance: true, // EN MAINTENANCE
    });

    const mockEspaceRepo: any = {
      trouverSalleParId: async () => salleEnMaintenance,
    };
    const mockUserRepo: any = {
      trouverParId: async () => dummyUser,
    };
    const mockResaRepo: any = {};
    const mockAbonnementRepo: any = {};

    const useCase = new ReserverSalleUseCase(
      mockResaRepo,
      mockEspaceRepo,
      mockUserRepo,
      mockAbonnementRepo,
      mockPayment,
      mockNotifier
    );

    await expect(
      useCase.executer({
        idUtilisateur: 1,
        idSalle: 10,
        dateHeureDebut: new Date("2026-10-10T10:00:00Z"),
        dateHeureFin: new Date("2026-10-10T12:00:00Z"),
      })
    ).rejects.toThrow(RoomUnderMaintenanceError);
  });

  it("bloque la réservation en cas de chevauchement sur la salle (RG-02)", async () => {
    const mockEspaceRepo: any = {
      trouverSalleParId: async () => dummySalle,
    };
    const mockUserRepo: any = {
      trouverParId: async () => dummyUser,
    };
    const mockResaRepo: any = {
      verifierChevauchement: async () => true, // Salle déjà occupée
    };
    const mockAbonnementRepo: any = {};

    const useCase = new ReserverSalleUseCase(
      mockResaRepo,
      mockEspaceRepo,
      mockUserRepo,
      mockAbonnementRepo,
      mockPayment,
      mockNotifier
    );

    await expect(
      useCase.executer({
        idUtilisateur: 1,
        idSalle: 10,
        dateHeureDebut: new Date("2026-10-10T10:00:00Z"),
        dateHeureFin: new Date("2026-10-10T12:00:00Z"),
      })
    ).rejects.toThrow(OverlappingReservationError);
  });
});
