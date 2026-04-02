import { createClient } from '@supabase/supabase-js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Loads .env

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
// Vous DEVEZ ajouter la clé secrète "service_role" dans votre .env pour contourner les règles RLS
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; 
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_API_URL = 'https://api.themoviedb.org/3';

if (!SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_URL || !TMDB_API_KEY) {
  console.error("❌ ERREUR: Assurez-vous d'avoir EXPO_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY et TMDB_API_KEY dans votre fichier .env.");
  console.log("Vous pouvez trouver la 'service_role key' dans votre dashboard Supabase > Project Settings > API.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function runMigration() {
  console.log("Démarrage de la migration des dates locales...");

  // 1. Récupération des profils pour lier chaque liste à la région de son utilisateur
  const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, region');
  if (pErr) {
    if (pErr.code === '42703') {
        console.error("\n❌ ERREUR : La colonne 'region' n'existe pas dans la table 'profiles' de Supabase !");
        console.error("Vous DEVEZ vous rendre sur le Dashboard Supabase > Table Editor > 'profiles'");
        console.error("et y ajouter une colonne 'region' de type 'text' pour que l'application et ce script puissent fonctionner.");
        process.exit(1);
    }
    throw pErr;
  }

  const userRegionMap = {};
  profiles.forEach(p => { userRegionMap[p.id] = p.region || 'FR'; });

  // 2. Récupérations de toutes les listes
  const { data: lists, error: lErr } = await supabase.from('lists').select('id, user_id');
  if (lErr) throw lErr;

  const listRegionMap = {};
  lists.forEach(l => { listRegionMap[l.id] = userRegionMap[l.user_id] || 'FR'; });

  // 3. Récupération de tous les films existants
  const { data: movies, error: mErr } = await supabase.from('movies').select('id, tmdb_id, title, release_date, list_id');
  if (mErr) throw mErr;

  console.log(`\nTrouvé ${movies.length} films en base de données. Fetching TMDB...\n`);

  let updatedCount = 0;

  for (const movie of movies) {
    if (!movie.tmdb_id) continue;
    const region = listRegionMap[movie.list_id] || 'FR';

    try {
      const datesRes = await axios.get(`${TMDB_API_URL}/movie/${movie.tmdb_id}/release_dates`, {
        params: { api_key: TMDB_API_KEY }
      });

      const regionDates = datesRes.data.results?.find(r => r.iso_3166_1 === region);
      if (regionDates && regionDates.release_dates?.length > 0) {
        const theatrical = regionDates.release_dates.find(d => d.type === 3 || d.type === 2);
        const bestRelease = theatrical || regionDates.release_dates[0];
        
        if (bestRelease?.release_date) {
          const newDate = bestRelease.release_date.split('T')[0];
          
          if (movie.release_date !== newDate) {
             console.log(`[${region}] "${movie.title}": ${movie.release_date} -> ${newDate}`);
             const { error: upErr } = await supabase
                .from('movies')
                .update({ release_date: newDate })
                .eq('id', movie.id);
             
             if (upErr) {
                console.error("Erreur de mise à jour: ", upErr);
             } else {
                updatedCount++;
             }
          }
        }
      }
    } catch (e) {
      console.log(`Impossible de migrer la date pour: ${movie.title} (${e.message})`);
    }

    // Petite pause de 50ms pour respecter les limites d'API TMDB
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n✅ Migration terminée ! Mis à jour: ${updatedCount} films.`);
}

runMigration().catch(console.error);
