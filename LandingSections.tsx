import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  Shield,
  Clock,
  Coffee,
  Globe,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Compass,
  DollarSign,
  Activity,
  Sparkles,
  MapPin,
  ExternalLink,
  Plane,
  Zap,
  Eye,
  Star,
  Layers,
  Ruler
} from 'lucide-react';

/* ═══════════════════════════════════════════════════════════════
   FLOATING BACKGROUND PARTICLES — Interactive glow orbs
   ═══════════════════════════════════════════════════════════════ */
function FloatingOrbs() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-[#C9A86A]/5 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute bottom-[20%] right-[10%] w-96 h-96 bg-amber-500/3 rounded-full blur-[130px] animate-pulse" style={{ animationDuration: '10s', animationDelay: '-3s' }} />
      <div className="absolute top-[40%] right-[30%] w-48 h-48 bg-[#C9A86A]/4 rounded-full blur-[80px] animate-pulse" style={{ animationDuration: '6s', animationDelay: '-1.5s' }} />
      <div className="absolute bottom-[30%] left-[20%] w-56 h-56 bg-blue-500/2 rounded-full blur-[100px] animate-pulse" style={{ animationDuration: '12s', animationDelay: '-5s' }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D TILT HOOK — Enhanced with smooth spring return
   ═══════════════════════════════════════════════════════════════ */
function use3DTilt(maxTilt = 8) {
  const ref = useRef<HTMLDivElement>(null);
  const styleEl = useRef<HTMLStyleElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const id = `tilt-style-${Math.random().toString(36).slice(2, 9)}`;
    styleEl.current = document.createElement('style');
    styleEl.current.id = id;
    document.head.appendChild(styleEl.current);
    return () => { styleEl.current?.remove(); };
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(800px) rotateY(${x * maxTilt}deg) rotateX(${-y * maxTilt}deg) translateZ(12px)`;
    el.style.transition = 'transform 0.08s ease-out';
  }, [maxTilt]);

  const onMouseLeave = useCallback(() => {
    const el = ref.current;
    if (el) {
      el.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0px)';
      el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    }
  }, []);

  return { ref, onMouseMove, onMouseLeave };
}

/* ═══════════════════════════════════════════════════════════════
   3D ICON COMPONENT — Enhanced with hover glow + orbit
   ═══════════════════════════════════════════════════════════════ */
function Icon3D({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const tilt = use3DTilt(18);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={() => { tilt.onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => setHovered(true)}
      className={`relative inline-flex items-center justify-center cursor-default ${className}`}
      style={{ willChange: 'transform' }}
    >
      <motion.div
        animate={hovered ? { scale: 1.15, rotate: [0, -5, 5, 0] } : { scale: 1, rotate: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10"
      >
        {children}
      </motion.div>
      {hovered && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1.5 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-[#C9A86A]/20 rounded-full blur-xl"
        />
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3D CARD — Glassmorphic with dynamic glow
   ═══════════════════════════════════════════════════════════════ */
function GlassCard({ children, className = '', glowColor = 'rgba(201,168,106,0.08)' }: { children: React.ReactNode; className?: string; glowColor?: string }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -5;
    const rotateY = ((x - centerX) / centerX) * 5;
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`;

    const glow = card.querySelector('.card-dynamic-glow') as HTMLElement;
    if (glow) {
      glow.style.background = `radial-gradient(500px circle at ${x}px ${y}px, ${glowColor}, transparent 50%)`;
    }
  };

  const handleLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px) scale(1)';
    card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    const glow = card.querySelector('.card-dynamic-glow') as HTMLElement;
    if (glow) glow.style.background = 'transparent';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`relative bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden ${className}`}
      style={{ willChange: 'transform', transformStyle: 'preserve-3d' }}
    >
      <div className="card-dynamic-glow absolute inset-0 pointer-events-none z-0 rounded-3xl" />
      <div className="absolute inset-0 bg-gradient-to-br from-[#C9A86A]/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {children}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   INTERACTIVE EARTH / GLOBE — with morphing ball transition
   ═══════════════════════════════════════════════════════════════ */
function InteractiveGlobe() {
  const globeRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [morphProgress, setMorphProgress] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setMorphProgress(prev => {
        const next = prev + 0.002;
        return next > 1 ? 0 : next;
      });
      setRotation(prev => ({
        x: prev.x * 0.95,
        y: prev.y * 0.95 + 0.2,
      }));
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMouseMove = (e: React.MouseEvent) => {
    const el = globeRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -30;
    setRotation({ x: y, y: x });
  };

  const earthVisible = morphProgress < 0.7;
  const ballVisible = morphProgress > 0.3;
  const earthScale = 1 - morphProgress * 1.2;
  const ballScale = (morphProgress - 0.3) * 1.5;
  const opacity = morphProgress < 0.5 ? 1 : 1 - (morphProgress - 0.5) * 2;

  return (
    <div
      ref={globeRef}
      onMouseMove={handleMouseMove}
      className="relative w-48 h-48 md:w-64 md:h-64 mx-auto cursor-grab"
    >
      {/* Earth sphere */}
      <motion.div
        animate={{ scale: Math.max(0, earthScale), opacity }}
        className="absolute inset-0"
      >
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#C9A86A]/20 to-transparent blur-2xl" />
        <div
          className="absolute inset-0 rounded-full border border-[#C9A86A]/30 overflow-hidden"
          style={{
            background: 'radial-gradient(circle at 35% 35%, rgba(201,168,106,0.15), rgba(10,15,31,0.9) 70%)',
            boxShadow: 'inset 0 0 60px rgba(201,168,106,0.1), 0 0 40px rgba(201,168,106,0.08)',
            transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          {[20, 40, 60, 80].map((deg) => (
            <div key={deg}
              className="absolute left-1/2 -translate-x-1/2 rounded-full border border-[#C9A86A]/10"
              style={{
                width: `${Math.cos((deg * Math.PI) / 180) * 100}%`,
                height: `${Math.cos((deg * Math.PI) / 180) * 100}%`,
                top: `${50 - Math.cos((deg * Math.PI) / 180) * 50}%`,
              }}
            />
          ))}
          {[0, 30, 60, 90, 120, 150].map((deg) => (
            <div key={`lng-${deg}`}
              className="absolute inset-0 border border-[#C9A86A]/8 rounded-full"
              style={{ transform: `rotateY(${deg}deg)` }}
            />
          ))}
          <div className="absolute top-[25%] left-[30%] w-3 h-3 rounded-full bg-[#C9A86A]/60 blur-sm animate-pulse" />
          <div className="absolute top-[45%] left-[65%] w-2 h-2 rounded-full bg-[#C9A86A]/40 blur-sm animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-[60%] left-[40%] w-2.5 h-2.5 rounded-full bg-[#C9A86A]/50 blur-sm animate-pulse" style={{ animationDelay: '0.5s' }} />
        </div>
      </motion.div>

      {/* Abstract morphing ball */}
      <motion.div
        animate={{
          scale: Math.max(0, Math.min(1, ballScale)),
          opacity: Math.max(0, Math.min(1, (morphProgress - 0.3) * 3)),
        }}
        className="absolute inset-0 flex items-center justify-center"
      >
        <div
          className="w-32 h-32 md:w-44 md:h-44 animate-morph"
          style={{
            background: 'radial-gradient(circle at 40% 40%, rgba(201,168,106,0.3), rgba(201,168,106,0.05) 70%)',
            boxShadow: '0 0 60px rgba(201,168,106,0.15), inset 0 0 40px rgba(201,168,106,0.05)',
            border: '1px solid rgba(201,168,106,0.2)',
            transform: `rotateY(${rotation.y}deg)`,
            transition: 'transform 0.1s ease-out',
          }}
        >
          <div className="absolute inset-4 rounded-full bg-[#C9A86A]/10 blur-sm animate-pulse" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-8 rounded-full bg-[#C9A86A]/5 blur-md animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
      </motion.div>

      {/* Orbiting particles */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 w-2 h-2 -ml-1 -mt-1 rounded-full bg-[#C9A86A]/60 blur-sm animate-orbit" />
        <div className="absolute top-1/2 left-1/2 w-1.5 h-1.5 -ml-0.5 -mt-0.5 rounded-full bg-[#C9A86A]/40 blur-sm animate-orbit" style={{ animationDelay: '-3s', animationDuration: '10s' }} />
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SCROLL-TRIGGERED 3D TRANSITION — Jet → 3D Element
   ═══════════════════════════════════════════════════════════════ */
function ScrollTransition3D() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const jetOpacity = useTransform(scrollYProgress, [0, 0.4, 0.6, 1], [1, 0.8, 0, 0]);
  const jetScale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.6, 0]);
  const jetY = useTransform(scrollYProgress, [0, 0.5, 1], [0, -30, -80]);
  const elementOpacity = useTransform(scrollYProgress, [0.4, 0.6, 1], [0, 1, 1]);
  const elementScale = useTransform(scrollYProgress, [0.4, 0.7, 1], [0.3, 1, 1.1]);

  return (
    <section ref={sectionRef} className="relative h-[600px] md:h-[700px] overflow-hidden bg-[#1A1C20]">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0D0D0F] via-[#1A1C20] to-[#0D0D0F]" />

      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center">
          {/* Jet Animation */}
          <motion.div
            style={{ opacity: jetOpacity, scale: jetScale, y: jetY }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ x: [0, 20, 0], y: [0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <svg width="120" height="120" viewBox="0 0 120 120" fill="none" className="drop-shadow-[0_0_30px_rgba(201,168,106,0.3)]">
                <path d="M60 10 L75 50 L110 55 L75 65 L60 110 L45 65 L10 55 L45 50 Z"
                  fill="rgba(201,168,106,0.9)" stroke="#C9A86A" strokeWidth="2" />
                <path d="M60 10 L60 110" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <path d="M10 55 L110 55" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
                <circle cx="60" cy="60" r="8" fill="rgba(255,255,255,0.3)" />
              </svg>
              {/* Contrail */}
              <motion.div
                className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-1 h-20 bg-gradient-to-b from-[#C9A86A]/40 to-transparent"
                animate={{ height: [20, 40, 20], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </motion.div>
            <p className="text-gray-500 text-xs tracking-widest uppercase mt-8 font-semibold">Ascending Beyond</p>
          </motion.div>

          {/* 3D Element that appears */}
          <motion.div
            style={{ opacity: elementOpacity, scale: elementScale }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="flex flex-col items-center gap-6">
              {/* Abstract 3D shape */}
              <motion.div
                animate={{ rotateY: [0, 360], rotateX: [0, 15, 0, -15, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                className="relative"
              >
                <div className="w-40 h-40 md:w-56 md:h-56 relative" style={{ transformStyle: 'preserve-3d' }}>
                  {/* Layered rings creating 3D depth */}
                  {[0, 30, 60, 90, 120, 150].map((angle, i) => (
                    <div
                      key={i}
                      className="absolute inset-0 rounded-full border border-[#C9A86A]/20"
                      style={{
                        transform: `rotateY(${angle}deg) rotateX(${30}deg)`,
                        width: `${70 + i * 5}%`,
                        height: `${70 + i * 5}%`,
                        left: `${(100 - (70 + i * 5)) / 2}%`,
                        top: `${(100 - (70 + i * 5)) / 2}%`,
                      }}
                    />
                  ))}
                  {/* Core */}
                  <div className="absolute inset-[25%] rounded-full bg-[#C9A86A]/10 blur-xl animate-glow-pulse" />
                  <div className="absolute inset-[35%] rounded-full border border-[#C9A86A]/30 animate-spin-slow" />
                </div>
              </motion.div>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="text-[#C9A86A] text-sm font-semibold tracking-widest uppercase"
              >
                Infinite Possibilities
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════════════════════
   ANIMATED PRIVATE JET STATS — Orbiting counters
   ═══════════════════════════════════════════════════════════════ */
function AnimatedCounter({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const duration = 2000;
          const steps = 60;
          const stepTime = duration / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            setCount(Math.floor((target / steps) * currentStep));
            if (currentStep >= steps) {
              setCount(target);
              clearInterval(timer);
            }
          }, stepTime);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref}>
      {count.toLocaleString()}{suffix}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function LandingSections() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);
  const [hoveredDestination, setHoveredDestination] = useState<string | null>(null);
  const [hoveredAirport, setHoveredAirport] = useState<string | null>(null);

  const [counts, setCounts] = useState({ routes: 0, cities: 0, operators: 0 });
  const countsRef = useRef(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start end', 'end start'] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          const duration = 1500;
          const steps = 50;
          const stepTime = duration / steps;
          let currentStep = 0;

          const timer = setInterval(() => {
            currentStep++;
            setCounts({
              routes: Math.floor((1200 / steps) * currentStep),
              cities: Math.floor((450 / steps) * currentStep),
              operators: Math.floor((85 / steps) * currentStep),
            });
            if (currentStep >= steps) {
              setCounts({ routes: 1200, cities: 450, operators: 85 });
              clearInterval(timer);
            }
          }, stepTime);
        }
      },
      { threshold: 0.1 }
    );

    if (countsRef.current) observer.observe(countsRef.current);
    return () => observer.disconnect();
  }, []);

  const advantages = [
    {
      icon: <Clock className="text-[#C9A86A]" size={24} />,
      title: 'Instant Global Search',
      description: 'Compare private jets and premium commercial flights worldwide in seconds.',
      gradient: 'from-amber-500/10 to-transparent',
    },
    {
      icon: <Shield className="text-[#C9A86A]" size={24} />,
      title: 'Verified Operators Only',
      description: 'Zero brokers, no hidden fees, and strict safety audits on all listings.',
      gradient: 'from-blue-500/10 to-transparent',
    },
    {
      icon: <TrendingUp className="text-[#C9A86A]" size={24} />,
      title: 'Smart Price Engine',
      description: 'Real-time optimization and direct pricing from multiple global providers.',
      gradient: 'from-emerald-500/10 to-transparent',
    },
    {
      icon: <Coffee className="text-[#C9A86A]" size={24} />,
      title: 'Luxury-Grade Experience',
      description: 'Curated flight insights and dedicated elite travel configurations.',
      gradient: 'from-purple-500/10 to-transparent',
    },
  ];

  const searchModes = [
    {
      id: 'oneway',
      title: 'One‑Way',
      description: 'Direct flight matching to your target destination.',
      icon: '✈️',
      path: 'M 10 50 Q 50 20 90 50',
    },
    {
      id: 'roundtrip',
      title: 'Roundtrip',
      description: 'Continuous routing with full schedule flexibility.',
      icon: '🔄',
      path: 'M 10 50 Q 50 10 90 50 Q 50 90 10 50',
    },
    {
      id: 'multicity',
      title: 'Multi‑City',
      description: 'Complex multi-leg itineraries fully optimized.',
      icon: '🧭',
      path: 'M 10 50 L 40 20 L 70 80 L 90 50',
    },
  ];

  const destinations = [
    {
      name: 'Doha',
      image: 'https://images.unsplash.com/photo-1578894381163-e72c17f2d45f?auto=format&fit=crop&w=600&h=800&q=80',
      iata: 'DOH',
      desc: 'Pearl of the Gulf'
    },
    {
      name: 'Dubai',
      image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&h=800&q=80',
      iata: 'DXB',
      desc: 'City of Gold'
    },
    {
      name: 'Riyadh',
      image: 'https://images.unsplash.com/photo-1696445361596-0f8c3d323f7e?ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=800&q=80',
      iata: 'RUH',
      desc: 'Heart of Nejd'
    },

    {
      name: 'London',
      image: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?auto=format&fit=crop&w=600&h=800&q=80',
      iata: 'LHR',
      desc: 'Royal Heritage'
    },
    {
      name: 'Paris',
      image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&h=800&q=80',
      iata: 'CDG',
      desc: 'The City of Light'
    },
    {
      name: 'New York',
      image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&h=800&q=80',
      iata: 'JFK',
      desc: 'The Capital of the World'
    },
  ];


  const operators = [
    'VistaJet', 'NetJets', 'Qatar Executive', 'Fly XO', 'JetSmarter',
    'VistaJet', 'NetJets', 'Qatar Executive', 'Fly XO', 'JetSmarter'
  ];

  const faqs = [
    {
      question: 'Is Avianta a private jet operator or airline?',
      answer: 'Avianta is a search and comparison platform. We do not operate aircraft or sell flights directly—we show you options from certified operators and redirect you to complete booking with them.',
    },
    {
      question: 'How does Avianta find the cheapest and most premium options?',
      answer: 'Avianta aggregates pricing and availability from partner operators, then ranks options by cost, cabin class, range, and schedule so you can quickly see both the most affordable and the most exclusive choices.',
    },
    {
      question: 'Does Avianta charge extra fees?',
      answer: 'No. The prices you see are provided directly by operators. Avianta does not add fees or commissions.',
    },
  ];

  const jetRoutes = [
    { id: 'route1', from: 'London', to: 'Dubai', d: 'M 150 120 Q 300 130 450 180' },
    { id: 'route2', from: 'Paris', to: 'New York', d: 'M 150 120 Q 80 100 30 140' },
    { id: 'route3', from: 'Dubai', to: 'Doha', d: 'M 450 180 Q 430 190 410 200' },
    { id: 'route4', from: 'Riyadh', to: 'Paris', d: 'M 400 210 Q 270 160 150 120' },
  ];

  const airports = [
    { name: 'London Heathrow', iata: 'LHR', x: '150', y: '120' },
    { name: 'Paris Charles de Gaulle', iata: 'CDG', x: '170', y: '140' },
    { name: 'Dubai International', iata: 'DXB', x: '450', y: '180' },
    { name: 'Hamad International', iata: 'DOH', x: '410', y: '200' },
    { name: 'King Khalid International', iata: 'RUH', x: '400', y: '210' },
    { name: 'John F. Kennedy', iata: 'JFK', x: '30', y: '140' },
  ];

  const snapshotStats = [
    { label: 'Available Jets', value: '2,340+', icon: <Plane size={20} />, trend: '+12% this week', detail: 'Global fleet at your command' },
    { label: 'Avg. Response', value: '< 4 min', icon: <Zap size={20} />, trend: '97% within SLA', detail: 'Lightning-fast confirmations' },
    { label: 'Live Operators', value: '85', icon: <Eye size={20} />, trend: 'All verified', detail: 'Strictly vetted partners' },
  ];

  return (
    <div ref={containerRef} className="bg-[#0D0D0F] text-[#F5F5F2] overflow-hidden space-y-0 font-sans selection:bg-[#C9A86A] selection:text-black">

      {/* ══════════════════════════════════════════════════════════
          0) TODAY'S PRIVATE JET SNAPSHOT — Premium 3D Glassmorphic Cards
          ══════════════════════════════════════════════════════════ */}
      <section className="py-20 relative overflow-hidden">
        <FloatingOrbs />

        <div className="max-w-7xl mx-auto px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="text-center max-w-2xl mx-auto mb-14"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-xs font-semibold uppercase tracking-wider text-[#C9A86A] mb-4">
              <Activity size={12} className="animate-pulse" /> Live Market Data
            </div>
            <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">
              Today's Private Jet <span className="font-semibold text-[#C9A86A]">Snapshot</span>
            </h2>
            <p className="text-gray-400 text-sm mt-3">Real-time intelligence from the global charter network.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {snapshotStats.map((stat, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 40, rotateX: -10 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <GlassCard glowColor="rgba(201,168,106,0.12)">
                  <div className="p-8 relative z-10">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                      transition={{ duration: 0.3 }}
                    >
                      <Icon3D className="w-14 h-14 bg-[#C9A86A]/10 border border-[#C9A86A]/20 rounded-2xl mb-6 text-[#C9A86A]">
                        {stat.icon}
                      </Icon3D>
                    </motion.div>

                    <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">{stat.label}</p>
                    <p className="text-4xl md:text-5xl font-light text-white tracking-tight mt-2 mb-1">{stat.value}</p>
                    <p className="text-[#C9A86A] text-xs font-medium">{stat.trend}</p>

                    {/* Expanding detail on hover */}
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      whileHover={{ height: 'auto', opacity: 1 }}
                      className="overflow-hidden mt-0"
                    >
                      <p className="text-gray-500 text-xs mt-3 pt-3 border-t border-white/5">{stat.detail}</p>
                    </motion.div>
                  </div>

                  {/* Animated corner accent */}
                  <motion.div
                    className="absolute top-0 right-0 w-20 h-20"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: i * 0.15 + 0.3 }}
                  >
                    <div className="absolute top-3 right-3 w-8 h-8 border-t border-r border-[#C9A86A]/30 rounded-tr-lg" />
                  </motion.div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* GLOWING TRAIL DIVIDER */}
      <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent">
        <motion.div
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#C9A86A]/80 blur-md"
          animate={{ left: ['20%', '80%', '20%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* ══════════════════════════════════════════════════════════
          SCROLL-TRIGGERED 3D TRANSITION
          ══════════════════════════════════════════════════════════ */}
      <ScrollTransition3D />

      {/* ══════════════════════════════════════════════════════════
          1) AVIANTA ADVANTAGES — "Designed for Clear Decisions" with 3D Jet Animation
          ══════════════════════════════════════════════════════════ */}
      <section id="advantages" className="relative max-w-7xl mx-auto px-6 md:px-8 py-24">
        <FloatingOrbs />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-wider text-[#C9A86A]">
            <Sparkles size={12} /> The Avianta Standard
          </div>
          <h2 className="text-3xl md:text-5xl font-light tracking-tight text-white">
            Designed for <span className="font-semibold text-[#C9A86A]">Clear Decisions</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base">
            Every layer optimized for speed, clarity, and uncompromising luxury-grade efficiency.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {advantages.map((adv, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30, rotateX: -5 }}
              whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="group"
            >
              <GlassCard glowColor="rgba(201,168,106,0.1)">
                <div className={`absolute inset-0 bg-gradient-to-br ${adv.gradient} rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-0`} />
                <div className="p-8 relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.15, y: -3 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  >
                    <Icon3D className="w-12 h-12 bg-white/5 border border-[#C9A86A]/20 rounded-2xl mb-6 group-hover:bg-[#C9A86A]/10 transition-colors">
                      {adv.icon}
                    </Icon3D>
                  </motion.div>
                  <h3 className="text-lg font-semibold text-white mb-2 relative z-10">{adv.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed relative z-10">{adv.description}</p>

                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: '30%' }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15 + 0.5, duration: 0.8 }}
                    className="h-px bg-[#C9A86A]/40 mt-5"
                  />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        {/* 3D Jet Animation under advantages */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mt-20 flex flex-col md:flex-row items-center justify-center gap-10 md:gap-20"
        >
          {/* 3D rotating jet icon */}
          <motion.div
            animate={{ rotateY: [0, 360], y: [0, -5, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            style={{ transformStyle: 'preserve-3d' }}
            className="relative w-32 h-32 md:w-40 md:h-40"
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border border-[#C9A86A]/20 animate-spin-slow" style={{ animationDirection: 'reverse' }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Plane size={48} className="text-[#C9A86A] drop-shadow-[0_0_15px_rgba(201,168,106,0.5)]" />
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border border-dashed border-[#C9A86A]/10 animate-spin-slow" />
            </div>
          </motion.div>

          {/* Stats */}
          <div className="text-center md:text-left">
            <p className="text-gray-400 text-xs uppercase tracking-widest font-semibold">Performance Metrics</p>
            <div className="grid grid-cols-3 gap-8 mt-4">
              <div>
                <p className="text-2xl md:text-3xl font-light text-white"><AnimatedCounter target={1200} suffix="+" /></p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Routes</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-light text-[#C9A86A]"><AnimatedCounter target={450} suffix="+" /></p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Cities</p>
              </div>
              <div>
                <p className="text-2xl md:text-3xl font-light text-white"><AnimatedCounter target={85} /></p>
                <p className="text-gray-500 text-xs uppercase tracking-wider">Operators</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* DIAGONAL CUT SEPARATOR */}
      <div className="w-full h-12 bg-gradient-to-tr from-[#0D0D0F] via-[#0F1C2E] to-[#0D0D0F]"></div>

      {/* ══════════════════════════════════════════════════════════
          2) ANIMATED SEARCH MODES — Interactive 3D Cards
          ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 py-16">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <h2 className="text-2xl md:text-4xl font-light text-white">
            Sophisticated <span className="font-semibold text-[#C9A86A]">Search Engine</span> Modes
          </h2>
          <p className="text-gray-400 text-xs md:text-sm mt-2">
            Select a pathway pattern optimized for regional hops or worldwide transcontinental flights.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {searchModes.map((mode, i) => {
            const tilt = use3DTilt(6);
            return (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div
                  ref={tilt.ref}
                  onMouseMove={tilt.onMouseMove}
                  onMouseLeave={tilt.onMouseLeave}
                  className="relative bg-white/[0.02] border border-white/5 rounded-3xl p-6 overflow-hidden cursor-pointer group transition-all duration-300 hover:border-[#C9A86A]/30 hover:bg-white/[0.04]"
                  style={{ willChange: 'transform', transition: 'transform 0.15s ease-out, border-color 0.3s, background 0.3s' }}
                  onMouseEnter={() => setHoveredMode(mode.id)}
                  onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-2xl">{mode.icon}</span>
                    <motion.div
                      animate={hoveredMode === mode.id ? { x: 10, y: -5, rotate: 45 } : { x: 0, y: 0, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200 }}
                      className="text-[#C9A86A] text-xl font-bold"
                    >
                      ➔
                    </motion.div>
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">{mode.title}</h3>
                  <p className="text-gray-400 text-sm mb-6">{mode.description}</p>

                  <div className="w-full h-16 bg-black/20 rounded-2xl relative overflow-hidden flex items-center justify-center border border-white/5">
                    <svg className="w-4/5 h-full" viewBox="0 0 100 100" fill="none">
                      <path d={mode.path} stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                      <motion.path
                        d={mode.path}
                        stroke="#C9A86A"
                        strokeWidth="3"
                        initial={{ pathLength: 0 }}
                        animate={hoveredMode === mode.id ? { pathLength: 1 } : { pathLength: 0 }}
                        transition={{ duration: 1.2, ease: 'easeInOut' }}
                      />
                      <circle cx="10" cy="50" r="4" fill="#C9A86A" />
                      <circle cx="90" cy="50" r="4" fill="#C9A86A" />
                    </svg>
                  </div>

                  {/* Hover border glow */}
                  <motion.div
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    animate={hoveredMode === mode.id ? { boxShadow: 'inset 0 0 30px rgba(201,168,106,0.08)' } : { boxShadow: 'inset 0 0 0px rgba(201,168,106,0)' }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* GLOWING TRAIL DIVIDER */}
      <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-[#C9A86A]/40 to-transparent"></div>

      {/* ══════════════════════════════════════════════════════════
    3) DESTINATION SPOTLIGHT CAROUSEL — LOOPED, REVERSED, NO OVERLAY
    ══════════════════════════════════════════════════════════ */}
      <section className="py-16 bg-black/40 relative overflow-hidden">

        {/* Header */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#C9A86A] uppercase">
              Curated Portfolios
            </span>
            <h2 className="text-2xl md:text-4xl font-light text-white mt-1">
              Spotlight Destinations
            </h2>
          </div>

          <button
            onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-sm font-semibold text-[#C9A86A] hover:underline flex items-center gap-1"
          >
            Search all routes ➔
          </button>
        </div>

        {/* AUTO-MOVING LOOPED CAROUSEL (REVERSED) */}
        <div className="relative w-full overflow-hidden select-none">
          <div className="flex gap-6 animate-marquee-reverse">

            {/* DUPLICATE LIST TWICE FOR INFINITE LOOP */}
            {[...destinations, ...destinations].map((dest, i) => (
              <motion.div
                key={i}
                className="
            relative w-64 h-80 rounded-3xl overflow-hidden shrink-0 cursor-pointer group
            shadow-xl border border-white/10 bg-white/[0.05] backdrop-blur-xl
          "
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % destinations.length) * 0.06 }}
                onMouseEnter={() => setHoveredDestination(dest.name)}
                onMouseLeave={() => setHoveredDestination(null)}
                onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                {/* IMAGE — NO OVERLAY */}
                <motion.img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />

                {/* TEXT */}
                <div className="absolute bottom-6 left-6 right-6 space-y-1">
                  <span className="text-[10px] font-bold tracking-widest text-[#C9A86A] uppercase">
                    {dest.iata}
                  </span>

                  <h3 className="text-2xl font-serif font-light text-white tracking-wide">
                    {dest.name}
                  </h3>

                  <p className="text-gray-300 text-xs">{dest.desc}</p>

                  <div className="pt-2 overflow-hidden">
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={hoveredDestination === dest.name ? { y: 0, opacity: 1 } : { y: 20, opacity: 0 }}
                      className="text-[#C9A86A] text-xs font-semibold flex items-center gap-1"
                    >
                      Explore flights <ArrowRight size={12} />
                    </motion.p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>


      {/* ═════════ PREMIUM JET OPERATORS SHOWCASE (LIGHT ULTRA PREMIUM) ═════════ */}
      <section className="py-12 bg-[var(--color-brand-cream)] border-y border-[var(--glass-border)]">

        {/* Heading */}
        <div className="max-w-7xl mx-auto px-6 md:px-8 mb-8 text-center">
          <span className="
      text-[10px] tracking-[0.2em] font-semibold 
      text-[var(--color-text-light)] uppercase
    ">
            Strategic Aviation Alliances
          </span>
        </div>

        {/* Marquee container */}
        <div className="relative w-full overflow-hidden flex flex-nowrap gap-12 select-none">

          {/* Row 1 */}
          <div className="
      flex gap-12 shrink-0 
      animate-marquee 
      items-center justify-around min-w-full
      hover:[animation-play-state:paused]
    ">
            {operators.map((op, idx) => (
              <span
                key={idx}
                className="
            text-xl md:text-2xl font-serif 
            text-[var(--color-text-medium)]
            transition-all cursor-pointer 
            px-6 py-2 rounded-full
            bg-[var(--glass-lighter)]
            backdrop-blur-xl
            border border-[var(--glass-border)]
            shadow-md shadow-[rgba(0,0,0,0.05)]
            hover:text-[var(--color-brand-gold)]
            hover:border-[var(--color-brand-gold)]/40
            hover:shadow-[0_0_20px_rgba(201,168,106,0.25)]
          "
              >
                {op}
              </span>
            ))}
          </div>

          {/* Row 2 (duplicate for infinite loop) */}
          <div
            className="
        flex gap-12 shrink-0 
        animate-marquee 
        items-center justify-around min-w-full
        hover:[animation-play-state:paused]
      "
            aria-hidden="true"
          >
            {operators.map((op, idx) => (
              <span
                key={idx + 100}
                className="
            text-xl md:text-2xl font-serif 
            text-[var(--color-text-medium)]
            transition-all cursor-pointer 
            px-6 py-2 rounded-full
            bg-[var(--glass-lighter)]
            backdrop-blur-xl
            border border-[var(--glass-border)]
            shadow-md shadow-[rgba(0,0,0,0.05)]
            hover:text-[var(--color-brand-gold)]
            hover:border-[var(--color-brand-gold)]/40
            hover:shadow-[0_0_20px_rgba(201,168,106,0.25)]
          "
              >
                {op}
              </span>
            ))}
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
    5) EARTH → BALL INTERACTIVE TRANSITION SECTION (LIGHT PREMIUM)
    ══════════════════════════════════════════════════════════ */}
      <section className="py-24 relative overflow-hidden">

        {/* Light luxury gradient background */}
        <div className="
    absolute inset-0 
    bg-gradient-to-b 
    from-[var(--color-brand-pearl)] 
    via-[var(--color-brand-cloud)] 
    to-[var(--color-brand-cream)]
  " />

        <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* LEFT TEXT BLOCK */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="
          text-xs font-semibold 
          text-[var(--color-brand-gold)] 
          uppercase tracking-wider
        ">
                Global Connectivity
              </span>

              <h2 className="
          text-3xl md:text-5xl 
          font-light 
          text-[var(--color-text-dark)] 
          mt-2 leading-tight
        ">
                One Platform.<br />
                <span className="font-semibold text-[var(--color-brand-gold)]">
                  Every Destination.
                </span>
              </h2>

              <p className="
          text-[var(--color-text-medium)] 
          mt-4 text-sm leading-relaxed max-w-lg
        ">
                Avianta connects you to over 1,200 optimized private jet corridors spanning 450+ cities worldwide.
                Our globe-spanning network ensures you're always just a few taps away from your next destination.
              </p>

              {/* Stats */}
              <div className="flex gap-8 mt-8">
                <div>
                  <p className="text-3xl font-light text-[var(--color-text-dark)]">450+</p>
                  <p className="text-[var(--color-text-light)] text-xs uppercase tracking-wider">Cities</p>
                </div>
                <div>
                  <p className="text-3xl font-light text-[var(--color-brand-gold)]">6</p>
                  <p className="text-[var(--color-text-light)] text-xs uppercase tracking-wider">Continents</p>
                </div>
                <div>
                  <p className="text-3xl font-light text-[var(--color-text-dark)]">24/7</p>
                  <p className="text-[var(--color-text-light)] text-xs uppercase tracking-wider">Coverage</p>
                </div>
              </div>
            </motion.div>

            {/* RIGHT GLOBE */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="
          flex items-center justify-center 
          backdrop-blur-xl 
          bg-[var(--glass-light)]/40 
          rounded-3xl 
          p-6 
          shadow-xl shadow-[rgba(0,0,0,0.08)]
        "
            >
              <InteractiveGlobe />
            </motion.div>

          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
          6) ANIMATED PRICE INSIGHTS SECTION
          ══════════════════════════════════════════════════════════ */}
      <section ref={countsRef} className="max-w-7xl mx-auto px-6 md:px-8 py-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16 space-y-2"
        >
          <span className="text-xs font-semibold text-[#C9A86A] uppercase tracking-wider">Analytical Intelligence</span>
          <h2 className="text-3xl md:text-4xl font-light text-white">Smart Network Insights</h2>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {[
            { label: 'Active Routes', value: counts.routes, suffix: '+', percent: 85, desc: 'Optimized private jet corridors globally' },
            { label: 'Monitored Hubs', value: counts.cities, suffix: '+', percent: 70, desc: 'Intercontinental destinations serviced' },
            { label: 'Verified Partners', value: counts.operators, suffix: '', percent: 90, desc: 'Accredited private jet operators' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="group"
            >
              <GlassCard glowColor="rgba(201,168,106,0.06)">
                <div className="p-8 relative z-10">
                  <span className="text-gray-400 text-xs uppercase tracking-widest">{stat.label}</span>
                  <div className="my-6">
                    <span className="text-5xl font-light text-white tracking-tight">{stat.value}{stat.suffix}</span>
                    <p className="text-gray-500 text-sm mt-1">{stat.desc}</p>
                  </div>
                  <div className="w-full bg-[#C9A86A]/10 h-1.5 rounded-full overflow-hidden">
                    <motion.div
                      className="bg-[#C9A86A] h-full rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${stat.percent}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: i * 0.2, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════
          7) INTERACTIVE MAP SECTION (JET ROUTES)
          ══════════════════════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-6 md:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-12"
        >
          <span className="text-xs font-semibold text-[#C9A86A] uppercase tracking-wider">Live Operations Map</span>
          <h2 className="text-2xl md:text-4xl font-light text-white mt-1">Active Airspace Corridors</h2>
        </motion.div>

        <div className="relative bg-black/50 border border-white/10 rounded-3xl p-6 md:p-12 overflow-hidden flex flex-col items-center justify-center">
          <svg className="w-full max-w-4xl h-80 md:h-[450px]" viewBox="0 0 800 400" fill="none">
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <path d="M 50 150 Q 80 120 150 120 T 250 140 T 350 200 T 450 250" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />
            <path d="M 550 100 Q 600 120 650 150 T 750 250" stroke="rgba(255,255,255,0.02)" strokeWidth="2" />

            {jetRoutes.map((route) => (
              <g key={route.id}>
                <path d={route.d} stroke="rgba(201,168,106,0.1)" strokeWidth="2" strokeDasharray="5 5" />
                <path
                  d={route.d}
                  stroke="#C9A86A"
                  strokeWidth="2"
                  strokeDasharray="40 160"
                  className="animate-dash"
                />
              </g>
            ))}

            {airports.map((airport) => (
              <g
                key={airport.iata}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredAirport(airport.name)}
                onMouseLeave={() => setHoveredAirport(null)}
              >
                <circle cx={airport.x} cy={airport.y} r="6" fill="#C9A86A" />
                <circle cx={airport.x} cy={airport.y} r="12" stroke="#C9A86A" strokeWidth="1.5" className="animate-ping opacity-75" style={{ transformOrigin: `${airport.x}px ${airport.y}px` }} />
                <text
                  x={airport.x}
                  y={parseFloat(airport.y) - 15}
                  textAnchor="middle"
                  fill="white"
                  fontSize="10"
                  fontWeight="bold"
                  style={{ display: hoveredAirport === airport.name ? 'block' : 'none' }}
                >
                  {airport.name} ({airport.iata})
                </text>
              </g>
            ))}
          </svg>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between text-xs text-gray-500">
            <span>Mercator Abstract Proj.</span>
            <span>Real-time Operations Airspace Connected</span>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <div className="relative w-full h-[1px] bg-gradient-to-r from-transparent via-[var(--color-brand-gold)]/40 to-transparent"></div>

      <section
        id="faq"
        className="relative z-[50] max-w-4xl mx-auto px-6 md:px-8 py-20"
      >

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <span className="
      text-xs font-semibold tracking-[0.25em] 
      text-[var(--color-brand-gold)] uppercase
    ">
            Questions & Answers
          </span>

          <h2 className="
      text-3xl md:text-4xl 
      font-light 
      text-[var(--color-brand-gold)] 
      tracking-tight
    ">
            Understanding Avianta Operations
          </h2>
        </motion.div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="
          rounded-2xl 
          overflow-hidden 
          backdrop-blur-xl 
          bg-[var(--glass-lighter)]/70
          border border-[var(--glass-border)]
          shadow-lg shadow-[rgba(0,0,0,0.06)]
          transition-all duration-300 
          hover:shadow-xl hover:shadow-[rgba(0,0,0,0.1)]
        "
            >
              {/* Question Button */}
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="
            w-full px-6 py-5 
            text-left flex items-center justify-between 
            font-medium 
            text-[var(--color-brand-gold)] 
            hover:text-[var(--color-brand-gold-light)] 
            transition-colors 
            focus:outline-none
          "
              >
                <span>{faq.question}</span>

                {openFaq === i ? (
                  <ChevronUp
                    className="text-[var(--color-brand-gold)] flex-shrink-0"
                    size={18}
                  />
                ) : (
                  <ChevronDown
                    className="text-[var(--color-brand-gold-soft)] flex-shrink-0"
                    size={18}
                  />
                )}
              </button>

              {/* Answer */}
              <AnimatePresence initial={false}>
                {openFaq === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="
                overflow-hidden 
                border-t border-[var(--glass-border)]
              "
                  >
                    <p className="
                px-6 py-5 
                text-sm 
                leading-relaxed 
                text-[var(--color-text-dark)]
                bg-[var(--color-brand-pearl)]
                text-justify
              ">
                      {faq.answer}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════
          PREMIUM FOOTER CTA
          ══════════════════════════════════════════════════════════ */}
      <section className="relative py-24 overflow-hidden border-t border-white/5">
        <FloatingOrbs />
        <div className="max-w-4xl mx-auto px-6 md:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#C9A86A]/10 border border-[#C9A86A]/20 text-xs font-semibold uppercase tracking-wider text-[#C9A86A]">
              <Sparkles size={12} /> Ready for Takeoff
            </div>
            <h2 className="text-3xl md:text-5xl font-light text-white leading-tight">
              Your next journey begins<br />
              <span className="font-semibold text-[#C9A86A]">with a single click</span>
            </h2>
            <p className="text-gray-400 text-sm md:text-base max-w-lg mx-auto">
              Browse thousands of private jet options and premium commercial flights — all in one place, all in seconds.
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => document.getElementById('search-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-3.5 rounded-full bg-gradient-to-r from-[#C9A86A] to-[#b9975f] text-white font-medium shadow-lg hover:shadow-xl transition-all text-sm"
            >
              <span className="flex items-center gap-2">
                Search Flights <ArrowRight size={14} />
              </span>
            </motion.button>
          </motion.div>

          {/* Bottom links */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-600"
          >
            <span>© 2026 Avianta — Private Jet Search Engine</span>
            <div className="flex items-center gap-6">
              <span>Privacy Policy</span>
              <span>Terms of Service</span>
              <span>Contact</span>
            </div>
          </motion.div>
        </div>
      </section>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-100%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
        @keyframes dash {
          to { stroke-dashoffset: -200; }
        }
        .animate-dash {
          animation: dash 8s linear infinite;
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }
        .animate-float-gentle {
          animation: float-gentle 4s ease-in-out infinite;
        }
      `}</style>

    </div>
  );
}