
import { supabase } from '../../lib/supabase';
import { Movie } from '../../types';

export const movieService = {
  async getMovies(listId: string): Promise<Movie[]> {
    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('list_id', listId)
      .order('rank', { ascending: true });

    if (error) throw error;

    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      rank: item.rank,
      imageUrl: item.image_url,
      notes: item.notes,
      tmdbId: item.tmdb_id,
      releaseDate: item.release_date,
      voteAverage: item.vote_average,
      backdropUrl: item.backdrop_url,
      genres: [], // Genres relationship is currently broken
    }));
  },

  async addMovie(listId: string, movie: Omit<Movie, 'id' | 'rank'>): Promise<void> {
    // Get max rank
    const { data: maxRankData } = await supabase
      .from('movies')
      .select('rank')
      .eq('list_id', listId)
      .order('rank', { ascending: false })
      .limit(1)
      .single();

    const newRank = (maxRankData?.rank || 0) + 1;

    // Insert movie
    const { data, error } = await supabase
      .from('movies')
      .insert({
        title: movie.title,
        list_id: listId,
        rank: newRank,
        image_url: movie.imageUrl,
        notes: movie.notes,
        tmdb_id: movie.tmdbId,
        release_date: movie.releaseDate,
        vote_average: movie.voteAverage,
        backdrop_url: movie.backdropUrl,
      })
      .select()
      .single();

    if (error) throw error;

    // Insert genres if any
    if (movie.genres && movie.genres.length > 0) {
      const genreInserts = movie.genres.map(genre => ({
        movie_id: data.id,
        genre_id: genre.id
      }));

      const { error: genreError } = await supabase
        .from('movie_genres')
        .insert(genreInserts);

      if (genreError) throw genreError;
    }
  },

  async updateMovie(listId: string, movie: Movie): Promise<void> {
    const { error } = await supabase
      .from('movies')
      .update({
        title: movie.title,
        image_url: movie.imageUrl,
        notes: movie.notes,
        // Update other fields if editable
      })
      .eq('id', movie.id)
      .eq('list_id', listId);

    if (error) throw error;
  },

  async deleteMovie(listId: string, movieId: string): Promise<void> {
    const { error } = await supabase
      .from('movies')
      .delete()
      .eq('id', movieId)
      .eq('list_id', listId);

    if (error) throw error;
  },

  async reorderMovies(listId: string, movies: Movie[]): Promise<void> {
    // Logic for reordering if necessary with local updates or batch updates
    // Simplifying for now
    for (let i = 0; i < movies.length; i++) {
      await supabase
        .from('movies')
        .update({ rank: i + 1 })
        .eq('id', movies[i].id);
    }
  }
};