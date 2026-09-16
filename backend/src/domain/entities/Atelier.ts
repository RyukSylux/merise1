import { WorkshopFullError } from "../errors/DomainError.js";

export interface AtelierProps {
  idAtelier?: number;
  titre: string;
  description?: string | null;
  dateHeure: Date;
  placesMax: number;
  nbInscrits?: number;
  tarif?: number;
  idSite: number;
}

export class Atelier {
  readonly idAtelier?: number;
  readonly titre: string;
  readonly description: string | null;
  readonly dateHeure: Date;
  readonly placesMax: number;
  nbInscrits: number;
  readonly tarif: number;
  readonly idSite: number;

  constructor(props: AtelierProps) {
    if (props.placesMax <= 0) {
      throw new Error("Le nombre de places maximum d'un atelier doit être supérieur à zéro.");
    }
    this.idAtelier = props.idAtelier;
    this.titre = props.titre;
    this.description = props.description ?? null;
    this.dateHeure = props.dateHeure;
    this.placesMax = props.placesMax;
    this.nbInscrits = props.nbInscrits ?? 0;
    this.tarif = Number(props.tarif ?? 0);
    this.idSite = props.idSite;
  }

  get placesRestantes(): number {
    return Math.max(0, this.placesMax - this.nbInscrits);
  }

  get estComplet(): boolean {
    return this.nbInscrits >= this.placesMax;
  }

  inscrireParticipant(): void {
    if (this.estComplet) {
      throw new WorkshopFullError(this.titre);
    }
    this.nbInscrits += 1;
  }

  desinscrireParticipant(): void {
    if (this.nbInscrits > 0) {
      this.nbInscrits -= 1;
    }
  }
}

export type StatutInscription = "CONFIRMEE" | "ANNULEE" | "LISTE_ATTENTE";

export interface InscriptionProps {
  idUtilisateur: number;
  idAtelier: number;
  dateInscription?: Date;
  statutInscription?: StatutInscription;
}

export class Inscription {
  readonly idUtilisateur: number;
  readonly idAtelier: number;
  readonly dateInscription: Date;
  statutInscription: StatutInscription;

  constructor(props: InscriptionProps) {
    this.idUtilisateur = props.idUtilisateur;
    this.idAtelier = props.idAtelier;
    this.dateInscription = props.dateInscription ?? new Date();
    this.statutInscription = props.statutInscription ?? "CONFIRMEE";
  }

  annuler(): void {
    this.statutInscription = "ANNULEE";
  }
}
