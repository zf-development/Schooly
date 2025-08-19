// Script pour créer les utilisateurs de démonstration dans Supabase Auth
// Utilise la clé de service pour créer des utilisateurs

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Variables d\'environnement manquantes');
    console.error('SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
    console.error('SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

async function createDemoUsers() {
    console.log('🚀 Création des utilisateurs de démonstration...\n');

    const demoUsers = [
        {
            email: 'demo@example.com',
            password: 'password',
            name: 'Utilisateur Démo'
        },
        {
            email: 'admin@example.com',
            password: 'password',
            name: 'Admin Démo'
        }
    ];

    for (const userData of demoUsers) {
        try {
            console.log(`📧 Création de ${userData.email}...`);

            // Créer l'utilisateur dans Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: userData.email,
                password: userData.password,
                email_confirm: true,
                user_metadata: {
                    name: userData.name
                }
            });

            if (authError) {
                if (authError.message.includes('already registered')) {
                    console.log(`⚠️  ${userData.email} existe déjà dans auth.users`);
                } else {
                    console.error(`❌ Erreur création auth:`, authError.message);
                    continue;
                }
            } else {
                console.log(`✅ ${userData.email} créé dans auth.users avec l'ID: ${authData.user.id}`);
            }

            // Vérifier si l'utilisateur existe dans notre table custom
            const { data: existingUser, error: checkError } = await supabase
                .from('users')
                .select('id')
                .eq('email', userData.email)
                .single();

            if (checkError && checkError.code !== 'PGRST116') {
                console.error(`❌ Erreur vérification table users:`, checkError.message);
                continue;
            }

            if (existingUser) {
                console.log(`ℹ️  ${userData.email} existe déjà dans la table users`);
            } else {
                // Insérer dans notre table custom users
                const { error: insertError } = await supabase
                    .from('users')
                    .insert([{
                        id: authData.user.id,
                        email: userData.email,
                        institution_id: '662c1b3a-2984-4e1e-ae7a-18bffe5e8d8c', // ID de l'institution de démo
                        created_at: new Date().toISOString()
                    }]);

                if (insertError) {
                    console.error(`❌ Erreur insertion table users:`, insertError.message);
                } else {
                    console.log(`✅ ${userData.email} ajouté à la table users`);
                }
            }

        } catch (error) {
            console.error(`❌ Erreur générale pour ${userData.email}:`, error.message);
        }

        console.log('---');
    }

    console.log('🎯 Test de connexion...');

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: 'demo@example.com',
            password: 'password'
        });

        if (error) {
            console.error('❌ Test de connexion échoué:', error.message);
        } else {
            console.log('✅ Test de connexion réussi !');
            console.log('🔑 Token d\'accès:', data.session.access_token.substring(0, 50) + '...');
        }
    } catch (error) {
        console.error('❌ Erreur test de connexion:', error.message);
    }
}

createDemoUsers()
    .then(() => {
        console.log('\n🎉 Script terminé !');
        process.exit(0);
    })
    .catch((error) => {
        console.error('\n💥 Erreur fatale:', error);
        process.exit(1);
    });

