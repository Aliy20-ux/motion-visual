'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

export default function CustomCursor() {
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const dotX = useMotionValue(-100);
  const dotY = useMotionValue(-100);

  const springX = useSpring(cursorX, { stiffness: 500, damping: 32 });
  const springY = useSpring(cursorY, { stiffness: 500, damping: 32 });

  const [variant, setVariant] = useState<'default' | 'hover' | 'invert'>('default');

  useEffect(() => {
    const move = (e: MouseEvent) => {
      cursorX.set(e.clientX - 20);
      cursorY.set(e.clientY - 20);
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
    };

    const enterLink = () => setVariant('hover');
    const leaveLink = () => setVariant('default');
    const enterMedia = () => setVariant('invert');
    const leaveMedia = () => setVariant('default');

    window.addEventListener('mousemove', move);

    const links = document.querySelectorAll('a, button, [data-cursor="hover"]');
    const media = document.querySelectorAll('img, video, canvas, [data-cursor="invert"]');

    links.forEach(el => { el.addEventListener('mouseenter', enterLink); el.addEventListener('mouseleave', leaveLink); });
    media.forEach(el => { el.addEventListener('mouseenter', enterMedia); el.addEventListener('mouseleave', leaveMedia); });

    return () => {
      window.removeEventListener('mousemove', move);
      links.forEach(el => { el.removeEventListener('mouseenter', enterLink); el.removeEventListener('mouseleave', leaveLink); });
      media.forEach(el => { el.removeEventListener('mouseenter', enterMedia); el.removeEventListener('mouseleave', leaveMedia); });
    };
  }, [cursorX, cursorY, dotX, dotY]);

  return (
    <>
      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 z-[99999] pointer-events-none rounded-full"
        style={{
          x: springX,
          y: springY,
          width: 40,
          height: 40,
          border: variant === 'invert' ? '1.5px solid #0A0A0B' : '1.5px solid rgba(244,241,236,0.5)',
          mixBlendMode: variant === 'invert' ? 'difference' : 'normal',
        }}
        animate={{
          scale: variant === 'hover' ? 1.6 : 1,
          opacity: variant === 'hover' ? 0.6 : 1,
        }}
        transition={{ duration: 0.2 }}
      />
      {/* Dot */}
      <motion.div
        className="fixed top-0 left-0 z-[99999] pointer-events-none rounded-full"
        style={{
          x: dotX,
          y: dotY,
          width: 8,
          height: 8,
          background: variant === 'invert' ? '#0A0A0B' : '#F4F1EC',
          mixBlendMode: variant === 'invert' ? 'difference' : 'normal',
        }}
        animate={{ scale: variant === 'hover' ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
