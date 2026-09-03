import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight, 
  ArrowLeft, 
  ExternalLink, 
  X, 
  Search,
  Sparkles,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import { EventItem } from '../../types';

interface EventsViewProps {
  eventsList: EventItem[];
  selectedEvent: EventItem | null;
  onSelectEvent: (event: EventItem | null) => void;
}

export const EventsView: React.FC<EventsViewProps> = ({
  eventsList,
  selectedEvent,
  onSelectEvent
}) => {
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');

  const publishedEvents = eventsList.filter(e => e.status === 'published');
  const todayStr = new Date().toISOString().split('T')[0];

  const upcomingList = publishedEvents.filter(e => e.date >= todayStr);
  const pastList = publishedEvents.filter(e => e.date < todayStr);

  const currentList = tab === 'upcoming' ? upcomingList : pastList;

  const filteredEvents = currentList.filter(evt =>
    evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    evt.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
    evt.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="events-view" className="space-y-10 sm:space-y-12 py-6 sm:py-8 pb-20">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-blue-900 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-xl text-center space-y-3">
          <div className="inline-block text-[10px] font-bold uppercase tracking-widest text-blue-200 bg-blue-800 px-3 py-1 rounded-full border border-blue-700">
            Agenda & Kegiatan
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Event & Agenda Sekolah
          </h1>
          <p className="text-xs sm:text-sm text-blue-100 max-w-2xl mx-auto opacity-90 leading-relaxed">
            Jadwal kegiatan penting, seminar kejuruan, bursa kerja khusus, peringatan hari besar, dan festival kreativitas peserta didik.
          </p>
        </div>
      </section>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Controls Bar */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl w-full md:w-auto">
            <button
              id="tab-events-upcoming"
              onClick={() => setTab('upcoming')}
              className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                tab === 'upcoming'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Event Mendatang ({upcomingList.length})</span>
            </button>
            <button
              id="tab-events-past"
              onClick={() => setTab('past')}
              className={`flex-1 md:flex-none px-5 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                tab === 'past'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <CalendarCheck className="w-4 h-4" />
              <span>Sudah Berlangsung ({pastList.length})</span>
            </button>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-events-search"
              type="text"
              placeholder="Cari nama event atau lokasi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 bg-slate-50/50"
            />
          </div>
        </div>

        {/* Events Grid */}
        {filteredEvents.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              {tab === 'upcoming' ? 'Tidak ada event mendatang saat ini' : 'Tidak ada arsip event'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Silakan periksa kembali di lain waktu.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filteredEvents.map((evt) => (
              <div
                key={evt.id}
                id={`event-card-${evt.id}`}
                onClick={() => onSelectEvent(evt)}
                className="bg-white rounded-2xl overflow-hidden shadow-xs hover:shadow-xl border border-slate-200/80 transition-all hover:translate-y-[-4px] cursor-pointer flex flex-col group"
              >
                <div className="relative aspect-16/10 overflow-hidden bg-slate-100">
                  <img
                    src={evt.posterUrl}
                    alt={evt.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80';
                    }}
                  />
                  <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md px-2.5 py-1 rounded-md text-xs font-bold text-indigo-700 shadow-xs">
                    {evt.category || 'Event Sekolah'}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div className="space-y-2.5">
                    <div className="space-y-1.5 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 text-blue-600 font-semibold">
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>{evt.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{evt.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{evt.location}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {evt.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      {evt.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600 group-hover:text-blue-800">
                    <span>Lihat Detail Agenda</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* DETAIL EVENT MODAL */}
      {selectedEvent && (
        <div 
          id="event-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150"
        >
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
              <button
                onClick={() => onSelectEvent(null)}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali ke Daftar Event</span>
              </button>

              <button
                onClick={() => onSelectEvent(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
              {/* Poster */}
              <div className="rounded-2xl overflow-hidden shadow-md aspect-16/10 bg-slate-100">
                <img
                  src={selectedEvent.posterUrl}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Title & Info */}
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800">
                  {selectedEvent.category || 'Event Sekolah'}
                </span>
                <h2 className="text-2xl font-bold text-slate-900 mt-2 tracking-tight">
                  {selectedEvent.title}
                </h2>
              </div>

              {/* Event details card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-slate-700">
                  <Calendar className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><strong>Tanggal:</strong> {selectedEvent.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><strong>Waktu:</strong> {selectedEvent.time}</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700 sm:col-span-2">
                  <MapPin className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <span><strong>Lokasi:</strong> {selectedEvent.location}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-slate-900">Deskripsi Acara:</h4>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>

              {selectedEvent.registrationLink && (
                <div className="pt-4 border-t border-slate-100">
                  <a
                    href={selectedEvent.registrationLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    <span>Formulir Pendaftaran / Tautan Event</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
