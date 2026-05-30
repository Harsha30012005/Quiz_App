'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Award, Flame, Zap, Calendar, User as UserIcon, X, Check, Save, Edit, BookOpen, AlertCircle, RefreshCw, Upload, Image } from 'lucide-react';
import { updateProfile } from '@/app/actions/profile';

interface Badge {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
}

interface Attempt {
  id: string;
  score: number;
  completedAt: Date;
  quiz: {
    title: string;
    difficulty: string;
  };
}

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
}

interface ProfileClientProps {
  user: User;
  allBadges: Badge[];
  unlockedBadgeIds: Set<string>;
  attempts: Attempt[];
  isAdminMode?: boolean;
}

export default function ProfileClient({
  user,
  allBadges = [],
  unlockedBadgeIds = new Set(),
  attempts = [],
  isAdminMode = false,
}: ProfileClientProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit Modal toggles
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [editName, setEditName] = useState(user.name || '');
  const [editBio, setEditBio] = useState(user.bio || '');
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl || '');

  // Loading States
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit: 1.5MB max to prevent database bloat
    if (file.size > 1.5 * 1024 * 1024) {
      alert('The selected image is too large. Please upload a photo smaller than 1.5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setError('Name field cannot be left blank.');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await updateProfile({
        name: editName.trim(),
        bio: editBio.trim(),
        avatarUrl: editAvatar, // sending base64 photo
      });

      if (res.success) {
        setIsEditing(false);
        router.refresh();
      } else {
        setError(res.error || 'Failed to update profile.');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred.');
    } finally {
      setSaving(false);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Helper to get initials
  const getInitials = (nameStr: string | null) => {
    if (!nameStr) return 'U';
    return nameStr.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-8 relative">
      
      {/* 1. Header Profile Banner */}
      <div className="card-3d bg-white p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6">
        <div className="relative group">
          <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-duo-blue bg-blue-50 flex items-center justify-center font-bold text-duo-blue-dark text-3xl shadow-md">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              <span className="select-none">{getInitials(user.name)}</span>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className="absolute bottom-0 right-0 p-1.5 rounded-full bg-duo-blue border-2 border-white text-white hover:bg-duo-blue-dark transition-all cursor-pointer shadow"
          >
            <Edit className="h-4 w-4" />
          </button>
        </div>
        
        <div className="space-y-2 flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 justify-center sm:justify-start">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">{user.name || 'Developer'}</h2>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wide border bg-gray-50 text-gray-500 border-gray-200">
                  {user.role}
                </span>
              </div>
              <p className="text-sm text-gray-400 font-semibold">{user.email}</p>
            </div>
            
            <button
              onClick={() => setIsEditing(true)}
              className="btn-3d-white px-4 py-2 text-xs flex items-center gap-1.5 self-center sm:self-start"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          {/* User Bio */}
          {user.bio ? (
            <p className="text-sm font-semibold text-gray-500 pt-1 leading-relaxed max-w-2xl">
              {user.bio}
            </p>
          ) : (
            <p className="text-sm font-bold text-gray-300 italic pt-1">
              No bio written yet. Click edit profile to add one!
            </p>
          )}
          
          {/* Quick stats widget for standard users */}
          {!isAdminMode && (
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-3 text-sm font-black">
              <div className="flex items-center gap-1 text-duo-orange">
                <Flame className="h-5 w-5 fill-current" />
                <span>{user.currentStreak} Day Streak</span>
              </div>
              <div className="flex items-center gap-1 text-duo-blue">
                <Zap className="h-5 w-5 fill-current" />
                <span>{user.totalXp} Total XP</span>
              </div>
              <div className="flex items-center gap-1 text-duo-green">
                <Award className="h-5 w-5" />
                <span>Level {user.level}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Main Content Grid - ONLY visible in User Mode */}
      {!isAdminMode && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Badges showcase */}
          <div className="lg:col-span-2 space-y-6">
            <div className="card-3d bg-white p-6">
              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Award className="h-5.5 w-5.5 text-duo-orange" />
                Earned Badges ({unlockedBadgeIds.size} of {allBadges.length})
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {allBadges.map((badge) => {
                  const isUnlocked = unlockedBadgeIds.has(badge.id);
                  return (
                    <div 
                      key={badge.id}
                      className={`flex items-center gap-4 p-3 rounded-xl border-2 transition-all ${
                        isUnlocked 
                          ? 'bg-yellow-50/20 border-yellow-100' 
                          : 'bg-gray-50 border-gray-200 opacity-60'
                      }`}
                    >
                      <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 shrink-0 ${
                        isUnlocked
                          ? 'bg-yellow-100 border-yellow-300 text-yellow-600 text-2xl shadow-sm'
                          : 'bg-gray-200 border-gray-300 text-gray-400 text-xl'
                      }`}>
                        {isUnlocked ? '🏆' : '🔒'}
                      </div>
                      <div>
                        <h4 className={`text-sm font-black ${isUnlocked ? 'text-gray-800' : 'text-gray-400'}`}>
                          {badge.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-semibold leading-normal mt-0.5">
                          {badge.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Quiz Logs */}
          <div className="space-y-6">
            <div className="card-3d bg-white p-6">
              <h3 className="text-xl font-black text-gray-800 mb-6 flex items-center gap-2 border-b border-gray-100 pb-3">
                <Calendar className="h-5.5 w-5.5 text-duo-blue" />
                Recent Quizzes
              </h3>

              <div className="flow-root">
                <ul className="-my-5 divide-y divide-gray-100">
                  {attempts.length === 0 ? (
                    <p className="py-6 text-center text-gray-400 font-semibold text-xs leading-relaxed">
                      No quiz completions yet.<br />
                      <Link href="/path" className="text-duo-blue underline font-extrabold mt-1 inline-block">
                        Practice now
                      </Link>
                    </p>
                  ) : (
                    attempts.map((attempt) => (
                      <li key={attempt.id} className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-black text-gray-800">
                              {attempt.quiz.title}
                            </p>
                            <p className="truncate text-[10px] text-gray-400 font-bold uppercase mt-0.5">
                              {attempt.quiz.difficulty} • passed: {attempt.score >= 80 ? 'Yes' : 'No'}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-flex items-center text-xs font-black px-2 py-0.5 rounded-lg ${
                              attempt.score >= 80 
                                ? 'bg-green-50 text-duo-green-dark border border-green-200' 
                                : 'bg-red-50 text-duo-red-dark border border-red-200'
                            }`}>
                              {attempt.score}%
                            </span>
                          </div>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* 3. Sliding Edit Profile Modal Drawer Overlay */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Dark background overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsEditing(false)}
              className="absolute inset-0 bg-black pointer-events-auto"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.9, y: 50, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 50, opacity: 0 }}
              className="relative w-full max-w-md bg-white card-3d p-6 sm:p-8 space-y-6 z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              
              {/* Close Button */}
              <button
                onClick={() => setIsEditing(false)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-b border-gray-100 pb-3">
                <h3 className="text-xl font-black text-gray-800">Edit Profile</h3>
                <p className="text-xs text-gray-400 font-semibold">Change your display name, bio, and upload a profile photo.</p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border-2 border-red-100 bg-red-50 p-3 text-sm font-bold text-red-500">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSave} className="space-y-6">
                         {/* 1. Photo File Upload Trigger & Predefined Avatars */}
                <div className="space-y-4 flex flex-col items-center">
                  <div className="relative">
                    <div className="h-24 w-24 overflow-hidden rounded-full border-4 border-duo-blue bg-blue-50 flex items-center justify-center font-bold text-duo-blue-dark text-3xl shadow-md">
                      {editAvatar ? (
                        <img src={editAvatar} alt="avatar preview" className="h-full w-full object-cover" />
                      ) : (
                        <span className="select-none">{getInitials(editName)}</span>
                      )}
                    </div>
                    {editAvatar && (
                      <button
                        type="button"
                        onClick={() => setEditAvatar('')}
                        className="absolute -top-1 -right-1 p-1 rounded-full bg-red-500 border-2 border-white text-white hover:bg-red-600 transition-all cursor-pointer"
                        title="Remove Photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                  />
                  
                  <button
                    type="button"
                    onClick={triggerFileSelect}
                    className="btn-3d-white px-4 py-2 text-xs flex items-center gap-1.5"
                  >
                    <Upload className="h-4 w-4" />
                    Upload Photo from Computer
                  </button>
                  <p className="text-[10px] text-gray-400 font-semibold">Supported formats: PNG, JPG, GIF (Max 1.5MB)</p>

                  <div className="w-full pt-2 border-t border-gray-100">
                    <label className="block text-xs font-black text-gray-400 uppercase mb-2 text-center">
                      Or Choose a Gamified Character
                    </label>
                    <div className="grid grid-cols-4 gap-2.5 max-w-[240px] mx-auto">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => {
                        const path = `/avatars/avatar-${num}.png`;
                        const isSelected = editAvatar === path;
                        return (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setEditAvatar(path)}
                            className={`relative h-11 w-11 rounded-full overflow-hidden border-2 transition-all hover:scale-105 ${
                              isSelected 
                                ? 'border-duo-blue scale-105 shadow-md ring-2 ring-duo-blue/30' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <img src={path} alt={`Avatar character ${num}`} className="h-full w-full object-cover" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* 2. Name input */}
                <div>
                  <label htmlFor="name" className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Display Name</label>
                  <input
                    id="name"
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    placeholder="Enter your display name"
                    className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
                  />
                </div>

                {/* 3. Bio text-area */}
                <div>
                  <label htmlFor="bio" className="block text-xs font-extrabold text-gray-400 uppercase mb-2">Bio / Status</label>
                  <textarea
                    id="bio"
                    value={editBio}
                    onChange={e => setEditBio(e.target.value)}
                    placeholder="Write a short summary about yourself..."
                    rows={3}
                    maxLength={160}
                    className="block w-full py-2.5 px-3 border-2 border-gray-200 rounded-xl font-bold text-gray-800 focus:outline-none focus:border-duo-blue bg-gray-50 focus:bg-white text-sm transition-all"
                  />
                  <div className="mt-1 text-right text-[10px] text-gray-400 font-semibold">
                    {editBio.length} / 160 characters
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3 border-t border-gray-100 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 btn-3d-white py-3 text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn-3d-green py-3 text-sm flex items-center justify-center gap-1.5"
                  >
                    {saving ? (
                      <RefreshCw className="h-4.5 w-4.5 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4.5 w-4.5" />
                        Save Changes
                      </>
                    )}
                  </button>
                </div>

              </form>

            </motion.div>

          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
