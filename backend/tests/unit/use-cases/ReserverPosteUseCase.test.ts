import { describe, it, expect, beforeEach } from "vitest";
import { ReserverPosteUseCase } from "../../../src/application/use-cases/ReserverPosteUseCase.js";
import {
  InMemoryReservationRepository,
  InMemoryEspaceRepository,
  InMemoryUtilisateurRepository,
  InMemoryAbonnementRepository,
  SpyPaymentGateway,
  SpyNotificationService,
} from "../../fakes/InMemoryRepositories.js";
import { Poste } from "../../../src/domain/entities/Espace.js";
import { Utilisateur } from "../../../src/domain/entities/Utilisateur.js";
import { Abonnement, Formule } from "../../../src/domain/entities/Abonnement.js";
import { OverlappingReservationError, EntityNotFoundError } from "../../../src/domain/errors/DomainError.js";

describe("TDD Palier 3 — Cas d'Usage UC-01 : ReserverPosteUseCase", () => {
  let resaRepo: InMemoryReservationRepository;
  let espaceRepo: InMemoryEspaceRepository;
  let userRepo: InMemoryUtilisateurRepository;
  let aboRepo: InMemoryAbonnementRepository;
  let payment: SpyPaymentGateway;
  let notifier: SpyNotificationService;
  let useCase: ReserverPosteUseCase;

  const abonne = new Utilisateur({
    idUtilisateur: 1,
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@coworkin.fr",
  });

  const nonAbonne = new Utilisateur({
    idUtilisateur: 2,
    nom: "Martin",
    prenom: "Claire",
    email: "claire.martin@externe.fr",
  });

  const poste = new Poste({
    idEspace: 10,
    code: "LIL-P-01",
    etage: 0,
    idSite: 1,
    estElectrique: true,
    aEcranExterne: true,
  });

  beforeEach(() => {
    resaRepo = new InMemoryReservationRepository();
    espaceRepo = new InMemoryEspaceRepository();
    userRepo = new InMemoryUtilisateurRepository();
    aboRepo = new InMemoryAbonnementRepository();
    payment = new SpyPaymentGateway();
    notifier = new SpyNotificationService();

    useCase = new ReserverPosteUseCase(
      resaRepo,
      espaceRepo,
      userRepo,
      aboRepo,
      payment,
      notifier
    );

    userRepo.utilisateurs.push(abonne, nonAbonne);
    espaceRepo.espaces.push(poste);

    // Formule Nomade avec abonnement actif pour 'abonne'
    const formule = new Formule({ idFormule: 1, libelle: "Nomade", tarifMensuel: 150, quotaSalleHeures: 4 });
    const abonnement = new Abonnement({
      idAbonnement: 1,
      idUtilisateur: 1,
      idFormule: 1,
      dateDebut: new Date("2026-01-01"),
      statut: "ACTIF",
    });
    aboRepo.abonnements.push({ abonnement, formule });
  });

  it("accorde la gratuité totale du poste pour un coworker abonné (RG-01)", async () => {
    const debut = new Date("2026-10-10T09:00:00Z");
    const fin = new Date("2026-10-10T12:00:00Z");

    const result = await useCase.executer({
      idUtilisateur: 1,
      idPoste: 10,
      dateHeureDebut: debut,
      dateHeureFin: fin,
    });

    expect(result.estGratuitAbonne).toBe(true);
    expect(result.montantTotal).toBe(0.0);
    expect(result.statut).toBe("CONFIRMEE");
    expect(payment.debitCalls.length).toBe(0); // Pas de débit CB
    expect(notifier.notifications.length).toBe(1); // E-mail bien parti
  });

  it("facture le tarif horaire et déclenche un débit PSP pour un coworker non-abonné", async () => {
    const debut = new Date("2026-10-10T09:00:00Z");
    const fin = new Date("2026-10-10T12:00:00Z"); // 3 heures

    const result = await useCase.executer({
      idUtilisateur: 2, // Claire (non-abonnée)
      idPoste: 10,
      dateHeureDebut: debut,
      dateHeureFin: fin,
    });

    expect(result.estGratuitAbonne).toBe(false);
    expect(result.montantTotal).toBe(15.0); // 3h * 5€
    expect(payment.debitCalls.length).toBe(1);
    expect(payment.debitCalls[0].montant).toBe(15.0);
  });

  it("rejette la réservation si le poste est déjà pris sur cette plage horaire", async () => {
    const debut = new Date("2026-10-10T09:00:00Z");
    const fin = new Date("2026-10-10T12:00:00Z");

    // Première réservation OK
    await useCase.executer({
      idUtilisateur: 1,
      idPoste: 10,
      dateHeureDebut: debut,
      dateHeureFin: fin,
    });

    // Deuxième réservation concurrente sur le même poste -> Rejet
    await expect(
      useCase.executer({
        idUtilisateur: 2,
        idPoste: 10,
        dateHeureDebut: new Date("2026-10-10T11:00:00Z"),
        dateHeureFin: new Date("2026-10-10T13:00:00Z"),
      })
    ).rejects.toThrow(OverlappingReservationError);
  });

  it("rejette la réservation si le coworker a déjà une réservation sur ce créneau (RG-02)", async () => {
    const debut = new Date("2026-10-10T09:00:00Z");
    const fin = new Date("2026-10-10T12:00:00Z");

    // Ajout d'un 2ème poste
    const poste2 = new Poste({ idEspace: 11, code: "LIL-P-02", etage: 0, idSite: 1, estElectrique: true, aEcranExterne: false });
    espaceRepo.espaces.push(poste2);

    // Le coworker 1 réserve le poste 1
    await useCase.executer({ idUtilisateur: 1, idPoste: 10, dateHeureDebut: debut, dateHeureFin: fin });

    // Le coworker 1 tente de réserver AUSSI le poste 2 en même temps -> Rejet RG-02
    await expect(
      useCase.executer({
        idUtilisateur: 1,
        idPoste: 11,
        dateHeureDebut: new Date("2026-10-10T10:00:00Z"),
        dateHeureFin: new Date("2026-10-10T11:00:00Z"),
      })
    ).rejects.toThrow("Vous possédez déjà une réservation active sur ce créneau horaire (RG-02).");
  });
});
