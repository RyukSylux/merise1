export type UserRole = "COWORKER" | "HOTE" | "GERANT";

export interface UtilisateurProps {
  idUtilisateur?: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string | null;
  role?: UserRole;
  dateCreation?: Date;
  idSociete?: number | null;
}

export class Utilisateur {
  readonly idUtilisateur?: number;
  readonly nom: string;
  readonly prenom: string;
  readonly email: string;
  readonly telephone: string | null;
  readonly role: UserRole;
  readonly dateCreation: Date;
  readonly idSociete: number | null;

  constructor(props: UtilisateurProps) {
    this.idUtilisateur = props.idUtilisateur;
    this.nom = props.nom;
    this.prenom = props.prenom;
    this.email = props.email.toLowerCase().trim();
    this.telephone = props.telephone ?? null;
    this.role = props.role ?? "COWORKER";
    this.dateCreation = props.dateCreation ?? new Date();
    this.idSociete = props.idSociete ?? null;
  }

  get nomComplet(): string {
    return `${this.prenom} ${this.nom}`;
  }

  appartientAUneSociete(): boolean {
    return this.idSociete !== null && this.idSociete !== undefined;
  }
}
