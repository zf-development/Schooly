// Script pour vérifier l'état actuel des tables
// À exécuter avec: node check-current-state.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Vérification de l\'état actuel des tables...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkCurrentState() {
    try {
        // Étape 1: Vérifier les utilisateurs dans auth.users
        console.log('\n1️⃣ Utilisateurs dans auth.users...');
        const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();

        if (authError) {
            console.error('   ❌ Erreur auth.users:', authError.message);
        } else {
            console.log(`   ✅ ${authUsers.users.length} utilisateurs trouvés dans auth.users`);
            authUsers.users.forEach((user, index) => {
                console.log(`      ${index + 1}. ${user.email} (ID: ${user.id})`);
            });
        }

        // Étape 2: Vérifier les utilisateurs dans notre table custom
        console.log('\n2️⃣ Utilisateurs dans table custom users...');
        const { data: customUsers, error: customError } = await supabase
            .from('users')
            .select('*');

        if (customError) {
            console.error('   ❌ Erreur table custom:', customError.message);
        } else {
            console.log(`   ✅ ${customUsers.length} utilisateurs trouvés dans table custom`);
            customUsers.forEach((user, index) => {
                console.log(`      ${index + 1}. ${user.email} (ID: ${user.id})`);
            });
        }

        // Étape 3: Vérifier les posts
        console.log('\n3️⃣ Posts dans la table feeds...');
        const { data: feeds, error: feedsError } = await supabase
            .from('feeds')
            .select('*');

        if (feedsError) {
            console.error('   ❌ Erreur feeds:', feedsError.message);
        } else {
            console.log(`   ✅ ${feeds.length} posts trouvés dans feeds`);
            feeds.forEach((feed, index) => {
                console.log(`      ${index + 1}. ${feed.title} (${feed.visibility}) - ${feed.author_id}`);
            });
        }

        // Étape 4: Vérifier la correspondance auth.users ↔ users
        console.log('\n4️⃣ Correspondance auth.users ↔ users...');
        if (authUsers.users && customUsers) {
            const authIds = new Set(authUsers.users.map(u => u.id));
            const customIds = new Set(customUsers.map(u => u.id));

            console.log('   🔍 IDs présents dans auth.users mais pas dans custom:');
            authUsers.users.forEach(user => {
                if (!customIds.has(user.id)) {
                    console.log(`      ❌ ${user.email} (${user.id})`);
                }
            });

            console.log('   🔍 IDs présents dans custom mais pas dans auth.users:');
            customUsers.forEach(user => {
                if (!authIds.has(user.id)) {
                    console.log(`      ❌ ${user.email} (${user.id})`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

checkCurrentState().then(() => {
    console.log('\n✅ Vérification terminée');
    process.exit(0);
});

