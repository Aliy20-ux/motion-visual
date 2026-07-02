'use client';
import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'motion/react';

type Variant = 'default' | 'hover' | 'view' | 'drag' | 'invert';

const RING_SIZE: Record<Variant, number> = {
  default: 40,
  hover: 52,
  view: 88,
  drag: 88,
  invert: 40,
};

const LABEL: Record<Variant, string> = {
  default: '',
  hover: '',
  view: 'VIEW',
  drag: 'DRAG',
  invert: '',
};

export default function CustomCursor() {
  const cursorX = useMotionValue(-200);
  const cursorY = useMotionValue(-200);
  const dotX = useMotionValue(-200);
  const dotY = useMotionValue(-200);

  const springConfig = { stiffness: 480, damping: 36 };
  const springX = useSpring(cursorX, springConfig);
  const springY = useSpring(cursorY, springConfig);

  const [variant, setVariant] = useState<Variant>('default');
  const [visible, setVisible] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    setEnabled(window.matchMedia('(pointer: fine)').matches);
  }, []);

  useEffect(() => {
    if (!enabled) return undefined;

    const move = (e: MouseEvent) => {
      const r = RING_SIZE[variant] / 2;
      cursorX.set(e.clientX - r);
      cursorY.set(e.clientY - r);
      dotX.set(e.clientX - 4);
      dotY.set(e.clientY - 4);
      if (!visible) setVisible(true);
    };

    const onDocLeave = () => setVisible(false);
    const onDocEnter = () => setVisible(true);
    const makeEnter = (v: Variant) => () => setVariant(v);
    const onLeave = () => setVariant('default');

    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', onDocLeave);
    document.addEventListener('mouseenter', onDocEnter);

    const groups: [NodeListOf<HTMLElement>, Variant][] = [
      [document.querySelectorAll<HTMLElement>('a, button'), 'hover'],
      [document.querySelectorAll<HTMLElement>('[data-cursor="view"]'), 'view'],
      [document.querySelectorAll<HTMLElement>('[data-cursor="drag"]'), 'drag'],
      [document.querySelectorAll<HTMLElement>('img, video, canvas'), 'invert'],
    ];
    const onEnterByGroup = groups.map(([, v]) => makeEnter(v));

    groups.forEach(([els], i) => {
      els.forEach(el => {
        el.addEventListener('mouseenter', onEnterByGroup[i]);
        el.addEventListener('mouseleave', onLeave);
      });
    });

    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', onDocLeave);
      document.removeEventListener('mouseenter', onDocEnter);
      groups.forEach(([els], i) => {
        els.forEach(el => {
          el.removeEventListener('mouseenter', onEnterByGroup[i]);
          el.removeEventListener('mouseleave', onLeave);
        });
      });
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);

  if (!enabled) return null;

  const size = RING_SIZE[variant];
  const isLabel = variant === 'view' || variant === 'drag';

  return (
    <>
      {/* Ring */}
      <motion.div
        className="fixed top-0 left-0 z-[99999] pointer-events-none rounded-full flex items-center justify-center overflow-hidden"
        style={{ x: springX, y: springY, opacity: visible ? 1 : 0 }}
        animate={{
          width: size,
          height: size,
          border: isLabel
            ? '1.5px solid rgba(196,30,30,0.85)'
            : variant === 'invert'
            ? '1.5px solid #0A0505'
            : '1.5px solid rgba(244,241,236,0.5)',
          background: isLabel ? 'rgba(196,30,30,0.08)' : 'transparent',
          mixBlendMode: variant === 'invert' ? 'difference' : 'normal',
        }}
        transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <AnimatePresence mode="wait">
          {isLabel && (
            <motion.span
              key={variant}
              className="font-body font-semibold select-none"
              style={{ fontSize: '9px', letterSpacing: '0.22em', color: 'rgba(196,30,30,0.95)' }}
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.18 }}
            >
              {LABEL[variant]}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Dot — hidden when showing label */}
      <motion.div
        className="fixed top-0 left-0 z-[99999] pointer-events-none rounded-full"
        style={{
          x: dotX,
          y: dotY,
          width: 8,
          height: 8,
          background: variant === 'invert' ? '#0A0505' : '#F4F1EC',
          mixBlendMode: variant === 'invert' ? 'difference' : 'normal',
          opacity: visible ? 1 : 0,
        }}
        animate={{ scale: (isLabel || variant === 'hover') ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
    </>
  );
}
