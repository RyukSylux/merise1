export interface LigneFactureProps {
  idFacture?: number;
  numLigne: number;
  description: string;
  quantite?: number;
  prixUnitaireHt: number;
  montantHt: number;
  idReservation?: number | null;
}

export class LigneFacture {
  idFacture?: number;
  readonly numLigne: number;
  readonly description: string;
  readonly quantite: number;
  readonly prixUnitaireHt: number;
  readonly montantHt: number;
  readonly idReservation: number | null;

  constructor(props: LigneFactureProps) {
    this.idFacture = props.idFacture;
    this.numLigne = props.numLigne;
    this.description = props.description;
    this.quantite = Number(props.quantite ?? 1.0);
    this.prixUnitaireHt = Number(props.prixUnitaireHt);
    this.montantHt = Number(props.montantHt);
    this.idReservation = props.idReservation ?? null;
  }
}

export type StatutPaiement = "EN_ATTENTE" | "PAYEE" | "ECHOUEE";

export interface FactureProps {
  idFacture?: number;
  reference: string;
  dateEmission?: Date;
  montantHt: number;
  montantTva: number;
  montantTtc: number;
  statutPaiement?: StatutPaiement;
  idUtilisateur?: number | null;
  idSociete?: number | null;
  lignes?: LigneFacture[];
}

export class Facture {
  readonly idFacture?: number;
  readonly reference: string;
  readonly dateEmission: Date;
  montantHt: number;
  montantTva: number;
  montantTtc: number;
  statutPaiement: StatutPaiement;
  readonly idUtilisateur: number | null;
  readonly idSociete: number | null;
  readonly lignes: LigneFacture[];

  constructor(props: FactureProps) {
    // Règle d'exclusion mutuelle : soit idUtilisateur, soit idSociete
    const hasUser = props.idUtilisateur !== undefined && props.idUtilisateur !== null;
    const hasCompany = props.idSociete !== undefined && props.idSociete !== null;
    if ((hasUser && hasCompany) || (!hasUser && !hasCompany)) {
      throw new Error("Une facture doit être adressée SOIT à un utilisateur individuel, SOIT à une société (exclusion mutuelle).");
    }

    this.idFacture = props.idFacture;
    this.reference = props.reference;
    this.dateEmission = props.dateEmission ?? new Date();
    this.montantHt = Number(props.montantHt);
    this.montantTva = Number(props.montantTva);
    this.montantTtc = Number(props.montantTtc);
    this.statutPaiement = props.statutPaiement ?? "EN_ATTENTE";
    this.idUtilisateur = props.idUtilisateur ?? null;
    this.idSociete = props.idSociete ?? null;
    this.lignes = props.lignes ?? [];
  }

  marquerPayee(): void {
    this.statutPaiement = "PAYEE";
  }

  ajouterLigne(ligne: LigneFacture): void {
    this.lignes.push(ligne);
    this.recalculerTotaux();
  }

  recalculerTotaux(): void {
    const totalHt = this.lignes.reduce((sum, l) => sum + l.montantHt, 0);
    this.montantHt = Math.round(totalHt * 100) / 100;
    this.montantTva = Math.round(this.montantHt * 0.20 * 100) / 100; // TVA 20% standard
    this.montantTtc = Math.round((this.montantHt + this.montantTva) * 100) / 100;
  }
}
