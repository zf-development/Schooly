# Scripts de développement

Ce document décrit les scripts disponibles pour le développement et la maintenance du projet.

## Scripts disponibles

### Développement
- `pnpm dev` - Lance le serveur de développement Vite
- `pnpm build` - Compile le projet pour la production
- `pnpm preview` - Prévisualise le build de production

### Vérification du code
- `pnpm type-check` - Vérifie les types TypeScript sans générer de fichiers
- `pnpm lint` - Vérifie le code avec ESLint (permissif, max 200 warnings)
- `pnpm lint:fix` - Corrige automatiquement les erreurs ESLint corrigeables
- `pnpm lint:strict` - Vérifie le code avec ESLint en mode strict (tous les warnings sont des erreurs)

### Scripts combinés
- `pnpm check` - Exécute `type-check` + `lint` (mode permissif)
- `pnpm check:strict` - Exécute `type-check` + `lint:strict` (mode strict)

## Recommandations d'usage

### Développement quotidien
```bash
# Vérification rapide du code
pnpm check

# Correction automatique des erreurs
pnpm lint:fix
```

### Avant un commit
```bash
# Vérification stricte
pnpm check:strict
```

### Avant un déploiement
```bash
# Build complet avec vérifications
pnpm build
```

## Configuration ESLint

Le projet utilise ESLint avec une configuration permissive pour le développement :
- Variables non utilisées : warning (max 200)
- Types `any` : autorisés
- Variables globales du navigateur : définies
- Règles React : configurées pour React 18+

Pour un mode strict, utilisez `pnpm lint:strict` ou `pnpm check:strict`.
