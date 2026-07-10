import React from 'react';
import WeaknessBadge from './WeaknessBadge';
import { calculateWeaknesses } from '../api/pokeApi';

const PokemonCard = ({ pokemon, allTypesData }) => {
  // Use the high quality 3D render from pokemon home
  const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/home/${pokemon.id}.png`;
  
  // Fallback to official artwork if home sprite is not available (mostly for very new generation pokemon)
  const fallbackSpriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

  const primaryType = pokemon.types[0].type.name;
  
  const weaknesses = calculateWeaknesses(pokemon.types, allTypesData);

  return (
    <div 
      className="pokemon-card" 
      style={{ '--type-color': `var(--type-${primaryType})` }}
    >
      <div className="pokemon-card-inner">
        <div className="card-glow"></div>
        
        <div className="card-header">
          <span className="pokemon-id">#{String(pokemon.id).padStart(3, '0')}</span>
          <h2 className="pokemon-name">{pokemon.name}</h2>
        </div>

        <div className="sprite-wrapper">
          <img 
            src={spriteUrl} 
            onError={(e) => { e.target.onerror = null; e.target.src = fallbackSpriteUrl; }}
            alt={pokemon.name} 
          />
        </div>

        <div className="card-footer">
          <div className="types-container">
            {pokemon.types.map((typeInfo) => (
              <span 
                key={typeInfo.type.name} 
                className="type-badge"
                style={{ '--type-color': `var(--type-${typeInfo.type.name})` }}
              >
                {typeInfo.type.name}
              </span>
            ))}
          </div>

          <div className="weaknesses-container">
            <h3 className="weaknesses-title">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Weaknesses
            </h3>
            <div className="weaknesses-grid">
              {weaknesses.length > 0 ? (
                weaknesses.map(w => (
                  <WeaknessBadge key={w.type} type={w.type} multiplier={w.multiplier} />
                ))
              ) : (
                <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>None</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonCard;
