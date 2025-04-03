import express from 'express';
import { tmdbService } from '../services/tmdbService';

const router = express.Router();

// Recherche de films
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q as string;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const movies = await tmdbService.searchMovies(query);
    
    // Transformer les résultats pour inclure les URLs des images
    const formattedMovies = movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      posterUrl: tmdbService.getImageUrl(movie.poster_path),
      backdropUrl: tmdbService.getImageUrl(movie.backdrop_path),
      voteAverage: movie.vote_average,
    }));
    
    res.json(formattedMovies);
  } catch (error) {
    res.status(500).json({ error: 'Failed to search movies' });
  }
});

// Détails d'un film
router.get('/:id', async (req, res) => {
  try {
    const movieId = parseInt(req.params.id);
    if (isNaN(movieId)) {
      return res.status(400).json({ error: 'Invalid movie ID' });
    }

    const movie = await tmdbService.getMovieDetails(movieId);
    
    const formattedMovie = {
      id: movie.id,
      title: movie.title,
      overview: movie.overview,
      releaseDate: movie.release_date,
      posterUrl: tmdbService.getImageUrl(movie.poster_path),
      backdropUrl: tmdbService.getImageUrl(movie.backdrop_path),
      voteAverage: movie.vote_average,
      genres: movie.genres,
      // Ajouter d'autres propriétés selon vos besoins
    };
    
    res.json(formattedMovie);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get movie details' });
  }
});

export default router;