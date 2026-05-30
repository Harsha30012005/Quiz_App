'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Star, Check, Play, Zap, X, ShieldAlert } from 'lucide-react';

interface PathNode {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  xpReward: number;
  sequenceOrder: number;
  questionsCount: number;
  isCompleted: boolean;
  isUnlocked: boolean;
}

interface PathClientProps {
  nodes: PathNode[];
}

export default function PathClient({ nodes }: PathClientProps) {
  const [activeNode, setActiveNode] = useState<PathNode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Sine-wave horizontal offset translation list (repeats every 8 steps)
  const getOffsetClass = (order: number) => {
    const pattern = [0, -32, -64, -32, 0, 32, 64, 32];
    const offset = pattern[(order - 1) % pattern.length];
    
    if (offset === -32) return 'translate-x-[-32px] sm:translate-x-[-48px]';
    if (offset === -64) return 'translate-x-[-64px] sm:translate-x-[-96px]';
    if (offset === 32) return 'translate-x-[32px] sm:translate-x-[48px]';
    if (offset === 64) return 'translate-x-[64px] sm:translate-x-[96px]';
    return 'translate-x-0';
  };

  const handleNodeClick = (node: PathNode) => {
    if (!node.isUnlocked) return;
    setActiveNode(prev => (prev?.id === node.id ? null : node));
  };

  return (
    <div ref={containerRef} className="relative flex flex-col items-center select-none pb-32">
      
      {/* Visual Rods/Tracks connecting the nodes */}
      <div className="absolute top-8 bottom-32 w-2.5 bg-gray-200 rounded-full z-0 pointer-events-none" />

      {nodes.length === 0 ? (
        <div className="card-3d bg-white p-8 text-center text-gray-500 font-bold max-w-sm w-full mt-8">
          <ShieldAlert className="mx-auto h-12 w-12 text-duo-orange mb-3" />
          <h3 className="text-lg font-black text-gray-800">No quizzes available</h3>
          <p className="text-sm text-gray-400 mt-1">Ask your administrator to publish some quizzes to get started!</p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center gap-16 relative z-10">
          {nodes.map((node, index) => {
            const isSelected = activeNode?.id === node.id;
            const offsetClass = getOffsetClass(node.sequenceOrder);
            
            return (
              <div 
                key={node.id} 
                className={`relative flex flex-col items-center transition-all ${offsetClass}`}
              >
                {/* Node Button */}
                <motion.button
                  whileHover={node.isUnlocked ? { scale: 1.08 } : {}}
                  whileTap={node.isUnlocked ? { scale: 0.95 } : {}}
                  onClick={() => handleNodeClick(node)}
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center border-4 cursor-pointer focus:outline-none transition-all ${
                    node.isCompleted
                      ? 'bg-yellow-400 border-yellow-500 text-white shadow-lg shadow-yellow-400/20'
                      : node.isUnlocked
                      ? 'bg-duo-green border-duo-green-dark text-white shadow-lg shadow-duo-green/20 animate-pulse'
                      : 'bg-gray-200 border-gray-300 text-gray-400 cursor-not-allowed'
                  }`}
                  style={{
                    borderBottomWidth: node.isUnlocked ? '8px' : '4px',
                  }}
                >
                  {node.isCompleted ? (
                    <Check className="h-10 w-10 stroke-[3.5px]" />
                  ) : node.isUnlocked ? (
                    <Star className="h-9 w-9 fill-current animate-spin-slow" />
                  ) : (
                    <Lock className="h-7 w-7" />
                  )}
                  
                  {/* Floating Number Tag */}
                  <span className="absolute -top-1 -right-1 bg-white text-gray-500 text-[10px] font-black w-6 h-6 rounded-full border-2 border-gray-200 flex items-center justify-center">
                    {node.sequenceOrder}
                  </span>
                </motion.button>

                {/* Alternating floating label next to node */}
                <span className="absolute top-1/2 -translate-y-1/2 left-24 whitespace-nowrap hidden sm:inline-block bg-white px-3 py-1 rounded-xl border-2 border-gray-200 font-extrabold text-xs text-gray-700 max-w-[150px] truncate shadow-sm">
                  {node.title}
                </span>

                {/* Selected Node Details Floating Tooltip Popover */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.8, y: -10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute top-24 left-1/2 -translate-x-1/2 w-72 bg-white card-3d p-5 z-30 shadow-2xl text-center"
                    >
                      {/* Close popover */}
                      <button 
                        onClick={() => setActiveNode(null)} 
                        className="absolute top-3.5 right-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>

                      {/* Info header */}
                      <span className="text-[10px] font-black text-duo-blue uppercase tracking-widest bg-blue-50 border border-blue-100 px-2.5 py-0.5 rounded-full inline-block mb-2">
                        {node.category}
                      </span>
                      
                      <h4 className="text-base font-black text-gray-800 line-clamp-1">{node.title}</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-1 mb-4 line-clamp-2 leading-relaxed">
                        {node.description}
                      </p>

                      <div className="flex items-center justify-around border-t border-gray-100 pt-3 mb-4 text-xs font-bold text-gray-400">
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-300">Questions</span>
                          <span className="text-gray-600 font-black">{node.questionsCount}</span>
                        </div>
                        <div className="h-6 w-px bg-gray-100" />
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-300">Difficulty</span>
                          <span className={`font-black ${
                            node.difficulty === 'EASY' ? 'text-duo-green-dark' : node.difficulty === 'MEDIUM' ? 'text-duo-blue-dark' : 'text-duo-red-dark'
                          }`}>{node.difficulty}</span>
                        </div>
                        <div className="h-6 w-px bg-gray-100" />
                        <div>
                          <span className="block text-[10px] uppercase font-bold text-gray-300">Reward</span>
                          <span className="text-duo-blue font-black flex items-center gap-0.5">
                            <Zap className="h-3.5 w-3.5 fill-current" /> +{node.xpReward}
                          </span>
                        </div>
                      </div>

                      {/* Start Quiz Action */}
                      <Link 
                        href={`/quiz/${node.id}`} 
                        className="w-full btn-3d-green py-2.5 text-sm flex items-center justify-center gap-1.5"
                      >
                        <Play className="h-4 w-4 fill-current" />
                        {node.isCompleted ? 'Review Quiz' : 'Start +XP'}
                      </Link>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
