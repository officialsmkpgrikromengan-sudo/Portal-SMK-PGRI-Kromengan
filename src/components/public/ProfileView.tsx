import React, { useState } from 'react';
import { 
  History, 
  Target, 
  Compass, 
  Users2, 
  Building2, 
  CheckCircle2, 
  Sparkles,
  ShieldCheck,
  Award
} from 'lucide-react';
import { SchoolInfo } from '../../types';
import { SectionHeading } from '../common/SectionHeading';

interface ProfileViewProps {
  schoolInfo: SchoolInfo;
}

export const ProfileView: React.FC<ProfileViewProps> = ({ schoolInfo }) => {
  const [activeTab, setActiveTab] = useState<'sejarah' | 'visimisi' | 'organisasi' | 'fasilitas'>('sejarah');

  return (
    <div id="profile-view" className="space-y-10 sm:space-y-12 py-6 sm:py-8 pb-20">
      {/* Page Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl text-center space-y-3">
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-blue-200 bg-blue-800 px-3 py-1 rounded-full border border-blue-700">
            Tentang Sekolah
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Profil Resmi {schoolInfo.name}
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Mengenal lebih dekat sejarah perjalanan, visi luhur, struktur kepemimpinan, dan sarana prasarana penunjang keunggulan vokasi kami.
          </p>
        </div>
      </section>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-2 bg-slate-100 p-1.5 rounded-2xl max-w-3xl mx-auto border border-slate-200">
          <button
            id="tab-btn-sejarah"
            onClick={() => setActiveTab('sejarah')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'sejarah'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Sejarah</span>
          </button>

          <button
            id="tab-btn-visimisi"
            onClick={() => setActiveTab('visimisi')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'visimisi'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Target className="w-4 h-4" />
            <span>Visi & Misi</span>
          </button>

          <button
            id="tab-btn-organisasi"
            onClick={() => setActiveTab('organisasi')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'organisasi'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Users2 className="w-4 h-4" />
            <span>Organisasi</span>
          </button>

          <button
            id="tab-btn-fasilitas"
            onClick={() => setActiveTab('fasilitas')}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'fasilitas'
                ? 'bg-white text-blue-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Fasilitas</span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* TAB 1: SEJARAH */}
        {activeTab === 'sejarah' && (
          <div id="section-sejarah" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-2 text-blue-600 text-xs font-bold uppercase tracking-wider">
                  <History className="w-4 h-4" />
                  <span>Jejak Langkah & Perkembangan</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  Perjalanan Panjang Mewujudkan Sekolah Rujukan Vokasi
                </h2>
                <div className="text-sm sm:text-base text-slate-600 leading-relaxed space-y-4 whitespace-pre-line">
                  {schoolInfo.history}
                </div>
              </div>
              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-slate-100 bg-slate-100 aspect-4/3">
                  <img
                    src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=800&q=80"
                    alt="Sejarah Gedung Sekolah"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Milestones bar */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-blue-50/50 border border-blue-100">
                <div className="text-xs font-bold text-blue-600 uppercase">Tahun 1985</div>
                <h4 className="text-base font-bold text-slate-900 mt-1">Pendirian Lembaga</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Mulai beroperasi dengan 2 program keahlian awal untuk melayani masyarakat.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                <div className="text-xs font-bold text-indigo-600 uppercase">Tahun 2010</div>
                <h4 className="text-base font-bold text-slate-900 mt-1">Standarisasi RSBI</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Rintisan sekolah berstandar internasional dan modernisasi seluruh laboratorium.
                </p>
              </div>
              <div className="p-5 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                <div className="text-xs font-bold text-emerald-600 uppercase">Tahun 2021 - Sekarang</div>
                <h4 className="text-base font-bold text-slate-900 mt-1">SMK Pusat Keunggulan</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Penetapan SMK PK dengan akreditasi A (Unggul) dan puluhan jejaring industri terkemuka.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: VISI & MISI */}
        {activeTab === 'visimisi' && (
          <div id="section-visimisi" className="space-y-8 animate-in fade-in duration-200">
            {/* Visi Card */}
            <div className="bg-linear-to-r from-blue-700 to-indigo-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl">
              <div className="max-w-3xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
                  <Target className="w-4 h-4 text-blue-300" />
                  <span>Visi Sekolah</span>
                </div>
                <h2 className="text-xl sm:text-3xl font-extrabold leading-snug tracking-tight text-white">
                  "{schoolInfo.vision}"
                </h2>
              </div>
            </div>

            {/* Misi Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Misi Sekolah</h3>
                  <p className="text-xs text-slate-500">Langkah-langkah strategis untuk merealisasikan visi sekolah</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schoolInfo.missions.map((misi, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3.5"
                  >
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <p className="text-sm text-slate-700 leading-relaxed font-medium">
                      {misi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: STRUKTUR ORGANISASI */}
        {activeTab === 'organisasi' && (
          <div id="section-organisasi" className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-8 animate-in fade-in duration-200">
            <SectionHeading
              badge="Manajemen Sekolah"
              title="Struktur Organisasi & Pimpinan"
              subtitle="Jajaran kepemimpinan yang berdedikasi tinggi mengawal mutu pendidikan dan layanan akademik sekolah."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {schoolInfo.organization?.map((member) => (
                <div
                  key={member.id}
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80 flex items-center gap-4 hover:shadow-md transition-shadow"
                >
                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-xs">
                    <img
                      src={member.photoUrl}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                      {member.category}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5 truncate">
                      {member.name}
                    </h4>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: FASILITAS SEKOLAH */}
        {activeTab === 'fasilitas' && (
          <div id="section-fasilitas" className="space-y-8 animate-in fade-in duration-200">
            <SectionHeading
              badge="Sarana & Prasarana"
              title="Fasilitas Unggulan Pendukung Belajar"
              subtitle="Menyediakan sarana belajar, laboratorium, dan bengkel praktik berstandar industri demi kenyamanan dan keamanan seluruh peserta didik."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {schoolInfo.facilities?.map((facility) => (
                <div
                  key={facility.id}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-lg transition-all flex flex-col group"
                >
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                    <img
                      src={facility.imageUrl}
                      alt={facility.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-bold text-white">
                      {facility.category}
                    </div>
                    {facility.capacity && (
                      <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-md text-[11px] font-semibold text-slate-800 shadow-xs">
                        Kapasitas: {facility.capacity}
                      </div>
                    )}
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {facility.name}
                      </h4>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                        {facility.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
