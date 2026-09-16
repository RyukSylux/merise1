import {
  IAnnulerReservationUseCase,
  AnnulerReservationCommand,
  AnnulerReservationResult,
} from "../../domain/ports/inbound/IAnnulerReservationUseCase.js";
import { IReservationRepository } from "../../domain/ports/outbound/IReservationRepository.js";
import { IUtilisateurRepository } from "../../domain/ports/outbound/IUtilisateurRepository.js";
import { IPaymentGatewayPort } from "../../domain/ports/outbound/IPaymentGatewayPort.js";
import { INotificationServicePort } from "../../domain/ports/outbound/INotificationServicePort.js";
import { CancellationPolicy } from "../../domain/rules/CancellationPolicy.js";
import {
  EntityNotFoundError,
} from "../../domain/errors/DomainError.js";

export class AnnulerReservationUseCase implements IAnnulerReservationUseCase {
  constructor(
    private readonly reservationRepo: IReservationRepository,
    private readonly utilisateurRepo: IUtilisateurRepository,
    private readonly paymentGateway: IPaymentGatewayPort,
    private readonly notificationService: INotificationServicePort
  ) {}

  async executer(command: AnnulerReservationCommand): Promise<AnnulerReservationResult> {
    const { idReservation, idUtilisateurDemandeur, estAdminOuHote } = command;

    // 1. Récupérer la réservation
    const reservation = await this.reservationRepo.trouverParId(idReservation);
    if (!reservation) {
      throw new EntityNotFoundError("Reservation", idReservation);
    }

    // 2. Contrôle des droits (soit le titulaire, soit admin/hôte)
    if (reservation.idUtilisateur !== idUtilisateurDemandeur && !estAdminOuHote) {
      throw new Error("Vous n'êtes pas autorisé à annuler cette réservation.");
    }

    if (reservation.statut !== "CONFIRMEE") {
      throw new Error(`Cette réservation est déjà dans le statut : ${reservation.statut}`);
    }

    // 3. Récupérer l'utilisateur pour la notification
    const utilisateur = await this.utilisateurRepo.trouverParId(reservation.idUtilisateur);

    // 4. Évaluer la politique d'annulation (RG-08 / RG-09)
    const evaluation = CancellationPolicy.evaluer(
      reservation.dateHeureDebut,
      reservation.montantTotal,
      0 // quota contextuel
    );

    // 5. Mettre à jour l'entité
    reservation.statut = evaluation.statutFinal;
    await this.reservationRepo.mettreAJour(reservation);

    // 6. Remboursement PSP si applicable
    if (evaluation.montantRembourse > 0) {
      await this.paymentGateway.rembourser({
        transactionId: `TX-RESA-${idReservation}`,
        montantARembourser: evaluation.montantRembourse,
        motif: `Annulation réservation #${idReservation} (${evaluation.statutFinal})`,
      });
    }

    // 7. Notification e-mail
    if (utilisateur) {
      await this.notificationService.envoyerNotification({
        destinataireEmail: utilisateur.email,
        sujet: `Annulation de votre réservation #${idReservation}`,
        contenu: `Bonjour ${utilisateur.prenom}, votre réservation a été annulée. ${evaluation.message} Montant remboursé: ${evaluation.montantRembourse.toFixed(2)} €. Retenue: ${evaluation.montantPenaliteConserve.toFixed(2)} €.`,
        type: "ANNULATION_RESERVATION",
      });
    }

    return {
      idReservation: reservation.idReservation!,
      statut: reservation.statut,
      penaliteAppliquee: evaluation.montantPenaliteConserve > 0,
      montantRembourse: evaluation.montantRembourse,
      montantPenalite: evaluation.montantPenaliteConserve,
      message: evaluation.message,
    };
  }
}
