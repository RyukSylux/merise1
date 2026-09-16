export interface InscrireAtelierCommand {
  idUtilisateur: number;
  idAtelier: number;
}

export interface InscrireAtelierResult {
  idAtelier: number;
  titre: string;
  dateHeure: Date;
  placesRestantes: number;
  statutInscription: string;
  message: string;
}

export interface IInscrireAtelierUseCase {
  executer(command: InscrireAtelierCommand): Promise<InscrireAtelierResult>;
}
