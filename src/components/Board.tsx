import { Chessboard } from 'react-chessboard';

interface BoardProps {
  fen: string;
  orientation: 'white' | 'black';
  onDrop: (source: string, target: string, piece: string) => boolean;
  /** dims/disables interaction, e.g. while loading the next puzzle */
  locked?: boolean;
}

export default function Board({ fen, orientation, onDrop, locked }: BoardProps) {
  return (
    <div
      className={`board-frame mx-auto w-full max-w-[480px] rounded-2xl p-3 transition-opacity duration-200 ${
        locked ? 'opacity-40' : 'opacity-100'
      }`}
    >
      <Chessboard
        id="blitz-fathersday-board"
        position={fen}
        boardOrientation={orientation}
        onPieceDrop={(source, target, piece) => (locked ? false : onDrop(source, target, piece))}
        customDarkSquareStyle={{ backgroundColor: '#6B8F4E' }}
        customLightSquareStyle={{ backgroundColor: '#EBECD0' }}
        customBoardStyle={{ borderRadius: '0.5rem', boxShadow: 'none' }}
        animationDuration={150}
        arePiecesDraggable={!locked}
      />
    </div>
  );
}
