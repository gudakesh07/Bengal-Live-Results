/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell,
  PieChart, Pie
} from 'recharts';
import { 
  TrendingUp, 
  BarChart3, 
  Users, 
  Info, 
  ChevronRight, 
  X,
  Zap,
  Clock,
  Linkedin,
  Trophy,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { generateInitialData, getRealElectionData } from './data';
import { Constituency, Party, ElectionStats } from './types';
import { modiImg, mamataImg } from './images';

// Components
const DetailModal = ({ seat, onClose }: { seat: Constituency, onClose: () => void }) => {
  const total = seat.bjp_votes + seat.tmc_votes + seat.others_votes;
  const bjpPerc = ((seat.bjp_votes / total) * 100).toFixed(1);
  const tmcPerc = ((seat.tmc_votes / total) * 100).toFixed(1);
  const othersPerc = ((seat.others_votes / total) * 100).toFixed(1);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        className="bg-black border border-white/10 w-full max-w-md rounded-3xl overflow-hidden shadow-[0_32px_64px_rgba(0,0,0,1)]"
        onClick={e => e.stopPropagation()}
      >
        <div className="relative p-8 pb-4">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-white/50" />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              seat.leading_party === 'BJP' ? 'bg-orange-500 shadow-orange-500/20' : 
              seat.leading_party === 'TMC' ? 'bg-blue-500 shadow-blue-500/20' : 'bg-pink-500 shadow-pink-500/20'
            }`}>
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-display tracking-tight text-white leading-none">{seat.name}</h2>
              <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-2 flex items-center gap-2">
                <MapPin className="w-3 h-3" />
                AC #{(parseInt(seat.id.split('-')[1]) + 1).toString().padStart(3, '0')}
              </div>
            </div>
          </div>

          <div className="bg-zinc-900/50 p-4 rounded-2xl border border-white/5 mb-6">
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-1">Current Frontrunner</div>
            <div className="text-lg font-black text-white">{seat.candidateName || "Awaiting Data..."}</div>
            <div className={`text-[10px] font-black uppercase mt-1 ${
              seat.leading_party === 'BJP' ? 'text-orange-500' : 
              seat.leading_party === 'TMC' ? 'text-blue-500' : 'text-pink-500'
            }`}>
              {seat.leading_party} • Leading by {Math.abs(seat.bjp_votes - seat.tmc_votes).toLocaleString()} votes
            </div>
          </div>

          <div className="space-y-5">
            <PartyRow party="BJP" votes={seat.bjp_votes} perc={bjpPerc} color="bg-orange-500" />
            <PartyRow party="TMC" votes={seat.tmc_votes} perc={tmcPerc} color="bg-blue-500" />
            <PartyRow party="OTH" votes={seat.others_votes} perc={othersPerc} color="bg-pink-500" />
          </div>
        </div>
        
        <div className="bg-zinc-900 border-t border-white/5 p-6 flex items-center justify-between">
          <div>
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Total Polled</div>
            <div className="text-xl font-black font-mono tracking-tighter text-white">{total.toLocaleString()}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mb-0.5">Swing</div>
            <div className="text-xl font-black font-mono tracking-tighter text-orange-500">+4.2%</div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const PartyRow = ({ party, votes, perc, color }: { party: string, votes: number, perc: string, color: string }) => (
  <div className="space-y-2">
    <div className="flex justify-between items-end">
      <div className="flex flex-col">
        <span className={`text-[10px] font-black tracking-widest uppercase ${color.replace('bg-', 'text-')}`}>{party}</span>
        <span className="text-xs font-bold text-zinc-400">{votes.toLocaleString()}</span>
      </div>
      <span className="text-sm font-black text-white">{perc}%</span>
    </div>
    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
      <motion.div 
        initial={{ width: 0 }}
        animate={{ width: `${perc}%` }}
        className={`h-full ${color} shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
      />
    </div>
  </div>
);

const HoverTooltip = ({ seat, pos }: { seat: Constituency | null, pos: { x: number, y: number } }) => {
  if (!seat) return null;
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed z-50 pointer-events-none bg-black/95 border border-white/10 p-4 rounded-xl shadow-2xl backdrop-blur-xl min-w-[200px]"
      style={{ left: pos.x + 20, top: pos.y - 40 }}
    >
      <div className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Legislative AC #{(parseInt(seat.id.split('-')[1]) + 1)}</div>
      <div className="text-sm font-black text-white mb-2 font-display">{seat.name}</div>
      <div className="space-y-1.5 border-t border-white/5 pt-2">
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-zinc-500">WINNING</span>
          <span className="text-white truncate max-w-[120px]">{seat.candidateName || "Candidate"}</span>
        </div>
        <div className="flex justify-between items-center text-[10px] font-bold">
          <span className="text-zinc-500 uppercase">Party</span>
          <span className={`${seat.leading_party === 'BJP' ? 'text-orange-500' : 'text-blue-500'}`}>{seat.leading_party}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function App() {
  const [constituencies, setConstituencies] = useState<Constituency[]>([]);
  const [selectedSeat, setSelectedSeat] = useState<Constituency | null>(null);
  const [hoveredSeat, setHoveredSeat] = useState<Constituency | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [countdown, setCountdown] = useState(30);
  const [isPlayingModiSong, setIsPlayingModiSong] = useState(false);

  const roasts = useMemo(() => [
    "Still counting... like your Dadi counting your mistakes at family dinners 😅",
    "Taking longer than a South Delhi girl deciding her weekend outfit 🙄",
    "Counting slower than your sibling returning the money they owe you 💸",
    "Refreshing more times than a college student checking their crush's story 👀",
    "Sweating harder than a software developer pushed to prod on Friday 💦",
    "EVMs taking longer than an Indian mom reading a WhatsApp forward 📱",
    "Tension higher than an Indian uncle arguing politics at a wedding 🎉",
  ], []);

  const [currentRoast, setCurrentRoast] = useState(roasts[0]);

  useEffect(() => {
    setCurrentRoast(prev => {
      let newRoast = prev;
      while (newRoast === prev) {
        newRoast = roasts[Math.floor(Math.random() * roasts.length)];
      }
      return newRoast;
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastUpdate]);

  const containerRef = useRef<HTMLDivElement>(null);
  const playerIframeRef = useRef<HTMLIFrameElement>(null);

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  const playModiSong = () => {
    setIsPlayingModiSong(prev => {
      const next = !prev;
      if (playerIframeRef.current && playerIframeRef.current.contentWindow) {
        if (next) {
          playerIframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*');
          playerIframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
        } else {
          playerIframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*');
        }
      }
      return next;
    });
  };

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Data update loop
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    // Initial load
    const fetchInitial = async () => {
      try {
        const liveData = await getRealElectionData();
        setConstituencies(liveData);
        setLastUpdate(new Date());
        setCountdown(30);
      } catch (err) {
        console.error("Failed to fetch initial election data", err);
      }
    };
    
    fetchInitial();

    // Setup polling every 30s
    intervalId = setInterval(async () => {
      try {
        const liveData = await getRealElectionData();
        setConstituencies(liveData);
        setLastUpdate(new Date());
        setCountdown(30);
      } catch (err) {
        console.error("Failed to fetch election data", err);
      }
    }, 30000); // 30 seconds as per UI

    return () => clearInterval(intervalId);
  }, []);

  // Statistics
  const stats = useMemo<ElectionStats>(() => {
    const s = { bjp: 0, tmc: 0, others: 0, total: constituencies.length };
    constituencies.forEach(c => {
      if (c.leading_party === 'BJP') s.bjp++;
      else if (c.leading_party === 'TMC') s.tmc++;
      else s.others++;
    });
    return s;
  }, [constituencies]);

  const chartData = useMemo(() => {
    let bjpVotes = 0;
    let tmcVotes = 0;
    let othersVotes = 0;
    constituencies.forEach(c => {
      bjpVotes += c.bjp_votes || 0;
      tmcVotes += c.tmc_votes || 0;
      othersVotes += c.others_votes || 0;
    });

    return {
      voteShare: [
        { name: 'BJP', value: bjpVotes, fill: '#f97316' },
        { name: 'TMC', value: tmcVotes, fill: '#3b82f6' },
        { name: 'OTHERS', value: othersVotes, fill: '#ec4899' },
      ],
      seatShare: [
        { name: 'BJP', seats: stats.bjp, fill: '#f97316' },
        { name: 'TMC', seats: stats.tmc, fill: '#3b82f6' },
        { name: 'OTHERS', seats: stats.others, fill: '#ec4899' },
      ]
    };
  }, [constituencies, stats]);

  const getTileColor = (c: Constituency) => {
    switch (c.leading_party) {
      case 'BJP': return 'bg-orange-500';
      case 'TMC': return 'bg-blue-500';
      case 'OTHERS': return 'bg-pink-500';
      default: return 'bg-zinc-800';
    }
  };

  return (
    <div 
      className="min-h-screen bg-black text-white p-4 max-w-lg mx-auto font-sans selection:bg-orange-500/30"
      onMouseMove={handleMouseMove}
    >
      {/* Top Banner */}
      <div className="flex flex-col items-center gap-4 mb-10 pt-4">
        <div className="bg-red-500 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full flex items-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_8px_white]"></span>
          Counting Live
        </div>
        
        <div className="text-center">
          <h1 className="text-4xl font-black font-display tracking-tight flex items-center justify-center gap-3">
            West Bengal 2026
          </h1>
          <p className="text-zinc-500 text-[11px] mt-2 uppercase font-bold tracking-[0.3em] opacity-60">
            Real-Time Legislative Audit
          </p>
          <div className="flex items-center justify-center gap-4 mt-6 text-[10px] font-bold text-zinc-400">
            <div className="bg-zinc-900 border border-white/5 pl-2 pr-1 py-1 rounded-lg flex items-center gap-2">
              <span className="opacity-50 text-[9px]">NEXT SYNC</span>
              <span className="bg-orange-500 px-1.5 py-0.5 rounded text-[10px] text-white font-black tabular-nums">{countdown}s</span>
            </div>
            <div className="h-4 w-[1px] bg-white/10"></div>
            <span className="opacity-40">{lastUpdate.toLocaleTimeString([], { hour12: true })}</span>
          </div>
        </div>
      </div>

      {/* Hero Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-12">
        {/* Modi Card */}
        <div 
          onClick={playModiSong}
          className="relative bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-500/20 p-6 rounded-[2.5rem] text-center overflow-hidden group cursor-pointer active:scale-95 transition-transform"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="relative inline-block mb-4">
              {isPlayingModiSong && (
                <>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500/60 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500/40 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '600ms' }}></div>
                  <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" style={{ animationDelay: '1200ms' }}></div>
                </>
              )}
               <div className={`relative z-10 w-28 h-28 rounded-full border-4 border-orange-500 p-1.5 transition-all overflow-hidden ${isPlayingModiSong ? 'scale-110 shadow-[0_0_40px_rgba(249,115,22,0.8)]' : 'shadow-[0_20px_50px_rgba(249,115,22,0.4)] group-hover:scale-110 group-hover:shadow-[0_20px_70px_rgba(249,115,22,0.6)]'}`}>
                <img 
                  src={modiImg} 
                  alt="Modi"
                  className="w-full h-full rounded-full object-cover filter contrast-110"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20 bg-white text-black text-[9px] font-black px-3 py-1 rounded-full whitespace-nowrap uppercase tracking-tighter shadow-xl animate-bounce">
                Touch me
              </div>
            </div>
            <div className="text-xl font-black font-display text-white mb-0.5">Narendra Modi</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4">BJP</div>
            <div className="text-7xl font-black text-orange-500 font-display tracking-tighter drop-shadow-[0_10px_10px_rgba(249,115,22,0.3)]">{stats.bjp}</div>
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Seats Leading</div>
          </div>
        </div>

        {/* Mamata Card */}
        <div className="relative bg-gradient-to-br from-blue-500/20 to-transparent border border-blue-500/20 p-6 rounded-[2.5rem] text-center overflow-hidden group">
          <div className="absolute top-0 left-0 w-32 h-32 bg-blue-500/5 blur-3xl -ml-16 -mt-16"></div>
          <div className="relative z-10">
            <div className="relative inline-block mb-4">
              <div className="w-28 h-28 rounded-full border-4 border-blue-500 p-1.5 shadow-[0_20px_50px_rgba(59,130,246,0.4)] transition-all group-hover:scale-110 group-hover:shadow-[0_20px_70px_rgba(59,130,246,0.6)] overflow-hidden">
                <img 
                  src={mamataImg} 
                  alt="Mamata"
                  className="w-full h-full rounded-full object-cover filter contrast-110"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
            <div className="text-xl font-black font-display text-white mb-0.5" style={{ whiteSpace: 'normal', lineHeight: '1.1' }}>Mamta<br />Banarjee</div>
            <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mb-4 pt-1">AITC / TMC</div>
            <div className="text-7xl font-black text-blue-500 font-display tracking-tighter drop-shadow-[0_10px_10px_rgba(59,130,246,0.3)]">{stats.tmc}</div>
            <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest mt-2">Seats Leading</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-14 px-4">
        <div className="relative h-6 bg-zinc-900 rounded-[2rem] overflow-hidden flex shadow-2xl border border-white/5 p-[3px] mb-3">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(stats.bjp / 294) * 100}%` }}
            className="h-full bg-orange-500 rounded-l-[1.5rem]"
          />
          <div className="w-1 bg-[#27272a] h-full z-10" />
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${(stats.tmc / 294) * 100}%` }}
            className="h-full bg-blue-500"
          />
          <div className="flex-1 bg-[#27272a] rounded-r-[1.5rem]" />
          
          <div className="absolute left-[50.34%] top-0 bottom-0 w-[1px] bg-white z-10 shadow-[0_0_15px_white]">
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 whitespace-nowrap text-[9px] font-black text-zinc-500 uppercase flex items-center gap-1">
              <span>▼</span> Majority (148)
            </div>
          </div>
        </div>
        <div className="flex justify-between items-center text-xs px-1 font-bold">
          <span className="text-orange-500 font-black">BJP {stats.bjp}</span>
          <span className="text-zinc-400 font-medium">Counting: {stats.total}</span>
          <span className="text-blue-500 font-black">TMC {stats.tmc}</span>
        </div>
      </div>

      {/* Funny Status */}
      <div className="bg-[#18181b] border border-white/5 p-4 rounded-2xl mb-8 text-center ring-1 ring-white/5 shadow-2xl relative overflow-hidden min-h-[56px] flex items-center justify-center">
        <AnimatePresence mode="wait">
          <motion.p 
            key={currentRoast}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-xs font-medium leading-relaxed text-zinc-300 flex items-center justify-center gap-2"
          >
            <span>⏳</span>
            {currentRoast}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Party Tally */}
      <div className="mb-8 font-sans">
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
          <span className="whitespace-nowrap">PARTY TALLY</span>
          <div className="h-[1px] flex-1 bg-zinc-800"></div>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#18181b] rounded-xl p-4 border border-white/10 ring-1 ring-black/50 hover:bg-[#202024] cursor-pointer transition-colors shadow-lg">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">BJP</div>
            <div className="text-4xl font-black text-orange-500 mb-1">{stats.bjp}</div>
            <div className="text-[10px] font-medium text-zinc-500">Leading / Won</div>
          </div>
          <div className="bg-[#18181b] rounded-xl p-4 border border-white/10 ring-1 ring-black/50 hover:bg-[#202024] cursor-pointer transition-colors shadow-lg">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">AITC / TMC</div>
            <div className="text-4xl font-black text-blue-500 mb-1">{stats.tmc}</div>
            <div className="text-[10px] font-medium text-zinc-500">Leading / Won</div>
          </div>
        </div>
      </div>

      {/* Seat Map */}
      <div className="mb-16">
        <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-4">
          <span className="whitespace-nowrap">SEAT MAP - 294 CONSTITUENCIES</span>
        </div>
        
        <div className="bg-zinc-900/20 p-6 rounded-[2.5rem] border border-white/5 shadow-inner">
          <div className="grid grid-cols-10 sm:grid-cols-21 gap-1.5">
            {constituencies.map((c) => (
              <motion.div 
                key={c.id}
                onMouseEnter={() => setHoveredSeat(c)}
                onMouseLeave={() => setHoveredSeat(null)}
                onClick={() => setSelectedSeat(c)}
                initial={false}
                animate={{ 
                  scale: c.leading_party !== c.last_leading_party ? [1, 1.4, 1] : 
                         hoveredSeat?.id === c.id ? 1.2 : 1,
                  boxShadow: hoveredSeat?.id === c.id ? "0 0 12px rgba(255,255,255,0.2)" : "none",
                  zIndex: hoveredSeat?.id === c.id ? 10 : 1
                }}
                className={`w-full aspect-square rounded-sm cursor-crosshair transition-colors duration-500 ${getTileColor(c)} border border-white/5`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* All Candidates Section */}
      <div className="mb-12">
        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
          <span className="whitespace-nowrap">Declared Results</span>
          <div className="h-[1px] flex-1 bg-zinc-900"></div>
          <span className="bg-zinc-900 px-2 py-1 rounded text-white tracking-widest leading-none">REAL-TIME</span>
        </div>
        <div className="space-y-3 bg-zinc-900/10 rounded-[2.5rem] p-4 border border-white/5 max-h-[600px] overflow-y-auto scrollbar-hide">
          {constituencies.map((c, i) => (
            <motion.div 
              key={c.id} 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              onClick={() => setSelectedSeat(c)}
              className="bg-zinc-900/40 p-5 rounded-[1.5rem] border border-white/5 flex items-center justify-between group hover:bg-zinc-800 transition-all cursor-pointer ring-1 ring-white/5 shadow-xl"
            >
              <div className="flex items-center gap-5">
                <div className="text-[10px] font-black font-mono text-zinc-700 bg-black w-8 h-8 rounded-lg flex items-center justify-center">{(i + 1).toString().padStart(3, '0')}</div>
                <div>
                  <div className="text-sm font-black text-white font-display tracking-tight group-hover:text-orange-500 transition-colors uppercase">{c.candidateName || "Candidate Name"}</div>
                  <div className="text-[9px] text-zinc-500 font-bold uppercase tracking-widest flex items-center gap-2 mt-1">
                    <span className={c.leading_party === 'BJP' ? 'text-orange-500' : 'text-blue-500'}>{c.leading_party}</span>
                    <span className="w-1 h-1 bg-zinc-800 rounded-full"></span>
                    <span>{c.name}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                  c.leading_party === 'BJP' ? 'bg-orange-500 text-white shadow-orange-500/20' : 
                  c.leading_party === 'TMC' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-pink-500 text-white shadow-pink-500/20'
                }`}>
                  {c.leading_party}
                </div>
                <div className="text-[9px] font-bold text-zinc-600 mt-2 flex items-center gap-1">
                  <span className="text-zinc-400 font-black">+{Math.abs(c.bjp_votes - c.tmc_votes).toLocaleString()}</span>
                  <span className="text-[8px] opacity-40 uppercase">MARGIN</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Visualizations Section */}
      <div className="mb-12">
        <div className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-6 flex items-center gap-4">
          <span className="whitespace-nowrap">Analysis</span>
          <div className="h-[1px] flex-1 bg-zinc-900"></div>
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/10 rounded-[2.5rem] p-6 border border-white/5 ring-1 ring-white/5 shadow-xl">
            <h3 className="text-white font-display text-sm font-black tracking-tight mb-6 uppercase text-center">Seat Distribution</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData.seatShare} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#71717a', fontWeight: 'bold' }} />
                  <RechartsTooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="seats" radius={[4, 4, 0, 0]} label={{ position: 'top', fill: '#fff', fontSize: 10, fontWeight: 'bold' }}>
                    {chartData.seatShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-zinc-900/10 rounded-[2.5rem] p-6 border border-white/5 ring-1 ring-white/5 shadow-xl">
            <h3 className="text-white font-display text-sm font-black tracking-tight mb-2 uppercase text-center">Vote Share</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.voteShare}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                    label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
                      const RADIAN = Math.PI / 180;
                      // Place the label slightly outside the outer radius for readability
                      const radius = outerRadius + 20; 
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="#71717a" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={10} fontWeight="bold">
                          {`${name} ${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}
                    labelLine={false}
                  >
                    {chartData.voteShare.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#18181b', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', fontSize: '12px' }}
                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                    formatter={(value: number) => value.toLocaleString()}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Social Footer */}
      <footer className="mt-24 pb-20 pt-16 border-t border-white/5 flex flex-col items-center gap-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black px-6 py-2 text-[8px] font-black text-zinc-600 tracking-[0.8em] uppercase border border-white/5 rounded-full whitespace-nowrap">
          Engineered By
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <a 
            href="https://x.com/Gudakesh_07" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-between bg-zinc-900/50 backdrop-blur-xl border border-white/5 p-5 rounded-[2rem] hover:bg-zinc-800 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 blur-2xl rounded-full -mr-8 -mt-8 group-hover:bg-white/10 transition-colors"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black text-2xl shadow-[0_10px_20px_rgba(255,255,255,0.1)] group-hover:scale-110 transition-transform">𝕏</div>
              <div className="text-left">
                <div className="text-xs font-black text-white font-display tracking-tight">Gudakesh</div>
                <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-0.5">X Profile</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-zinc-700 group-hover:text-white transition-colors relative z-10" />
          </a>
          
          <a 
            href="https://www.linkedin.com/in/ritu-raj-51b546318/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-between bg-blue-600/5 backdrop-blur-xl border border-blue-600/10 p-5 rounded-[2rem] hover:bg-blue-600/10 transition-all group overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-600/10 blur-2xl rounded-full -mr-8 -mt-8 group-hover:bg-blue-600/20 transition-colors"></div>
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.3)] group-hover:scale-110 transition-transform">
                <Linkedin className="w-6 h-6 text-white fill-current" />
              </div>
              <div className="text-left">
                <div className="text-xs font-black text-white font-display tracking-tight">Ritu Raj</div>
                <div className="text-[10px] text-blue-500 font-bold uppercase tracking-widest mt-0.5">LinkedIn</div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-blue-900 group-hover:text-white transition-colors relative z-10" />
          </a>
        </div>

        <div className="text-center opacity-40 group cursor-default">
          <div className="text-[10px] font-black uppercase tracking-[1em] mb-4 text-zinc-600 pl-[1em]">Live Data Sync</div>
          <div className="text-[9px] font-bold text-zinc-700 uppercase leading-relaxed tracking-[0.4em]">
            Data auto-refreshed every 30 seconds<br />
            Real-time counting feed active
          </div>
        </div>
      </footer>

      <HoverTooltip seat={hoveredSeat} pos={mousePos} />

      {/* Hidden YouTube Player */}
      <div className="absolute opacity-0 pointer-events-none w-0 h-0 overflow-hidden">
        <iframe
          ref={playerIframeRef}
          width="10"
          height="10"
          src="https://www.youtube.com/embed/CvRvvQebvPE?enablejsapi=1"
          frameBorder="0"
          allow="autoplay"
          title="Modi Song"
        ></iframe>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedSeat && (
          <DetailModal 
            seat={selectedSeat} 
            onClose={() => setSelectedSeat(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}

