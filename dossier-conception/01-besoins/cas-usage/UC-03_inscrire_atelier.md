# Fiche de Cas d'Usage — UC-03 : S'inscrire à un atelier du jeudi soir

| Champ | Description |
| :--- | :--- |
| **Identifiant** | **UC-03** |
| **Nom** | **S'inscrire à un atelier du jeudi soir** |
| **Acteur principal** | **Coworker** (A1) |
| **Acteurs secondaires** | **Service d'e-mailing** (A7), **Animateur d'atelier** (A5) |
| **Parties prenantes** | **Gérant** (indicateurs d'animation communautaire) |
| **Déclencheur** | Le coworker souhaite réserver sa place pour un atelier événementiel organisé le jeudi soir. |
| **Préconditions** | 1. Le coworker est authentifié.<br>2. L'atelier est publié et la date limite d'inscription n'est pas dépassée. |
| **Postconditions** | 1. L'inscription est enregistrée en base (`date_inscription`).<br>2. Le nombre de places réservées (`nb_inscrits`) de l'atelier est incrémenté de 1.<br>3. Un e-mail de confirmation avec billet d'accès est envoyé. |

---

## Scénario Nominal

1. Le **Coworker** consulte le programme des ateliers du jeudi soir organisés sur son site rattaché (ou sur d'autres sites CoWork'In).
2. Le **Système** affiche la fiche détaillée de l'atelier (thématique, intervenant, horaire, nombre de places disponibles sur la jauge).
3. Le **Coworker** clique sur « S'inscrire ».
4. Le **Système** vérifie que le nombre de places réservées est strictement inférieur au nombre de places maximum (**RG-06**).
5. Le **Système** enregistre la relation `Inscription` entre le coworker et l'atelier avec la date/heure courante.
6. Le **Système** incrémente le compteur `nb_inscrits` de l'atelier.
7. Le **Système** envoie un e-mail de confirmation au coworker via le **Service d'e-mailing** et informe l'animateur.

---

## Scénarios Alternatifs

- **4a. Atelier complet — Inscription sur liste d'attente** :
  1. Le Système constate que `nb_inscrits == places_max`.
  2. Le Système propose au coworker de s'inscrire sur la liste d'attente (rang attribué automatiquement).
  3. Le coworker accepte.
  4. Le Système enregistre l'inscription en statut `LISTE_ATTENTE`.
  5. Le cas d'usage se termine avec notification de prise en compte sur liste d'attente.

- **3a. Annulation par le coworker** :
  1. Le coworker choisit « Annuler mon inscription » à un atelier où il est inscrit.
  2. Le Système supprime l'inscription (ou la passe en statut `ANNULEE`).
  3. Le Système décrémente `nb_inscrits` et notifie automatiquement le premier membre de la liste d'attente pour lui promouvoir la place.

---

## Exceptions

- **4a1. Inscription en double** :
  1. Le coworker tente de s'inscrire à un atelier auquel il est déjà inscrit.
  2. Le Système détecte l'existence d'une inscription active et rejette la demande avec le message « Vous êtes déjà inscrit à cet atelier ».

- **2a. Atelier annulé par l'organisateur** :
  1. L'animateur ou le gérant annule l'atelier.
  2. Le Système passe l'atelier en statut `ANNULE` et envoie une notification d'annulation à tous les participants inscrits.

---

## Règles de Gestion Associées

- **RG-06 (Jauge d'Atelier)** : Le nombre total d'inscriptions confirmées à un atelier ne peut en aucun cas dépasser `places_max` fixé par l'organisateur (normes de sécurité et confort).
- **RG-07 (Unicité d'Inscription)** : Un même coworker ne peut s'inscrire qu'une seule fois à une même session d'atelier.

---

## Exigences Non Fonctionnelles

- **Concurrence** : Le contrôle de la jauge doit utiliser un verrouillage (optimiste ou pessimiste) pour éviter les sur-inscriptions simultanées au franchissement de la dernière place.
- **Réactivité** : Mise à jour immédiate de la jauge sur l'interface utilisateur web.
