'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Heart, Bookmark, Share2, 
  Flame, Plus
} from 'lucide-react';
import { CommunityPost } from '@/types/mobile';
import { CommunityDetailModal, CreatePostModal } from './modals';
import { getCommunityPosts, togglePostLike, togglePostBookmark, unwrapArray } from '@/lib/cardwise-api';

const CATEGORIES = ['전체', 'CARD_HACKS', 'SAVING_TIPS', 'QNA', 'FREE'];
const CATEGORY_LABELS: Record<string, string> = {
  '전체': '🪐 전체',
  'CARD_HACKS': '💡 꿀팁',
  'SAVING_TIPS': '💰 절약',
  'QNA': '❓ 질문',
  'FREE': '💬 자유'
};

const getAuthorInfo = (accountId: string) => {
  const avatars = ['🦊', '🐻', '🐯', '🦁', '🐼', '🐹'];
  const names = ['카드고수', '절약왕', '혜택요정', '소비요정', '금융똑똑'];
  const badges = ['GOLD', 'SILVER', 'BRONZE'];
  
  const hash = accountId.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  
  return {
    name: names[hash % names.length] + ' ' + accountId.slice(0, 4),
    avatar: avatars[hash % avatars.length],
    badge: badges[hash % badges.length]
  };
};

export function CommunityView() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [page, setPage] = useState(1);
  const [hasMore, setMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setMore(true);
  }, [selectedCategory, refreshTrigger]);

  useEffect(() => {
    let active = true;
    
    const fetchPosts = async () => {
      if (page === 1) setLoading(true);
      else setIsFetchingMore(true);

      const category = selectedCategory === '전체' ? undefined : selectedCategory;
      try {
        const res = await getCommunityPosts(category, page, 10);
        const rawPosts = unwrapArray<CommunityPost>(res);

        if (!active) return;

        if (rawPosts && rawPosts.length > 0) {
          const mapped = rawPosts.map((p: CommunityPost) => ({
            ...p,
            author: getAuthorInfo(p.accountId)
          }));
          setPosts(prev => page === 1 ? mapped : [...prev, ...mapped]);
          if (rawPosts.length < 10) setMore(false);
        } else {
          if (page === 1) setPosts([]);
          setMore(false);
        }
      } catch (err) {
        console.error('Failed to load posts:', err);
        if (page === 1) setPosts([]);
      } finally {
        if (active) {
          setLoading(false);
          setIsFetchingMore(false);
        }
      }
    };

    fetchPosts();
    return () => { active = false; };
  }, [selectedCategory, refreshTrigger, page]);

  // Infinite Scroll Observer
  const observerRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!hasMore || loading || isFetchingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPage(prev => prev + 1);
        }
      },
      { threshold: 0.1 }
    );

    if (observerRef.current) observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loading, isFetchingMore]);

  const toggleLike = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const toggleBookmark = async (postId: number, e: React.MouseEvent) => {
    e.stopPropagation();
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

  const handlePostClick = (post: CommunityPost) => {
    setSelectedPost(post);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-slate-900 transition-colors" size={18} />
        <input 
          type="text" 
          placeholder="오늘의 금융 꿀팁을 찾아보세요" 
          className="w-full h-14 pl-14 pr-6 rounded-2xl bg-gray-50 border-none focus:ring-4 focus:ring-slate-900/5 text-[14px] font-black transition-all"
        />
      </div>

      {/* Premium Underline Tabs - Rock Solid & Stylish */}
      <div className="sticky top-0 z-[80] bg-white pt-2 -mx-6 px-6">
        <div className="flex gap-10 overflow-x-auto no-scrollbar border-b border-gray-100/50">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button 
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`relative pb-4 text-[15px] font-black transition-all whitespace-nowrap active:scale-95 ${
                  isActive ? 'text-slate-900' : 'text-gray-300 hover:text-gray-400'
                }`}
              >
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-slate-900 rounded-full" />
                )}
                {CATEGORY_LABELS[cat]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor's Pick */}
      <section className="relative p-8 rounded-[40px] bg-slate-900 text-white overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 rounded-full blur-[80px]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
             <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Editor&apos;s Pick</span>
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
        {loading && page === 1 ? (
          <div className="flex flex-col items-center py-20 opacity-40">
            <div className="w-10 h-10 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mb-4" />
            <p className="font-black text-xs uppercase tracking-widest text-rose-500">Loading Feed...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-400 font-bold">작성된 게시글이 없습니다. 🌸</p>
          </div>
        ) : (
          <>
            {posts.map((post) => (
              <div 
                key={post.postId} 
                onClick={() => handlePostClick(post)}
                className="p-7 rounded-[40px] bg-white border border-gray-50 shadow-lg active:scale-[0.98] transition-all group cursor-pointer"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center text-xl shadow-inner border border-gray-100 group-hover:scale-110 transition-transform">
                      {post.author?.avatar}
                    </div>
                    <div>
                       <p className="text-[14px] font-black text-slate-800">{post.author?.name}</p>
                       <div className="flex items-center gap-1.5">
                          <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">{post.author?.badge}</span>
                          <span className="text-[10px] font-bold text-gray-300">· {new Date(post.createdAt).toLocaleDateString()}</span>
                       </div>
                    </div>
                  </div>
                  <button 
                    className={`transition-colors ${post.isBookmarked ? 'text-rose-500' : 'text-gray-300'}`} 
                    onClick={(e) => toggleBookmark(post.postId, e)}
                  >
                    <Bookmark size={20} fill={post.isBookmarked ? "currentColor" : "none"} />
                  </button>
                </div>

                <h4 className="text-[18px] font-black text-slate-800 mb-2 tracking-tight line-clamp-1">{post.title}</h4>
                <p className="text-[14px] text-gray-500 leading-relaxed font-medium mb-6 line-clamp-2">{post.content}</p>

                <div className="flex items-center gap-6 mt-6 pt-6 border-t border-gray-50">
                    <button 
                      onClick={(e) => toggleLike(post.postId, e)}
                      className={`flex items-center gap-1.5 transition-colors ${post.isLiked ? 'text-rose-500' : 'text-gray-400'}`}
                    >
                      <Heart size={16} fill={post.isLiked ? "currentColor" : "none"} />
                      <span className="text-[12px] font-black">{post.likeCount}</span>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); handlePostClick(post); }}
                      className="flex items-center gap-1.5 text-gray-400 active:text-rose-500 transition-colors"
                    >
                      <MessageSquare size={16} />
                      <span className="text-[12px] font-black">{post.commentCount}</span>
                    </button>
                    <button className="ml-auto text-gray-300 active:text-slate-900 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <Share2 size={16} />
                    </button>
                </div>
              </div>
            ))}
            
            {/* Infinite Scroll Trigger */}
            <div ref={observerRef} className="h-10 flex items-center justify-center">
              {isFetchingMore && (
                <div className="w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
              )}
            </div>
          </>
        )}
      </section>

      {/* Floating Write Button */}
      <button 
        onClick={() => setIsWriteModalOpen(true)}
        className="fixed bottom-28 right-6 w-16 h-16 rounded-full bg-slate-900 text-white shadow-2xl shadow-slate-400 flex items-center justify-center active:scale-90 transition-all z-40 group overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
        <Plus size={32} strokeWidth={3} className="relative z-10" />
      </button>

      <CommunityDetailModal 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
        post={selectedPost} 
      />

      <CreatePostModal 
        isOpen={isWriteModalOpen} 
        onClose={() => { 
          setIsWriteModalOpen(false); 
          setRefreshTrigger(prev => prev + 1); 
        }} 
      />
    </div>
  );
}
