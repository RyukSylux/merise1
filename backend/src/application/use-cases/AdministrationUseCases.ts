import {
  ISalleMaintenanceUseCase,
  BasculerMaintenanceCommand,
  IRegistrePresenceUseCase,
  IFacturationMensuelleUseCase,
} from "../../domain/ports/inbound/IAdministrationUseCases.js";
import { IEspaceRepository } from "../../domain/ports/outbound/IEspaceRepository.js";
import { IReservationRepository } from "../../domain/ports/outbound/IReservationRepository.js";
import { IFactureRepository } from "../../domain/ports/outbound/IFactureRepository.js";
import { IUtilisateurRepository } from "../../domain/ports/outbound/IUtilisateurRepository.js";
import { Facture, LigneFacture } from "../../domain/entities/Facture.js";
import { EntityNotFoundError } from "../../domain/errors/DomainError.js";

export class BasculerMaintenanceUseCase implements ISalleMaintenanceUseCase {
  constructor(private readonly espaceRepo: IEspaceRepository) {}

  async executer(command: BasculerMaintenanceCommand): Promise<{ idSalle: number; nomSalle: string; estMaintenance: boolean }> {
    const salle = await this.espaceRepo.trouverSalleParId(command.idSalle);
    if (!salle) {
      throw new EntityNotFoundError("SalleReunion", command.idSalle);
    }

    if (command.estMaintenance) {
      salle.mettreEnMaintenance();
    } else {
      salle.retirerDeMaintenance();
    }

    await this.espaceRepo.mettreAJourMaintenanceSalle(command.idSalle, salle.estMaintenance);

    return {
      idSalle: command.idSalle,
      nomSalle: salle.nomSalle,
      estMaintenance: salle.estMaintenance,
    };
  }
}

export class ObtenirRegistrePresenceUseCase implements IRegistrePresenceUseCase {
  constructor(private readonly reservationRepo: IReservationRepository) {}

  async obtenirPresencesSite(idSite: number) {
    return await this.reservationRepo.trouverPresencesActuellesParSite(idSite, new Date());
  }
}

export class CloturerFacturationUseCase implements IFacturationMensuelleUseCase {
  constructor(
    private readonly reservationRepo: IReservationRepository,
    private readonly utilisateurRepo: IUtilisateurRepository,
    private readonly factureRepo: IFactureRepository
  ) {}

  async cloturerMois(annee: number, mois: number): Promise<{
    nbFacturesCreees: number;
    totalFactureHt: number;
    totalFactureTtc: number;
  }> {
    // Récupérer les réservations payantes du mois
    const reservations = await this.reservationRepo.trouverReservationsNonFactureesDuMois(annee, mois);

    // Grouper par utilisateur
    const reservationsParUtilisateur = new Map<number, typeof reservations>();
    for (const r of reservations) {
      const list = reservationsParUtilisateur.get(r.idUtilisateur) ?? [];
      list.push(r);
      reservationsParUtilisateur.set(r.idUtilisateur, list);
    }

    let nbFacturesCreees = 0;
    let totalFactureHt = 0;
    let totalFactureTtc = 0;

    for (const [idUtilisateur, resas] of reservationsParUtilisateur.entries()) {
      const user = await this.utilisateurRepo.trouverParId(idUtilisateur);
      if (!user) continue;

      const ref = `FACT-${annee}${String(mois).padStart(2, "0")}-U${idUtilisateur}-${Date.now().toString().slice(-4)}`;
      const lignes: LigneFacture[] = resas.map((resa, index) => {
        const montantHt = Math.round((resa.montantTotal / 1.20) * 100) / 100;
        return new LigneFacture({
          numLigne: index + 1,
          description: `Réservation #${resa.idReservation} du ${resa.dateHeureDebut.toLocaleDateString("fr-FR")}`,
          quantite: 1,
          prixUnitaireHt: montantHt,
          montantHt,
          idReservation: resa.idReservation,
        });
      });

      const totalHt = lignes.reduce((s, l) => s + l.montantHt, 0);
      const totalTva = Math.round(totalHt * 0.20 * 100) / 100;
      const totalTtc = Math.round((totalHt + totalTva) * 100) / 100;

      // Si l'utilisateur est affilié à une société -> Facture à la société, sinon à l'utilisateur
      const facture = new Facture({
        reference: ref,
        dateEmission: new Date(),
        montantHt: totalHt,
        montantTva: totalTva,
        montantTtc: totalTtc,
        statutPaiement: "EN_ATTENTE",
        idUtilisateur: user.idSociete ? null : user.idUtilisateur,
        idSociete: user.idSociete ?? null,
        lignes,
      });

      await this.factureRepo.sauvegarder(facture);
      nbFacturesCreees += 1;
      totalFactureHt += totalHt;
      totalFactureTtc += totalTtc;
    }

    return {
      nbFacturesCreees,
      totalFactureHt: Math.round(totalFactureHt * 100) / 100,
      totalFactureTtc: Math.round(totalFactureTtc * 100) / 100,
    };
  }
}
