import React, { useState, useMemo } from 'react';
import { Search, User, Hash, GraduationCap, AlertCircle, Info } from 'lucide-react';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 根據 PDF 內容整理的成績資料
  const studentData = [
    { id: "B11111025", name: "洪昕妤", score: 86 },
    { id: "B11356031", name: "蕭睿騰", score: 40 },
    { id: "B11356001", name: "施景維", score: 63 },
    { id: "B11356032", name: "王育騰", score: 49 },
    { id: "B11356002", name: "鍾昀璋", score: 54 },
    { id: "B11356033", name: "林永富", score: 38 },
    { id: "B11356003", name: "林書瑋", score: 54 },
    { id: "B11356035", name: "陳嘉錡", score: 47 },
    { id: "B11356004", name: "蔡秉澄", score: 49 },
    { id: "B11356036", name: "鄭文傑", score: 46 },
    { id: "B11356005", name: "廖右程", score: 55 },
    { id: "B11356038", name: "林政宏", score: 84 },
    { id: "B11356006", name: "許永誠", score: 54 },
    { id: "B11356039", name: "蔡乃如", score: 72 },
    { id: "B11356007", name: "張芯語", score: 57 },
    { id: "B11356040", name: "蔡翌佳", score: 84 },
    { id: "B11356008", name: "葉承杰", score: 75 },
    { id: "B11356041", name: "黃昱琦", score: 66 },
    { id: "B11356009", name: "楊可彤", score: 48 },
    { id: "B11356042", name: "張彥彬", score: 46 },
    { id: "B11356010", name: "張 喬", score: 84 },
    { id: "B11356043", name: "鄭安廷", score: 37 },
    { id: "B11356011", name: "林俊宇", score: 30 },
    { id: "B11356045", name: "萬宗訓", score: 56 },
    { id: "B11356012", name: "盧慧敏", score: 48 },
    { id: "B11356046", name: "王乙臻", score: 32 },
    { id: "B11356014", name: "吳韋臻", score: 67 },
    { id: "B11356047", name: "朱育宏", score: 76 },
    { id: "B11356015", name: "陳駿宏", score: 0 },
    { id: "B11356048", name: "胡冠軒", score: 63 },
    { id: "B11356016", name: "歐陽品臻", score: 80 },
    { id: "B11356049", name: "宋妮潔", score: 55 },
    { id: "B11356017", name: "蘇韻蓉", score: 90 },
    { id: "B11356050", name: "陳志宇", score: 59 },
    { id: "B11356019", name: "林湘庭", score: 51 },
    { id: "B11356051", name: "陳品婕", score: 70 },
    { id: "B11356020", name: "張佩芩", score: 72 },
    { id: "B11356052", name: "王佑程", score: 51 },
    { id: "B11356021", name: "熊婉其", score: 58 },
    { id: "B11356053", name: "陳錦楓", score: 47 },
    { id: "B11356022", name: "洪偉強", score: 49 },
    { id: "B11356054", name: "張惠淨", score: 79 },
    { id: "B11356023", name: "鄭惠心", score: 44 },
    { id: "B11356057", name: "紀曼臻", score: 60 },
    { id: "B11356024", name: "陳長岳", score: 38 },
    { id: "B11356058", name: "王又正", score: 83 },
    { id: "B11356025", name: "余旻恩", score: 74 },
    { id: "B11356059", name: "陳佳榮", score: 55 },
    { id: "B11356026", name: "歐丞儒", score: 82 },
    { id: "B11356027", name: "李宗穎", score: 68 },
    { id: "B11356060", name: "陳思宇", score: 84 },
    { id: "B11356028", name: "張君愷", score: 64 },
    { id: "B11356029", name: "陳俊瑋", score: 71 },
    { id: "B11356030", name: "黃亭瑜", score: 64 },
  ];

  const filteredResults = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return [];
    
    // 改為精確匹配：只有輸入完整學號(9碼)或完整姓名才顯示
    return studentData.filter(student => 
      student.id.toLowerCase() === term || 
      student.name === searchTerm.trim()
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex flex-col items-center">
      {/* Header */}
      <div className="w-full max-w-2xl mb-8 text-center">
        <div className="inline-flex p-3 bg-indigo-600 rounded-2xl mb-4 shadow-lg shadow-indigo-200">
          <GraduationCap className="text-white w-8 h-8" />
        </div>
        <h1 className="text-3xl font-bold text-slate-800">114-1 資料結構</h1>
        <p className="text-slate-500 mt-2 text-lg">期末考試成績查詢系統</p>
      </div>

      {/* Search Input */}
      <div className="w-full max-w-md relative group mb-6">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="請輸入完整 9 碼學號或姓名..."
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all text-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Info Tip */}
      <div className="w-full max-w-md flex items-start gap-2 px-4 mb-8 text-slate-400">
        <Info size={16} className="mt-0.5 shrink-0" />
        <p className="text-xs">
          為保護隱私，系統僅在輸入<b>完整 9 碼學號</b>或<b>精確姓名</b>後才會顯示分數。
        </p>
      </div>

      {/* Results Section */}
      <div className="w-full max-w-md space-y-4">
        {searchTerm.trim() === '' ? (
          <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            <p className="text-sm">請輸入資料開始查詢</p>
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((student) => (
            <div 
              key={student.id} 
              className="bg-white p-6 rounded-3xl shadow-md border border-slate-100 transform transition-all animate-in zoom-in duration-300"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <div className="flex items-center gap-2 text-slate-500 mb-1">
                    <User size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">姓名</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-800">{student.name}</h2>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-2 text-slate-500 mb-1">
                    <Hash size={14} />
                    <span className="text-xs font-semibold uppercase tracking-wider">學號</span>
                  </div>
                  <p className="text-sm font-mono text-slate-600 bg-slate-100 px-2 py-1 rounded-lg inline-block">
                    {student.id}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500 text-sm font-medium block">期末考試總分</span>
                  <span className="text-xs text-slate-400">114-1 學期課程</span>
                </div>
                <div className="text-center">
                  <span className={`text-5xl font-black ${
                    student.score >= 60 ? 'text-emerald-500' : 'text-rose-500'
                  }`}>
                    {student.score}
                  </span>
                  <p className={`text-[10px] font-bold mt-1 uppercase tracking-tighter ${
                    student.score >= 60 ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {student.score >= 60 ? 'Passed' : 'Failed'}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          /* 當輸入滿一定長度但找不到資料時才顯示錯誤，避免輸入途中一直跳錯誤 */
          (searchTerm.trim().length >= 3) && (
            <div className="bg-white p-8 rounded-3xl border border-slate-100 text-center animate-in fade-in slide-in-from-top-4 duration-300">
              <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 font-medium">找不到相符的資料</p>
              <p className="text-slate-400 text-sm mt-1">請確認是否輸入了完整的 9 碼學號</p>
            </div>
          )
        )}
      </div>

      {/* Footer Info */}
      <footer className="mt-auto py-8 text-slate-400 text-xs text-center">
        <p>© 114-1 資料結構期末成績查詢系統</p>
        <p className="mt-1 opacity-50">查詢狀態：{filteredResults.length > 0 ? '已找到結果' : '等待完整輸入'}</p>
      </footer>
    </div>
  );
};

export default App;