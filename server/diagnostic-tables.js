// Script de diagnostic des tables Supabase existantes
// À exécuter avec: node diagnostic-tables.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Diagnostic des tables Supabase...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function diagnosticTables() {
    try {
        console.log('\n📊 Vérification de la table institutions...');
        const { data: institutions, error: instError } = await supabase
            .from('institutions')
            .select('*');

        if (instError) {
            console.error('❌ Erreur institutions:', instError.message);
        } else {
            console.log(`✅ Institutions: ${institutions?.length || 0} trouvées`);
            if (institutions && institutions.length > 0) {
                console.log('   Première institution:', institutions[0]);
            }
        }

        console.log('\n👥 Vérification de la table users...');
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('*');

        if (usersError) {
            console.error('❌ Erreur users:', usersError.message);
        } else {
            console.log(`✅ Users: ${users?.length || 0} trouvés`);
            if (users && users.length > 0) {
                console.log('   Premier user:', users[0]);
            }
        }

        console.log('\n📝 Vérification de la table feeds...');
        const { data: feeds, error: feedsError } = await supabase
            .from('feeds')
            .select('*');

        if (feedsError) {
            console.error('❌ Erreur feeds:', feedsError.message);
        } else {
            console.log(`✅ Feeds: ${feeds?.length || 0} trouvés`);
            if (feeds && feeds.length > 0) {
                console.log('   Premier feed:', feeds[0]);
            }
        }

        console.log('\n🔍 Vérification de la structure des tables...');

        // Vérifier les colonnes de la table institutions
        try {
            const { data: instCols, error: colError } = await supabase
                .rpc('get_table_columns', { table_name: 'institutions' });

            if (colError) {
                console.log('   📋 Colonnes institutions: Impossible de récupérer (normal)');
            } else {
                console.log('   📋 Colonnes institutions:', instCols);
            }
        } catch (e) {
            console.log('   📋 Colonnes institutions: Impossible de récupérer (normal)');
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

diagnosticTables().then(() => {
    console.log('\n✅ Diagnostic terminé');
    process.exit(0);
});

