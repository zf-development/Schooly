// Script pour lister tous les utilisateurs existants
// À exécuter avec: node list-existing-users.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('👥 Liste des utilisateurs existants...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function listExistingUsers() {
    try {
        // Étape 1: Lister les utilisateurs dans auth.users
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

        // Étape 2: Lister les utilisateurs dans notre table custom
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

        // Étape 3: Vérifier la correspondance
        console.log('\n3️⃣ Correspondance entre les tables...');
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

listExistingUsers().then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
});

