import { describe, it, expect } from "vitest";
import { errorHandler } from "../../../src/adapters/inbound/http/middlewares/errorHandler.js";
import {
  RoomUnderMaintenanceError,
  OverlappingReservationError,
  WorkshopFullError,
  EntityNotFoundError,
} from "../../../src/domain/errors/DomainError.js";
import { z } from "zod";

describe("TDD Palier 5 — Adaptateurs Inbound HTTP : errorHandler", () => {
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

  it("traduit RoomUnderMaintenanceError en HTTP 409 Conflict", () => {
    const req: any = {};
    const res = createMockRes();
    const next: any = () => {};

    errorHandler(new RoomUnderMaintenanceError("Salle Vauban"), req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe("ROOM_UNDER_MAINTENANCE");
  });

  it("traduit OverlappingReservationError en HTTP 409 Conflict", () => {
    const req: any = {};
    const res = createMockRes();
    const next: any = () => {};

    errorHandler(new OverlappingReservationError(), req, res, next);

    expect(res.statusCode).toBe(409);
    expect(res.body.error.code).toBe("OVERLAPPING_RESERVATION");
  });

  it("traduit WorkshopFullError en HTTP 422 Unprocessable Entity", () => {
    const req: any = {};
    const res = createMockRes();
    const next: any = () => {};

    errorHandler(new WorkshopFullError("Atelier Dev"), req, res, next);

    expect(res.statusCode).toBe(422);
    expect(res.body.error.code).toBe("WORKSHOP_FULL");
  });

  it("traduit EntityNotFoundError en HTTP 404 Not Found", () => {
    const req: any = {};
    const res = createMockRes();
    const next: any = () => {};

    errorHandler(new EntityNotFoundError("Poste", 999), req, res, next);

    expect(res.statusCode).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  it("traduit une ZodError de validation en HTTP 400 Bad Request", () => {
    const req: any = {};
    const res = createMockRes();
    const next: any = () => {};

    const schema = z.object({ idPoste: z.number().positive() });
    let zodErr: any;
    try {
      schema.parse({ idPoste: -5 });
    } catch (e) {
      zodErr = e;
    }

    errorHandler(zodErr, req, res, next);

    expect(res.statusCode).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
  });
});
