-- Script pour créer des données de démo dans StudBud
-- À exécuter dans l'éditeur SQL de Supabase

-- ========================================
-- 1. CRÉATION D'UTILISATEURS DE DÉMO
-- ========================================

-- Utilisateur 1: Étudiant MGR Parent
INSERT INTO users (id, email, institution_id) VALUES (
    '11111111-1111-1111-1111-111111111111',
    'etudiant1@mgr-parent.com',
    '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
);

-- Utilisateur 2: Professeur MGR Parent
INSERT INTO users (id, email, institution_id) VALUES (
    '22222222-2222-2222-2222-222222222222',
    'prof1@mgr-parent.com',
    '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
);

-- Utilisateur 3: Étudiant Cégep Édouard-Montpetit
INSERT INTO users (id, email, institution_id) VALUES (
    '33333333-3333-3333-3333-333333333333',
    'etudiant2@cegep-em.com',
    'ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f'
);

-- Utilisateur 4: Professeur Cégep Édouard-Montpetit
INSERT INTO users (id, email, institution_id) VALUES (
    '44444444-4444-4444-4444-444444444444',
    'prof2@cegep-em.com',
    'ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f'
);

-- ========================================
-- 2. CRÉATION DE POSTS DE DÉMO
-- ========================================

-- Posts MGR Parent (institution: 662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c)

-- Post 1: Public - Étudiant MGR Parent
INSERT INTO feeds (id, title, content, visibility, author_id, institution_id) VALUES (
    'feed-1111-1111-1111-111111111111',
    'Bienvenue à MGR Parent ! 🎓',
    'Salut tout le monde ! Je suis ravi de rejoindre cette communauté étudiante. Quelqu''un a des conseils pour les nouveaux étudiants ?',
    'public',
    '11111111-1111-1111-1111-111111111111',
    '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
);

-- Post 2: Privé - Professeur MGR Parent
INSERT INTO feeds (id, title, content, visibility, author_id, institution_id) VALUES (
    'feed-2222-2222-2222-222222222222',
    'Rappel: Devoir de mathématiques 📚',
    'N''oubliez pas que le devoir de mathématiques est à remettre vendredi prochain. Questions en classe ou par email.',
    'private',
    '22222222-2222-2222-2222-222222222222',
    '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
);

-- Post 3: Public - Étudiant MGR Parent
INSERT INTO feeds (id, title, content, visibility, author_id, institution_id) VALUES (
    'feed-3333-3333-3333-333333333333',
    'Activités parascolaires 🏃‍♂️',
    'Qui est intéressé par le club de robotique ? On commence les réunions la semaine prochaine !',
    'public',
    '11111111-1111-1111-1111-111111111111',
    '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
);

-- Posts Cégep Édouard-Montpetit (institution: ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f)

-- Post 4: Public - Étudiant Cégep
INSERT INTO feeds (id, title, content, visibility, author_id, institution_id) VALUES (
    'feed-4444-4444-4444-444444444444',
    'Nouveau programme en informatique 💻',
    'Super nouvelle ! Le cégep lance un nouveau programme en développement web. Inscriptions ouvertes !',
    'public',
    '33333333-3333-3333-3333-333333333333',
    'ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f'
);

-- Post 5: Privé - Professeur Cégep
INSERT INTO feeds (id, title, content, visibility, author_id, institution_id) VALUES (
    'feed-5555-5555-5555-555555555555',
    'Laboratoire de sciences 🔬',
    'Le laboratoire de sciences sera fermé ce weekend pour maintenance. Réouverture lundi.',
    'private',
    '44444444-4444-4444-4444-444444444444',
    'ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f'
);

-- Post 6: Public - Étudiant Cégep
INSERT INTO feeds (id, title, content, visibility, author_id, institution_id) VALUES (
    'feed-6666-6666-6666-666666666666',
    'Événement culturel 🎭',
    'Spectacle de théâtre étudiant ce vendredi soir ! Venez nombreux soutenir nos artistes.',
    'public',
    '33333333-3333-3333-3333-333333333333',
    'ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f'
);

-- ========================================
-- 3. VÉRIFICATION DES DONNÉES
-- ========================================

-- Vérifier les utilisateurs créés
SELECT 'Utilisateurs créés:' as info;
SELECT id, email, institution_id, created_at FROM users ORDER BY created_at;

-- Vérifier les posts créés
SELECT 'Posts créés:' as info;
SELECT id, title, visibility, author_id, institution_id, created_at FROM feeds ORDER BY created_at;

-- Compter par institution
SELECT 'Comptage par institution:' as info;
SELECT 
    i.name as institution,
    COUNT(DISTINCT u.id) as nb_users,
    COUNT(DISTINCT f.id) as nb_posts
FROM institutions i
LEFT JOIN users u ON u.institution_id = i.id
LEFT JOIN feeds f ON f.institution_id = i.id
GROUP BY i.id, i.name
ORDER BY i.name;

