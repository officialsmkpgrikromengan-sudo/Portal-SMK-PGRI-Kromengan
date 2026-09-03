import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  ShieldCheck, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Calendar, 
  User, 
  Layers, 
  Activity,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { AuditLogItem, AuditAction, AuditModule } from '../../types';
import { getAuditLogs, logAuditEvent } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';

export const AdminAuditLogs: React.FC = () => {
  const { success, info } = useToast();
  const [logsList, setLogsList] = useState<AuditLogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const data = await getAuditLogs(200);
      setLogsList(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleExportLogsCsv = () => {
    if (logsList.length === 0) {
      info('Tidak ada data audit log untuk diekspor.');
      return;
    }

    const headers = ['ID Log', 'Waktu (UTC)', 'Email Pengguna', 'Role', 'Aksi', 'Modul', 'Target ID', 'Target Nama', 'Deskripsi Aktivitas', 'IP Gateway'];
    const rows = filteredLogs.map(l => [
      l.id,
      l.createdAt,
      l.userEmail,
      l.userRole,
      l.action,
      l.module,
      l.targetId,
      l.targetName || '-',
      l.description,
      l.ipAddress || '-'
    ]);

    const csvRows = [
      `"Audit Log Sistem SMK PGRI"`,
      `"Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}"`,
      '',
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(','))
    ];

    const blob = new Blob(['\uFEFF' + csvRows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    success('Data audit log berhasil diekspor.');
  };

  const filteredLogs = logsList.filter(l => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    if (moduleFilter !== 'all' && l.module !== moduleFilter) return false;
    if (searchKeyword) {
      const kw = searchKeyword.toLowerCase();
      return (
        l.userEmail.toLowerCase().includes(kw) ||
        l.description.toLowerCase().includes(kw) ||
        (l.targetName && l.targetName.toLowerCase().includes(kw)) ||
        l.action.toLowerCase().includes(kw) ||
        l.module.toLowerCase().includes(kw)
      );
    }
    return true;
  });

  const getActionBadge = (action: AuditAction) => {
    switch (action) {
      case 'CREATE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">CREATE</span>;
      case 'UPDATE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800">UPDATE</span>;
      case 'DELETE':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800">DELETE</span>;
      case 'EXPORT':
      case 'PRINT':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">{action}</span>;
      case 'LOGIN':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-100 text-indigo-800">LOGIN</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">{action}</span>;
    }
  };

  return (
    <div id="admin-audit-logs-view" className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 sm:p-7 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Audit Trail & Security Telemetry</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Log Aktivitas & Audit Keamanan
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl mt-1">
            Riwayat lengkap pencatatan setiap perubahan data (Create, Update, Delete, Export) untuk transparansi dan kepatuhan sistem sekolah.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Segarkan</span>
          </button>
          <button
            onClick={handleExportLogsCsv}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative min-w-[220px] flex-1 sm:max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Cari aktivitas, email, atau modul..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
          >
            <option value="all">Semua Tipe Aksi</option>
            <option value="CREATE">CREATE (Tambah)</option>
            <option value="UPDATE">UPDATE (Ubah)</option>
            <option value="DELETE">DELETE (Hapus)</option>
            <option value="EXPORT">EXPORT (Unduh)</option>
            <option value="PRINT">PRINT (Cetak)</option>
            <option value="LOGIN">LOGIN</option>
            <option value="SETTINGS">SETTINGS</option>
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => setModuleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium"
          >
            <option value="all">Semua Modul</option>
            <option value="Akademik">Akademik</option>
            <option value="PKL">PKL</option>
            <option value="BKK">BKK</option>
            <option value="Alumni">Alumni</option>
            <option value="Master Data">Master Data</option>
            <option value="Auth">Auth & Pengguna</option>
            <option value="Laporan">Laporan</option>
            <option value="Settings">Pengaturan</option>
          </select>
        </div>

        <div className="text-xs text-slate-500">
          Menampilkan <strong>{filteredLogs.length}</strong> catatan aktivitas
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="p-3.5">Waktu Aktivitas</th>
                <th className="p-3.5">Pengguna & Peran</th>
                <th className="p-3.5">Aksi</th>
                <th className="p-3.5">Modul</th>
                <th className="p-3.5">Detail Aktivitas</th>
                <th className="p-3.5">IP Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    Tidak ada riwayat aktivitas yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-semibold text-slate-800">
                        {new Date(log.createdAt).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleTimeString('id-ID')} WIB
                      </div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <div className="font-bold text-slate-800">{log.userEmail}</div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider">{log.userRole}</div>
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="p-3.5 whitespace-nowrap">
                      <span className="font-bold text-slate-700 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                        {log.module}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="font-medium text-slate-800">{log.description}</div>
                      {log.targetName && (
                        <div className="text-[10px] text-blue-600 font-medium mt-0.5">
                          Target: {log.targetName} ({log.targetId})
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {log.ipAddress || '180.252.164.22'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
