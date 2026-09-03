import React, { useState } from 'react';
import { 
  Mail, 
  Trash2, 
  Search, 
  Calendar, 
  User, 
  Phone, 
  MessageSquare,
  Clock,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { ContactMessage } from '../../types';
import { deleteMessage } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';
import { ConfirmDialog } from '../common/ConfirmDialog';

interface AdminMessagesProps {
  messages: ContactMessage[];
  onRefresh: () => void;
}

export const AdminMessages: React.FC<AdminMessagesProps> = ({
  messages,
  onRefresh
}) => {
  const { success, error } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessage | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await deleteMessage(deleteTarget.id);
      success('Pesan berhasil dihapus.');
      if (selectedMessage?.id === deleteTarget.id) {
        setSelectedMessage(null);
      }
      setDeleteTarget(null);
      onRefresh();
    } catch (err) {
      error('Gagal menghapus pesan.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = messages.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.message.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="admin-messages-view" className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Kotak Masuk Pesan Pengunjung</h2>
          <p className="text-xs text-slate-500">Daftar pertanyaan, permohonan informasi, dan konsultasi dari website publik.</p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-100 self-start sm:self-auto">
          Total Pesan: {messages.length}
        </span>
      </div>

      {/* 2-Columns Layout: List and Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Message List */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari pengirim atau subjek..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500/20 bg-white"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden divide-y divide-slate-100 max-h-[650px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <Mail className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-semibold">Tidak ada pesan masuk.</p>
              </div>
            ) : (
              filtered.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-4 cursor-pointer transition-colors flex items-start justify-between gap-3 ${
                      isSelected ? 'bg-blue-50/80 border-l-4 border-blue-600' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="min-w-0 space-y-1 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">{msg.name}</span>
                        <span className="text-[10px] text-slate-400">{msg.createdAt?.split('T')[0] || 'Baru'}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-blue-700 truncate">{msg.subject}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{msg.message}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Message Detail Reader */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6 animate-in fade-in">
              <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-[11px] font-bold uppercase text-blue-600 tracking-wider">Subjek Pesan</span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{selectedMessage.subject}</h3>
                </div>

                <button
                  onClick={() => setDeleteTarget(selectedMessage)}
                  className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors shrink-0"
                  title="Hapus Pesan"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Sender Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <User className="w-4 h-4 text-blue-600 shrink-0" />
                  <span><strong>Pengirim:</strong> {selectedMessage.name}</span>
                </div>

                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-4 h-4 text-blue-600 shrink-0" />
                  <a href={`mailto:${selectedMessage.email}`} className="text-blue-600 hover:underline truncate">
                    {selectedMessage.email}
                  </a>
                </div>

                {selectedMessage.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-4 h-4 text-blue-600 shrink-0" />
                    <span><strong>HP/WA:</strong> {selectedMessage.phone}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>{selectedMessage.createdAt || 'Waktu tidak tersedia'}</span>
                </div>
              </div>

              {/* Message Body */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Isi Pesan:</span>
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 leading-relaxed whitespace-pre-line">
                  {selectedMessage.message}
                </div>
              </div>

              {/* Quick Reply button */}
              <div className="pt-2 flex flex-wrap gap-3">
                <a
                  href={`mailto:${selectedMessage.email}?subject=Balasan: ${encodeURIComponent(selectedMessage.subject)}`}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-2"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Balas Lewat Email ({selectedMessage.email})</span>
                </a>

                {selectedMessage.phone && (
                  <a
                    href={`https://wa.me/${selectedMessage.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs flex items-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Hubungi via WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-xs text-center text-slate-400 space-y-3">
              <MessageSquare className="w-12 h-12 mx-auto text-slate-300" />
              <h4 className="text-base font-bold text-slate-700">Pilih Pesan</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Klik salah satu pesan di daftar sebelah kiri untuk membaca detail pertanyaan dan membalas pengirim.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Pesan Masuk"
        message={`Apakah Anda yakin ingin menghapus pesan dari "${deleteTarget?.name}"?`}
        confirmLabel="Ya, Hapus"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
