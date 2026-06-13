import { useState } from 'react';
import StartScreen from './components/StartScreen';
import GameScreen from './components/GameScreen';
import EndScreen from './components/EndScreen';

type Phase = 'start' | 'playing' | 'end';

export default function App() {
  const [phase, setPhase] = useState<Phase>('start');
  const [playerName, setPlayerName] = useState('Dad');
  const [finalScore, setFinalScore] = useState(0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      {phase === 'start' && (
        <StartScreen
          onStart={(name) => {
            setPlayerName(name);
            setPhase('playing');
          }}
        />
      )}

      {phase === 'playing' && (
        <GameScreen
          onGameOver={(score) => {
            setFinalScore(score);
            setPhase('end');
          }}
        />
      )}

      {phase === 'end' && (
        <EndScreen
          playerName={playerName}
          score={finalScore}
          onPlayAgain={() => setPhase('start')}
        />
      )}
    </div>
  );
}
