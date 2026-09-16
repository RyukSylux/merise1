import { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import {
  DomainError,
  EntityNotFoundError,
  RoomUnderMaintenanceError,
  OverlappingReservationError,
  WorkshopFullError,
  AlreadyRegisteredError,
  PastReservationCancellationError,
  InvalidDateRangeError,
} from "../../../../domain/errors/DomainError.js";

export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  // Validation Zod
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: "VALIDATION_ERROR",
        message: "Les données fournies dans la requête sont invalides.",
        details: err.issues.map((issue) => ({
          champ: issue.path.join("."),
          message: issue.message,
        })),
      },
    });
    return;
  }

  // Erreurs Métier du Domaine
  if (err instanceof EntityNotFoundError) {
    res.status(404).json({
      success: false,
      error: {
        code: "NOT_FOUND",
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof RoomUnderMaintenanceError) {
    res.status(409).json({
      success: false,
      error: {
        code: "ROOM_UNDER_MAINTENANCE",
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof OverlappingReservationError) {
    res.status(409).json({
      success: false,
      error: {
        code: "OVERLAPPING_RESERVATION",
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof WorkshopFullError) {
    res.status(422).json({
      success: false,
      error: {
        code: "WORKSHOP_FULL",
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof AlreadyRegisteredError) {
    res.status(409).json({
      success: false,
      error: {
        code: "ALREADY_REGISTERED",
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof PastReservationCancellationError) {
    res.status(400).json({
      success: false,
      error: {
        code: "PAST_RESERVATION_CANCELLATION",
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof InvalidDateRangeError) {
    res.status(400).json({
      success: false,
      error: {
        code: "INVALID_DATE_RANGE",
        message: err.message,
      },
    });
    return;
  }

  if (err instanceof DomainError) {
    res.status(400).json({
      success: false,
      error: {
        code: "DOMAIN_ERROR",
        message: err.message,
      },
    });
    return;
  }

  // Erreur interne non gérée
  console.error("❌ [ERREUR NON GÉRÉE] :", err);
  res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: err.message || "Une erreur interne est survenue.",
    },
  });
}
