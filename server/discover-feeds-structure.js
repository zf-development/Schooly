// Script pour découvrir la vraie structure de la table feeds
// À exécuter avec: node discover-feeds-structure.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Découverte de la structure de la table feeds...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function discoverFeedsStructure() {
    try {
        // Étape 1: Essayer de voir la structure en regardant les colonnes
        console.log('\n1️⃣ Test avec différentes colonnes...');

        // Test 1: Seulement author_id
        console.log('\n   Test 1: author_id seulement');
        const test1 = { author_id: '4a286464-cc8a-47fb-b123-106f4841f8dd' };
        const { data: data1, error: error1 } = await supabase
            .from('feeds')
            .insert([test1])
            .select();

        if (error1) {
            console.log('     ❌ Erreur:', error1.message);
        } else {
            console.log('     ✅ Succès:', data1);
        }

        // Test 2: author_id + institution_id
        console.log('\n   Test 2: author_id + institution_id');
        const test2 = {
            author_id: '4a286464-cc8a-47fb-b123-106f4841f8dd',
            institution_id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
        };
        const { data: data2, error: error2 } = await supabase
            .from('feeds')
            .insert([test2])
            .select();

        if (error2) {
            console.log('     ❌ Erreur:', error2.message);
        } else {
            console.log('     ✅ Succès:', data2);
        }

        // Test 3: Essayer de voir la structure en regardant un post existant
        console.log('\n2️⃣ Tentative de voir la structure existante...');

        // Essayer de voir s'il y a des posts existants
        const { data: existingFeeds, error: existingError } = await supabase
            .from('feeds')
            .select('*')
            .limit(1);

        if (existingError) {
            console.log('   ❌ Erreur lecture:', existingError.message);
        } else if (existingFeeds && existingFeeds.length > 0) {
            console.log('   ✅ Post existant trouvé:', existingFeeds[0]);
            console.log('   📋 Colonnes disponibles:', Object.keys(existingFeeds[0]));
        } else {
            console.log('   📋 Aucun post existant');
        }

        // Test 4: Essayer avec des colonnes communes
        console.log('\n   Test 3: colonnes communes');
        const test3 = {
            author_id: '4a286464-cc8a-47fb-b123-106f4841f8dd',
            institution_id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c',
            message: 'Message de test',
            type: 'post'
        };
        const { data: data3, error: error3 } = await supabase
            .from('feeds')
            .insert([test3])
            .select();

        if (error3) {
            console.log('     ❌ Erreur:', error3.message);
        } else {
            console.log('     ✅ Succès:', data3);
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

discoverFeedsStructure().then(() => {
    console.log('\n✅ Découverte terminée');
    process.exit(0);
});

