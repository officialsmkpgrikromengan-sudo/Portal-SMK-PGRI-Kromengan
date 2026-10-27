import React from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  Award, 
  Users, 
  Building2, 
  Briefcase, 
  Calendar, 
  MapPin, 
  Clock, 
  ChevronRight,
  BookOpen,
  Code,
  Network,
  Palette,
  Wrench,
  Coins,
  CheckCircle2,
  Quote,
  Eye
} from 'lucide-react';
import { 
  SchoolInfo, 
  NewsItem, 
  EventItem, 
  AchievementItem, 
  GalleryItem, 
  NavigationPage,
  MajorItem
} from '../../types';
import { SectionHeading } from '../common/SectionHeading';
import { getActiveVocationalPrograms } from '../../utils/majorsSync';

interface HomeViewProps {
  schoolInfo: SchoolInfo;
  majorsList?: MajorItem[];
  newsList: NewsItem[];
  eventsList: EventItem[];
  achievementsList: AchievementItem[];
  galleryList: GalleryItem[];
  onNavigate: (page: NavigationPage) => void;
  onSelectNews: (news: NewsItem) => void;
  onSelectEvent: (event: EventItem) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  schoolInfo,
  majorsList,
  newsList,
  eventsList,
  achievementsList,
  galleryList,
  onNavigate,
  onSelectNews,
  onSelectEvent
}) => {
  const programs = majorsList && majorsList.length > 0
    ? getActiveVocationalPrograms(majorsList, schoolInfo.programs)
    : (schoolInfo.programs || []);
  const publishedNews = newsList.filter(n => n.status === 'published').slice(0, 3);
  const upcomingEvents = eventsList
    .filter(e => e.status === 'published')
    .slice(0, 3);
  const featuredAchievements = achievementsList.slice(0, 3);
  const recentGallery = galleryList.slice(0, 6);

  // Helper for program color badges
  const getProgramBadgeStyle = (code: string, idx: number) => {
    const styles = [
      { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
      { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
      { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
      { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
      { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
    ];
    return styles[idx % styles.length];
  };

  // Program icons mapper helper
  const getProgramIcon = (iconName: string) => {
    switch (iconName) {
      case 'Code': return <Code className="w-5 h-5" />;
      case 'Network': return <Network className="w-5 h-5" />;
      case 'Palette': return <Palette className="w-5 h-5" />;
      case 'Wrench': return <Wrench className="w-5 h-5" />;
      case 'Coins': return <Coins className="w-5 h-5" />;
      default: return <BookOpen className="w-5 h-5" />;
    }
  };

  return (
    <div id="home-view" className="space-y-16 sm:space-y-24 py-6 sm:py-10">
      {/* 1. TOP HERO & HIGHLIGHTS GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Main Hero Card (8 cols) */}
          <div className="lg:col-span-8 bg-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg border border-slate-800 flex flex-col justify-between min-h-[440px]">
            <div className="relative z-10 max-w-xl space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 border border-blue-800/60">
                <span>Akreditasi {schoolInfo.accreditation}</span>
                <span className="text-blue-500">•</span>
                <span>NPSN: {schoolInfo.npsn}</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black leading-tight tracking-tight text-white">
                Wujudkan Masa Depan Vokasi Unggul Bersama Kami
              </h1>

              <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-lg">
                {schoolInfo.tagline || 'Sekolah vokasi unggulan dengan kurikulum selaras industri, sertifikasi profesi BNSP, dan fasilitas teknologi terkini.'}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3.5">
                <button
                  id="btn-hero-contact"
                  onClick={() => onNavigate('contact')}
                  className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer"
                >
                  <span>Pendaftaran & Konsultasi</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  id="btn-hero-programs"
                  onClick={() => onNavigate('programs')}
                  className="bg-slate-800/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 px-5 py-3 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer"
                >
                  Program Keahlian
                </button>
              </div>
            </div>

            {/* Principal Quote Footer inside Hero */}
            <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center gap-3.5 text-xs text-slate-300">
              <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-800 shrink-0 border border-slate-700">
                <img
                  src={schoolInfo.headmasterPhoto}
                  alt={schoolInfo.headmasterName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="text-slate-300 italic truncate max-w-md">
                  "{schoolInfo.headmasterSpeech.slice(0, 110)}..."
                </p>
                <p className="font-semibold text-white text-[11px] mt-0.5">
                  {schoolInfo.headmasterName} — <span className="text-slate-400">{schoolInfo.headmasterTitle}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Right Side Utility Cards (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {/* Event Terdekat Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span>Agenda Terdekat</span>
                  </h3>
                  <button
                    onClick={() => onNavigate('events')}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                  >
                    Semua Event →
                  </button>
                </div>

                {upcomingEvents.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">Belum ada agenda terdekat.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.slice(0, 2).map((evt) => {
                      const dateParts = evt.date ? evt.date.split('-') : ['2026', '08', '24'];
                      const dayStr = dateParts[2] || '24';
                      const monthStr = dateParts[1] ? ['JAN','FEB','MAR','APR','MEI','JUN','JUL','AGU','SEP','OKT','NOV','DES'][parseInt(dateParts[1], 10) - 1] || 'MEI' : 'MEI';

                      return (
                        <div
                          key={evt.id}
                          onClick={() => onSelectEvent(evt)}
                          className="flex gap-3.5 items-center p-2.5 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer"
                        >
                          <div className="bg-blue-50/80 p-2.5 rounded-xl text-center min-w-[48px] shrink-0 border border-blue-100">
                            <span className="block text-blue-700 font-extrabold text-base leading-none">{dayStr}</span>
                            <span className="block text-[9px] font-bold text-blue-500 uppercase mt-0.5">{monthStr}</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">{evt.title}</h4>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{evt.time} • {evt.location}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 mt-2">
                <span className="text-[11px] text-slate-500 font-medium block truncate">
                  {eventsList.length} kegiatan aktif di kalender akademik
                </span>
              </div>
            </div>

            {/* Prestasi Siswa Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-slate-800 uppercase text-xs tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-600" />
                    <span>Prestasi Terkini</span>
                  </h3>
                  <button
                    onClick={() => onNavigate('achievements')}
                    className="text-blue-600 hover:text-blue-800 text-xs font-bold"
                  >
                    Prestasi →
                  </button>
                </div>

                <div className="space-y-2.5">
                  {featuredAchievements.slice(0, 2).map((ach, idx) => (
                    <div key={ach.id} className="bg-slate-50/80 rounded-2xl p-3 border border-slate-100 flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-xs ${
                        idx === 0 ? 'bg-amber-500' : 'bg-slate-400'
                      }`}>
                        {idx === 0 ? '🥇' : '🥈'}
                      </div>
                      <div className="text-xs min-w-0 flex-1">
                        <p className="font-bold text-slate-900 truncate">{ach.title}</p>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">{ach.studentName} ({ach.year})</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 mt-2">
                <span className="text-[11px] text-slate-500 font-medium block truncate">
                  {achievementsList.length} medali dan penghargaan tingkat nasional
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. STATS STRIP (Clean & Subtle) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <div className="space-y-1 pt-3 sm:pt-0">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {schoolInfo.stats.students}+
              </div>
              <div className="text-xs font-medium text-slate-500">
                Peserta Didik Aktif
              </div>
            </div>

            <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {schoolInfo.stats.teachers}
              </div>
              <div className="text-xs font-medium text-slate-500">
                Guru & Tenaga Pendidik
              </div>
            </div>

            <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {programs.length || schoolInfo.stats.majors}
              </div>
              <div className="text-xs font-medium text-slate-500">
                Program Keahlian
              </div>
            </div>

            <div className="space-y-1 pt-3 sm:pt-0 sm:pl-4">
              <div className="text-2xl sm:text-3xl font-black text-slate-900">
                {schoolInfo.stats.partnerships}+
              </div>
              <div className="text-xs font-medium text-slate-500">
                Mitra Industri & DUDI
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PROGRAM KEAHLIAN / JURUSAN GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Program Keahlian & Jurusan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Kurikulum terstruktur berbasis kompetensi industri dan sertifikasi profesi.
            </p>
          </div>
          <button
            onClick={() => onNavigate('programs')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Seluruh Kurikulum</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {programs.map((prog, idx) => {
            const badge = getProgramBadgeStyle(prog.code, idx);
            return (
              <div
                key={prog.id}
                onClick={() => onNavigate('programs')}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-2.5 py-1 ${badge.bg} ${badge.text} rounded-lg font-black text-xs`}>
                      {prog.code}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">3 Tahun</span>
                  </div>
                  <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-700 transition-colors leading-snug">
                    {prog.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {prog.shortDesc || 'Program Kejuruan Unggulan berstandar industri.'}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                  <span>Lihat Detail</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. SAMBUTAN KEPALA SEKOLAH */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-2xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100">
                <img
                  src={schoolInfo.headmasterPhoto}
                  alt={schoolInfo.headmasterName}
                  className="w-full h-full object-cover object-top"
                />
              </div>
              <h3 className="mt-4 text-base font-bold text-slate-900">
                {schoolInfo.headmasterName}
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {schoolInfo.headmasterTitle}
              </p>
            </div>

            <div className="lg:col-span-8 space-y-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 inline-block">
                Sambutan Kepala Sekolah
              </span>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                Membangun Generasi Vokasi Berkarakter dan Siap Kerja
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl whitespace-pre-line">
                {schoolInfo.headmasterSpeech}
              </p>
              <div className="pt-2">
                <button
                  onClick={() => onNavigate('profile')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Baca Visi, Misi & Struktur Organisasi Lengkap</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. BERITA TERBARU */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Kabar & Berita Terkini
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Informasi kegiatan sekolah, pengumuman resmi, dan dokumentasi aktivitas belajar.
            </p>
          </div>
          <button
            onClick={() => onNavigate('news')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Semua Berita</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {publishedNews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200/80">
            <p className="text-xs text-slate-500">Belum ada berita yang dipublikasikan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {publishedNews.map((news) => (
              <article
                key={news.id}
                id={`card-news-${news.id}`}
                onClick={() => onSelectNews(news)}
                className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={news.thumbnailUrl}
                    alt={news.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-md text-[10px] font-bold text-slate-800 shadow-xs">
                    {news.category}
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[11px] text-slate-400 font-medium block mb-1.5">
                      {news.publishedAt} • {news.author}
                    </span>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {news.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                      {news.excerpt || news.content}
                    </p>
                  </div>

                  <div className="text-xs font-bold text-blue-600 flex items-center justify-between pt-3 border-t border-slate-100">
                    <span>Baca Selengkapnya</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* 6. GALERI FOTO */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-2">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Galeri Kegiatan
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Dokumentasi aktivitas praktikum, upacara, dan kegiatan ekstrakurikuler.
            </p>
          </div>
          <button
            onClick={() => onNavigate('gallery')}
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
          >
            <span>Buka Galeri Penuh</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {recentGallery.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onNavigate('gallery')}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80 shadow-xs cursor-pointer"
            >
              <img
                src={photo.imageUrl}
                alt={photo.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-slate-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3 text-white">
                <span className="text-[9px] font-bold text-blue-300 uppercase">{photo.category}</span>
                <span className="text-[11px] font-bold line-clamp-1 mt-0.5">{photo.title}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 7. PPDB CTA BANNER (Calm Institutional Banner) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-md flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl space-y-2 text-center md:text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 bg-slate-800 px-3 py-1 rounded-full border border-slate-700 inline-block">
              Penerimaan Peserta Didik Baru
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Siap Bergabung dengan {schoolInfo.name}?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Konsultasikan peminatan kejuruan bersama tim bimbingan konseling dan panitia PPDB sekolah kami.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onNavigate('contact')}
              className="px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              Hubungi Panitia PPDB
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
