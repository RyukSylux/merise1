export interface BasculerMaintenanceCommand {
  idSalle: number;
  estMaintenance: boolean;
}

export interface ISalleMaintenanceUseCase {
  executer(command: BasculerMaintenanceCommand): Promise<{ idSalle: number; nomSalle: string; estMaintenance: boolean }>;
}

export interface IRegistrePresenceUseCase {
  obtenirPresencesSite(idSite: number): Promise<Array<{
    idUtilisateur: number;
    nom: string;
    prenom: string;
    email: string;
    codeEspace: string;
    typeEspace: string;
    dateHeureDebut: Date;
    dateHeureFin: Date;
  }>>;
}

export interface IFacturationMensuelleUseCase {
  cloturerMois(annee: number, mois: number): Promise<{
    nbFacturesCreees: number;
    totalFactureHt: number;
    totalFactureTtc: number;
  }>;
}
