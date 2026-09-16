import { Reservation } from "../../entities/Reservation.js";

export interface PresenceRecord {
  idUtilisateur: number;
  nom: string;
  prenom: string;
  email: string;
  codeEspace: string;
  typeEspace: "POSTE" | "SALLE";
  idSite: number;
  dateHeureDebut: Date;
  dateHeureFin: Date;
}

export interface IReservationRepository {
  trouverParId(idReservation: number): Promise<Reservation | null>;
  sauvegarder(reservation: Reservation): Promise<Reservation>;
  mettreAJour(reservation: Reservation): Promise<void>;
  verifierChevauchement(idEspace: number, debut: Date, fin: Date, exclureIdReservation?: number): Promise<boolean>;
  verifierChevauchementUtilisateur(idUtilisateur: number, debut: Date, fin: Date, exclureIdReservation?: number): Promise<boolean>;
  calculerHeuresConsommeesMois(idUtilisateur: number, annee: number, mois: number): Promise<number>;
  trouverPresencesActuellesParSite(idSite: number, aLaDate?: Date): Promise<PresenceRecord[]>;
  trouverParUtilisateur(idUtilisateur: number): Promise<Reservation[]>;
  trouverReservationsNonFactureesDuMois(annee: number, mois: number): Promise<Reservation[]>;
}
