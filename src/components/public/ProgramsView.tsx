import React, { useState } from 'react';
import { 
  Code, 
  Network, 
  Palette, 
  Wrench, 
  Coins, 
  BookOpen, 
  Briefcase, 
  CheckCircle2, 
  Sparkles,
  ArrowRight,
  UserCheck
} from 'lucide-react';
import { VocationalProgram, SchoolInfo, NavigationPage } from '../../types';
import { SectionHeading } from '../common/SectionHeading';

interface ProgramsViewProps {
  schoolInfo: SchoolInfo;
  onNavigate: (page: NavigationPage) => void;
}

export const ProgramsView: React.FC<ProgramsViewProps> = ({ schoolInfo, onNavigate }) => {
  const [selectedProgram, setSelectedProgram] = useState<string>(
    schoolInfo.programs && schoolInfo.programs.length > 0 ? schoolInfo.programs[0].id : ''
  );

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

  const programs = schoolInfo?.programs || [];
  const activeProg = programs.find(p => p.id === selectedProgram) || programs[0];

  return (
    <div id="programs-view" className="space-y-10 sm:space-y-12 py-6 sm:py-8 pb-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl text-center space-y-3">
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-blue-200 bg-blue-800 px-3 py-1 rounded-full border border-blue-700">
            Kurikulum & Kejuruan
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Program Keahlian & Jurusan Vokasi
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Disiapkan khusus dengan kurikulum industri, sertifikasi profesi BNSP, dan pembelajaran berbasis proyek nyata (Project Based Learning).
          </p>
        </div>
      </section>

      {/* Program Selector Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {schoolInfo.programs?.map((program) => {
            const isSelected = selectedProgram === program.id;
            return (
              <button
                key={program.id}
                id={`btn-program-tab-${program.code}`}
                onClick={() => setSelectedProgram(program.id)}
                className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-blue-900 text-white border-blue-900 shadow-md'
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-xs'
                }`}
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-700'
                }`}>
                  {program.code}
                </div>
                <div>
                  <span className={`text-[10px] font-bold uppercase tracking-wider block ${
                    isSelected ? 'text-blue-200' : 'text-slate-400'
                  }`}>
                    {program.code}
                  </span>
                  <span className="text-xs sm:text-sm font-bold line-clamp-1">
                    {program.name.split('(')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Program Detail */}
      {activeProg && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-10">
            {/* Top header of program */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-lg bg-blue-100 text-blue-800 text-xs font-bold uppercase">
                    Kode Jurusan: {activeProg.code}
                  </span>
                  {activeProg.headOfProgram && (
                    <span className="px-3 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                      Kaprog: {activeProg.headOfProgram}
                    </span>
                  )}
                </div>

                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {activeProg.name}
                </h2>

                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {activeProg.fullDesc || activeProg.shortDesc}
                </p>
              </div>

              <div className="lg:col-span-5">
                <div className="rounded-2xl overflow-hidden shadow-xl border-4 border-slate-100 bg-slate-100 aspect-16/10">
                  <img
                    src={activeProg.imageUrl}
                    alt={activeProg.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Competencies & Career Prospects */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-100">
              {/* Competencies */}
              <div className="space-y-4 bg-slate-50 p-6 rounded-2xl border border-slate-200/80">
                <div className="flex items-center gap-2 text-blue-700 font-bold text-base">
                  <Sparkles className="w-5 h-5" />
                  <span>Kompetensi Utama yang Dipelajari</span>
                </div>
                <ul className="space-y-3">
                  {activeProg.competencies?.map((comp, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed">
                        {comp}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Job Prospects */}
              <div className="space-y-4 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-base">
                  <Briefcase className="w-5 h-5" />
                  <span>Peluang & Prospek Karir Lulusan</span>
                </div>
                <ul className="space-y-3">
                  {activeProg.jobProspects?.map((job, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1.5"></div>
                      <span className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed">
                        {job}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom CTA for program */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-linear-to-r from-slate-900 to-blue-950 p-6 rounded-2xl text-white">
              <div>
                <h4 className="text-base font-bold">Tertarik dengan jurusan {activeProg.name}?</h4>
                <p className="text-xs text-slate-300 mt-0.5">Konsultasikan pendaftaran atau kunjungi fasilitas laboratorium kami.</p>
              </div>
              <button
                onClick={() => onNavigate('contact')}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors shadow-sm whitespace-nowrap"
              >
                Hubungi Panitia Pendaftaran
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
