export interface SiteProps {
  idSite?: number;
  nom: string;
  ville: string;
  adresse: string;
  capaciteMax: number;
}

export class Site {
  readonly idSite?: number;
  readonly nom: string;
  readonly ville: string;
  readonly adresse: string;
  readonly capaciteMax: number;

  constructor(props: SiteProps) {
    if (props.capaciteMax <= 0) {
      throw new Error("La capacité maximale d'un site doit être strictement positive.");
    }
    this.idSite = props.idSite;
    this.nom = props.nom;
    this.ville = props.ville;
    this.adresse = props.adresse;
    this.capaciteMax = props.capaciteMax;
  }
}
