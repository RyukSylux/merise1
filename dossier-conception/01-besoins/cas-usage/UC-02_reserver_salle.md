# Fiche de Cas d'Usage — UC-02 : Réserver une salle de réunion

| Champ | Description |
| :--- | :--- |
| **Identifiant** | **UC-02** |
| **Nom** | **Réserver une salle de réunion** |
| **Acteur principal** | **Coworker** (A1) |
| **Acteurs secondaires** | **Service d'e-mailing** (A7), **Prestataire de paiement** (A6 - en cas de dépassement de quota ou non-abonné) |
| **Parties prenantes** | **Hôte d'accueil** (A3 - notification pour préparation), **DPO** |
| **Déclencheur** | Le coworker souhaite louer une salle de réunion équipée pour une durée déterminée. |
| **Préconditions** | 1. Le coworker est authentifié.<br>2. La salle choisie est en état `DISPONIBLE` (non fermée pour maintenance). |
| **Postconditions** | 1. La réservation de la salle est validée et planifiée.<br>2. Le solde du quota mensuel d'heures offertes de l'abonné est recalculé.<br>3. Une facture d'acompte/ticket de paiement est émise si heures supplémentaires au-delà de 4h/mois. |

---

## Scénario Nominal

1. Le **Coworker** recherche une salle de réunion en indiquant la ville, la date, la plage horaire et le nombre de participants.
2. Le **Système** filtre et affiche la liste des salles de réunion disponibles avec leurs équipements (visioconférence, écran, tableau).
3. Le **Coworker** sélectionne une salle et confirme sa demande.
4. Le **Système** consulte le solde de quota mensuel d'heures gratuites de l'abonné (Règle **RG-03** : 4h offertes/mois pour abonnés Nomade, Résident, Team).
5. Le **Système** constate que la durée demandée entre intégralement dans le quota mensuel restant (ex: 2h demandées, 4h de solde).
6. Le **Système** déduit les heures du solde de l'abonné pour le mois en cours.
7. Le **Système** enregistre la réservation de la salle en statut `CONFIRMEE`.
8. Le **Système** émet une notification au coworker et informe l'hôte d'accueil du site.

---

## Scénarios Alternatifs

- **5a. Dépassement du quota mensuel de 4h (Abonné)** :
  1. Le Système calcule le solde restant (ex: 1h gratuite restante sur une réservation de 3h).
  2. Le Système calcule la part payante au tarif horaire en vigueur (ex: 2h facturables).
  3. Le Système soumet le montant résiduel au coworker pour validation.
  4. Le coworker valide et règle le complément via le **Prestataire de paiement** (A6).
  5. Le solde de quota passe à 0h et la réservation est enregistrée.
  6. Le scénario reprend à l'étape 7.

- **4a. Coworker non-abonné (Sans quota)** :
  1. Le Système applique le tarif horaire plein sur l'intégralité de la durée.
  2. Le coworker procède au règlement intégral via le **Prestataire de paiement**.
  3. Le scénario reprend à l'étape 7.

---

## Exceptions

- **2a. Salle fermée pour maintenance (RG-04)** :
  1. La salle demandée est marquée `EN_MAINTENANCE` par l'hôte d'accueil.
  2. Le Système bloque la sélection et affiche un message expliquant l'indisponibilité.
  3. Le Système propose d'autres salles aux caractéristiques équivalentes.

- **4a1. Échec du paiement complémentaire** :
  1. La transaction de paiement est rejetée par le PSP.
  2. Le Système n'impacte pas le quota gratuit du coworker et annule la prise de réservation.
  3. Le cas d'usage se termine en échec.

---

## Règles de Gestion Associées

- **RG-03 (Quota Mensuel Salle)** : Chaque abonnement (Nomade, Résident, Team) inclut un crédit de 4 heures gratuites de réservation de salle de réunion par mois civil (non reportables).
- **RG-04 (Priorité Maintenance)** : Une salle en statut `EN_MAINTENANCE` prime sur toute tentative de réservation.
- **RG-05 (Rattachement Société)** : Si le coworker est rattaché à un contrat `Societe`, les heuresconsommées sont déduites du quota global de la société ou facturées sur le compte entreprise.

---

## Exigences Non Fonctionnelles

- **Intégrité Transactionnelle** : La réservation et l'imputation de quota doivent être traitées au sein d'une même transaction de base de données (ACID) afin d'éviter tout dépassement indu du quota.
- **Notification** : Envoi de l'e-mail de confirmation sous 1 minute.
