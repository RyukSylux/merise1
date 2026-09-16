# Expression de Besoin Brute & Analyse Initiale — CoWork'In

## 1. Verbatim Client (Compte-rendu d'entretien)

> « Nous gérons trois espaces de coworking, à Lille, Roubaix et Tourcoing. Aujourd'hui tout passe par un tableur partagé et des mails : on double-réserve une salle au moins une fois par semaine.
>
> On voudrait un site où les coworkers créent leur compte, voient les postes libres et les salles de réunion en temps réel, et réservent à l'heure ou à la journée. Les abonnés — formules Nomade, Résident, Team — ne paient pas les postes, mais paient les salles au-delà de 4 h par mois.
>
> À la fin du mois, il faut sortir une facture par client ; pour les sociétés, une facture globale avec le détail par collaborateur. L'équipe d'accueil doit pouvoir fermer une salle pour maintenance et voir qui est présent en cas d'évacuation. Le gérant veut un tableau de bord du taux d'occupation par site.
>
> Ah, et on organise des ateliers le jeudi soir, avec inscription en ligne et places limitées. »

---

## 2. Analyse par Lectures Successives

### Pass 1 : Qui ? (Acteurs & Parties prenantes)
- Coworkers (particuliers ou collaborateurs)
- Abonnés (Formules Nomade, Résident, Team)
- Société (Clients professionnels rattachant des collaborateurs)
- Équipe d'accueil (Hôte / Hôtesse)
- Gérant
- Animateurs / Participants aux ateliers du jeudi soir
- Systèmes tiers implicites : Prestataire de paiement (PSP), Service d'e-mailing, Planificateur mensuel de facturation

### Pass 2 : Quoi ? (Actions & Cas d'usage métier)
- Créer un compte coworker
- Consulter la disponibilité des postes et salles en temps réel
- Réserver un poste (à l'heure ou à la journée)
- Réserver une salle de réunion (calcul du quota 4h/mois offertes pour abonnés)
- Fermer / Rouvrir une salle pour maintenance
- Consulter le registre de présence en temps réel (évacuation / sécurité)
- Générer et éditer les factures mensuelles (facture individuelle ou globale société décomposée)
- Consulter le tableau de bord du taux d'occupation par site
- S'inscrire / Annuler l'inscription à un atelier du jeudi soir

### Pass 3 : Sur quoi ? (Entités & Objets du domaine)
- **Site** (Lille, Roubaix, Tourcoing)
- **Espace** / **Poste** / **SalleReunion**
- **Utilisateur** / **Societe**
- **Formule** / **Abonnement**
- **Reservation**
- **Atelier** / **Inscription**
- **Facture** / **LigneFacture**

---

## 3. Trous dans l'Expression de Besoin & Questions Client

1. **Gestion des abonnements** : Qui crée et modifie les tarifs des formules (Nomade, Résident, Team) ? Existe-t-il un rôle d'administrateur système ?
2. **Paiement immédiat vs Différé** : Les non-abonnés paient-ils la réservation immédiatement par CB sur le site ou lors de la facturation mensuelle ?
3. **Gestion des dépassements de quota** : Que se passe-t-il si un abonné réserve une salle pour 2h alors qu'il lui reste 1h de quota gratuit ? La réservation est-elle scindée (1h gratuite + 1h payante) ?
