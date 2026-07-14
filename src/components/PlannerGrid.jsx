import React from 'react';
import { getPokemonSprite } from '../api/pokeApi';

const PlannerGrid = ({ 
  pokemonList, 
  team, 
  onAddPokemon, 
  searchQuery, 
  setSearchQuery, 
  loading,
  hideSearch
}) => {
  // Check if a pokemon is already in the team (max 6)
  const isTeamFull = team.length >= 6;
  const isSelected = (pokemonId) => team.some(p => p.id === pokemonId);

  return (
    <div className="planner-grid-container">
      {!hideSearch && (
        <div className="planner-controls" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <input 
            type="text" 
            className="planner-search"
            placeholder="Search Pokémon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      )}

      <div className="planner-grid">
        {pokemonList.map((pokemon) => {
          const selected = isSelected(pokemon.id);
          const disabled = selected || isTeamFull;
          
          return (
            <div 
              key={pokemon.id} 
              className={`planner-pokemon ${selected ? 'selected' : ''}`}
              title={pokemon.name}
              onClick={() => {
                if (!disabled) onAddPokemon(pokemon);
              }}
            >
              <img 
                src={getPokemonSprite(pokemon, false, false)} 
                alt={pokemon.name} 
              />
            </div>
          );
        })}
      </div>

      {loading && <div className="tp-loading">Loading Pokémon...</div>}
    </div>
  );
};

export default PlannerGrid;
