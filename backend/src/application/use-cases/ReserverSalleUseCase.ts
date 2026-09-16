import {
  IReserverSalleUseCase,
  ReserverSalleCommand,
  ReserverSalleResult,
} from "../../domain/ports/inbound/IReserverSalleUseCase.js";
import { IReservationRepository } from "../../domain/ports/outbound/IReservationRepository.js";
import { IEspaceRepository } from "../../domain/ports/outbound/IEspaceRepository.js";
import { IUtilisateurRepository } from "../../domain/ports/outbound/IUtilisateurRepository.js";
import { IAbonnementRepository } from "../../domain/ports/outbound/IAbonnementRepository.js";
import { IPaymentGatewayPort } from "../../domain/ports/outbound/IPaymentGatewayPort.js";
import { INotificationServicePort } from "../../domain/ports/outbound/INotificationServicePort.js";
import { Reservation } from "../../domain/entities/Reservation.js";
import { QuotaCalculator } from "../../domain/rules/QuotaCalculator.js";
import {
  EntityNotFoundError,
  OverlappingReservationError,
  RoomUnderMaintenanceError,
} from "../../domain/errors/DomainError.js";

export class ReserverSalleUseCase implements IReserverSalleUseCase {
  constructor(
    private readonly reservationRepo: IReservationRepository,
    private readonly espaceRepo: IEspaceRepository,
    private readonly utilisateurRepo: IUtilisateurRepository,
    private readonly abonnementRepo: IAbonnementRepository,
    private readonly paymentGateway: IPaymentGatewayPort,
    private readonly notificationService: INotificationServicePort
  ) {}

  async executer(command: ReserverSalleCommand): Promise<ReserverSalleResult> {
    const { idUtilisateur, idSalle, dateHeureDebut, dateHeureFin } = command;

    // 1. Vérifier l'utilisateur
    const utilisateur = await this.utilisateurRepo.trouverParId(idUtilisateur);
    if (!utilisateur) {
      throw new EntityNotFoundError("Utilisateur", idUtilisateur);
    }

    // 2. Vérifier la salle
    const salle = await this.espaceRepo.trouverSalleParId(idSalle);
    if (!salle) {
      throw new EntityNotFoundError("SalleReunion", idSalle);
    }

    // 3. RG-04 : Contrôle de l'état de maintenance
    if (!salle.estDisponiblePourReservation()) {
      throw new RoomUnderMaintenanceError(salle.nomSalle);
    }

    // 4. Vérifier le non-chevauchement sur la salle
    const salleOccupee = await this.reservationRepo.verifierChevauchement(
      idSalle,
      dateHeureDebut,
      dateHeureFin
    );
    if (salleOccupee) {
      throw new OverlappingReservationError("Cette salle de réunion est déjà réservée sur cette plage horaire.");
    }

    // 5. RG-02 : Vérifier le non-chevauchement du coworker
    const coworkerOccupe = await this.reservationRepo.verifierChevauchementUtilisateur(
      idUtilisateur,
      dateHeureDebut,
      dateHeureFin
    );
    if (coworkerOccupe) {
      throw new OverlappingReservationError(
        "Vous avez déjà une réservation active sur ce même créneau horaire (RG-02)."
      );
    }

    // 6. Calcul de la durée
    const diffMs = dateHeureFin.getTime() - dateHeureDebut.getTime();
    const dureeHeures = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));

    // 7. RG-03 / RG-05 : Recherche abonnement et calcul des quotas
    const annee = dateHeureDebut.getFullYear();
    const mois = dateHeureDebut.getMonth() + 1; // 1-12

    const abonnementInfo = await this.abonnementRepo.trouverAbonnementActif(idUtilisateur, dateHeureDebut);
    const estAbonne = abonnementInfo !== null;
    const quotaMensuelOffert = estAbonne ? abonnementInfo.formule.quotaSalleHeures : 0;

    // Calculer les heures de salle déjà consommées ce mois-ci
    const heuresDejaConsommees = await this.reservationRepo.calculerHeuresConsommeesMois(
      idUtilisateur,
      annee,
      mois
    );

    const tarifHoraireSalle = 25.0; // 25 € / h pour les salles de réunion

    const repartition = QuotaCalculator.calculerRepartition({
      estAbonne,
      quotaMensuelOffert,
      heuresDejaConsommeesMois: heuresDejaConsommees,
      dureeDemandeeHeures: dureeHeures,
      tauxHoraireSalle: tarifHoraireSalle,
    });

    // 8. Paiement complémentaire si heures payantes
    if (repartition.montantTotal > 0) {
      await this.paymentGateway.debiter({
        montant: repartition.montantTotal,
        emailClient: utilisateur.email,
        description: `Réservation salle ${salle.nomSalle} (${repartition.heuresPayantes}h payantes)`,
        referenceCommande: `SALLE-${idSalle}-${Date.now()}`,
      });
    }

    // 9. Enregistrement de la réservation
    const nouvelleReservation = new Reservation({
      idUtilisateur,
      idEspace: idSalle,
      dateHeureDebut,
      dateHeureFin,
      statut: "CONFIRMEE",
      montantTotal: repartition.montantTotal,
    });

    const reservationSauvegardee = await this.reservationRepo.sauvegarder(nouvelleReservation);

    // 10. Notification e-mail
    await this.notificationService.envoyerNotification({
      destinataireEmail: utilisateur.email,
      sujet: `Confirmation réservation salle : ${salle.nomSalle}`,
      contenu: `Bonjour ${utilisateur.prenom}, votre réservation de la salle "${salle.nomSalle}" est confirmée du ${dateHeureDebut.toLocaleString("fr-FR")} au ${dateHeureFin.toLocaleString("fr-FR")}. Heures déduites du quota: ${repartition.heuresImputeesQuota}h. Montant facturé: ${repartition.montantTotal.toFixed(2)} €. Quota restant: ${repartition.quotaRestantApres}h.`,
      type: "CONFIRMATION_RESERVATION",
    });

    return {
      idReservation: reservationSauvegardee.idReservation!,
      nomSalle: salle.nomSalle,
      dateHeureDebut,
      dateHeureFin,
      dureeHeures,
      heuresImputeesQuota: repartition.heuresImputeesQuota,
      heuresPayantes: repartition.heuresPayantes,
      montantTotal: repartition.montantTotal,
      quotaRestantApres: repartition.quotaRestantApres,
      statut: reservationSauvegardee.statut,
    };
  }
}
