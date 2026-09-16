import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../../../../config/env.js";

export interface AuthenticatedUser {
  idUtilisateur: number;
  role: string;
  idSociete?: number | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Support en-tête de test direct x-user-id pour faciliter les tests
  const headerUserId = req.header("x-user-id");
  if (headerUserId) {
    const role = req.header("x-user-role") || "COWORKER";
    req.user = {
      idUtilisateur: Number(headerUserId),
      role,
      idSociete: req.header("x-societe-id") ? Number(req.header("x-societe-id")) : null,
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Par défaut, si aucun header n'est fourni, on assigne l'utilisateur 1 (Jean Dupont - Nomade) pour faciliter les tests
    req.user = {
      idUtilisateur: 1,
      role: "COWORKER",
    };
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as any;
    req.user = {
      idUtilisateur: payload.idUtilisateur,
      role: payload.role || "COWORKER",
      idSociete: payload.idSociete || null,
    };
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Token d'authentification invalide ou expiré." },
    });
  }
}

export function requireRole(...rolesAutorises: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !rolesAutorises.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: `Accès réservé aux rôles suivants : ${rolesAutorises.join(", ")}`,
        },
      });
      return;
    }
    next();
  };
}
