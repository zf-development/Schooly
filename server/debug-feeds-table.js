// Script pour diagnostiquer la table feeds
require('dotenv/config');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    console.log('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function debugFeedsTable() {
    console.log('🔍 Diagnostic de la table feeds...\n');

    try {
        // 1. Vérifier la structure de la table
        console.log('📋 1. Structure de la table feeds:');
        const { data: columns, error: columnsError } = await supabase
            .from('information_schema.columns')
            .select('column_name, data_type, is_nullable')
            .eq('table_name', 'feeds')
            .eq('table_schema', 'public')
            .order('ordinal_position');

        if (columnsError) {
            console.error('❌ Erreur lors de la récupération des colonnes:', columnsError);
        } else {
            console.table(columns);
        }

        // 2. Compter tous les posts
        console.log('\n📊 2. Nombre total de posts:');
        const { count, error: countError } = await supabase
            .from('feeds')
            .select('*', { count: 'exact', head: true });

        if (countError) {
            console.error('❌ Erreur lors du comptage:', countError);
        } else {
            console.log(`Total posts: ${count}`);
        }

        // 3. Récupérer tous les posts (sans filtre)
        console.log('\n📝 3. Tous les posts (sans filtre):');
        const { data: allPosts, error: allPostsError } = await supabase
            .from('feeds')
            .select('*')
            .order('created_at', { ascending: false });

        if (allPostsError) {
            console.error('❌ Erreur lors de la récupération de tous les posts:', allPostsError);
        } else {
            console.log('Posts trouvés:', allPosts.length);
            if (allPosts.length > 0) {
                console.table(allPosts);
            }
        }

        // 4. Tester le filtrage par institution
        console.log('\n🏫 4. Test filtrage par institution MGR Parent:');
        const institutionId = '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c';
        const { data: filteredPosts, error: filteredError } = await supabase
            .from('feeds')
            .select('*')
            .eq('institution_id', institutionId)
            .order('created_at', { ascending: false });

        if (filteredError) {
            console.error('❌ Erreur lors du filtrage par institution:', filteredError);
        } else {
            console.log(`Posts pour institution ${institutionId}:`, filteredPosts.length);
            if (filteredPosts.length > 0) {
                console.table(filteredPosts);
            }
        }

        // 5. Vérifier les RLS policies
        console.log('\n🔒 5. Vérification des politiques RLS:');
        const { data: policies, error: policiesError } = await supabase
            .from('pg_policies')
            .select('*')
            .eq('tablename', 'feeds');

        if (policiesError) {
            console.error('❌ Erreur lors de la récupération des politiques:', policiesError);
        } else {
            console.log('Politiques RLS trouvées:', policies.length);
            if (policies.length > 0) {
                console.table(policies);
            }
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error);
    }
}

debugFeedsTable();

