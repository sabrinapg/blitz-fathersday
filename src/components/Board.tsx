import { useEffect, useMemo, useState } from 'react';
import { Chess, type Square } from 'chess.js';
import { Chessboard } from 'react-chessboard';

interface BoardProps {
  fen: string;
  orientation: 'white' | 'black';
  /** returns true if the move was accepted (correct mate) */
  onMove: (source: string, target: string, promotion?: string) => boolean;
  /** dims/disables interaction, e.g. while loading the next puzzle */
  locked?: boolean;
  feedback?: 'idle' | 'correct' | 'wrong';
}

const SELECTED_STYLE = { boxShadow: 'inset 0 0 0 3px rgba(201, 162, 75, 0.9)' };
const TARGET_DOT_STYLE = {
  backgroundImage:
    'radial-gradient(circle, rgba(245, 241, 230, 0.55) 24%, transparent 25%)',
};
const TARGET_CAPTURE_STYLE = {
  boxShadow: 'inset 0 0 0 4px rgba(245, 241, 230, 0.55)',
};

export default function Board({ fen, orientation, onMove, locked, feedback = 'idle' }: BoardProps) {
  const [selected, setSelected] = useState<string | null>(null);

  // Clear any selection whenever the position changes (new puzzle, move made)
  useEffect(() => {
    setSelected(null);
  }, [fen]);

  const chess = useMemo(() => new Chess(fen), [fen]);

  const legalMovesFromSelected = useMemo(() => {
    if (!selected) return [];
    return chess.moves({ square: selected as Square, verbose: true });
  }, [chess, selected]);

  const customSquareStyles = useMemo(() => {
    const styles: Record<string, React.CSSProperties> = {};
    if (selected) {
      styles[selected] = SELECTED_STYLE;
    }
    for (const move of legalMovesFromSelected) {
      styles[move.to] = move.captured || move.flags.includes('e')
        ? TARGET_CAPTURE_STYLE
        : TARGET_DOT_STYLE;
    }
    return styles;
  }, [selected, legalMovesFromSelected]);

  const tryMove = (source: string, target: string) => {
    const move = onMove(source, target, 'q');
    setSelected(null);
    return move;
  };

  const handleSquareClick = (square: string) => {
    if (locked) return;

    const piece = chess.get(square as Square);

    if (selected) {
      if (square === selected) {
        setSelected(null);
        return;
      }
      const isLegalTarget = legalMovesFromSelected.some((m) => m.to === square);
      if (isLegalTarget) {
        tryMove(selected, square);
        return;
      }
      // Clicking another of your own pieces re-selects instead of moving
      if (piece && piece.color === chess.turn()) {
        setSelected(square);
        return;
      }
      setSelected(null);
      return;
    }

    if (piece && piece.color === chess.turn()) {
      setSelected(square);
    }
  };

  const handlePieceDrop = (source: string, target: string) => {
    if (locked) return false;
    return tryMove(source, target);
  };

  const feedbackClass =
    feedback === 'correct'
      ? 'ring-4 ring-board-dark'
      : feedback === 'wrong'
      ? 'ring-4 ring-ember animate-shake'
      : 'ring-0';

  return (
    <div
      className={`board-frame mx-auto w-full max-w-[480px] rounded-2xl p-3 transition-all duration-200 ${feedbackClass} ${
        locked ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <Chessboard
        id="blitz-fathersday-board"
        position={fen}
        boardOrientation={orientation}
        onPieceDrop={handlePieceDrop}
        onSquareClick={handleSquareClick}
        customSquareStyles={customSquareStyles}
        customDarkSquareStyle={{ backgroundColor: '#6B8F4E' }}
        customLightSquareStyle={{ backgroundColor: '#EBECD0' }}
        customBoardStyle={{ borderRadius: '0.5rem', boxShadow: 'none' }}
        animationDuration={150}
        arePiecesDraggable={!locked}
      />
    </div>
  );
}
