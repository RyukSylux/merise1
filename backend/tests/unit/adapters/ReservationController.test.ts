import { describe, it, expect } from "vitest";
import { ReservationController } from "../../../src/adapters/inbound/http/controllers/ReservationController.js";

describe("TDD Palier 5 — Adaptateurs Inbound HTTP : ReservationController", () => {
  function createMockRes() {
    const res: any = {};
    res.statusCode = 200;
    res.body = null;
    res.status = (code: number) => {
      res.statusCode = code;
      return res;
    };
    res.json = (data: any) => {
      res.body = data;
      return res;
    };
    return res;
  }

  it("répond en HTTP 201 avec le DTO de retour lors d'une réservation de poste réussie (UC-01)", async () => {
    const mockReserverPoste = {
      executer: async (cmd: any) => ({
        idReservation: 77,
        codeEspace: "LIL-P-01",
        dateHeureDebut: cmd.dateHeureDebut,
        dateHeureFin: cmd.dateHeureFin,
        estGratuitAbonne: true,
        montantTotal: 0,
        statut: "CONFIRMEE",
      }),
    };

    const controller = new ReservationController(
      mockReserverPoste as any,
      {} as any,
      {} as any,
      {} as any
    );

    const req: any = {
      body: {
        idPoste: 10,
        dateHeureDebut: "2026-10-10T09:00:00.000Z",
        dateHeureFin: "2026-10-10T12:00:00.000Z",
      },
      user: { idUtilisateur: 1, role: "COWORKER" },
    };
    const res = createMockRes();
    const next: any = () => {};

    await controller.reserverPoste(req, res, next);

    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.idReservation).toBe(77);
    expect(res.body.data.estGratuitAbonne).toBe(true);
  });

  it("répond en HTTP 200 avec le DTO de restitution lors d'une annulation de réservation (UC-04)", async () => {
    const mockAnnuler = {
      executer: async (cmd: any) => ({
        idReservation: cmd.idReservation,
        statut: "ANNULEE",
        penaliteAppliquee: false,
        montantRembourse: 50.0,
        montantPenalite: 0,
        message: "Annulation sans pénalité.",
      }),
    };

    const controller = new ReservationController(
      {} as any,
      {} as any,
      mockAnnuler as any,
      {} as any
    );

    const req: any = {
      params: { id: "88" },
      user: { idUtilisateur: 1, role: "COWORKER" },
    };
    const res = createMockRes();
    const next: any = () => {};

    await controller.annulerReservation(req, res, next);

    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.idReservation).toBe(88);
    expect(res.body.data.montantRembourse).toBe(50.0);
  });
});
