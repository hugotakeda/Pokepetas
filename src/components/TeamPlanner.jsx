import React, { useState, useEffect } from 'react';
import TeamSlots from './TeamSlots';
import TypeAnalysis from './TypeAnalysis';
import PlannerGrid from './PlannerGrid';
import { getPokemonList, getPokemonDetails, getAllPokemon } from '../api/pokeApi';
import '../TeamPlanner.css';

const TeamPlanner = ({ allTypesData }) => {
  const [team, setTeam] = useState([]);
  
  const [pokemonList, setPokemonList] = useState([]);
  const [allPokemonCache, setAllPokemonCache] = useState([]);
  const [loading, setLoading] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const LIMIT = 50; // Load more at once for the planner

  // Fetch all pokemon for search
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const allPkmn = await getAllPokemon();
        setAllPokemonCache(allPkmn);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAll();
  }, []);

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const loadPokemon = async (currentOffset, reset = false) => {
    setLoading(true);
    try {
      const data = await getPokemonList(currentOffset, LIMIT);
      const detailedPokemon = await Promise.all(
        data.results.map(async (p) => await getPokemonDetails(p.url))
      );
      setPokemonList((prev) => reset ? detailedPokemon : [...prev, ...detailedPokemon]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Normal pagination
  useEffect(() => {
    if (!isSearching && !debouncedQuery) {
      loadPokemon(offset, offset === 0);
    }
  }, [offset, isSearching, debouncedQuery]);

  // Search
  useEffect(() => {
    const doSearch = async () => {
      if (!debouncedQuery) {
        if (isSearching) {
          setIsSearching(false);
          setOffset(0);
        }
        return;
      }
      setIsSearching(true);
      setLoading(true);
      
      try {
        if (!isNaN(debouncedQuery)) {
          const data = await getPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${debouncedQuery}`);
          setPokemonList([data]);
          setLoading(false);
          return;
        }

        const matches = allPokemonCache.filter(p => p.name.includes(debouncedQuery));
        if (matches.length === 0) {
          setPokemonList([]);
        } else {
          const topMatches = matches.slice(0, LIMIT);
          const detailedPokemon = await Promise.all(
            topMatches.map(async (p) => await getPokemonDetails(p.url))
          );
          setPokemonList(detailedPokemon);
        }
      } catch (err) {
        setPokemonList([]);
      } finally {
        setLoading(false);
      }
    };

    if (allPokemonCache.length > 0) doSearch();
  }, [debouncedQuery, allPokemonCache]);

  const handleAddPokemon = (pokemon) => {
    if (team.length < 6 && !team.some(p => p.id === pokemon.id)) {
      setTeam([...team, pokemon]);
    }
  };

  const handleRemovePokemon = (index) => {
    const newTeam = [...team];
    newTeam.splice(index, 1);
    setTeam(newTeam);
  };

  return (
    <div className="team-planner-container">
      <div className="tp-header">
        <h1 className="tp-title">Pokémon Team Planner</h1>
        <TeamSlots team={team} onRemovePokemon={handleRemovePokemon} />
      </div>

      <TypeAnalysis team={team} allTypesData={allTypesData} />

      <PlannerGrid 
        pokemonList={pokemonList}
        team={team}
        onAddPokemon={handleAddPokemon}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        loading={loading}
        hasMore={!isSearching && pokemonList.length > 0}
        onLoadMore={() => setOffset(prev => prev + LIMIT)}
      />
    </div>
  );
};

export default TeamPlanner;
