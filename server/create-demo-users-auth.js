// Script pour créer les utilisateurs de démo dans auth.users
// À exécuter avec: node create-demo-users-auth.js

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('👥 Création des utilisateurs de démo dans auth.users...');

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes !');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createDemoUsers() {
    try {
        // Utilisateurs de démo à créer
        const demoUsers = [
            {
                email: 'etudiant1@mgr-parent.com',
                password: 'demo123',
                institution_id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
            },
            {
                email: 'prof1@mgr-parent.com',
                password: 'demo123',
                institution_id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c'
            },
            {
                email: 'etudiant2@cegep-em.com',
                password: 'demo123',
                institution_id: 'ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f'
            },
            {
                email: 'prof2@cegep-em.com',
                password: 'demo123',
                institution_id: 'ebc0272e-bfdf-4f6e-b2dc-47ddef7ae97f'
            }
        ];

        for (const userData of demoUsers) {
            console.log(`\n📋 Création de ${userData.email}...`);

            try {
                // Créer dans auth.users
                const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                    email: userData.email,
                    password: userData.password,
                    email_confirm: true,
                    user_metadata: {
                        institution_id: userData.institution_id
                    }
                });

                if (authError) {
                    if (authError.code === 'email_exists') {
                        console.log(`   ⚠️  Utilisateur ${userData.email} existe déjà dans auth.users`);
                    } else {
                        console.error(`   ❌ Erreur auth.users:`, authError.message);
                        continue;
                    }
                } else {
                    console.log(`   ✅ Utilisateur créé dans auth.users: ${authData.user.id}`);
                }

                // Créer dans notre table custom users
                const { data: customUser, error: customError } = await supabase
                    .from('users')
                    .insert([{
                        id: authData.user.id,
                        email: userData.email,
                        institution_id: userData.institution_id
                    }])
                    .select()
                    .single();

                if (customError) {
                    if (customError.code === '23505') { // Violation de contrainte unique
                        console.log(`   ⚠️  Utilisateur ${userData.email} existe déjà dans table custom`);
                    } else {
                        console.error(`   ❌ Erreur table custom:`, customError.message);
                    }
                } else {
                    console.log(`   ✅ Utilisateur créé dans table custom: ${customUser.id}`);
                }

            } catch (error) {
                console.error(`   ❌ Erreur générale pour ${userData.email}:`, error.message);
            }
        }

        console.log('\n🎉 Création des utilisateurs de démo terminée !');

    } catch (error) {
        console.error('❌ Erreur générale:', error.message);
    }
}

createDemoUsers().then(() => {
    console.log('\n✅ Script terminé');
    process.exit(0);
});

