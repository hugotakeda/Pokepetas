import React, { useState, useEffect } from 'react';
import { getPokemonList, getPokemonDetails, getAllTypes, getAllPokemon } from './api/pokeApi';
import PokemonCard from './components/PokemonCard';

function App() {
  const [pokemonList, setPokemonList] = useState([]);
  const [allTypesData, setAllTypesData] = useState(null);
  const [allPokemonCache, setAllPokemonCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  const LIMIT = 20;

  useEffect(() => {
    // Fetch types and full pokemon list for searching on mount
    const fetchInitialData = async () => {
      try {
        const types = await getAllTypes();
        setAllTypesData(types);
        
        const allPkmn = await getAllPokemon();
        setAllPokemonCache(allPkmn);
      } catch (error) {
        console.error("Error fetching initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 400); // 400ms delay to prevent spamming while typing
    
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadPokemon = async (currentOffset, reset = false) => {
    setLoading(true);
    try {
      const data = await getPokemonList(currentOffset, LIMIT);
      
      const detailedPokemon = await Promise.all(
        data.results.map(async (p) => {
          return await getPokemonDetails(p.url);
        })
      );

      setPokemonList((prev) => reset ? detailedPokemon : [...prev, ...detailedPokemon]);
    } catch (error) {
      console.error("Error fetching pokemon:", error);
    } finally {
      setLoading(false);
    }
  };

  // Handle normal pagination
  useEffect(() => {
    if (!isSearching && !debouncedQuery) {
      loadPokemon(offset, offset === 0);
    }
  }, [offset, isSearching, debouncedQuery]);

  // Handle live search
  useEffect(() => {
    const doSearch = async () => {
      if (!debouncedQuery) {
        if (isSearching) {
          setIsSearching(false);
          setOffset(0);
          setError('');
        }
        return;
      }

      setIsSearching(true);
      setLoading(true);
      setError('');
      
      try {
        // If it's a number, search by exact ID
        if (!isNaN(debouncedQuery)) {
          const data = await getPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${debouncedQuery}`);
          setPokemonList([data]);
          setLoading(false);
          return;
        }

        // Substring match on the name
        const matches = allPokemonCache.filter(p => p.name.includes(debouncedQuery));
        
        if (matches.length === 0) {
          setError('Nenhum Pokémon encontrado!');
          setPokemonList([]);
        } else {
          // Take the top matches to avoid overloading requests
          const topMatches = matches.slice(0, LIMIT);
          const detailedPokemon = await Promise.all(
            topMatches.map(async (p) => await getPokemonDetails(p.url))
          );
          setPokemonList(detailedPokemon);
        }
      } catch (err) {
        setError('Nenhum Pokémon encontrado!');
        setPokemonList([]);
      } finally {
        setLoading(false);
      }
    };

    if (allPokemonCache.length > 0) {
      doSearch();
    }
  }, [debouncedQuery, allPokemonCache]);

  const handleLoadMore = () => {
    setOffset((prev) => prev + LIMIT);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setIsSearching(false);
    setOffset(0);
    setError('');
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>Poképetas</h1>
        <p>Explore Pokémon types and weaknesses in a modern 3D interface.</p>
        
        <form className="search-form" onSubmit={(e) => e.preventDefault()}>
          <div className="search-input-wrapper">
            <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input 
              type="text" 
              placeholder="Search by name or ID..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button type="button" className="clear-search" onClick={clearSearch}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </form>
      </header>

      <main>
        {error && <div className="error-message">{error}</div>}

        <div className="pokemon-grid">
          {pokemonList.map((pokemon) => (
            <PokemonCard 
              key={`${pokemon.id}-${pokemon.name}`} 
              pokemon={pokemon} 
              allTypesData={allTypesData} 
            />
          ))}
        </div>
        
        {loading && (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && !isSearching && pokemonList.length > 0 && (
          <button 
            className="load-more-btn" 
            onClick={handleLoadMore}
            disabled={loading}
          >
            Load More Pokémon
          </button>
        )}
      </main>
    </div>
  );
}

export default App;
