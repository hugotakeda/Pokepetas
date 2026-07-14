import React from 'react';

const TeamSlots = ({ team, onRemovePokemon }) => {
  // Always render 6 slots
  const slots = Array.from({ length: 6 });

  return (
    <div className="team-slots-container">
      {slots.map((_, index) => {
        const pokemon = team[index];
        return (
          <div 
            key={index} 
            className={`team-slot ${pokemon ? 'filled' : ''}`}
            onClick={() => pokemon && onRemovePokemon(index)}
          >
            {pokemon ? (
              <>
                <img 
                  src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default} 
                  alt={pokemon.name} 
                  title={pokemon.name}
                />
                <button 
                  className="remove-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePokemon(index);
                  }}
                  title={`Remove ${pokemon.name}`}
                >
                  &times;
                </button>
              </>
            ) : (
              <span style={{color: '#ddd', fontSize: '2rem'}}>+</span>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamSlots;
