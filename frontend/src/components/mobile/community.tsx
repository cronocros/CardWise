'use client';

import React, { useState, useEffect } from 'react';
import { 
  Search, MessageSquare, Heart, Bookmark, Share2, 
  Flame, Plus, ChevronDown, Eye
} from 'lucide-react';
import { CommunityPost } from '@/types/mobile';
import { CommunityDetailModal, CreatePostModal } from './modals';
import { getCommunityPosts, togglePostLike, togglePostBookmark, unwrapArray } from '@/lib/cardwise-api';

const CATEGORIES = ['홈', 'CARD_HACKS', 'SAVING_TIPS', 'QNA', 'FREE'];
const CATEGORY_LABELS: Record<string, string> = {
  '홈': '🪐 커뮤니티 홈',
  'CARD_HACKS': '💡 카드꿀팁',
  'SAVING_TIPS': '💰 절약비법',
  'QNA': '❓ 무엇이든 물어보세요',
  'FREE': '💬 자유게시판'
};

const getAvatar = (accountId?: string) => {
  if (!accountId) return '👤';
  const avatars = ['🦊', '🐻', '🐯', '🦁', '🐼', '🐹'];
  const hash = accountId.split('-').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return avatars[hash % avatars.length];
};

export function CommunityView() {
  const [selectedCategory, setSelectedCategory] = useState('홈');
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<CommunityPost | null>(null);
  const [isWriteModalOpen, setIsWriteModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [topPosts, setTopPosts] = useState<Record<string, CommunityPost>>({});
  const [trendingPosts, setTrendingPosts] = useState<CommunityPost[]>([]);

  const [page, setPage] = useState(1);
  const [hasMore, setMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  useEffect(() => {
    const fetchTopPosts = async () => {
      const targetCategories = ['CARD_HACKS', 'SAVING_TIPS', 'QNA', 'FREE'];
      const results: Record<string, CommunityPost> = {};
      
      await Promise.all(targetCategories.map(async (cat) => {
         try {
           const res = await getCommunityPosts(cat, 1, 1, 'viewCount');
           const unwrapped = unwrapArray<CommunityPost>(res);
           if (unwrapped.length > 0) {
             results[cat] = unwrapped[0];
           }
         } catch(e) {
           console.error(`Failed to fetch top post for ${cat}`, e);
         }
      }));
      setTopPosts(results);

      // Fetch overall trending posts (by commentCount)
      try {
        const trendRes = await getCommunityPosts(undefined, 1, 5, 'commentCount');
        setTrendingPosts(unwrapArray<CommunityPost>(trendRes));
      } catch(e) {
        console.error("Failed to fetch trending posts", e);
      }
    };

    if (selectedCategory === '홈') {
      fetchTopPosts();
    }
  }, [refreshTrigger, selectedCategory]);

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

      const category = selectedCategory === '홈' ? undefined : selectedCategory;
      try {
        const res = await getCommunityPosts(category, page, 10);
        const rawPosts = unwrapArray<CommunityPost>(res);

        if (!active) return;

        if (rawPosts && rawPosts.length > 0) {
          setPosts(prev => {
            if (page === 1) return rawPosts;
              const existingIds = new Set(prev.map(p => p.postId));
              const uniqueNew = rawPosts.filter((p: CommunityPost) => !existingIds.has(p.postId));
              return [...prev, ...uniqueNew];
            });
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

  const handleShare = async (post: CommunityPost, e: React.MouseEvent) => {
    e.stopPropagation();
    const shareData = {
      title: post.title,
      text: post.content.substring(0, 50) + '...',
      url: window.location.href + '?postId=' + post.postId,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      navigator.clipboard.writeText(shareData.url);
      alert('링크가 복사되었습니다!');
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-24">
      {/* Integrated Search & Category Box - Premium All-in-one */}
      <div className="relative z-[80] -mx-2 px-2">
        <div className="bg-white border border-gray-100 rounded-[32px] shadow-2xl shadow-slate-900/5 overflow-hidden transition-all duration-300">
           {/* Top: Category Selector */}
           <button 
             onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
             className="w-full h-14 flex items-center justify-between px-6 bg-white hover:bg-gray-50/50 active:bg-gray-100/50 transition-colors"
           >
             <div className="flex items-center gap-3">
               <span className="text-[17px] font-[900] text-slate-900 tracking-tight">{CATEGORY_LABELS[selectedCategory]}</span>
             </div>
             <ChevronDown className={`text-slate-400 transition-transform duration-500 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} size={20} />
           </button>

           {/* Divider - Subtle & Elegant */}
           <div className="h-px bg-slate-50 mx-6 opacity-60" />

           {/* Bottom: Search Input */}
           <div className="relative h-14 flex items-center px-6 group/search">
              <Search className="text-gray-300 group-focus-within/search:text-slate-900 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="오늘의 금융 꿀팁을 찾아보세요" 
                className="flex-1 h-full pl-3 bg-transparent border-none focus:ring-0 text-[14px] font-bold placeholder-gray-300 text-slate-800"
              />
           </div>
        </div>

        {isCategoryDropdownOpen && (
          <div className="absolute top-[calc(100%+8px)] left-2 right-2 p-2 bg-white/95 backdrop-blur-xl border border-gray-100 rounded-[28px] shadow-2xl animate-in zoom-in-95 fade-in duration-200 z-[90]">
            <div className="grid grid-cols-1 gap-1">
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button 
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCategoryDropdownOpen(false);
                    }}
                    className={`flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all active:scale-[0.97] ${
                      isActive 
                        ? 'bg-slate-900 text-white shadow-md' 
                        : 'hover:bg-gray-50 text-slate-600'
                    }`}
                  >
                    <span className="text-[14px] font-[900]">{CATEGORY_LABELS[cat]}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Editor's Pick - Only visible on Home */}
      {selectedCategory === '홈' && (
        <section className="relative p-8 rounded-[40px] bg-slate-900 text-white overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/20 rounded-full blur-[80px]" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
               <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Editor&apos;s Pick</span>
            </div>
            <h3 className="text-[20px] font-[900] mb-3 tracking-tighter">이번 달 신용카드 혜택 <br/>순위 대공개! 🏆</h3>
            <p className="text-[12px] font-bold text-gray-400 mb-6 drop-shadow-sm opacity-80">가장 인기가 많았던 카드 3종을 분석해봤어요.</p>
            <button className="px-5 py-2.5 rounded-xl bg-white text-slate-900 font-black text-[13px] active:scale-95 transition-all">보러가기</button>
          </div>
          <div className="absolute right-[-10px] bottom-[-10px] opacity-10 rotate-[15deg]">
             <Flame size={120} />
          </div>
        </section>
      )}

      {/* Top View Posts - Horizontal Scroll by Category */}
      {selectedCategory === '홈' && Object.keys(topPosts).length > 0 && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-700">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[18px] font-[900] text-slate-800 tracking-tight flex items-center gap-2">
              <Flame className="text-rose-500" size={20} fill="currentColor" />
              게시판별 최다 조회
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
            {Object.entries(topPosts).map(([cat, post]) => (
              <div 
                key={cat}
                onClick={() => handlePostClick(post)}
                className="flex-shrink-0 w-[260px] p-6 rounded-[32px] bg-white border border-gray-50 shadow-xl shadow-slate-900/5 active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-black text-rose-500 bg-rose-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                     {CATEGORY_LABELS[cat] ? CATEGORY_LABELS[cat].split(' ')[1] : cat}
                   </span>
                </div>
                <h4 className="text-[16px] font-[900] text-slate-900 line-clamp-2 mb-3 tracking-tighter leading-tight group-hover:text-rose-500 transition-colors">
                  {post.title}
                </h4>
                <div className="flex items-center gap-4 text-gray-300">
                   <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                     <Eye size={12} className="text-gray-400" />
                     <span className="text-[11px] font-black text-gray-400">{post.viewCount}</span>
                   </div>
                   <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                     <MessageSquare size={12} className="text-gray-400" />
                     <span className="text-[11px] font-black text-gray-400">{post.commentCount}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trending Posts - By Comment Count */}
      {selectedCategory === '홈' && trendingPosts.length > 0 && (
        <div className="space-y-5 animate-in slide-in-from-right-4 duration-1000">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-[18px] font-[900] text-slate-800 tracking-tight flex items-center gap-2">
              <MessageSquare className="text-indigo-500" size={20} fill="currentColor" />
              지금 가장 핫한 토크
            </h3>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar scroll-smooth">
            {trendingPosts.map((post) => (
              <div 
                key={post.postId}
                onClick={() => handlePostClick(post)}
                className="flex-shrink-0 w-[260px] p-6 rounded-[32px] bg-indigo-50/30 border border-indigo-100/50 shadow-xl shadow-indigo-900/5 active:scale-[0.98] transition-all group"
              >
                <div className="flex items-center gap-2 mb-4">
                   <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                     Trending 🔥
                   </span>
                </div>
                <h4 className="text-[16px] font-[900] text-slate-900 line-clamp-2 mb-3 tracking-tighter leading-tight group-hover:text-indigo-600 transition-colors">
                  {post.title}
                </h4>
                <div className="flex items-center gap-4 text-gray-300">
                   <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-indigo-100/30">
                     <MessageSquare size={12} className="text-indigo-400" />
                     <span className="text-[11px] font-black text-indigo-500">{post.commentCount}</span>
                   </div>
                   <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-md border border-indigo-100/30">
                     <Heart size={12} className="text-rose-400" />
                     <span className="text-[11px] font-black text-rose-500">{post.likeCount}</span>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                      {getAvatar(post.author?.accountId || post.accountId)}
                    </div>
                    <div>
                       <p className="text-[14px] font-black text-slate-800">{post.author?.displayName || '익명 사용자'}</p>
                       <div className="flex items-center gap-1.5 mt-0.5">
                          {post.author?.tierName && (
                            <span className="text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                              {post.author.tierName}
                            </span>
                          )}
                          <span className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                            Lv.{post.author?.level || 1}
                          </span>
                          <span className="text-[10px] font-bold text-gray-400">· {new Date(post.createdAt).toLocaleDateString()}</span>
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
                    <div className="flex items-center gap-1.5 text-gray-300">
                      <Eye size={16} />
                      <span className="text-[12px] font-black">{post.viewCount}</span>
                    </div>
                    <button 
                      className="ml-auto text-gray-300 hover:text-slate-900 active:scale-90 transition-all flex items-center gap-1.5 p-2" 
                      onClick={(e) => handleShare(post, e)}
                    >
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

      {/* Floating Write Button - Locked to Mobile App Container */}
      <div className="fixed bottom-28 left-0 right-0 max-w-[430px] mx-auto pointer-events-none z-[60]">
        <div className="relative w-full h-full">
          <button 
            onClick={() => setIsWriteModalOpen(true)}
            className="absolute right-6 bottom-0 pointer-events-auto w-[60px] h-[60px] rounded-[24px] bg-slate-900 text-white flex items-center justify-center active:scale-90 transition-all group overflow-hidden"
            style={{boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4), inset 0 2px 0 rgba(255,255,255,0.1)'}}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-rose-500/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
            <Plus size={30} strokeWidth={2.5} className="relative z-10" />
          </button>
        </div>
      </div>

      <CommunityDetailModal 
        isOpen={!!selectedPost} 
        onClose={() => setSelectedPost(null)} 
        post={selectedPost}
        onUpdate={(updated) => {
          setPosts(prev => prev.map(p => p.postId === updated.postId ? updated : p));
          setTrendingPosts(prev => prev.map(p => p.postId === updated.postId ? updated : p));
          setTopPosts(prev => {
            const next = { ...prev };
            Object.keys(next).forEach(cat => {
              if (next[cat].postId === updated.postId) next[cat] = updated;
            });
            return next;
          });
        }}
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
