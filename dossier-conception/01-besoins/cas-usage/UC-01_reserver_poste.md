# Fiche de Cas d'Usage — UC-01 : Réserver un poste de travail

| Champ | Description |
| :--- | :--- |
| **Identifiant** | **UC-01** |
| **Nom** | **Réserver un poste de travail** |
| **Acteur principal** | **Coworker** (A1) |
| **Acteurs secondaires** | **Service d'e-mailing** (A7), **Prestataire de paiement** (A6 - si non-abonné) |
| **Parties prenantes** | **Bailleur** (respect capacité ERP) |
| **Déclencheur** | Le coworker souhaite garantir sa place de travail pour un créneau donné sur un site. |
| **Préconditions** | 1. Le coworker est authentifié sur la plateforme.<br>2. Le site choisi dispose d'au moins un poste libre sur le créneau demandé. |
| **Postconditions** | 1. La réservation du poste est enregistrée en statut `CONFIRMEE`.<br>2. Le poste est marqué indisponible pour les tiers sur le créneau.<br>3. Un e-mail de confirmation contenant un QR code / code de réservation est envoyé. |

---

## Scénario Nominal

1. Le **Coworker** sélectionne un site (Lille, Roubaix ou Tourcoing), une date et un créneau horaire (à l'heure ou à la journée).
2. Le **Système** affiche la carte interactive/liste des postes libres en temps réel pour le site et la période choisis.
3. Le **Coworker** sélectionne un poste de travail spécifique (ou demande une attribution automatique).
4. Le **Système** contrôle le statut du coworker (abonné ou non-abonné).
5. Le **Système** applique la règle **RG-01** (Gratuité du poste pour les abonnés Nomade, Résident, Team) et calcule un montant de 0,00 €.
6. Le **Système** enregistre la réservation du poste et génère le récapitulatif.
7. Le **Système** déclenche l'envoi d'un e-mail de confirmation au coworker via le **Service d'e-mailing**.

---

## Scénarios Alternatifs

- **4a. Le coworker est un utilisateur non-abonné (Ticket à l'acte)** :
  1. Le Système calcule le montant total selon le tarif horaire/journalier du poste.
  2. Le Système redirige le coworker vers l'interface sécurisée du **Prestataire de paiement** (A6).
  3. Le PSP confirme la validation du paiement.
  4. Le scénario reprend à l'étape 6.

- **3a. Attribution automatique du poste** :
  1. Le coworker choisit l'option « Choisir pour moi le meilleur poste libre ».
  2. Le Système attribue automatiquement le poste correspondant le mieux aux préférences du profil.
  3. Le scénario reprend à l'étape 4.

---

## Exceptions

- **4a1. Échec du paiement (Non-abonné)** :
  1. Le PSP notifie un refus de transaction (solde insuffisant ou rejet carte).
  2. Le Système informe le coworker et débloque immédiatement le poste réservé temporairement.
  3. Le cas d'usage s'arrête en échec.

- **6a. Concurrence d'accès (Poste réservé simultanément)** :
  1. Un autre utilisateur valide la réservation du même poste une fraction de seconde avant.
  2. Le Système informe le coworker que le poste sélectionné vient d'être pris.
  3. Le Système rafraîchit la carte et propose de sélectionner un autre poste libre.

---

## Règles de Gestion Associées

- **RG-01 (Tarification Poste Abonné)** : Tout coworker titulaire d'un abonnement actif (`Formule` Nomade, Résident ou Team) bénéficie de la gratuité illimitée sur la réservation de postes de travail simples.
- **RG-02 (Chevauchement de réservation)** : Un même coworker ne peut pas détenir deux réservations actives qui se chevauchent temporellement sur un même créneau.

---

## Exigences Non Fonctionnelles

- **Performance** : La vérification de disponibilité en temps réel doit répondre en moins de 300 ms.
- **Sécurité** : Contrôle d'accès strict sur l'identité de l'utilisateur connecté (seul le coworker peut réserver pour lui-même ou pour sa société).
- **Accessibilité** : La carte des postes doit être utilisable en mode clavier / lecteur d'écran (alternative sous forme de liste).

---

## Fréquence & Volumétrie

- **Fréquence** : Très élevée (~ 200 réservations / jour / site).
