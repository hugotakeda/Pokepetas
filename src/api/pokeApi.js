const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (offset = 0, limit = 20) => {
  const response = await fetch(`${BASE_URL}/pokemon?offset=${offset}&limit=${limit}`);
  return response.json();
};

let allPokemonCache = null;

export const getAllPokemon = async () => {
  if (allPokemonCache) return allPokemonCache;
  const response = await fetch(`${BASE_URL}/pokemon?limit=10000`);
  const data = await response.json();
  allPokemonCache = data.results;
  return allPokemonCache;
};

export const getPokemonDetails = async (url) => {
  const response = await fetch(url);
  return response.json();
};

// Fetch all 18 types once and cache them
let typesCache = null;

export const getAllTypes = async () => {
  if (typesCache) return typesCache;
  
  const response = await fetch(`${BASE_URL}/type`);
  const data = await response.json();
  
  // We only care about the first 18 types (the real ones)
  const results = data.results.slice(0, 18);
  
  const typesData = {};
  
  await Promise.all(results.map(async (type) => {
    const typeRes = await fetch(type.url);
    const typeDetails = await typeRes.json();
    typesData[type.name] = typeDetails.damage_relations;
  }));
  
  typesCache = typesData;
  return typesCache;
};

/**
 * Calculates the overall weaknesses of a pokemon given its types.
 * @param {Array} types - Array of type strings (e.g., ['fire', 'flying'])
 * @param {Object} allTypesData - The cached damage relations for all types
 * @returns {Array} - Array of objects: { type: 'water', multiplier: 2 }
 */
export const calculateWeaknesses = (types, allTypesData) => {
  if (!allTypesData) return [];
  
  const multipliers = {};
  
  // Initialize all known types with 1x multiplier
  Object.keys(allTypesData).forEach(t => {
    multipliers[t] = 1;
  });

  // Calculate combined multiplier for each type
  types.forEach(typeObj => {
    const typeName = typeObj.type.name;
    const damageRelations = allTypesData[typeName];
    
    if (!damageRelations) return;

    damageRelations.double_damage_from.forEach(t => {
      multipliers[t.name] *= 2;
    });
    damageRelations.half_damage_from.forEach(t => {
      multipliers[t.name] *= 0.5;
    });
    damageRelations.no_damage_from.forEach(t => {
      multipliers[t.name] *= 0;
    });
  });

  // Filter only weaknesses (multiplier > 1)
  const weaknesses = Object.entries(multipliers)
    .filter(([type, multiplier]) => multiplier > 1)
    .map(([type, multiplier]) => ({ type, multiplier }))
    .sort((a, b) => b.multiplier - a.multiplier);

  return weaknesses;
};

/**
 * Calculates the team's combined defense against all types.
 * Returns an object with types as keys and how many pokemon are weak/resistant to it.
 */
export const calculateTeamDefense = (team, allTypesData) => {
  if (!allTypesData) return {};
  
  // Initialize defense tally
  const defense = {};
  Object.keys(allTypesData).forEach(t => {
    defense[t] = { weak: 0, resist: 0, immune: 0 };
  });

  team.forEach(pokemon => {
    if (!pokemon) return;
    
    const multipliers = {};
    Object.keys(allTypesData).forEach(t => multipliers[t] = 1);
    
    pokemon.types.forEach(typeObj => {
      const typeName = typeObj.type.name;
      const damageRelations = allTypesData[typeName];
      if (!damageRelations) return;

      damageRelations.double_damage_from.forEach(t => { multipliers[t.name] *= 2; });
      damageRelations.half_damage_from.forEach(t => { multipliers[t.name] *= 0.5; });
      damageRelations.no_damage_from.forEach(t => { multipliers[t.name] *= 0; });
    });

    Object.entries(multipliers).forEach(([type, multiplier]) => {
      if (multiplier > 1) defense[type].weak += 1;
      else if (multiplier === 0) defense[type].immune += 1;
      else if (multiplier < 1) defense[type].resist += 1;
    });
  });

  return defense;
};
