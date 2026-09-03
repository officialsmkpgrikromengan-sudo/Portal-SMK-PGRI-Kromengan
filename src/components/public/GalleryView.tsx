import React, { useState } from 'react';
import { 
  Camera, 
  Sparkles, 
  Calendar, 
  X, 
  ZoomIn, 
  Image as ImageIcon,
  Tag
} from 'lucide-react';
import { GalleryItem, GalleryCategory } from '../../types';

interface GalleryViewProps {
  galleryList: GalleryItem[];
}

export const GalleryView: React.FC<GalleryViewProps> = ({ galleryList }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [activePhoto, setActivePhoto] = useState<GalleryItem | null>(null);

  const categories: string[] = [
    'Semua',
    'Akademik',
    'Ekstrakurikuler',
    'Prestasi & Lomba',
    'Fasilitas',
    'Kegiatan Siswa',
    'Upacara & Event'
  ];

  const filtered = galleryList.filter(item => 
    selectedCategory === 'Semua' || item.category === selectedCategory
  );

  return (
    <div id="gallery-view" className="space-y-10 sm:space-y-12 py-6 sm:py-8 pb-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl text-center space-y-3">
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-200 bg-blue-800 px-3 py-1 rounded-full border border-blue-700">
            Dokumentasi Visual
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Galeri Kegiatan Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Merekam dinamika dan momen-momen berharga dalam proses pembelajaran, kreasi siswa, kebersamaan, dan prestasi sekolah.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Category Filters */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto bg-slate-100 p-2 rounded-2xl max-w-4xl mx-auto border border-slate-200">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-white text-emerald-700 shadow-md'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Gallery Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">Belum ada foto dalam kategori ini</h3>
            <p className="text-xs text-slate-500 mt-1">Pilih kategori lain untuk melihat dokumentasi kegiatan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.map((item) => (
              <div
                key={item.id}
                id={`gallery-item-${item.id}`}
                onClick={() => setActivePhoto(item)}
                className="group relative aspect-4/3 rounded-2xl overflow-hidden bg-slate-100 shadow-xs hover:shadow-xl border border-slate-200/80 cursor-pointer transition-all hover:scale-[1.02]"
              >
                <img
                  src={item.imageUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80';
                  }}
                />

                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-linear-to-t from-slate-950/90 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between text-white">
                  <div className="flex justify-end">
                    <span className="p-2 rounded-xl bg-white/20 backdrop-blur-md text-white">
                      <ZoomIn className="w-4 h-4" />
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500 text-white inline-block">
                      {item.category}
                    </span>
                    <h4 className="text-sm font-bold leading-snug line-clamp-2">
                      {item.title}
                    </h4>
                    {item.date && (
                      <p className="text-[11px] text-slate-300 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {item.date}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LIGHTBOX PHOTO MODAL */}
      {activePhoto && (
        <div
          id="gallery-lightbox-modal"
          onClick={() => setActivePhoto(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/85 backdrop-blur-sm animate-in fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col my-auto max-h-[90vh]"
          >
            {/* Top bar */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase px-2.5 py-1 rounded bg-emerald-600 text-white">
                  {activePhoto.category}
                </span>
                <span className="text-xs text-slate-400">
                  {activePhoto.date}
                </span>
              </div>
              <button
                onClick={() => setActivePhoto(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photo preview */}
            <div className="relative bg-black flex items-center justify-center overflow-hidden min-h-[300px] max-h-[60vh]">
              <img
                src={activePhoto.imageUrl}
                alt={activePhoto.title}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Caption */}
            <div className="p-6 bg-white space-y-2">
              <h3 className="text-lg font-bold text-slate-900">
                {activePhoto.title}
              </h3>
              {activePhoto.description && (
                <p className="text-sm text-slate-600 leading-relaxed">
                  {activePhoto.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
