import React, { useState } from 'react';
import { 
  Search, 
  Calendar, 
  User, 
  ArrowRight, 
  ArrowLeft, 
  Share2, 
  X, 
  Filter,
  Eye,
  Clock
} from 'lucide-react';
import { NewsItem } from '../../types';
import { useToast } from '../../context/ToastContext';

interface NewsViewProps {
  newsList: NewsItem[];
  selectedNews: NewsItem | null;
  onSelectNews: (news: NewsItem | null) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({
  newsList,
  selectedNews,
  onSelectNews
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const { success } = useToast();

  const publishedNews = newsList.filter(n => n.status === 'published');

  // Categories list
  const categories = ['Semua', ...Array.from(new Set(publishedNews.map(n => n.category || 'Umum')))];

  const filteredNews = publishedNews.filter(news => {
    const matchesSearch = news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      news.author.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'Semua' || news.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleShare = (news: NewsItem) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Tautan berita berhasil disalin ke papan klip!');
    }
  };

  return (
    <div id="news-view" className="space-y-10 sm:space-y-12 py-6 sm:py-8 pb-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl text-center space-y-3">
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-blue-200 bg-blue-800 px-3 py-1 rounded-full border border-blue-700">
            Warta & Pengumuman
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Berita Resmi Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Dapatkan informasi terpercaya mengenai kegiatan akademik, kejuaraan, inovasi kejuruan, dan agenda resmi sekolah.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Search & Category Filter Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-news-search"
              type="text"
              placeholder="Cari judul atau isi berita..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            <span className="text-xs font-semibold text-slate-400 shrink-0 hidden sm:inline">Kategori:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {filteredNews.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada berita yang sesuai</h3>
            <p className="text-xs text-slate-500 mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredNews.map((news) => (
              <article
                key={news.id}
                id={`news-card-${news.id}`}
                onClick={() => onSelectNews(news)}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-slate-200/80 transition-all hover:translate-y-[-4px] cursor-pointer flex flex-col group"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={news.thumbnailUrl}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-blue-700 shadow-xs">
                    {news.category}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mb-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {news.publishedAt}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5" />
                        {news.author}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {news.title}
                    </h3>

                    <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {news.excerpt || news.content}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-800">
                    <span>Baca Berita Lengkap</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL NEWS MODAL */}
      {selectedNews && (
        <div 
          id="news-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            {/* Modal Header bar */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <button
                id="btn-back-from-news"
                onClick={() => onSelectNews(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Berita</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-share-news"
                  onClick={() => handleShare(selectedNews)}
                  className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-white transition-colors"
                  title="Bagikan Tautan Berita"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  id="btn-close-news-modal"
                  onClick={() => onSelectNews(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Thumbnail Image */}
              <div className="rounded-2xl overflow-hidden shadow-md aspect-16/9 bg-slate-100">
                <img
                  src={selectedNews.thumbnailUrl}
                  alt={selectedNews.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                  {selectedNews.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Dipublikasikan: {selectedNews.publishedAt}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  Penulis: {selectedNews.author}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {selectedNews.title}
              </h1>

              {/* Content text */}
              <div className="text-sm sm:text-base text-slate-700 leading-relaxed space-y-4 whitespace-pre-line border-t border-slate-100 pt-6 font-normal">
                {selectedNews.content}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
