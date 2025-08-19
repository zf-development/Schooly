// Script pour vérifier la table feeds
// À exécuter avec: node check-feeds-table.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Vérification de la table feeds...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkFeedsTable() {
    try {
        // Étape 1: Vérifier si la table feeds existe
        console.log('\n1️⃣ Test d\'accès à la table feeds...');
        const { data: feeds, error: feedsError } = await supabase
            .from('feeds')
            .select('*')
            .limit(1);

        if (feedsError) {
            console.error('   ❌ Erreur accès feeds:', feedsError.message);
            console.error('   Code:', feedsError.code);
            console.error('   Détails:', feedsError.details);
            return;
        } else {
            console.log('   ✅ Table feeds accessible');
            console.log(`   📊 ${feeds.length} posts trouvés`);
        }

        // Étape 2: Essayer d'insérer un post de test
        console.log('\n2️⃣ Test d\'insertion d\'un post...');
        const testPost = {
            title: 'Post de test',
            content: 'Contenu de test',
            visibility: 'public',
            author_id: '4a286464-cc8a-47fb-b123-106f4841f8dd', // etudiant1@mgr-parent.com
            institution_id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
        };

        console.log('   📋 Données à insérer:', testPost);

        const { data: insertedPost, error: insertError } = await supabase
            .from('feeds')
            .insert([testPost])
            .select()
            .single();

        if (insertError) {
            console.error('   ❌ Erreur insertion:', insertError.message);
            console.error('   Code:', insertError.code);
            console.error('   Détails:', insertError.details);
            console.error('   Hint:', insertError.hint);
        } else {
            console.log('   ✅ Post inséré avec succès:', insertedPost);

            // Nettoyer le post de test
            const { error: deleteError } = await supabase
                .from('feeds')
                .delete()
                .eq('id', insertedPost.id);

            if (deleteError) {
                console.log('   ⚠️  Erreur suppression post de test:', deleteError.message);
            } else {
                console.log('   ✅ Post de test supprimé');
            }
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

checkFeedsTable().then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
});
