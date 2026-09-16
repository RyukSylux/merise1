-- =============================================================================
-- CoWork'In — Script DDL 002 : Contraintes de Clés Étrangères & Validations CHECK
-- Version : 1.0.0
-- =============================================================================

-- -----------------------------------------------------------------------------
-- Clés Étrangères (Foreign Keys)
-- -----------------------------------------------------------------------------

ALTER TABLE utilisateur
    ADD CONSTRAINT fk_utilisateur_societe
    FOREIGN KEY (id_societe) REFERENCES societe(id_societe)
    ON DELETE SET NULL;

ALTER TABLE abonnement
    ADD CONSTRAINT fk_abonnement_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
    ON DELETE RESTRICT,
    ADD CONSTRAINT fk_abonnement_formule
    FOREIGN KEY (id_formule) REFERENCES formule(id_formule)
    ON DELETE RESTRICT;

ALTER TABLE espace
    ADD CONSTRAINT fk_espace_site
    FOREIGN KEY (id_site) REFERENCES site(id_site)
    ON DELETE RESTRICT;

ALTER TABLE poste
    ADD CONSTRAINT fk_poste_espace
    FOREIGN KEY (id_espace) REFERENCES espace(id_espace)
    ON DELETE CASCADE;

ALTER TABLE salle_reunion
    ADD CONSTRAINT fk_salle_espace
    FOREIGN KEY (id_espace) REFERENCES espace(id_espace)
    ON DELETE CASCADE;

ALTER TABLE reservation
    ADD CONSTRAINT fk_reservation_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
    ON DELETE RESTRICT,
    ADD CONSTRAINT fk_reservation_espace
    FOREIGN KEY (id_espace) REFERENCES espace(id_espace)
    ON DELETE RESTRICT;

ALTER TABLE atelier
    ADD CONSTRAINT fk_atelier_site
    FOREIGN KEY (id_site) REFERENCES site(id_site)
    ON DELETE RESTRICT;

ALTER TABLE inscription
    ADD CONSTRAINT fk_inscription_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
    ON DELETE CASCADE,
    ADD CONSTRAINT fk_inscription_atelier
    FOREIGN KEY (id_atelier) REFERENCES atelier(id_atelier)
    ON DELETE CASCADE;

ALTER TABLE facture
    ADD CONSTRAINT fk_facture_utilisateur
    FOREIGN KEY (id_utilisateur) REFERENCES utilisateur(id_utilisateur)
    ON DELETE SET NULL,
    ADD CONSTRAINT fk_facture_societe
    FOREIGN KEY (id_societe) REFERENCES societe(id_societe)
    ON DELETE SET NULL;

ALTER TABLE ligne_facture
    ADD CONSTRAINT fk_ligne_facture_parent
    FOREIGN KEY (id_facture) REFERENCES facture(id_facture)
    ON DELETE CASCADE,
    ADD CONSTRAINT fk_ligne_reservation
    FOREIGN KEY (id_reservation) REFERENCES reservation(id_reservation)
    ON DELETE SET NULL;

-- -----------------------------------------------------------------------------
-- Contraintes de Validation Nommées (CHECK Constraints)
-- -----------------------------------------------------------------------------

ALTER TABLE site
    ADD CONSTRAINT chk_site_capacite_positive
    CHECK (capacite_max > 0);

ALTER TABLE salle_reunion
    ADD CONSTRAINT chk_salle_capacite_positive
    CHECK (capacite_personnes > 0);

ALTER TABLE reservation
    ADD CONSTRAINT chk_reservation_dates_coherentes
    CHECK (date_heure_fin > date_heure_debut),
    ADD CONSTRAINT chk_reservation_statut_valide
    CHECK (statut IN ('CONFIRMEE', 'ANNULEE', 'ANNULEE_PENALITE', 'TERMINEE')),
    ADD CONSTRAINT chk_reservation_montant_positif
    CHECK (montant_total >= 0.00);

ALTER TABLE atelier
    ADD CONSTRAINT chk_atelier_jauge_coherente
    CHECK (nb_inscrits >= 0 AND nb_inscrits <= places_max),
    ADD CONSTRAINT chk_atelier_places_positives
    CHECK (places_max > 0);

ALTER TABLE facture
    ADD CONSTRAINT chk_facture_destinataire_exclusif
    CHECK (
        (id_utilisateur IS NOT NULL AND id_societe IS NULL) OR
        (id_utilisateur IS NULL AND id_societe IS NOT NULL)
    ),
    ADD CONSTRAINT chk_facture_montants_coherents
    CHECK (montant_ht >= 0.00 AND montant_tva >= 0.00 AND montant_ttc >= montant_ht);
