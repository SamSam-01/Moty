import 'dotenv/config';

export default ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    'expo-web-browser'
  ],
  extra: {
    TMDB_API_KEY: process.env.TMDB_API_KEY,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
});
