# Document d'Analyse des Acteurs et Parties Prenantes — CoWork'In

## 1. Tableau des Acteurs du Système

Un **acteur** désigne un rôle joué par un utilisateur ou un système externe qui interagit directement avec la plateforme CoWork'In.

| Code | Acteur | Type | Objectif vis-à-vis du système | Droits & Périmètre de Sécurité |
| :--- | :--- | :--- | :--- | :--- |
| **A1** | **Coworker** | Principal &middot; Humain | Consulter les disponibilités, réserver un poste/salle, s'inscrire à un atelier, suivre ses réservations et factures. | Accès strict à son compte personnel et à ses réservations. |
| **A2** | **Référent Société** | Principal &middot; Humain | Rattacher ou retirer des collaborateurs, suivre la consommation globale de l'entreprise et récupérer la facture consolidée. | Gestion limitée aux collaborateurs associés à sa société. |
| **A3** | **Hôte d'accueil** | Principal &middot; Humain | Exploiter le site au quotidien : enregistrer les arrivées/départs, fermer/rouvrir un espace pour maintenance, éditer le registre d'évacuation. | Lecture/Écriture sur les présences du site rattaché et l'état des salles. |
| **A4** | **Gérant** | Principal &middot; Humain | Superviser l'activité globale, analyser le taux d'occupation par site, consulter et valider le rapport de facturation mensuel. | Accès complet aux données statistiques, financières et multi-sites. |
| **A5** | **Animateur d'atelier** | Principal &middot; Humain | Proposer un atelier du jeudi soir, gérer les jauges et consulter la liste des personnes inscrites. | Accès restreint aux ateliers dont il est l'organisateur. |
| **A6** | **Prestataire de Paiement (PSP)** | Secondaire &middot; Système | Valider les paiements par carte bancaire et notifier le système en cas de succès ou d'échec de transaction. | Communication sécurisée via API / Webhook. Aucune donnée bancaire stockée chez CoWork'In. |
| **A7** | **Service d'e-mailing** | Secondaire &middot; Système | Router les notifications (confirmations de réservation, rappels d'ateliers, envoi des factures PDF). | Communication sortante via API SMTP / Transactionnelle. |
| **A8** | **Planificateur (Temps)** | Secondaire &middot; Horloge | Déclencher automatiquement des traitements récurrents (clôture mensuelle de facturation le 1er du mois à 00h00, relances). | Exécution automatique en tâche de fond (Cron job / Worker). |

---

## 2. Tableau des Parties Prenantes (Non-Actrices)

Une **partie prenante** a un intérêt direct ou indirect dans le fonctionnement du système mais n'interagit pas directement avec l'application web.

| Partie Prenante | Intérêt / Exigence vis-à-vis de CoWork'In | Impact sur la Conception |
| :--- | :--- | :--- |
| **DPO (Délégué à la Protection des Données)** | Respect du RGPD : droit à l'oubli, minimisation des données collectées (notamment le registre de présence), durée de conservation des données. | Anonymisation après 3 ans des données d'historique de présence. Masquage des données sensibles. |
| **Expert-Comptable / DAF** | Conformité fiscale et comptable des factures émises (numérotation séquentielle sans trou, mentions légales, ventilation TVA). | Immuabilité des factures générées (non-modifiables une fois émises). |
| **Bailleur Immobilier** | Respect des capacités maximales autorisées par établissement (normes ERP / sécurité incendie). | Blocage strict des jauges maximales par salle et par site. |

---

## 3. Questions d'Analyse à Poser au Client

1. **Rôle d'Administration Technique** : Qui est habilité à créer un nouveau site (ex: ouvrir un 4ème espace à Arras) ou à faire évoluer le tarif des abonnements ? *(Proposition : Ajouter un rôle A9 Admin Système)*.
2. **Politique d'Annulation** : Jusqu'à combien de temps avant le début d'une réservation un coworker peut-il annuler sans pénalité financière ?
3. **Double Rôle Utilisateur** : Salma est hôtesse d'accueil le mardi mais coworker le samedi. Confirmez-vous qu'un même compte utilisateur peut cumuler les rôles **Coworker** et **Hôte d'accueil** avec bascule de contexte ?
