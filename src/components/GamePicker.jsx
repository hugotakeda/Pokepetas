import React from 'react';

const gamesList = [
  { id: 'rby', name: 'Red, Blue & Yellow', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/rby.png' },
  { id: 'gsc', name: 'Gold, Silver & Crystal', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/gsc.png' },
  { id: 'rse', name: 'Ruby, Sapphire & Emerald', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/rse.png' },
  { id: 'frlg', name: 'FireRed & LeafGreen', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/frlg.png' },
  { id: 'dppt', name: 'Diamond, Pearl & Platinum', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/dppt.png' },
  { id: 'hgss', name: 'HeartGold & SoulSilver', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/hgss.png' },
  { id: 'bw', name: 'Black & White', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/bw.png' },
  { id: 'b2w2', name: 'Black 2 & White 2', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/b2w2.png' },
  { id: 'xy', name: 'X & Y', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/xy.png' },
  { id: 'oras', name: 'Omega Ruby & Alpha Sapphire', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/oras.png' },
  { id: 'sm', name: 'Sun & Moon', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/sm.png' },
  { id: 'usum', name: 'Ultra Sun & Ultra Moon', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/usum.png' },
  { id: 'lgpe', name: "Let's Go Pikachu & Eevee", logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/lgpe.png' },
  { id: 'swsh', name: 'Sword & Shield', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/swsh.png' },
  { id: 'arceus', name: 'Legends: Arceus', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/arceus.png' },
  { id: 'sv', name: 'Scarlet & Violet', logoUrl: 'https://raw.githubusercontent.com/richi3f/pokemon-team-planner/master/static/img/game/sv.png' }
];

const GamePicker = ({ onSelectGame }) => {
  return (
    <div className="game-picker-container">
      <div className="game-picker-header">
        <h1 className="tp-title">Pokémon Team Planner</h1>
        <p className="game-picker-subtitle">Welcome! Select a game and start planning your Pokémon team!</p>
      </div>

      <div className="games-grid">
        {gamesList.map((game) => (
          <div 
            key={game.id} 
            className="game-card"
            onClick={() => onSelectGame(game)}
          >
            {game.logoUrl ? (
              <img src={game.logoUrl} alt={game.name} />
            ) : (
              <h3>{game.name}</h3>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamePicker;
