export interface SocieteProps {
  idSociete?: number;
  raisonSociale: string;
  siret: string;
  adresseFacturation: string;
}

export class Societe {
  readonly idSociete?: number;
  readonly raisonSociale: string;
  readonly siret: string;
  readonly adresseFacturation: string;

  constructor(props: SocieteProps) {
    if (!props.siret || props.siret.length !== 14) {
      throw new Error("Le SIRET d'une société doit comporter exactement 14 caractères.");
    }
    this.idSociete = props.idSociete;
    this.raisonSociale = props.raisonSociale;
    this.siret = props.siret;
    this.adresseFacturation = props.adresseFacturation;
  }
}
