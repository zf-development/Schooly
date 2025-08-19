// Script pour créer les utilisateurs simulés du authMiddleware
// À exécuter avec: node create-simulated-users.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('👥 Création des utilisateurs simulés...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createSimulatedUsers() {
    try {
        // Utilisateurs simulés du authMiddleware
        const simulatedUsers = [
            {
                id: '11111111-1111-1111-1111-111111111111', // user1
                email: 'jean@ecole-a.com',
                institution_id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c' // MGR Parent
            },
            {
                id: '22222222-2222-2222-2222-222222222222', // user2
                email: 'marie@ecole-b.com',
                institution_id: 'ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f' // Cégep Édouard-Montpetit
            },
            {
                id: '33333333-3333-3333-3333-333333333333', // user3
                email: 'test@ecole-a.com',
                institution_id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c' // MGR Parent
            }
        ];

        for (const user of simulatedUsers) {
            console.log(`\n📋 Création de ${user.email}...`);

            const { data, error } = await supabase
                .from('users')
                .insert([user])
                .select()
                .single();

            if (error) {
                if (error.code === '23505') { // Violation de contrainte unique
                    console.log(`   ⚠️  Utilisateur ${user.email} existe déjà`);
                } else {
                    console.error(`   ❌ Erreur création ${user.email}:`, error.message);
                }
            } else {
                console.log(`   ✅ Utilisateur ${user.email} créé:`, data.id);
            }
        }

        console.log('\n🎉 Création des utilisateurs simulés terminée !');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

createSimulatedUsers().then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
});
