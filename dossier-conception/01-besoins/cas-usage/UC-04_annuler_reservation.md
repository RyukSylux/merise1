# Fiche de Cas d'Usage — UC-04 : Annuler une réservation

| Champ | Description |
| :--- | :--- |
| **Identifiant** | **UC-04** |
| **Nom** | **Annuler une réservation** |
| **Acteur principal** | **Coworker** (A1) |
| **Acteurs secondaires** | **Service d'e-mailing** (A7), **Prestataire de paiement** (A6 - si remboursement), **Hôte d'accueil** (A3) |
| **Parties prenantes** | **Gérant** (impact financier / taux d'occupation) |
| **Déclencheur** | Le coworker souhaite annuler une réservation de poste ou de salle de réunion préalablement effectuée. |
| **Préconditions** | 1. Le coworker est authentifié.<br>2. La réservation est en statut `CONFIRMEE` et sa date de début est supérieure à la date/heure courante. |
| **Postconditions** | 1. La réservation passe en statut `ANNULEE`.<br>2. L'espace (poste ou salle) est libéré et remis en disponibilité en temps réel.<br>3. Le crédit d'heures de quota est récrédité OU un remboursement est ordonné au PSP selon le délai d'annulation. |

---

## Scénario Nominal (Annulation dans les délais > 24h)

1. Le **Coworker** consulte la liste de ses réservations à venir dans son espace personnel.
2. Le **Coworker** sélectionne une réservation active et clique sur « Annuler la réservation ».
3. Le **Système** contrôle la date/heure courante par rapport à la date de début de la réservation.
4. Le **Système** constate que le délai d'annulation est supérieur à 24 heures (**RG-08** : Annulation gratuite > 24h avant).
5. Le **Système** vérifie le mode d'imputation initial (crédit quota ou paiement CB).
6. Le **Système** restituer l'intégralité du quota d'heures au compteur de l'abonné pour le mois en cours.
7. Le **Système** enregistre le statut `ANNULEE` sur la réservation et libère le créneau horaire de l'espace.
8. Le **Système** envoie un e-mail de confirmation d'annulation au coworker via le **Service d'e-mailing**.

---

## Scénarios Alternatifs

- **5a. Annulation partielle / Remboursement CB (Non-abonné ou dépassement de quota)** :
  1. La réservation avait été payée par carte bancaire.
  2. Le Système calcule le montant à rembourser à 100 % (car annulation > 24h).
  3. Le Système émet un ordre de remboursement au **Prestataire de paiement** (A6).
  4. Le PSP confirme le remboursement partiel/total.
  5. Le scénario reprend à l'étape 7.

- **4a. Annulation hors délai (< 24h avant le début)** :
  1. Le Système constate que le délai avant la réservation est inférieur à 24h (ex: 4h avant le début).
  2. Le Système applique la règle de pénalité **RG-09** (50 % du montant conservé ou 50 % des heures de quota consommées).
  3. Le Système affiche le récapitulatif de la pénalité au coworker et demande confirmation.
  4. Le coworker confirme l'annulation malgré la retenue.
  5. Le Système recrédite seulement 50 % des heures de quota (ou ordonne un remboursement de 50 % sur CB).
  6. Le scénario reprend à l'étape 7.

---

## Exceptions

- **3a. Réservation déjà commencée ou passée** :
  1. Le coworker tente d'annuler une réservation dont la date de début est déjà dépassée.
  2. Le Système bloque l'annulation et affiche le message « Impossible d'annuler une réservation déjà débutée ».

- **5a1. Échec de la transaction de remboursement PSP** :
  1. Le PSP retourne une erreur lors de l'ordre de remboursement.
  2. Le Système enregistre un avoir comptable sur le compte du coworker et passe la réservation en `ANNULEE_AVOIR`.

---

## Règles de Gestion Associées

- **RG-08 (Annulation gratuite)** : Toute annulation effectuée plus de 24 heures avant le début de la réservation donne droit à une restitution intégrale (quota ou remboursement).
- **RG-09 (Annulation tardive)** : Toute annulation effectuée moins de 24 heures avant le début donne lieu à une pénalité de 50 % de la valeur du créneau réservé.

---

## Exigences Non Fonctionnelles

- **Disponibilité en Temps Réel** : Dès que l'annulation est validée, le créneau horaire doit réapparaître immédiatement comme disponible sur le catalogue en temps réel.
