'use client';

import React, { useState } from 'react';
import { 
  Search, MessageSquare, Heart, Bookmark, Share2, 
  ChevronRight, Flame, Trophy, Award, Filter
} from 'lucide-react';
import { COMMUNITY_POSTS } from '@/lib/sampleData';
import { CommunityPost } from '@/types/mobile';
import { CommunityDetailModal } from './modals';

const CATEGORIES = ['전체', '꿀팁', '카드수다', '질문', '자랑하기', '나눔'];

export function CommunityView() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handlePostClick = (post: CommunityPost) => {
    setSelectedPost(post);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-rose-500 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="관심 키워드를 검색해보세요" 
          className="w-full h-14 pl-14 pr-6 rounded-2xl bg-gray-50 border-none focus:ring-2 focus:ring-rose-500/20 text-[14px] font-medium transition-all"
        />
      </div>

      {/* Categories Scroller */}
      <div className="flex gap-2.5 overflow-x-auto pb-2 no-scrollbar px-1">
        {CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2.5 rounded-xl whitespace-nowrap text-[13px] font-black transition-all ${
              selectedCategory === cat 
                ? 'bg-slate-900 text-white shadow-xl shadow-slate-200 scale-105' 
                : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'
            }`}
          >
            {cat === '전체' ? '🪐 전체' : cat}
          </button>
        ))}
      </div>

      {/* Editor's Pick */}
      <section className="relative p-8 rounded-[40px] bg-slate-900 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Editor's Pick</span>
          </div>
          <h3 className="text-[20px] font-black mb-3 tracking-tighter">이번 달 신용카드 혜택 <br/>순위 대공개! 🏆</h3>
          <p className="text-[12px] font-bold text-gray-400 mb-6 drop-shadow-sm opacity-80">가장 인기가 많았던 카드 3종을 분석해봤어요.</p>
          <button className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-black text-[13px] active:scale-95 transition-all">보러가기</button>
        </div>
        <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-[15deg]">
           <Flame size={120} />
        </div>
      </section>

      {/* Post Feed */}
      <section className="space-y-6">
        {COMMUNITY_POSTS.map((post, idx) => (
          <div 
            key={post.id} 
            onClick={() => handlePostClick(post)}
            className="p-7 rounded-[40px] bg-white border border-gray-50 shadow-lg active:scale-[0.98] transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl shadow-inner border border-gray-100 group-hover:scale-110 transition-transform">
                  {post.author.avatar}
                </div>
                <div>
                   <p className="text-[14px] font-black text-slate-800">{post.author.name}</p>
                   <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">{post.author.badge}</span>
                      <span className="text-[10px] font-bold text-gray-300">· {new Date(post.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
              </div>
              <button className="text-gray-300 active:text-rose-500 transition-colors" onClick={(e) => e.stopPropagation()}>
                <Bookmark size={20} />
              </button>
            </div>

            <h4 className="text-[18px] font-black text-slate-800 mb-2 tracking-tight line-clamp-1">{post.title}</h4>
            <p className="text-[14px] text-gray-500 leading-relaxed font-medium mb-6 line-clamp-2">{post.content}</p>

            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-50">
                <button 
                  onClick={(e) => toggleLike(post.id, e)}
                  className={`flex items-center gap-1.5 transition-colors ${likedPosts.includes(post.id) ? 'text-rose-500' : 'text-gray-400'}`}
                >
                  <Heart size={16} fill={likedPosts.includes(post.id) ? "currentColor" : "none"} />
                  <span className="text-[12px] font-black">{post.likes + (likedPosts.includes(post.id) ? 1 : 0)}</span>
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handlePostClick(post); }}
                  className="flex items-center gap-1.5 text-gray-400 active:text-rose-500 transition-colors"
                >
                  <MessageSquare size={16} />
                  <span className="text-[12px] font-black">{post.comments}</span>
                </button>
                <button className="ml-auto text-gray-300 active:text-slate-900 transition-colors" onClick={(e) => e.stopPropagation()}>
                  <Share2 size={16} />
                </button>
            </div>
          </div>
        ))}
      </section>

      <CommunityDetailModal 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
        post={selectedPost} 
      />
    </div>
  );
}
