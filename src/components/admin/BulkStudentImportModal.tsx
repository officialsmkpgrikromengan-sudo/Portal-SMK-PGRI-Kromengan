import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  X, 
  HelpCircle,
  FileCheck,
  Users,
  Check
} from 'lucide-react';
import { StudentItem, ClassItem, MajorItem, GenderType, StudentStatus } from '../../types';
import { bulkCreateStudents } from '../../lib/firebase';
import { useToast } from '../../context/ToastContext';

interface BulkStudentImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  classesList: ClassItem[];
  majorsList: MajorItem[];
  existingStudents: StudentItem[];
  onSuccess: () => void;
}

interface ParsedStudentRow {
  rowNum: number;
  nis: string;
  nisn: string;
  fullName: string;
  gender: GenderType;
  birthPlace: string;
  birthDate: string;
  address: string;
  phone: string;
  email: string;
  classNameInput: string;
  classId: string;
  majorNameInput: string;
  majorId: string;
  enrollmentYear: string;
  status: StudentStatus;
  errors: string[];
  warnings: string[];
  isValid: boolean;
}

export const BulkStudentImportModal: React.FC<BulkStudentImportModalProps> = ({
  isOpen,
  onClose,
  classesList = [],
  majorsList = [],
  existingStudents = [],
  onSuccess
}) => {
  const { success, error, warning } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fileName, setFileName] = useState<string>('');
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'valid' | 'invalid'>('all');

  if (!isOpen) return null;

  // 1. Generate & Download Template XLSX
  const handleDownloadTemplate = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Main Data Sheet
      const headers = [
        'NISN (10 Digit) *',
        'Nama Lengkap *',
        'NIS (Lokal Opsional)',
        'Jenis Kelamin (Laki-laki/Perempuan) *',
        'Tempat Lahir',
        'Tanggal Lahir (YYYY-MM-DD)',
        'Kelas / Rombel *',
        'Jurusan / Program Keahlian *',
        'Tahun Masuk (misal: 2024)',
        'No WhatsApp / HP',
        'Email',
        'Alamat Lengkap',
        'Status (Aktif/Lulus/Pindah/Nonaktif)'
      ];

      // Sample Data Rows for reference
      const sampleClass1 = classesList[0]?.name || 'X RPL 1';
      const sampleMajor1 = majorsList[0]?.name || 'Rekayasa Perangkat Lunak';
      const sampleMajorCode1 = majorsList[0]?.code || 'RPL';

      const sampleClass2 = classesList[1]?.name || 'XI TJKT 1';
      const sampleMajor2 = majorsList[1]?.name || 'Teknik Jaringan Komputer dan Telekomunikasi';
      const sampleMajorCode2 = majorsList[1]?.code || 'TJKT';

      const sampleRows = [
        [
          '0076543210',
          'Muhammad Rizky Pratama',
          '242501099',
          'Laki-laki',
          'Malang',
          '2008-05-12',
          sampleClass1,
          sampleMajorCode1,
          '2024',
          '081234567890',
          'rizky.pratama@siswa.smkpgri.sch.id',
          'Jl. Melati No. 12, Kromengan, Malang',
          'Aktif'
        ],
        [
          '0087654321',
          'Alya Nur Ramadhani',
          '242501100',
          'Perempuan',
          'Kepanjen',
          '2008-09-24',
          sampleClass2,
          sampleMajorCode2,
          '2024',
          '081398765432',
          'alya.ramadhani@siswa.smkpgri.sch.id',
          'Jl. Mawar No. 45, Kepanjen, Malang',
          'Aktif'
        ]
      ];

      const wsData = [headers, ...sampleRows];
      const ws = XLSX.utils.aoa_to_sheet(wsData);

      // Set column widths for readability
      ws['!cols'] = [
        { wch: 18 }, // NISN
        { wch: 28 }, // Nama
        { wch: 16 }, // NIS
        { wch: 24 }, // Gender
        { wch: 18 }, // Tempat Lahir
        { wch: 22 }, // Tgl Lahir
        { wch: 18 }, // Kelas
        { wch: 22 }, // Jurusan
        { wch: 16 }, // Th Masuk
        { wch: 20 }, // HP
        { wch: 30 }, // Email
        { wch: 35 }, // Alamat
        { wch: 18 }  // Status
      ];

      XLSX.utils.book_append_sheet(wb, ws, 'Template_Data_Siswa');

      // Reference Sheet (List of valid Classes and Majors)
      const refHeaders = ['Daftar Kelas Tersedia', 'Tingkat', 'Kode Jurusan', 'Nama Jurusan Tersedia'];
      const maxLen = Math.max(classesList.length, majorsList.length);
      const refRows = [];
      for (let i = 0; i < maxLen; i++) {
        const cls = classesList[i];
        const maj = majorsList[i];
        refRows.push([
          cls ? cls.name : '',
          cls ? cls.level : '',
          maj ? maj.code : '',
          maj ? maj.name : ''
        ]);
      }
      const wsRef = XLSX.utils.aoa_to_sheet([refHeaders, ...refRows]);
      wsRef['!cols'] = [{ wch: 24 }, { wch: 12 }, { wch: 16 }, { wch: 40 }];
      XLSX.utils.book_append_sheet(wb, wsRef, 'Referensi_Kelas_Jurusan');

      // Save File
      XLSX.writeFile(wb, 'Template_Import_Siswa_SMK_PGRI_Kromengan.xlsx');
      success('Template Excel berhasil diunduh. Silakan isi data dan unggah kembali.');
    } catch (err) {
      console.error(err);
      error('Gagal mengunduh template Excel.');
    }
  };

  // 2. Parse Excel File
  const processExcelFile = (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls') && !file.name.endsWith('.csv')) {
      error('Format file tidak didukung. Harap unggah file dengan format .xlsx atau .xls.');
      return;
    }

    setFileName(file.name);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        // Read as array of arrays
        const rawJson: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

        if (rawJson.length <= 1) {
          warning('File Excel kosong atau hanya berisi baris header.');
          setParsedRows([]);
          setIsProcessing(false);
          return;
        }

        // Header is row 0, data starts from row 1
        const rows: ParsedStudentRow[] = [];
        // Header row inspection to support both new template (NISN first) and old template
        const headerRow = (rawJson[0] || []).map((h: any) => String(h || '').toLowerCase());
        const isOldFormat = headerRow.length > 0 && headerRow[0].includes('nis') && !headerRow[0].includes('nisn') && headerRow[1]?.includes('nisn');

        const existingNisnSet = new Set(existingStudents.map(s => (s.nisn || s.nis || '').trim().toLowerCase()));
        const fileNisnSet = new Set<string>();

        for (let i = 1; i < rawJson.length; i++) {
          const row = rawJson[i];
          // Skip completely empty rows
          if (!row || row.every(val => String(val).trim() === '')) {
            continue;
          }

          let rawNisn = '';
          let rawFullName = '';
          let rawNis = '';
          let rawGender = '';
          let rawBirthPlace = '';
          let rawBirthDate = '';
          let rawClass = '';
          let rawMajor = '';
          let rawYear = '';
          let rawPhone = '';
          let rawEmail = '';
          let rawAddress = '';
          let rawStatus = '';

          if (isOldFormat) {
            rawNis = String(row[0] || '').trim();
            rawNisn = String(row[1] || '').trim();
            rawFullName = String(row[2] || '').trim();
            rawGender = String(row[3] || '').trim();
            rawBirthPlace = String(row[4] || '').trim();
            rawBirthDate = String(row[5] || '').trim();
            rawClass = String(row[6] || '').trim();
            rawMajor = String(row[7] || '').trim();
            rawYear = String(row[8] || '').trim();
            rawPhone = String(row[9] || '').trim();
            rawEmail = String(row[10] || '').trim();
            rawAddress = String(row[11] || '').trim();
            rawStatus = String(row[12] || '').trim();
          } else {
            // New format: NISN is column 0, FullName is column 1, NIS is column 2
            rawNisn = String(row[0] || '').trim();
            rawFullName = String(row[1] || '').trim();
            rawNis = String(row[2] || '').trim();
            rawGender = String(row[3] || '').trim();
            rawBirthPlace = String(row[4] || '').trim();
            rawBirthDate = String(row[5] || '').trim();
            rawClass = String(row[6] || '').trim();
            rawMajor = String(row[7] || '').trim();
            rawYear = String(row[8] || '').trim();
            rawPhone = String(row[9] || '').trim();
            rawEmail = String(row[10] || '').trim();
            rawAddress = String(row[11] || '').trim();
            rawStatus = String(row[12] || '').trim();
          }

          // If NIS is empty, fallback to NISN
          if (!rawNis && rawNisn) {
            rawNis = rawNisn;
          }

          const errors: string[] = [];
          const warnings: string[] = [];

          // Validation: NISN (Primary Identifier)
          if (!rawNisn && !rawNis) {
            errors.push('NISN wajib diisi');
          } else {
            const cleanNisn = (rawNisn || rawNis).toLowerCase();
            if (existingNisnSet.has(cleanNisn)) {
              errors.push(`NISN ${rawNisn || rawNis} sudah terdaftar di database`);
            }
            if (fileNisnSet.has(cleanNisn)) {
              errors.push(`Duplikat NISN ${rawNisn || rawNis} dalam file ini`);
            }
            fileNisnSet.add(cleanNisn);
          }

          // Validation: Full Name
          if (!rawFullName) {
            errors.push('Nama lengkap siswa wajib diisi');
          }

          // Gender formatting
          let gender: GenderType = 'Laki-laki';
          const gLower = rawGender.toLowerCase();
          if (gLower.startsWith('p') || gLower.includes('wanita') || gLower.includes('perempuan') || gLower === 'f') {
            gender = 'Perempuan';
          } else if (gLower.startsWith('l') || gLower.includes('pria') || gLower.includes('laki') || gLower === 'm') {
            gender = 'Laki-laki';
          } else if (rawGender) {
            warnings.push('Format jenis kelamin tidak standar, diset ke Laki-laki');
          }

          // Class Matching
          let matchedClass = classesList.find(c => 
            c.name.toLowerCase() === rawClass.toLowerCase() ||
            c.id === rawClass
          );
          if (!matchedClass && rawClass) {
            // Partial matching
            matchedClass = classesList.find(c => 
              c.name.toLowerCase().includes(rawClass.toLowerCase()) ||
              rawClass.toLowerCase().includes(c.name.toLowerCase())
            );
          }
          if (!matchedClass) {
            matchedClass = classesList[0];
            warnings.push(`Kelas "${rawClass || '-'}" tidak cocok, dialihkan ke ${matchedClass?.name || 'default'}`);
          }

          // Major Matching
          let matchedMajor = majorsList.find(m => 
            m.code.toLowerCase() === rawMajor.toLowerCase() ||
            m.name.toLowerCase() === rawMajor.toLowerCase() ||
            m.id === rawMajor
          );
          if (!matchedMajor && rawMajor) {
            matchedMajor = majorsList.find(m => 
              m.name.toLowerCase().includes(rawMajor.toLowerCase()) ||
              m.code.toLowerCase().includes(rawMajor.toLowerCase())
            );
          }
          if (!matchedMajor) {
            matchedMajor = matchedClass ? majorsList.find(m => m.id === matchedClass?.majorId) : majorsList[0];
            if (rawMajor) {
              warnings.push(`Jurusan "${rawMajor}" tidak ditemukan, disesuaikan ke ${matchedMajor?.code || 'default'}`);
            }
          }

          // Date formatting: handle YYYY-MM-DD or standard DD/MM/YYYY or excel serial numbers
          let formattedBirthDate = rawBirthDate;
          if (rawBirthDate && !isNaN(Number(rawBirthDate)) && Number(rawBirthDate) > 20000) {
            // Excel serial date number
            const dateObj = new Date(Math.round((Number(rawBirthDate) - 25569) * 86400 * 1000));
            formattedBirthDate = dateObj.toISOString().split('T')[0];
          } else if (rawBirthDate && rawBirthDate.includes('/')) {
            const parts = rawBirthDate.split('/');
            if (parts.length === 3) {
              if (parts[2].length === 4) {
                formattedBirthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
              }
            }
          }
          if (!formattedBirthDate) {
            formattedBirthDate = '2008-01-01';
          }

          // Status
          let status: StudentStatus = 'Aktif';
          const sLower = rawStatus.toLowerCase();
          if (sLower.includes('lulus')) status = 'Lulus';
          else if (sLower.includes('pindah')) status = 'Pindah';
          else if (sLower.includes('non') || sLower.includes('keluar') || sLower.includes('drop')) status = 'Nonaktif';

          rows.push({
            rowNum: i + 1,
            nis: rawNis,
            nisn: rawNisn || '-',
            fullName: rawFullName,
            gender,
            birthPlace: rawBirthPlace || 'Malang',
            birthDate: formattedBirthDate,
            address: rawAddress || 'Kromengan, Malang',
            phone: rawPhone || '-',
            email: rawEmail || `${rawNis || 'siswa'}@siswa.smkpgri.sch.id`,
            classNameInput: rawClass,
            classId: matchedClass?.id || '',
            majorNameInput: rawMajor,
            majorId: matchedMajor?.id || matchedClass?.majorId || majorsList[0]?.id || '',
            enrollmentYear: rawYear || '2024',
            status,
            errors,
            warnings,
            isValid: errors.length === 0
          });
        }

        setParsedRows(rows);
        if (rows.length === 0) {
          warning('Tidak ada baris data valid yang terbaca.');
        } else {
          const validCount = rows.filter(r => r.isValid).length;
          success(`Berhasil memproses ${rows.length} data siswa (${validCount} valid).`);
        }
      } catch (err) {
        console.error(err);
        error('Gagal membaca file Excel. Pastikan format tabel sesuai dengan template.');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processExcelFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processExcelFile(e.target.files[0]);
    }
  };

  // 3. Execute Bulk Import
  const handleExecuteImport = async () => {
    const validRows = parsedRows.filter(r => r.isValid);
    if (validRows.length === 0) {
      error('Tidak ada data valid yang dapat diimpor.');
      return;
    }

    try {
      setIsImporting(true);
      const studentPayloads: Omit<StudentItem, 'id' | 'createdAt'>[] = validRows.map(r => ({
        nis: r.nis,
        nisn: r.nisn,
        fullName: r.fullName,
        gender: r.gender,
        birthPlace: r.birthPlace,
        birthDate: r.birthDate,
        address: r.address,
        phone: r.phone,
        email: r.email,
        photoUrl: r.gender === 'Perempuan'
          ? 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80'
          : 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
        classId: r.classId,
        majorId: r.majorId,
        enrollmentYear: r.enrollmentYear,
        status: r.status
      }));

      const importedCount = await bulkCreateStudents(studentPayloads);
      success(`Sukses mengimpor ${importedCount} data siswa ke sistem!`);
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      error('Terjadi kesalahan saat menyimpan data siswa secara massal.');
    } finally {
      setIsImporting(false);
    }
  };

  const validRowsCount = parsedRows.filter(r => r.isValid).length;
  const invalidRowsCount = parsedRows.filter(r => !r.isValid).length;

  const displayedRows = parsedRows.filter(r => {
    if (activeTab === 'valid') return r.isValid;
    if (activeTab === 'invalid') return !r.isValid;
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Import Data Siswa Massal (.xlsx)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Unggah banyak data siswa sekaligus dengan cepat menggunakan format Excel spreadsheet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          
          {/* Step 1 & Step 2 Guide Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Step 1: Download Template */}
            <div className="p-4 rounded-2xl border border-blue-100 dark:border-blue-900/50 bg-blue-50/40 dark:bg-blue-950/20 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 font-bold mb-1">
                  <span className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px]">1</span>
                  <span>Unduh Template Excel Resmi</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  Gunakan template resmi yang sudah dilengkapi kolom NIS, NISN, Nama, Jenis Kelamin, serta lembar referensi nama kelas & jurusan aktif.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Unduh Template .xlsx</span>
              </button>
            </div>

            {/* Step 2: Upload Guidelines */}
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold mb-1">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Aturan Pengisian Data</span>
              </div>
              <ul className="text-[11px] text-slate-600 dark:text-slate-400 space-y-1 list-disc pl-4 leading-relaxed">
                <li>Kolom <strong>NIS</strong> & <strong>Nama Lengkap</strong> bersifat wajib (*).</li>
                <li>NIS tidak boleh sama dengan data siswa yang sudah ada.</li>
                <li>Format tanggal lahir: <code>YYYY-MM-DD</code> (contoh: 2008-04-20).</li>
                <li>Pastikan nama kelas atau kode jurusan sesuai lembar referensi.</li>
              </ul>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleFileDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-3xl p-6 text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              dragActive 
                ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30' 
                : 'border-slate-300 dark:border-slate-700 hover:border-blue-400 hover:bg-slate-50/50 dark:hover:bg-slate-800/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileInputChange}
              className="hidden"
            />
            
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
              <Upload className="w-6 h-6" />
            </div>

            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">
                {fileName ? `File terpilih: ${fileName}` : 'Klik atau seret file spreadsheet Excel ke sini'}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Mendukung format .xlsx, .xls, atau .csv (Maks 500 siswa per file)
              </p>
            </div>

            {fileName && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                <Check className="w-3.5 h-3.5" /> Siap Dipratinjau
              </span>
            )}
          </div>

          {/* Preview Parsed Data Section */}
          {parsedRows.length > 0 && (
            <div className="space-y-3 pt-2">
              
              {/* Summary Toolbar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white">Hasil Analisis Data:</span>
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 font-bold text-slate-800 dark:text-slate-200">
                    Total: {parsedRows.length}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Valid: {validRowsCount}
                  </span>
                  {invalidRowsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold flex items-center gap-1">
                      <XCircle className="w-3 h-3" /> Error: {invalidRowsCount}
                    </span>
                  )}
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeTab === 'all'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Semua ({parsedRows.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('valid')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeTab === 'valid'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Hanya Valid ({validRowsCount})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('invalid')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeTab === 'invalid'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    Hanya Error ({invalidRowsCount})
                  </button>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden max-h-72 overflow-y-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100 dark:bg-slate-800 sticky top-0 z-10 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                      <th className="py-2.5 px-3">Baris</th>
                      <th className="py-2.5 px-3">NIS</th>
                      <th className="py-2.5 px-3">Nama Lengkap</th>
                      <th className="py-2.5 px-3">L/P</th>
                      <th className="py-2.5 px-3">Kelas Terdeteksi</th>
                      <th className="py-2.5 px-3">Jurusan</th>
                      <th className="py-2.5 px-3">Status Validasi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {displayedRows.map((row) => {
                      const matchedClass = classesList.find(c => c.id === row.classId);
                      const matchedMajor = majorsList.find(m => m.id === row.majorId);

                      return (
                        <tr 
                          key={row.rowNum}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-800/40 ${
                            !row.isValid ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''
                          }`}
                        >
                          <td className="py-2 px-3 font-semibold text-slate-400">#{row.rowNum}</td>
                          <td className="py-2 px-3 font-mono font-bold text-slate-900 dark:text-white">
                            {row.nis || <span className="text-rose-500 italic">Kosong</span>}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">
                            {row.fullName || <span className="text-rose-500 italic">Kosong</span>}
                          </td>
                          <td className="py-2 px-3 text-slate-600 dark:text-slate-400 font-semibold">
                            {row.gender === 'Laki-laki' ? 'L' : 'P'}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            {matchedClass?.name || row.classNameInput || '-'}
                          </td>
                          <td className="py-2 px-3 font-semibold text-slate-700 dark:text-slate-300">
                            {matchedMajor?.code || row.majorNameInput || '-'}
                          </td>
                          <td className="py-2 px-3">
                            {row.isValid ? (
                              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                                <span>Valid</span>
                                {row.warnings.length > 0 && (
                                  <span 
                                    className="text-amber-500 cursor-help"
                                    title={row.warnings.join(', ')}
                                  >
                                    <AlertTriangle className="w-3 h-3" />
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col text-rose-600 dark:text-rose-400 text-[11px] font-bold">
                                {row.errors.map((errStr, errIdx) => (
                                  <span key={errIdx} className="flex items-center gap-1">
                                    <XCircle className="w-3 h-3 shrink-0" />
                                    {errStr}
                                  </span>
                                ))}
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {parsedRows.length > 0 && (
              <span>
                <strong>{validRowsCount}</strong> siswa valid akan dimasukkan ke database sekolah.
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isImporting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 font-bold text-xs transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleExecuteImport}
              disabled={isImporting || validRowsCount === 0}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all cursor-pointer"
            >
              {isImporting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Mengimpor Data...</span>
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  <span>Impor {validRowsCount} Data Siswa</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
