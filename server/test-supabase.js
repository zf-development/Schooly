// Script de test simple pour vérifier la connexion Supabase
// À exécuter avec: node test-supabase.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Test de connexion Supabase...');
console.log('URL:', supabaseUrl ? '✅ Configurée' : '❌ Manquante');
console.log('Service Key:', supabaseServiceKey ? '✅ Configurée' : '❌ Manquante');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes !');
    console.log('Vérifiez votre fichier .env');
    process.exit(1);
}

try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('✅ Client Supabase créé avec succès');

    // Test simple de connexion
    console.log('🧪 Test de connexion à la base de données...');

    // Test de lecture des institutions
    supabase
        .from('institutions')
        .select('*')
        .limit(1)
        .then(({ data, error }) => {
            if (error) {
                console.error('❌ Erreur de connexion:', error.message);
            } else {
                console.log('✅ Connexion réussie !');
                console.log('📊 Données récupérées:', data ? data.length : 0, 'institutions');
            }
        })
        .catch(err => {
            console.error('❌ Erreur:', err.message);
        });

} catch (error) {
    console.error('❌ Erreur lors de la création du client:', error.message);
}

