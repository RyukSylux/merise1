export interface ReserverPosteCommand {
  idUtilisateur: number;
  idPoste: number;
  dateHeureDebut: Date;
  dateHeureFin: Date;
}

export interface ReserverPosteResult {
  idReservation: number;
  codeEspace: string;
  dateHeureDebut: Date;
  dateHeureFin: Date;
  estGratuitAbonne: boolean;
  montantTotal: number;
  statut: string;
}

export interface IReserverPosteUseCase {
  executer(command: ReserverPosteCommand): Promise<ReserverPosteResult>;
}
