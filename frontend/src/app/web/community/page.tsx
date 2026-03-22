'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, MessageSquare, Heart, Bookmark, Share2, 
  Flame, Plus, ChevronRight
} from 'lucide-react';
import { CommunityPost } from '@/types/mobile';
import { getCommunityPosts, togglePostLike, togglePostBookmark, unwrapArray } from '@/lib/cardwise-api';

const CATEGORIES = ['전체', 'CARD_HACKS', 'SAVING_TIPS', 'QNA', 'FREE'];
const CATEGORY_LABELS: Record<string, string> = {
  '전체': '🪐 전체',
  'CARD_HACKS': '💡 꿀팁',
  'SAVING_TIPS': '💰 절약',
  'QNA': '❓ 질문',
  'FREE': '💬 자유'
};

const getAvatar = (accountId?: string) => {
  if (!accountId) return '👤';
  const avatars = ['🦊', '🐻', '🐯', '🦁', '🐼', '🐹'];
  const hash = accountId.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatars[hash % avatars.length];
};

export default function WebCommunityPage() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const category = selectedCategory === '전체' ? undefined : selectedCategory;
    const res = await getCommunityPosts(category);
    const rawPosts = unwrapArray<CommunityPost>(res);
    
    setPosts(rawPosts);
    setLoading(false);
  }, [selectedCategory]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const toggleLike = async (postId: number) => {
    const res = await togglePostLike(postId);
    if (res?.data) {
       setPosts(prev => prev.map(p => 
          p.postId === postId ? { 
            ...p, 
            isLiked: res.data.isActive, 
            likeCount: res.data.count 
          } : p
       ));
    }
  };

  const toggleBookmark = async (postId: number) => {
    const res = await togglePostBookmark(postId);
    if (res?.data) {
       setPosts(prev => prev.map(p => 
          p.postId === postId ? { 
            ...p, 
            isBookmarked: res.data.isActive 
          } : p
       ));
    }
  };

  const handleShare = async (post: CommunityPost) => {
    const shareData = {
      title: post.title,
      text: post.content.substring(0, 50) + '...',
      url: window.location.href + '?postId=' + post.postId,
    };
    if (navigator.share) {
      try { await navigator.share(shareData); } catch {}
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('링크가 복사되었습니다!');
    }
  };

  return (
    <div className="p-10 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tighter mb-2">커뮤니티</h1>
          <p className="text-slate-500 font-medium">카드 생활의 지혜를 나누는 공간입니다.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl shadow-slate-200 active:scale-95 transition-all">
          <Plus size={18} />
          글쓰기
        </button>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Left: Category & Search */}
        <div className="col-span-3 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="relative mb-6">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" 
                placeholder="검색어를 입력하세요"
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:bg-white focus:border-rose-200 transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl font-black text-sm transition-all ${
                    selectedCategory === cat 
                      ? 'bg-rose-50 text-rose-600' 
                      : 'text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  <span>{CATEGORY_LABELS[cat]}</span>
                  {selectedCategory === cat && <ChevronRight size={16} />}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-rose-500 to-rose-600 p-6 rounded-3xl text-white shadow-xl shadow-rose-200">
             <Flame size={24} className="mb-4" />
             <h3 className="font-black text-lg mb-2">이달의 베스트 팁</h3>
             <p className="text-rose-100 text-sm font-medium leading-relaxed opacity-90">
               삼성 iD 카드로 연회비 뽕 뽑는 방법이 궁금하신가요?
             </p>
          </div>
        </div>

        {/* Right: Posts */}
        <div className="col-span-9 space-y-6">
          {loading ? (
            <div className="bg-white rounded-[40px] p-20 flex flex-col items-center border border-slate-100 shadow-sm">
              <div className="w-12 h-12 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mb-4" />
              <p className="font-black text-rose-500 uppercase tracking-widest text-sm">Loading...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-[40px] p-20 text-center border border-slate-100 shadow-sm">
              <p className="text-slate-400 font-bold">작성된 게시글이 없습니다. 🌸</p>
            </div>
          ) : (
            posts.map(post => (
              <div 
                key={post.postId}
                className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all group"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner border border-slate-100">
                      {getAvatar(post.author?.accountId || post.accountId)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-black text-slate-800">{post.author?.displayName || '익명 계정'}</h4>
                        {post.author?.tierName && (
                          <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2 rounded uppercase">{post.author.tierName}</span>
                        )}
                        <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 rounded uppercase">Lv.{post.author?.level || 1}</span>
                      </div>
                      <p className="text-xs font-bold text-slate-400">{new Date(post.createdAt).toLocaleDateString()} · {post.category}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => toggleBookmark(post.postId)}
                    className={`transition-colors ${post.isBookmarked ? 'text-rose-500' : 'text-slate-200'}`}
                  >
                    <Bookmark size={24} fill={post.isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>

                <h2 className="text-xl font-black text-slate-800 mb-3 group-hover:text-rose-500 transition-colors">{post.title}</h2>
                <p className="text-slate-500 leading-relaxed font-medium mb-8 line-clamp-2">{post.content}</p>

                <div className="flex items-center gap-8 pt-8 border-t border-slate-50">
                  <button 
                    onClick={() => toggleLike(post.postId)}
                    className={`flex items-center gap-2 font-black text-sm transition-colors ${post.isLiked ? 'text-rose-500' : 'text-slate-400'}`}
                  >
                    <Heart size={20} fill={post.isLiked ? "currentColor" : "none"} />
                    {post.likeCount}
                  </button>
                  <button className="flex items-center gap-2 font-black text-sm text-slate-400 hover:text-slate-600 transition-colors">
                    <MessageSquare size={20} />
                    {post.commentCount}
                  </button>
                  <button 
                    className="ml-auto text-slate-300 hover:text-slate-800 transition-all active:scale-95"
                    onClick={() => handleShare(post)}
                  >
                    <Share2 size={20} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
