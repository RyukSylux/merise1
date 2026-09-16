import { Abonnement, Formule } from "../../entities/Abonnement.js";

export interface IAbonnementRepository {
  trouverAbonnementActif(idUtilisateur: number, aLaDate?: Date): Promise<{ abonnement: Abonnement; formule: Formule } | null>;
  trouverFormuleParId(idFormule: number): Promise<Formule | null>;
  listerFormules(): Promise<Formule[]>;
}
