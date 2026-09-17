import { MajorItem, VocationalProgram, SchoolInfo } from '../types';

/**
 * Normalizes and synchronizes active Master Majors into Vocational Programs
 * so that any changes made by Administrator in Admin -> Program Keahlian
 * are instantly reflected on public HomeView, ProgramsView, and Footer.
 */
export const getActiveVocationalPrograms = (
  majorsList: MajorItem[] = [],
  fallbackPrograms: VocationalProgram[] = []
): VocationalProgram[] => {
  // If no majors data at all, return fallback
  if (!majorsList || majorsList.length === 0) {
    return fallbackPrograms || [];
  }

  // Filter only active majors
  const activeMajors = majorsList.filter(m => m.status === 'Aktif');

  // If all are inactive, return empty or fallback if none active
  if (activeMajors.length === 0) {
    return [];
  }

  return activeMajors.map(m => {
    // Attempt to match with default rich program details by code, shortName, or id
    const match = (fallbackPrograms || []).find(
      p => p.id === m.id ||
           p.code?.toUpperCase() === m.code?.toUpperCase() ||
           p.code?.toUpperCase() === m.shortName?.toUpperCase() ||
           p.name?.toLowerCase().includes(m.code?.toLowerCase())
    );

    const fullDesc = m.description?.trim() || match?.fullDesc || match?.shortDesc || `Program Keahlian ${m.name} SMK PGRI Teladan Nusantara berorientasi industri dan sertifikasi profesi.`;
    const shortDesc = m.description?.trim() || match?.shortDesc || fullDesc;

    // Default icon selection based on code if none specified
    let iconName = m.iconName || match?.iconName;
    if (!iconName) {
      const c = m.code?.toUpperCase() || '';
      if (c.includes('RPL') || c.includes('SIJA') || c.includes('PPLG')) iconName = 'Code';
      else if (c.includes('TKJ') || c.includes('TJKT')) iconName = 'Network';
      else if (c.includes('DKV') || c.includes('MM')) iconName = 'Palette';
      else if (c.includes('TO') || c.includes('TKRO') || c.includes('TBSM')) iconName = 'Wrench';
      else if (c.includes('MPLB') || c.includes('AKL') || c.includes('BD')) iconName = 'Coins';
      else iconName = 'BookOpen';
    }

    // Default image if none specified
    let imageUrl = m.imageUrl || match?.imageUrl;
    if (!imageUrl) {
      const c = m.code?.toUpperCase() || '';
      if (c.includes('RPL')) imageUrl = 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80';
      else if (c.includes('TJKT') || c.includes('TKJ')) imageUrl = 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80';
      else if (c.includes('DKV')) imageUrl = 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80';
      else if (c.includes('TO') || c.includes('TKRO')) imageUrl = 'https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=800&q=80';
      else if (c.includes('MPLB') || c.includes('AKL')) imageUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80';
      else imageUrl = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80';
    }

    return {
      id: m.id,
      name: m.name,
      code: m.code,
      shortDesc,
      fullDesc,
      iconName,
      imageUrl,
      jobProspects: (m.jobProspects && m.jobProspects.length > 0)
        ? m.jobProspects
        : (match?.jobProspects && match.jobProspects.length > 0
            ? match.jobProspects
            : [
                `Spesialis Kejuruan ${m.code} di Industri Mitra`,
                'Teknisi Profesional & Operasional Lapangan',
                'Wirausaha Mandiri Berbasis Keahlian Vokasi'
              ]),
      competencies: (m.competencies && m.competencies.length > 0)
        ? m.competencies
        : (match?.competencies && match.competencies.length > 0
            ? match.competencies
            : [
                `Dasar-dasar Keahlian ${m.name}`,
                'Praktik Kerja Industri & Teaching Factory (TEFA)',
                'Uji Sertifikasi Kompetensi Profesi BNSP'
              ]),
      headOfProgram: m.headOfProgram || match?.headOfProgram || ''
    };
  });
};

/**
 * Returns schoolInfo with programs & stats.majors synchronized with active majors
 */
export const syncSchoolInfoWithMajors = (
  schoolInfo: SchoolInfo,
  majorsList: MajorItem[] = []
): SchoolInfo => {
  const syncedPrograms = getActiveVocationalPrograms(majorsList, schoolInfo.programs);
  return {
    ...schoolInfo,
    programs: syncedPrograms,
    stats: {
      ...schoolInfo.stats,
      majors: syncedPrograms.length
    }
  };
};
