'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, Flame, Award } from 'lucide-react';

interface LeaderboardUser {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  level: number;
  xp: number;
  rank: number;
}

interface LeaderboardClientProps {
  leaderboardData: {
    weekly: LeaderboardUser[];
    monthly: LeaderboardUser[];
    overall: LeaderboardUser[];
  };
  currentUserId: string;
}

type TabType = 'weekly' | 'monthly' | 'overall';

export default function LeaderboardClient({ leaderboardData, currentUserId }: LeaderboardClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('weekly');

  const list = leaderboardData[activeTab] || [];
  
  // Extract podium and list entries
  const firstPlace = list.find(u => u.rank === 1);
  const secondPlace = list.find(u => u.rank === 2);
  const thirdPlace = list.find(u => u.rank === 3);
  
  const remainingUsers = list.filter(u => u.rank > 3);

  // Tabs layout configuration
  const tabs: { id: TabType; name: string }[] = [
    { id: 'weekly', name: 'Weekly XP' },
    { id: 'monthly', name: 'Monthly XP' },
    { id: 'overall', name: 'Hall of Fame' },
  ];

  return (
    <div className="space-y-8 select-none">
      
      {/* 1. Styled Tab Toggle Switch */}
      <div className="flex bg-gray-100 rounded-2xl border-2 border-gray-200 p-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-3 text-sm font-extrabold rounded-xl transition-all cursor-pointer ${
                isActive 
                  ? 'bg-white text-duo-blue shadow-sm border border-gray-200/50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* 2. Visual Podium Block */}
      <div className="pt-6 pb-2 border-b-2 border-gray-200">
        <div className="flex justify-center items-end gap-3 sm:gap-6 min-h-[220px]">
          
          {/* 2nd Place */}
          {secondPlace && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              key={`pod-2-${activeTab}`}
              className="flex flex-col items-center flex-1 max-w-[110px]"
            >
              <div className="relative">
                <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-gray-300 bg-gray-50 flex items-center justify-center font-bold text-gray-600">
                  {secondPlace.avatarUrl ? (
                    <img src={secondPlace.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    secondPlace.name ? secondPlace.name[0].toUpperCase() : 'U'
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-gray-300 text-gray-700 text-[10px] font-black w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="mt-3 text-center">
                <h4 className="text-xs font-black text-gray-700 truncate max-w-[90px]">{secondPlace.name}</h4>
                <span className="text-[10px] font-extrabold text-duo-blue flex items-center justify-center gap-0.5 mt-0.5">
                  <Zap className="h-3 w-3 fill-current" /> {secondPlace.xp} XP
                </span>
              </div>
              <div className="w-full bg-gray-200/80 border-t-2 border-gray-300 h-20 rounded-t-xl mt-3 flex items-center justify-center">
                <span className="text-2xl font-black text-gray-400">🥈</span>
              </div>
            </motion.div>
          )}

          {/* 1st Place */}
          {firstPlace && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              key={`pod-1-${activeTab}`}
              className="flex flex-col items-center flex-1 max-w-[130px]"
            >
              {/* Crown Icon */}
              <Crown className="h-7 w-7 text-yellow-400 fill-current animate-bounce mb-1" />
              
              <div className="relative">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-yellow-400 bg-yellow-50 flex items-center justify-center font-bold text-gray-600 shadow-md">
                  {firstPlace.avatarUrl ? (
                    <img src={firstPlace.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    firstPlace.name ? firstPlace.name[0].toUpperCase() : 'U'
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-yellow-400 text-white text-[10px] font-black w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  1
                </span>
              </div>
              <div className="mt-3 text-center">
                <h4 className="text-sm font-black text-gray-800 truncate max-w-[110px]">{firstPlace.name}</h4>
                <span className="text-xs font-black text-duo-blue flex items-center justify-center gap-0.5 mt-0.5">
                  <Zap className="h-3.5 w-3.5 fill-current" /> {firstPlace.xp} XP
                </span>
              </div>
              <div className="w-full bg-yellow-100 border-t-2 border-yellow-200 h-28 rounded-t-xl mt-3 flex items-center justify-center">
                <span className="text-3xl font-black">👑</span>
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {thirdPlace && (
            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              key={`pod-3-${activeTab}`}
              className="flex flex-col items-center flex-1 max-w-[110px]"
            >
              <div className="relative">
                <div className="h-16 w-16 overflow-hidden rounded-full border-4 border-orange-400 bg-gray-50 flex items-center justify-center font-bold text-gray-600">
                  {thirdPlace.avatarUrl ? (
                    <img src={thirdPlace.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  ) : (
                    thirdPlace.name ? thirdPlace.name[0].toUpperCase() : 'U'
                  )}
                </div>
                <span className="absolute -bottom-1 -right-1 bg-orange-400 text-white text-[10px] font-black w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="mt-3 text-center">
                <h4 className="text-xs font-black text-gray-700 truncate max-w-[90px]">{thirdPlace.name}</h4>
                <span className="text-[10px] font-extrabold text-duo-blue flex items-center justify-center gap-0.5 mt-0.5">
                  <Zap className="h-3 w-3 fill-current" /> {thirdPlace.xp} XP
                </span>
              </div>
              <div className="w-full bg-orange-100/70 border-t-2 border-orange-200 h-16 rounded-t-xl mt-3 flex items-center justify-center">
                <span className="text-2xl font-black">🥉</span>
              </div>
            </motion.div>
          )}

        </div>
      </div>

      {/* 3. Rest of the list */}
      <div className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            key={activeTab}
            className="space-y-3"
          >
            {remainingUsers.length === 0 ? (
              <div className="text-center py-6 text-gray-400 font-semibold text-sm">
                Compete to fill the board!
              </div>
            ) : (
              remainingUsers.map((u) => {
                const isCurrentUser = u.id === currentUserId;
                return (
                  <div
                    key={u.id}
                    className={`card-3d bg-white px-5 py-3.5 flex items-center justify-between border-2 transition-all ${
                      isCurrentUser 
                        ? 'border-duo-blue bg-blue-50/10 shadow-sm' 
                        : 'border-gray-200'
                    }`}
                    style={{
                      borderBottomWidth: '4px',
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank tag */}
                      <span className="text-sm font-black text-gray-400 w-6 text-center">
                        {u.rank}
                      </span>
                      
                      {/* Avatar */}
                      <div className="h-10 w-10 overflow-hidden rounded-full border border-gray-200 bg-gray-50 flex items-center justify-center font-bold text-gray-500">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                        ) : (
                          u.name ? u.name[0].toUpperCase() : 'U'
                        )}
                      </div>

                      {/* Name and Level */}
                      <div>
                        <div className="font-black text-gray-800 text-sm flex items-center gap-1.5">
                          {u.name}
                          {isCurrentUser && (
                            <span className="bg-duo-blue text-white text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-gray-400 font-extrabold uppercase">
                          Level {u.level}
                        </div>
                      </div>
                    </div>

                    {/* XP Score */}
                    <div className="text-right font-black text-duo-blue text-sm flex items-center gap-1">
                      <Zap className="h-4 w-4 fill-current text-duo-blue" />
                      <span>{u.xp} XP</span>
                    </div>

                  </div>
                );
              })
            )}
          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  );
}
