# Lommel Marketplace

Marketplace multi-vendeurs pour le marché camerounais (FCFA).

## Stack technique
- **Frontend** : React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **API** : tRPC (fullstack typesafe)
- **ORM** : Drizzle ORM
- **Base de données** : MySQL
- **Tests** : Vitest

## Installation

```bash
npm install
cp .env.example .env
# Remplir les variables dans .env
npm run dev
```

## Structure
```
src/
  pages/        → Pages React (routes)
  components/   → Composants réutilisables
  lib/          → Hooks et utilitaires
  shared/       → Constantes partagées client/serveur
server/         → API tRPC + logique métier
drizzle/        → Schéma DB + migrations
```

## Fonctionnalités
- Marketplace multi-boutiques
- Abonnement VIP vendeur (15 000 FCFA/an)
- Commission plateforme 8%
- Panier & commandes
- Wallet vendeur
- Upload d'images
- Dashboard admin
- Paiement Orange Money (FCFA)
