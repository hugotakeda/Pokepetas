import React from 'react';

const PlannerGrid = ({ 
  pokemonList, 
  team, 
  onAddPokemon, 
  searchQuery, 
  setSearchQuery, 
  loading, 
  hasMore, 
  onLoadMore 
}) => {
  // Check if a pokemon is already in the team (max 6)
  const isTeamFull = team.length >= 6;
  const isSelected = (pokemonId) => team.some(p => p.id === pokemonId);

  return (
    <div className="planner-grid-container">
      <div className="planner-controls">
        <input 
          type="text" 
          className="planner-search"
          placeholder="Search Pokémon..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
                src={pokemon.sprites?.front_default || pokemon.sprites?.other?.['official-artwork']?.front_default} 
                alt={pokemon.name} 
              />
            </div>
          );
        })}
      </div>

      {loading && <div className="tp-loading">Loading Pokémon...</div>}
      
      {!loading && hasMore && (
        <button 
          className="load-more-btn" 
          style={{ margin: '2rem auto', display: 'block', backgroundColor: '#3498db', color: 'white' }}
          onClick={onLoadMore}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default PlannerGrid;
