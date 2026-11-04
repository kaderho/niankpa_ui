# Nian Kpa — Back-office

Application web de l'équipe Nian Kpa : clients (organisations, comptes),
abonnements (plans, paiements, paiements en ligne), listes de référence
envoyées aux téléphones et configuration globale.

React, TypeScript, [Ant Design](https://ant.design), React Query, Vite. Elle
appelle l'API `../niankpa_api` sous `/api/bo/`.

## Lancer en développement

```bash
npm install
npm run dev          # http://localhost:5173
```

L'API doit tourner sur `http://localhost:8000` : le serveur Vite lui renvoie
tout ce qui commence par `/api`, sans réglage CORS. Une autre adresse se
donne dans `.env` (`NIANKPA_API_PROXY`, voir `.env.example`).

Connexion : numéro et mot de passe d'un compte de l'équipe (`is_staff`). Le
premier se crée côté API avec `manage.py createsuperuser`.

## Mettre en ligne

```bash
VITE_API_URL=https://api.exemple.com npm run build   # fichiers dans dist/
```

Servir `dist/` comme un site statique, en renvoyant toute adresse inconnue
vers `index.html`. Côté API, ajouter l'adresse du back-office à
`NIANKPA_CORS_ALLOWED_ORIGINS`. Sans `VITE_API_URL`, le back-office appelle
l'API sur son propre domaine.

## Organisation

| Dossier          | Rôle                                                     |
| ---------------- | -------------------------------------------------------- |
| `src/api/`       | Appels à l'API, jetons (renouvelés tout seuls), types    |
| `src/auth/`      | Connexion, session, pages protégées                      |
| `src/layout/`    | Cadre : menu latéral, en-tête                            |
| `src/shared/`    | Pièces communes : listes, formulaires, formats, états    |
| `src/features/`  | Un dossier par domaine : tableau de bord, organisations, comptes, plans, paiements, listes de référence, configuration |
