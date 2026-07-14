import React, { useMemo } from 'react';
import { calculateTeamDefense } from '../api/pokeApi';

const TypeAnalysis = ({ team, allTypesData }) => {
  const defense = useMemo(() => {
    return calculateTeamDefense(team, allTypesData);
  }, [team, allTypesData]);

  if (!allTypesData) return null;

  const typeNames = Object.keys(allTypesData);

  return (
    <div className="type-analysis-container">
      <h2>Team Defense Analysis</h2>
      <div className="analysis-grid">
        {typeNames.map(type => {
          const stats = defense[type] || { weak: 0, resist: 0, immune: 0 };
          return (
            <div key={type} className="analysis-row">
              <span className={`type-label bg-${type}`}>{type}</span>
              <div className="analysis-stats">
                <span className={`stat-pill ${stats.weak > 0 ? 'stat-weak' : 'stat-empty'}`} title="Weaknesses">
                  {stats.weak > 0 ? `-${stats.weak}` : '0'}
                </span>
                <span className={`stat-pill ${stats.resist > 0 ? 'stat-resist' : 'stat-empty'}`} title="Resistances">
                  {stats.resist > 0 ? `+${stats.resist}` : '0'}
                </span>
                <span className={`stat-pill ${stats.immune > 0 ? 'stat-immune' : 'stat-empty'}`} title="Immunities">
                  {stats.immune > 0 ? `0x${stats.immune}` : '0'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TypeAnalysis;
