import { IReservationRepository, PresenceRecord } from "../../src/domain/ports/outbound/IReservationRepository.js";
import { IEspaceRepository } from "../../src/domain/ports/outbound/IEspaceRepository.js";
import { IUtilisateurRepository } from "../../src/domain/ports/outbound/IUtilisateurRepository.js";
import { IAbonnementRepository } from "../../src/domain/ports/outbound/IAbonnementRepository.js";
import { IAtelierRepository } from "../../src/domain/ports/outbound/IAtelierRepository.js";
import { IFactureRepository } from "../../src/domain/ports/outbound/IFactureRepository.js";
import { IUnitOfWork } from "../../src/domain/ports/outbound/IUnitOfWork.js";
import { IPaymentGatewayPort, PaymentRequest, PaymentResponse, RefundRequest } from "../../src/domain/ports/outbound/IPaymentGatewayPort.js";
import { INotificationServicePort, NotificationPayload } from "../../src/domain/ports/outbound/INotificationServicePort.js";
import { Reservation } from "../../src/domain/entities/Reservation.js";
import { Espace, Poste, SalleReunion } from "../../src/domain/entities/Espace.js";
import { Utilisateur } from "../../src/domain/entities/Utilisateur.js";
import { Abonnement, Formule } from "../../src/domain/entities/Abonnement.js";
import { Atelier, Inscription } from "../../src/domain/entities/Atelier.js";
import { Facture } from "../../src/domain/entities/Facture.js";

export class InMemoryReservationRepository implements IReservationRepository {
  public reservations: Reservation[] = [];
  private nextId = 1;

  async trouverParId(idReservation: number): Promise<Reservation | null> {
    return this.reservations.find((r) => r.idReservation === idReservation) ?? null;
  }

  async sauvegarder(reservation: Reservation): Promise<Reservation> {
    const saved = new Reservation({
      ...reservation,
      idReservation: reservation.idReservation ?? this.nextId++,
    });
    this.reservations.push(saved);
    return saved;
  }

  async mettreAJour(reservation: Reservation): Promise<void> {
    const index = this.reservations.findIndex((r) => r.idReservation === reservation.idReservation);
    if (index !== -1) {
      this.reservations[index] = reservation;
    }
  }

  async verifierChevauchement(idEspace: number, debut: Date, fin: Date, exclureId?: number): Promise<boolean> {
    return this.reservations.some(
      (r) =>
        r.idEspace === idEspace &&
        r.statut === "CONFIRMEE" &&
        r.idReservation !== exclureId &&
        r.chevauche(debut, fin)
    );
  }

  async verifierChevauchementUtilisateur(idUtilisateur: number, debut: Date, fin: Date, exclureId?: number): Promise<boolean> {
    return this.reservations.some(
      (r) =>
        r.idUtilisateur === idUtilisateur &&
        r.statut === "CONFIRMEE" &&
        r.idReservation !== exclureId &&
        r.chevauche(debut, fin)
    );
  }

  async calculerHeuresConsommeesMois(idUtilisateur: number, annee: number, mois: number): Promise<number> {
    return this.reservations
      .filter((r) => {
        const d = r.dateHeureDebut;
        return (
          r.idUtilisateur === idUtilisateur &&
          r.statut === "CONFIRMEE" &&
          d.getFullYear() === annee &&
          d.getMonth() + 1 === mois
        );
      })
      .reduce((acc, r) => acc + r.dureeEnHeures, 0);
  }

  async trouverPresencesActuellesParSite(idSite: number, aLaDate: Date = new Date()): Promise<PresenceRecord[]> {
    return [];
  }

  async trouverParUtilisateur(idUtilisateur: number): Promise<Reservation[]> {
    return this.reservations.filter((r) => r.idUtilisateur === idUtilisateur);
  }

  async trouverReservationsNonFactureesDuMois(annee: number, mois: number): Promise<Reservation[]> {
    return this.reservations.filter((r) => r.montantTotal > 0);
  }
}

export class InMemoryEspaceRepository implements IEspaceRepository {
  public espaces: Espace[] = [];

  async trouverParId(idEspace: number): Promise<Espace | null> {
    return this.espaces.find((e) => e.idEspace === idEspace) ?? null;
  }

  async trouverSalleParId(idEspace: number): Promise<SalleReunion | null> {
    const e = await this.trouverParId(idEspace);
    return e instanceof SalleReunion ? e : null;
  }

  async trouverPosteParId(idEspace: number): Promise<Poste | null> {
    const e = await this.trouverParId(idEspace);
    return e instanceof Poste ? e : null;
  }

  async listerPostesDisponibles(idSite: number, debut: Date, fin: Date): Promise<Poste[]> {
    return this.espaces.filter((e) => e instanceof Poste && e.idSite === idSite) as Poste[];
  }

  async listerSallesDisponibles(idSite: number, debut: Date, fin: Date): Promise<SalleReunion[]> {
    return this.espaces.filter(
      (e) => e instanceof SalleReunion && e.idSite === idSite && e.estDisponiblePourReservation()
    ) as SalleReunion[];
  }

  async mettreAJourMaintenanceSalle(idEspace: number, estMaintenance: boolean): Promise<void> {
    const salle = await this.trouverSalleParId(idEspace);
    if (salle) salle.estMaintenance = estMaintenance;
  }
}

export class InMemoryUtilisateurRepository implements IUtilisateurRepository {
  public utilisateurs: Utilisateur[] = [];

  async trouverParId(idUtilisateur: number): Promise<Utilisateur | null> {
    return this.utilisateurs.find((u) => u.idUtilisateur === idUtilisateur) ?? null;
  }

  async trouverParEmail(email: string): Promise<Utilisateur | null> {
    return this.utilisateurs.find((u) => u.email.toLowerCase() === email.toLowerCase()) ?? null;
  }

  async listerParSociete(idSociete: number): Promise<Utilisateur[]> {
    return this.utilisateurs.filter((u) => u.idSociete === idSociete);
  }

  async sauvegarder(utilisateur: Utilisateur): Promise<Utilisateur> {
    this.utilisateurs.push(utilisateur);
    return utilisateur;
  }
}

export class InMemoryAbonnementRepository implements IAbonnementRepository {
  public abonnements: Array<{ abonnement: Abonnement; formule: Formule }> = [];

  async trouverAbonnementActif(idUtilisateur: number, aLaDate: Date = new Date()) {
    const found = this.abonnements.find(
      (a) => a.abonnement.idUtilisateur === idUtilisateur && a.abonnement.estActif(aLaDate)
    );
    return found ?? null;
  }

  async trouverFormuleParId(idFormule: number): Promise<Formule | null> {
    const found = this.abonnements.find((a) => a.formule.idFormule === idFormule);
    return found ? found.formule : null;
  }

  async listerFormules(): Promise<Formule[]> {
    return this.abonnements.map((a) => a.formule);
  }
}

export class InMemoryAtelierRepository implements IAtelierRepository {
  public ateliers: Atelier[] = [];
  public inscriptions: Inscription[] = [];

  async trouverParId(idAtelier: number): Promise<Atelier | null> {
    return this.ateliers.find((a) => a.idAtelier === idAtelier) ?? null;
  }

  async trouverParIdPourMiseAJour(idAtelier: number): Promise<Atelier | null> {
    return this.trouverParId(idAtelier);
  }

  async listerAValider(): Promise<Atelier[]> {
    return this.ateliers;
  }

  async listerParSite(idSite: number): Promise<Atelier[]> {
    return this.ateliers.filter((a) => a.idSite === idSite);
  }

  async trouverInscription(idUtilisateur: number, idAtelier: number): Promise<Inscription | null> {
    return (
      this.inscriptions.find(
        (i) => i.idUtilisateur === idUtilisateur && i.idAtelier === idAtelier
      ) ?? null
    );
  }

  async sauvegarderInscription(inscription: Inscription): Promise<Inscription> {
    const existing = await this.trouverInscription(inscription.idUtilisateur, inscription.idAtelier);
    if (existing) {
      existing.statutInscription = inscription.statutInscription;
      return existing;
    }
    this.inscriptions.push(inscription);
    return inscription;
  }

  async mettreAJourAtelier(atelier: Atelier): Promise<void> {
    const idx = this.ateliers.findIndex((a) => a.idAtelier === atelier.idAtelier);
    if (idx !== -1) this.ateliers[idx] = atelier;
  }

  async mettreAJourInscription(inscription: Inscription): Promise<void> {
    const existing = await this.trouverInscription(inscription.idUtilisateur, inscription.idAtelier);
    if (existing) existing.statutInscription = inscription.statutInscription;
  }
}

export class InMemoryFactureRepository implements IFactureRepository {
  public factures: Facture[] = [];
  private nextId = 1;

  async trouverParId(idFacture: number): Promise<Facture | null> {
    return this.factures.find((f) => f.idFacture === idFacture) ?? null;
  }

  async trouverParReference(reference: string): Promise<Facture | null> {
    return this.factures.find((f) => f.reference === reference) ?? null;
  }

  async listerParUtilisateur(idUtilisateur: number): Promise<Facture[]> {
    return this.factures.filter((f) => f.idUtilisateur === idUtilisateur);
  }

  async listerParSociete(idSociete: number): Promise<Facture[]> {
    return this.factures.filter((f) => f.idSociete === idSociete);
  }

  async sauvegarder(facture: Facture): Promise<Facture> {
    (facture as any).idFacture = this.nextId++;
    this.factures.push(facture);
    return facture;
  }
}

export class DirectUnitOfWork implements IUnitOfWork {
  async executeInTransaction<T>(operation: () => Promise<T>): Promise<T> {
    return await operation();
  }
}

export class SpyPaymentGateway implements IPaymentGatewayPort {
  public debitCalls: PaymentRequest[] = [];
  public refundCalls: RefundRequest[] = [];

  async debiter(requete: PaymentRequest): Promise<PaymentResponse> {
    this.debitCalls.push(requete);
    return { succes: true, transactionId: `TX_${Date.now()}`, message: "OK" };
  }

  async rembourser(requete: RefundRequest): Promise<PaymentResponse> {
    this.refundCalls.push(requete);
    return { succes: true, transactionId: `REF_${Date.now()}`, message: "OK" };
  }
}

export class SpyNotificationService implements INotificationServicePort {
  public notifications: NotificationPayload[] = [];

  async envoyerNotification(notification: NotificationPayload): Promise<void> {
    this.notifications.push(notification);
  }
}
