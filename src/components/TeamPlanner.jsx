import React, { useState, useEffect } from 'react';
import TeamSlots from './TeamSlots';
import TypeAnalysis from './TypeAnalysis';
import PlannerGrid from './PlannerGrid';
import GamePicker from './GamePicker';
import { getPokemonList, getPokemonDetails, getAllPokemon, getPokedexEntries } from '../api/pokeApi';
import '../TeamPlanner.css';

import gamesData from '../data/games';
import dexesData from '../data/dexes';
import pokemonData from '../data/pokemon';

// Build reverse lookup for base_id + form_id -> slug
const reverseLookup = {};
for (const [slug, data] of Object.entries(pokemonData)) {
  reverseLookup[`${data.base_id}_${data.form_id}`] = slug;
}

const TeamPlanner = ({ allTypesData }) => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [team, setTeam] = useState([]);
  
  // Toggles and options
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [showFilters, setShowFilters] = useState(true);

  const [dexGroups, setDexGroups] = useState([]); // Array of { title, pokemon: [] }
  const [displayedGroups, setDisplayedGroups] = useState([]); // Filtered array
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Handle Game Selection
  const handleSelectGame = (game) => {
    setSelectedGame(game);
    setTeam([]); // Clear team when switching games
    setSearchQuery('');
    setDexGroups([]);
    setDisplayedGroups([]);
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Load all detailed Pokemon for all sub-dexes of the selected game
  useEffect(() => {
    const loadAllPokemonGroups = async () => {
      if (!selectedGame) return;
      
      const gameInfo = gamesData[selectedGame.id];
      if (!gameInfo || !gameInfo.dex_slugs) return;
      
      setLoading(true);
      try {
        const groups = [];
        
        for (const slug of gameInfo.dex_slugs) {
          const dexData = dexesData[slug];
          if (!dexData) continue;
          
          const slugsToLoad = [];
          // Extract all forms in order
          for (const key of Object.keys(dexData.order)) {
            const forms = dexData.order[key];
            for (const form of forms) {
              const reverseSlug = reverseLookup[`${form[0]}_${form[1]}`];
              if (reverseSlug) slugsToLoad.push(reverseSlug);
            }
          }

          const detailedPokemon = await Promise.all(
            slugsToLoad.map(async (pokeSlug) => {
              try {
                return await getPokemonDetails(`https://pokeapi.co/api/v2/pokemon/${pokeSlug}`);
              } catch(e) {
                return null;
              }
            })
          );
          
          const validPokemon = detailedPokemon.filter(Boolean);
          if (validPokemon.length > 0) {
            groups.push({
              title: dexData.name || slug,
              pokemon: validPokemon
            });
          }
        }
        
        setDexGroups(groups);
        setDisplayedGroups(groups);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadAllPokemonGroups();
  }, [selectedGame]);

  // Update displayed list when search query changes
  useEffect(() => {
    if (!debouncedQuery) {
      setDisplayedGroups(dexGroups);
      return;
    }
    
    const filteredGroups = dexGroups.map(group => {
      let filtered;
      if (!isNaN(debouncedQuery)) {
        filtered = group.pokemon.filter(p => p.id.toString() === debouncedQuery);
      } else {
        filtered = group.pokemon.filter(p => p.name.includes(debouncedQuery));
      }
      return { ...group, pokemon: filtered };
    }).filter(group => group.pokemon.length > 0);

    setDisplayedGroups(filteredGroups);
  }, [debouncedQuery, dexGroups]);

  const handleAddPokemon = (pokemon) => {
    if (team.length < 6 && !team.some(p => p.id === pokemon.id)) {
      setTeam([...team, { ...pokemon, isShiny: false, isFemale: false }]);
    }
  };

  const handleRemovePokemon = (index) => {
    const newTeam = [...team];
    newTeam.splice(index, 1);
    setTeam(newTeam);
  };

  const handleToggleShiny = (index) => {
    const newTeam = [...team];
    newTeam[index].isShiny = !newTeam[index].isShiny;
    setTeam(newTeam);
  };

  const handleToggleFemale = (index) => {
    const newTeam = [...team];
    newTeam[index].isFemale = !newTeam[index].isFemale;
    setTeam(newTeam);
  };

  const handleRandomTeam = async () => {
    if (dexGroups.length === 0) return;
    
    setLoading(true);
    const randomPokemon = [];
    
    // Merge all available pokemon in all groups into one flat list
    const allAvailablePokemon = [];
    dexGroups.forEach(group => {
      allAvailablePokemon.push(...group.pokemon);
    });
    
    // Remove duplicates by ID (since some might appear in multiple sub-dexes)
    const uniquePokemonMap = new Map();
    allAvailablePokemon.forEach(p => uniquePokemonMap.set(p.id, p));
    const cacheCopy = Array.from(uniquePokemonMap.values());
    
    // Pick up to 6 random distinct pokemon
    for (let i = 0; i < 6 && cacheCopy.length > 0; i++) {
      const randomIndex = Math.floor(Math.random() * cacheCopy.length);
      const picked = cacheCopy.splice(randomIndex, 1)[0];
      randomPokemon.push(picked);
    }
    
    setTeam(randomPokemon.map(p => ({ ...p, isShiny: false, isFemale: false })));
    setLoading(false);
  };

  if (!selectedGame) {
    return <GamePicker onSelectGame={handleSelectGame} />;
  }

  return (
    <div className="team-planner-container">
      <div className="tp-header">
        <button 
          onClick={() => setSelectedGame(null)} 
          style={{
            position: 'absolute', 
            marginTop: '-1rem',
            background: 'rgba(255,255,255,0.1)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          &larr; Change Game
        </button>
        <h1 className="tp-title">{selectedGame.name} Team Planner</h1>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button onClick={handleRandomTeam} style={actionBtnStyle}>
            Random Team
          </button>
          <button onClick={() => setShowAnalysis(!showAnalysis)} style={actionBtnStyle}>
            {showAnalysis ? 'Hide' : 'Show'} Team Analysis
          </button>
          <button onClick={() => setShowFilters(!showFilters)} style={actionBtnStyle}>
            {showFilters ? 'Hide' : 'Show'} Filters
          </button>
        </div>

        <TeamSlots 
          team={team} 
          onRemovePokemon={handleRemovePokemon} 
          onToggleShiny={handleToggleShiny}
          onToggleFemale={handleToggleFemale}
        />
      </div>

      {showAnalysis && <TypeAnalysis team={team} allTypesData={allTypesData} />}

      <div style={{ display: showFilters ? 'block' : 'none' }}>
        <div className="planner-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            className="planner-search"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {loading && <div className="tp-loading">Loading Pokémon...</div>}
        
        {!loading && displayedGroups.map((group, idx) => (
          <div key={idx} style={{ marginBottom: '3rem' }}>
            <h3 style={{ 
              textAlign: 'center', 
              marginBottom: '1.5rem', 
              color: 'var(--text-primary)',
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              {group.title}
            </h3>
            <PlannerGrid 
              pokemonList={group.pokemon}
              team={team}
              onAddPokemon={handleAddPokemon}
              searchQuery={''} // Moved search bar out to TeamPlanner level
              setSearchQuery={() => {}}
              loading={false}
              hideSearch={true}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

const actionBtnStyle = {
  background: 'var(--card-glass-bg)',
  border: '1px solid var(--card-glass-border)',
  color: 'white',
  padding: '0.6rem 1.2rem',
  borderRadius: '20px',
  cursor: 'pointer',
  fontWeight: '600',
  transition: 'all 0.2s'
};

export default TeamPlanner;
