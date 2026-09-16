import { z } from "zod";

export const reserverPosteSchema = z.object({
  idPoste: z.coerce.number().positive("L'identifiant du poste doit être un nombre positif."),
  dateHeureDebut: z.string().datetime("La date de début doit être au format ISO 8601."),
  dateHeureFin: z.string().datetime("La date de fin doit être au format ISO 8601."),
});

export const reserverSalleSchema = z.object({
  idSalle: z.coerce.number().positive("L'identifiant de la salle doit être un nombre positif."),
  dateHeureDebut: z.string().datetime("La date de début doit être au format ISO 8601."),
  dateHeureFin: z.string().datetime("La date de fin doit être au format ISO 8601."),
});

export const inscrireAtelierSchema = z.object({
  idAtelier: z.coerce.number().positive("L'identifiant de l'atelier doit être un nombre positif."),
});

export const annulerReservationSchema = z.object({
  idReservation: z.coerce.number().positive("L'identifiant de la réservation doit être un nombre positif."),
});

export const basculerMaintenanceSchema = z.object({
  estMaintenance: z.boolean(),
});

export const cloturerFacturationSchema = z.object({
  annee: z.coerce.number().int().min(2020).max(2100),
  mois: z.coerce.number().int().min(1).max(12),
});
