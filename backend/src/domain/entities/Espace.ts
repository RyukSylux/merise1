export interface EspaceProps {
  idEspace?: number;
  code: string;
  etage: number;
  idSite: number;
}

export abstract class Espace {
  readonly idEspace?: number;
  readonly code: string;
  readonly etage: number;
  readonly idSite: number;

  constructor(props: EspaceProps) {
    this.idEspace = props.idEspace;
    this.code = props.code;
    this.etage = props.etage;
    this.idSite = props.idSite;
  }
}

export interface PosteProps extends EspaceProps {
  estElectrique: boolean;
  aEcranExterne: boolean;
}

export class Poste extends Espace {
  readonly estElectrique: boolean;
  readonly aEcranExterne: boolean;

  constructor(props: PosteProps) {
    super(props);
    this.estElectrique = props.estElectrique;
    this.aEcranExterne = props.aEcranExterne;
  }
}

export interface SalleReunionProps extends EspaceProps {
  nomSalle: string;
  capacitePersonnes: number;
  equipements?: string | null;
  estMaintenance?: boolean;
}

export class SalleReunion extends Espace {
  readonly nomSalle: string;
  readonly capacitePersonnes: number;
  readonly equipements: string | null;
  estMaintenance: boolean;

  constructor(props: SalleReunionProps) {
    super(props);
    if (props.capacitePersonnes <= 0) {
      throw new Error("La capacité d'une salle de réunion doit être strictement positive.");
    }
    this.nomSalle = props.nomSalle;
    this.capacitePersonnes = props.capacitePersonnes;
    this.equipements = props.equipements ?? null;
    this.estMaintenance = props.estMaintenance ?? false;
  }

  mettreEnMaintenance(): void {
    this.estMaintenance = true;
  }

  retirerDeMaintenance(): void {
    this.estMaintenance = false;
  }

  estDisponiblePourReservation(): boolean {
    return !this.estMaintenance;
  }
}
