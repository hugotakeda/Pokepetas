import React from 'react';
import { getPokemonSprite } from '../api/pokeApi';

const TeamSlots = ({ team, onRemovePokemon, onToggleShiny, onToggleFemale }) => {
  // Always render 6 slots
  const slots = Array.from({ length: 6 });

  return (
    <div className="team-slots-container">
      {slots.map((_, index) => {
        const pokemon = team[index];
        return (
          <div 
            key={index} 
            className={`team-slot-wrapper ${pokemon ? 'filled' : ''}`}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px' }}
          >
            <div 
              className={`team-slot ${pokemon ? 'filled' : ''}`}
              onClick={() => pokemon && onRemovePokemon(index)}
            >
              {pokemon ? (
                <>
                <img 
                  src={getPokemonSprite(pokemon, pokemon.isShiny, pokemon.isFemale)} 
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
            
            {pokemon && (
              <div style={{ display: 'flex', gap: '5px' }}>
                {(pokemon.sprites?.front_shiny || pokemon.sprites?.other?.['official-artwork']?.front_shiny) && (
                  <button 
                    onClick={() => onToggleShiny(index)}
                    style={{
                      fontSize: '10px',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      border: '1px solid ' + (pokemon.isShiny ? '#38bdf8' : 'rgba(255,255,255,0.2)'),
                      background: pokemon.isShiny ? 'rgba(56,189,248,0.2)' : 'rgba(255,255,255,0.05)',
                      color: pokemon.isShiny ? '#38bdf8' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                    title="Toggle Shiny"
                  >
                    Shiny
                  </button>
                )}
                {(pokemon.sprites?.front_female || pokemon.sprites?.other?.['official-artwork']?.front_female) && (
                  <button 
                    onClick={() => onToggleFemale(index)}
                    style={{
                      fontSize: '10px',
                      padding: '2px 5px',
                      borderRadius: '4px',
                      border: '1px solid ' + (pokemon.isFemale ? '#ec4899' : 'rgba(255,255,255,0.2)'),
                      background: pokemon.isFemale ? 'rgba(236,72,153,0.2)' : 'rgba(255,255,255,0.05)',
                      color: pokemon.isFemale ? '#ec4899' : 'var(--text-secondary)',
                      cursor: 'pointer'
                    }}
                    title="Toggle Female"
                  >
                    Female
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default TeamSlots;
