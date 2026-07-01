'use client';
import { motion } from 'motion/react';

const ease = [0.16, 1, 0.3, 1] as const;

const clients = [
  { name: 'Thomas J Walls', industry: 'Coffee House', location: 'Edinburgh Old Town' },
  { name: 'Texture Lounge', industry: 'Beauty & Hair', location: 'Edinburgh West End' },
  { name: 'CHE Edinburgh', industry: 'Hospitality', location: 'Edinburgh City Centre' },
  { name: 'S2 Studio Cuts', industry: 'Barbershop', location: 'Edinburgh North' },
  { name: 'Lucky Chen', industry: 'Restaurant', location: 'Edinburgh South Side' },
  { name: 'The Mid Yoken', industry: 'Community Pub', location: 'Edinburgh' },
];

export default function Clients() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: '#09090A', padding: 'clamp(64px,8vw,112px) clamp(24px,5vw,88px)' }}
    >
      {/* Top rule */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.06)' }} />

      <div className="max-w-7xl mx-auto">

        {/* Label */}
        <motion.div
          className="flex items-center justify-between mb-12"
          initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.7 }}>
          <div className="flex items-center gap-4">
            <div className="w-8 h-px gradient-bg" />
            <span className="font-body text-[10px] tracking-[0.3em] uppercase"
              style={{ color: 'rgba(237,232,220,0.3)' }}>
              Trusted by Edinburgh's finest
            </span>
          </div>
          <span className="font-body text-[10px] tracking-[0.18em] uppercase hidden md:block"
            style={{ color: 'rgba(237,232,220,0.15)' }}>
            6 live projects
          </span>
        </motion.div>

        {/* Client grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px"
          style={{ background: 'rgba(237,232,220,0.06)' }}>
          {clients.map((client, i) => (
            <motion.div
              key={i}
              className="group relative flex flex-col justify-between"
              style={{ background: '#09090A', padding: 'clamp(24px,3vw,40px) clamp(18px,2vw,28px)', minHeight: 140 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.65, ease, delay: i * 0.07 }}>

              {/* Hover accent */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(196,30,30,0.07) 0%, transparent 70%)' }} />

              {/* Animated left border */}
              <div className="absolute left-0 top-0 w-px h-0 group-hover:h-full transition-all duration-400 pointer-events-none"
                style={{ background: 'linear-gradient(to bottom, #C41E1E, #E83838)' }} />

              <div>
                <p className="font-body text-[9px] tracking-[0.26em] uppercase mb-3 transition-colors duration-300"
                  style={{ color: 'rgba(237,232,220,0.2)' }}>
                  {client.industry}
                </p>
                <p className="font-display italic leading-tight transition-all duration-300 group-hover:gradient-text"
                  style={{
                    fontSize: 'clamp(0.85rem,1.5vw,1.05rem)',
                    letterSpacing: '-0.01em',
                    color: 'rgba(237,232,220,0.7)',
                    lineHeight: 1.2,
                  }}>
                  {client.name}
                </p>
              </div>

              <p className="font-body text-[9px] mt-3 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
                style={{ color: 'rgba(196,30,30,0.6)', letterSpacing: '0.06em' }}>
                {client.location}
              </p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Bottom rule */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, background: 'rgba(237,232,220,0.06)' }} />
    </section>
  );
}
