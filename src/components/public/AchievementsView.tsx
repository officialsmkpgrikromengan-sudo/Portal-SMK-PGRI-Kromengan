import React, { useState } from 'react';
import { 
  Award, 
  Trophy, 
  Medal, 
  Calendar, 
  User, 
  Sparkles,
  Search,
  Filter,
  Eye,
  X
} from 'lucide-react';
import { AchievementItem, AchievementLevel } from '../../types';

interface AchievementsViewProps {
  achievementsList: AchievementItem[];
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ achievementsList }) => {
  const [selectedLevel, setSelectedLevel] = useState<string>('Semua');
  const [selectedYear, setSelectedYear] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);

  const levels: string[] = ['Semua', 'Internasional', 'Nasional', 'Provinsi', 'Kota/Kabupaten', 'Kecamatan', 'Sekolah'];
  
  // Unique years
  const years = ['Semua', ...Array.from(new Set(achievementsList.map(a => a.year))).sort((a, b) => Number(b) - Number(a))];

  const filtered = achievementsList.filter(item => {
    const matchesLevel = selectedLevel === 'Semua' || item.level === selectedLevel;
    const matchesYear = selectedYear === 'Semua' || item.year === selectedYear;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rank.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.category && item.category.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesLevel && matchesYear && matchesSearch;
  });

  const getRankBadgeColor = (rank: string) => {
    const lower = rank.toLowerCase();
    if (lower.includes('1') || lower.includes('emas') || lower.includes('juara umum')) {
      return 'bg-amber-100 text-amber-900 border-amber-300';
    }
    if (lower.includes('2') || lower.includes('perak')) {
      return 'bg-slate-100 text-slate-800 border-slate-300';
    }
    if (lower.includes('3') || lower.includes('perunggu')) {
      return 'bg-orange-100 text-orange-900 border-orange-300';
    }
    return 'bg-blue-100 text-blue-900 border-blue-200';
  };

  return (
    <div id="achievements-view" className="space-y-10 sm:space-y-12 py-6 sm:py-8 pb-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl text-center space-y-3">
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-amber-200 bg-blue-800 px-3 py-1 rounded-full border border-blue-700">
            Prestasi & Penghargaan
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Prestasi Sekolah & Peserta Didik
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Bukti nyata dedikasi, kerja keras, dan keunggulan kompetensi siswa-siswi dan institusi kami di berbagai ajang kejuaraan.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Filter Controls */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="input-achievement-search"
                type="text"
                placeholder="Cari prestasi, nama siswa, atau lomba..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
              />
            </div>

            {/* Year Selector */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <span className="text-xs font-semibold text-slate-500 shrink-0">Tahun:</span>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
              >
                {years.map(yr => (
                  <option key={yr} value={yr}>{yr === 'Semua' ? 'Semua Tahun' : yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Level Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
            <span className="text-xs font-semibold text-slate-400 shrink-0">Tingkat Lomba:</span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  selectedLevel === lvl
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Achievements Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto mb-3">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Tidak ada data prestasi yang cocok</h3>
            <p className="text-xs text-slate-500 mt-1">Coba sesuaikan filter tingkat atau kata kunci pencarian.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                id={`achievement-card-${item.id}`}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Photo Documentation if available */}
                  {item.imageUrl && (
                    <div 
                      onClick={() => setActivePhoto(item.imageUrl)}
                      className="relative aspect-16/9 overflow-hidden bg-slate-100 cursor-pointer"
                    >
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <span className="bg-black/60 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs">
                          <Eye className="w-3.5 h-3.5" /> Lihat Foto
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="p-5 space-y-3">
                    {/* Badges */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-extrabold border ${getRankBadgeColor(item.rank)}`}>
                        {item.rank}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                        Tingkat {item.level}
                      </span>
                      <span className="px-2 py-1 rounded-lg text-xs font-medium text-slate-500">
                        Tahun {item.year}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-base font-bold text-slate-900 leading-snug group-hover:text-blue-600 transition-colors">
                      {item.title}
                    </h3>

                    {/* Student/Team */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <User className="w-4 h-4 text-blue-600 shrink-0" />
                      <span className="truncate">{item.studentName}</span>
                    </div>

                    {/* Description if any */}
                    {item.description && (
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-slate-100">
                  <span>Kategori: {item.category || 'Vokasi'}</span>
                  <Trophy className="w-4 h-4 text-amber-500" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox photo modal */}
      {activePhoto && (
        <div
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs cursor-pointer animate-in fade-in"
        >
          <div className="relative max-w-4xl max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl">
            <img src={activePhoto} alt="Dokumentasi Prestasi" className="w-full h-full object-contain" />
            <button
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 bg-slate-900/80 text-white rounded-full hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
