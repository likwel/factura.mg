# Factura.mg

Système de gestion commerciale SaaS complet pour Madagascar.

## Stack Technique

- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL + Prisma ORM
- **Real-time**: Socket.io
- **Monorepo**: npm workspaces

## Installation

```bash
# Installer les dépendances
npm install

# Configuration base de données
cp apps/backend/.env.example apps/backend/.env
# Éditez apps/backend/.env avec vos configurations

# Migrations
npm run db:migrate

# Démarrer en mode développement
npm run dev
```

## URLs

- Application: http://localhost:5173
- Backend API: http://localhost:3000

## Fonctionnalités

- ✅ Gestion articles, stock, emplacements
- ✅ Clients, fournisseurs
- ✅ Facturation
- ✅ Comptabilité
- ✅ Paie et présence
- ✅ Permissions utilisateurs
- ✅ Notifications temps réel
- ✅ Messagerie interne
- ✅ Système d'abonnement
- ✅ Thèmes personnalisables
- ✅ Audit logs
- ✅ Cron jobs (alertes stock, rappels)
- ✅ Landing page intégrée
