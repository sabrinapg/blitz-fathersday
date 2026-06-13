import { useEffect, useState } from 'react';
import { playStart, playTick } from '../lib/sounds';

interface CountdownProps {
  onComplete: () => void;
}

const STEPS = ['3', '2', '1', 'Go!'];

export default function Countdown({ onComplete }: CountdownProps) {
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step < STEPS.length - 1) {
      playTick();
    } else {
      playStart();
    }

    const id = setTimeout(() => {
      if (step < STEPS.length - 1) {
        setStep((s) => s + 1);
      } else {
        onComplete();
      }
    }, 650);

    return () => clearTimeout(id);
  }, [step, onComplete]);

  return (
    <div className="flex h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold">Get ready</p>
      <span key={step} className="animate-pop font-display text-7xl font-bold text-gold sm:text-8xl">
        {STEPS[step]}
      </span>
    </div>
  );
}