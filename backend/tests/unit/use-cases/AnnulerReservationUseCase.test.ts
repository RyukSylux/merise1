import { describe, it, expect, beforeEach } from "vitest";
import { AnnulerReservationUseCase } from "../../../src/application/use-cases/AnnulerReservationUseCase.js";
import {
  InMemoryReservationRepository,
  InMemoryUtilisateurRepository,
  SpyPaymentGateway,
  SpyNotificationService,
} from "../../fakes/InMemoryRepositories.js";
import { Reservation } from "../../../src/domain/entities/Reservation.js";
import { Utilisateur } from "../../../src/domain/entities/Utilisateur.js";

describe("TDD Palier 3 — Cas d'Usage UC-04 : AnnulerReservationUseCase", () => {
  let resaRepo: InMemoryReservationRepository;
  let userRepo: InMemoryUtilisateurRepository;
  let payment: SpyPaymentGateway;
  let notifier: SpyNotificationService;
  let useCase: AnnulerReservationUseCase;

  const titulaire = new Utilisateur({
    idUtilisateur: 10,
    nom: "Bernard",
    prenom: "Sophie",
    email: "sophie.bernard@coworkin.fr",
  });

  beforeEach(() => {
    resaRepo = new InMemoryReservationRepository();
    userRepo = new InMemoryUtilisateurRepository();
    payment = new SpyPaymentGateway();
    notifier = new SpyNotificationService();

    useCase = new AnnulerReservationUseCase(resaRepo, userRepo, payment, notifier);
    userRepo.utilisateurs.push(titulaire);
  });

  it("interdit à un utilisateur tiers d'annuler une réservation qui ne lui appartient pas", async () => {
    const resa = new Reservation({
      idReservation: 55,
      idUtilisateur: 10, // Sophie
      idEspace: 3,
      dateHeureDebut: new Date("2026-11-20T10:00:00Z"),
      dateHeureFin: new Date("2026-11-20T12:00:00Z"),
      montantTotal: 40.0,
      statut: "CONFIRMEE",
    });
    resaRepo.reservations.push(resa);

    await expect(
      useCase.executer({
        idReservation: 55,
        idUtilisateurDemandeur: 99, // Inconnu
        estAdminOuHote: false,
      })
    ).rejects.toThrow("Vous n'êtes pas autorisé à annuler cette réservation.");
  });

  it("permet au titulaire d'annuler > 24h avec remboursement 100% (RG-08)", async () => {
    // Réservation dans 3 jours
    const debut = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const fin = new Date(debut.getTime() + 2 * 60 * 60 * 1000);

    const resa = new Reservation({
      idReservation: 56,
      idUtilisateur: 10,
      idEspace: 3,
      dateHeureDebut: debut,
      dateHeureFin: fin,
      montantTotal: 50.0,
      statut: "CONFIRMEE",
    });
    resaRepo.reservations.push(resa);

    const result = await useCase.executer({
      idReservation: 56,
      idUtilisateurDemandeur: 10,
    });

    expect(result.statut).toBe("ANNULEE");
    expect(result.penaliteAppliquee).toBe(false);
    expect(result.montantRembourse).toBe(50.0);
    expect(result.montantPenalite).toBe(0);
    expect(payment.refundCalls.length).toBe(1);
    expect(payment.refundCalls[0].montantARembourser).toBe(50.0);
  });

  it("applique une retenue de pénalité de 50% lors d'une annulation < 24h (RG-09)", async () => {
    // Réservation dans 5 heures
    const debut = new Date(Date.now() + 5 * 60 * 60 * 1000);
    const fin = new Date(debut.getTime() + 2 * 60 * 60 * 1000);

    const resa = new Reservation({
      idReservation: 57,
      idUtilisateur: 10,
      idEspace: 3,
      dateHeureDebut: debut,
      dateHeureFin: fin,
      montantTotal: 100.0,
      statut: "CONFIRMEE",
    });
    resaRepo.reservations.push(resa);

    const result = await useCase.executer({
      idReservation: 57,
      idUtilisateurDemandeur: 10,
    });

    expect(result.statut).toBe("ANNULEE_PENALITE");
    expect(result.penaliteAppliquee).toBe(true);
    expect(result.montantRembourse).toBe(50.0);
    expect(result.montantPenalite).toBe(50.0);
    expect(payment.refundCalls[0].montantARembourser).toBe(50.0);
  });

  it("autorise un hôte d'accueil ou gérant à annuler pour le compte d'un coworker", async () => {
    const debut = new Date(Date.now() + 48 * 60 * 60 * 1000);
    const fin = new Date(debut.getTime() + 2 * 60 * 60 * 1000);

    const resa = new Reservation({
      idReservation: 58,
      idUtilisateur: 10,
      idEspace: 3,
      dateHeureDebut: debut,
      dateHeureFin: fin,
      montantTotal: 20.0,
      statut: "CONFIRMEE",
    });
    resaRepo.reservations.push(resa);

    const result = await useCase.executer({
      idReservation: 58,
      idUtilisateurDemandeur: 999, // Hôte
      estAdminOuHote: true,
    });

    expect(result.statut).toBe("ANNULEE");
  });
});
