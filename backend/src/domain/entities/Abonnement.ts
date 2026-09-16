export interface FormuleProps {
  idFormule?: number;
  libelle: string; // Nomade, Résident, Team
  tarifMensuel: number;
  quotaSalleHeures: number; // Défaut: 4h
}

export class Formule {
  readonly idFormule?: number;
  readonly libelle: string;
  readonly tarifMensuel: number;
  readonly quotaSalleHeures: number;

  constructor(props: FormuleProps) {
    this.idFormule = props.idFormule;
    this.libelle = props.libelle;
    this.tarifMensuel = Number(props.tarifMensuel);
    this.quotaSalleHeures = Number(props.quotaSalleHeures ?? 4);
  }
}

export type StatutAbonnement = "ACTIF" | "RESILIE" | "SUSPENDU";

export interface AbonnementProps {
  idAbonnement?: number;
  dateDebut: Date;
  dateFin?: Date | null;
  statut?: StatutAbonnement;
  idUtilisateur: number;
  idFormule: number;
}

export class Abonnement {
  readonly idAbonnement?: number;
  readonly dateDebut: Date;
  readonly dateFin: Date | null;
  readonly statut: StatutAbonnement;
  readonly idUtilisateur: number;
  readonly idFormule: number;

  constructor(props: AbonnementProps) {
    this.idAbonnement = props.idAbonnement;
    this.dateDebut = props.dateDebut;
    this.dateFin = props.dateFin ?? null;
    this.statut = props.statut ?? "ACTIF";
    this.idUtilisateur = props.idUtilisateur;
    this.idFormule = props.idFormule;
  }

  estActif(aLaDate: Date = new Date()): boolean {
    if (this.statut !== "ACTIF") return false;
    if (this.dateDebut > aLaDate) return false;
    if (this.dateFin && this.dateFin < aLaDate) return false;
    return true;
  }
}
