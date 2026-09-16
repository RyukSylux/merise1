import {
  IInscrireAtelierUseCase,
  InscrireAtelierCommand,
  InscrireAtelierResult,
} from "../../domain/ports/inbound/IInscrireAtelierUseCase.js";
import { IAtelierRepository } from "../../domain/ports/outbound/IAtelierRepository.js";
import { IUtilisateurRepository } from "../../domain/ports/outbound/IUtilisateurRepository.js";
import { INotificationServicePort } from "../../domain/ports/outbound/INotificationServicePort.js";
import { IUnitOfWork } from "../../domain/ports/outbound/IUnitOfWork.js";
import { Inscription } from "../../domain/entities/Atelier.js";
import {
  EntityNotFoundError,
  AlreadyRegisteredError,
  WorkshopFullError,
} from "../../domain/errors/DomainError.js";

export class InscrireAtelierUseCase implements IInscrireAtelierUseCase {
  constructor(
    private readonly atelierRepo: IAtelierRepository,
    private readonly utilisateurRepo: IUtilisateurRepository,
    private readonly notificationService: INotificationServicePort,
    private readonly unitOfWork: IUnitOfWork
  ) {}

  async executer(command: InscrireAtelierCommand): Promise<InscrireAtelierResult> {
    const { idUtilisateur, idAtelier } = command;

    // 1. Vérifier l'utilisateur
    const utilisateur = await this.utilisateurRepo.trouverParId(idUtilisateur);
    if (!utilisateur) {
      throw new EntityNotFoundError("Utilisateur", idUtilisateur);
    }

    // 2. RG-07 : Vérifier si déjà inscrit
    const existante = await this.atelierRepo.trouverInscription(idUtilisateur, idAtelier);
    if (existante && existante.statutInscription === "CONFIRMEE") {
      throw new AlreadyRegisteredError("Vous êtes déjà inscrit à cet atelier (RG-07).");
    }

    // 3. Exécuter l'inscription sous transaction ACID avec verrouillage (RG-06)
    return await this.unitOfWork.executeInTransaction(async () => {
      const atelier = await this.atelierRepo.trouverParIdPourMiseAJour(idAtelier);
      if (!atelier) {
        throw new EntityNotFoundError("Atelier", idAtelier);
      }

      if (atelier.estComplet) {
        throw new WorkshopFullError(atelier.titre);
      }

      // Incrémenter la jauge
      atelier.inscrireParticipant();
      await this.atelierRepo.mettreAJourAtelier(atelier);

      // Enregistrer l'inscription
      const inscription = new Inscription({
        idUtilisateur,
        idAtelier,
        statutInscription: "CONFIRMEE",
      });
      await this.atelierRepo.sauvegarderInscription(inscription);

      // 4. Notification e-mail
      await this.notificationService.envoyerNotification({
        destinataireEmail: utilisateur.email,
        sujet: `Confirmation d'inscription à l'atelier : ${atelier.titre}`,
        contenu: `Bonjour ${utilisateur.prenom}, votre place pour l'atelier "${atelier.titre}" du ${atelier.dateHeure.toLocaleString("fr-FR")} est réservée avec succès !`,
        type: "INSCRIPTION_ATELIER",
      });

      return {
        idAtelier: atelier.idAtelier!,
        titre: atelier.titre,
        dateHeure: atelier.dateHeure,
        placesRestantes: atelier.placesRestantes,
        statutInscription: "CONFIRMEE",
        message: "Inscription confirmée avec succès.",
      };
    });
  }
}
