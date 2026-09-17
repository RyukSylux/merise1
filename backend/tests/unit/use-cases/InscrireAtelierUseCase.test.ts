import { describe, it, expect, beforeEach } from "vitest";
import { InscrireAtelierUseCase } from "../../../src/application/use-cases/InscrireAtelierUseCase.js";
import {
  InMemoryAtelierRepository,
  InMemoryUtilisateurRepository,
  SpyNotificationService,
  DirectUnitOfWork,
} from "../../fakes/InMemoryRepositories.js";
import { Atelier } from "../../../src/domain/entities/Atelier.js";
import { Utilisateur } from "../../../src/domain/entities/Utilisateur.js";
import {
  AlreadyRegisteredError,
  WorkshopFullError,
  EntityNotFoundError,
} from "../../../src/domain/errors/DomainError.js";

describe("TDD Palier 3 — Cas d'Usage UC-03 : InscrireAtelierUseCase", () => {
  let atelierRepo: InMemoryAtelierRepository;
  let userRepo: InMemoryUtilisateurRepository;
  let notifier: SpyNotificationService;
  let uow: DirectUnitOfWork;
  let atelier: Atelier;
  let useCase: InscrireAtelierUseCase;

  const coworker = new Utilisateur({
    idUtilisateur: 1,
    nom: "Dupont",
    prenom: "Jean",
    email: "jean.dupont@coworkin.fr",
  });

  beforeEach(() => {
    atelierRepo = new InMemoryAtelierRepository();
    userRepo = new InMemoryUtilisateurRepository();
    notifier = new SpyNotificationService();
    uow = new DirectUnitOfWork();

    atelier = new Atelier({
      idAtelier: 100,
      titre: "Atelier IA & Automatisation",
      dateHeure: new Date("2026-10-22T18:30:00Z"),
      placesMax: 2,
      nbInscrits: 0,
      idSite: 1,
    });

    useCase = new InscrireAtelierUseCase(atelierRepo, userRepo, notifier, uow);

    userRepo.utilisateurs.push(coworker);
    atelierRepo.ateliers.push(atelier);
  });

  it("enregistre l'inscription d'un coworker et incrémente la jauge", async () => {
    const res = await useCase.executer({ idUtilisateur: 1, idAtelier: 100 });

    expect(res.statutInscription).toBe("CONFIRMEE");
    expect(res.placesRestantes).toBe(1);
    expect(atelier.nbInscrits).toBe(1);
    expect(notifier.notifications.length).toBe(1);
    expect(notifier.notifications[0].type).toBe("INSCRIPTION_ATELIER");
  });

  it("rejette si le coworker tente de s'inscrire deux fois au même atelier (RG-07)", async () => {
    // 1ère inscription
    await useCase.executer({ idUtilisateur: 1, idAtelier: 100 });

    // 2ème tentative -> Erreur RG-07
    await expect(
      useCase.executer({ idUtilisateur: 1, idAtelier: 100 })
    ).rejects.toThrow(AlreadyRegisteredError);
  });

  it("bloque l'inscription si l'atelier a atteint sa jauge maximale (RG-06)", async () => {
    // Remplir les 2 places
    atelier.inscrireParticipant();
    atelier.inscrireParticipant();
    expect(atelier.estComplet).toBe(true);

    const autreCoworker = new Utilisateur({
      idUtilisateur: 2,
      nom: "Leroy",
      prenom: "Marc",
      email: "marc.leroy@coworkin.fr",
    });
    userRepo.utilisateurs.push(autreCoworker);

    await expect(
      useCase.executer({ idUtilisateur: 2, idAtelier: 100 })
    ).rejects.toThrow(WorkshopFullError);
  });
});
