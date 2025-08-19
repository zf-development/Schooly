-- Script pour vérifier l'encodage de la base de données
-- À exécuter dans Supabase SQL Editor

-- Vérifier l'encodage de la base de données
SELECT 
    datname as "Nom de la base",
    pg_encoding_to_char(encoding) as "Encodage",
    datcollate as "Collation",
    datctype as "Type de caractères"
FROM pg_database 
WHERE datname = current_database();

-- Vérifier le contenu d'un post avec des accents
SELECT 
    id,
    content,
    title,
    length(content) as "Longueur contenu",
    octet_length(content) as "Octets contenu"
FROM feeds 
WHERE content LIKE '%système%' OR content LIKE '%test%'
LIMIT 5;

-- Vérifier l'encodage général de la base
SHOW server_encoding;

-- Vérifier l'encodage du client
SHOW client_encoding;
