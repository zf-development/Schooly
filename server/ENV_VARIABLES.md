# Variables d'environnement nécessaires

## Configuration Supabase

### SUPABASE_URL
L'URL de votre projet Supabase
```
SUPABASE_URL=https://abcdefghijklmnop.supabase.co
```

### SUPABASE_SERVICE_ROLE_KEY
La clé de service (service role key) de Supabase pour les opérations côté serveur
```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Configuration serveur

### PORT
Le port sur lequel le serveur écoutera (défaut: 3001)
```
PORT=3001
```

### NODE_ENV
L'environnement d'exécution (development, production, test)
```
NODE_ENV=development
```

## Comment configurer

1. Créez un fichier `.env` dans le dossier `server/`
2. Copiez les variables ci-dessus
3. Remplacez les valeurs par vos vraies clés Supabase
4. Ne commitez jamais le fichier `.env` dans Git !

## Structure de base de données Supabase

### Table `users`
- `id` (uuid, primary key)
- `email` (text, unique)
- `name` (text)
- `institution_id` (uuid, foreign key vers institutions.id)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Table `institutions`
- `id` (uuid, primary key)
- `name` (text)
- `type` (enum: 'university', 'college', 'high_school')
- `is_active` (boolean)
- `created_at` (timestamp)

### Table `feeds`
- `id` (uuid, primary key)
- `title` (text)
- `content` (text)
- `visibility` (enum: 'public', 'private')
- `author_id` (uuid, foreign key vers users.id)
- `institution_id` (uuid, foreign key vers institutions.id)
- `created_at` (timestamp)
- `updated_at` (timestamp)

