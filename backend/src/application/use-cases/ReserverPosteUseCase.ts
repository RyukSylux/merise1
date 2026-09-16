import {
  IReserverPosteUseCase,
  ReserverPosteCommand,
  ReserverPosteResult,
} from "../../domain/ports/inbound/IReserverPosteUseCase.js";
import { IReservationRepository } from "../../domain/ports/outbound/IReservationRepository.js";
import { IEspaceRepository } from "../../domain/ports/outbound/IEspaceRepository.js";
import { IUtilisateurRepository } from "../../domain/ports/outbound/IUtilisateurRepository.js";
import { IAbonnementRepository } from "../../domain/ports/outbound/IAbonnementRepository.js";
import { IPaymentGatewayPort } from "../../domain/ports/outbound/IPaymentGatewayPort.js";
import { INotificationServicePort } from "../../domain/ports/outbound/INotificationServicePort.js";
import { Reservation } from "../../domain/entities/Reservation.js";
import {
  EntityNotFoundError,
  OverlappingReservationError,
} from "../../domain/errors/DomainError.js";

export class ReserverPosteUseCase implements IReserverPosteUseCase {
  constructor(
    private readonly reservationRepo: IReservationRepository,
    private readonly espaceRepo: IEspaceRepository,
    private readonly utilisateurRepo: IUtilisateurRepository,
    private readonly abonnementRepo: IAbonnementRepository,
    private readonly paymentGateway: IPaymentGatewayPort,
    private readonly notificationService: INotificationServicePort
  ) {}

  async executer(command: ReserverPosteCommand): Promise<ReserverPosteResult> {
    const { idUtilisateur, idPoste, dateHeureDebut, dateHeureFin } = command;

    // 1. Vérifier l'utilisateur
    const utilisateur = await this.utilisateurRepo.trouverParId(idUtilisateur);
    if (!utilisateur) {
      throw new EntityNotFoundError("Utilisateur", idUtilisateur);
    }

    // 2. Vérifier le poste
    const poste = await this.espaceRepo.trouverPosteParId(idPoste);
    if (!poste) {
      throw new EntityNotFoundError("Poste", idPoste);
    }

    // 3. Vérifier le non-chevauchement sur le poste
    const posteOccupe = await this.reservationRepo.verifierChevauchement(
      idPoste,
      dateHeureDebut,
      dateHeureFin
    );
    if (posteOccupe) {
      throw new OverlappingReservationError("Ce poste de travail est déjà réservé sur cette plage horaire.");
    }

    // 4. RG-02 : Vérifier que le coworker n'a pas déjà une réservation active sur ce créneau
    const coworkerOccupe = await this.reservationRepo.verifierChevauchementUtilisateur(
      idUtilisateur,
      dateHeureDebut,
      dateHeureFin
    );
    if (coworkerOccupe) {
      throw new OverlappingReservationError(
        "Vous possédez déjà une réservation active sur ce créneau horaire (RG-02)."
      );
    }

    // 5. RG-01 : Contrôle de l'abonnement actif (Gratuité des postes pour abonnés)
    const abonnementInfo = await this.abonnementRepo.trouverAbonnementActif(idUtilisateur, dateHeureDebut);
    const estAbonne = abonnementInfo !== null;

    let montant = 0;
    if (!estAbonne) {
      // Tarif standard non-abonné : 5 € par heure
      const diffMs = dateHeureFin.getTime() - dateHeureDebut.getTime();
      const dureeHeures = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
      montant = dureeHeures * 5.0;

      // Débit via le port de paiement
      await this.paymentGateway.debiter({
        montant,
        emailClient: utilisateur.email,
        description: `Réservation poste ${poste.code} (${dureeHeures}h)`,
        referenceCommande: `POSTE-${idPoste}-${Date.now()}`,
      });
    }

    // 6. Création et enregistrement de l'entité Reservation
    const nouvelleReservation = new Reservation({
      idUtilisateur,
      idEspace: idPoste,
      dateHeureDebut,
      dateHeureFin,
      statut: "CONFIRMEE",
      montantTotal: montant,
    });

    const reservationSauvegardee = await this.reservationRepo.sauvegarder(nouvelleReservation);

    // 7. Notification e-mail
    await this.notificationService.envoyerNotification({
      destinataireEmail: utilisateur.email,
      sujet: `Confirmation de votre réservation de poste - ${poste.code}`,
      contenu: `Bonjour ${utilisateur.prenom}, votre réservation pour le poste ${poste.code} du ${dateHeureDebut.toLocaleString("fr-FR")} au ${dateHeureFin.toLocaleString("fr-FR")} est confirmée. Montant: ${montant.toFixed(2)} €.`,
      type: "CONFIRMATION_RESERVATION",
    });

    return {
      idReservation: reservationSauvegardee.idReservation!,
      codeEspace: poste.code,
      dateHeureDebut,
      dateHeureFin,
      estGratuitAbonne: estAbonne,
      montantTotal: montant,
      statut: reservationSauvegardee.statut,
    };
  }
}
