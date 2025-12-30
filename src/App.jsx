import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, Hash, GraduationCap, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 自動注入 Tailwind CDN (確保即使 index.css 是空的也能顯示樣式)
  useEffect(() => {
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }
  }, []);

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
    { id: "B11356053", name: "陳錦楓", score: 47 },
    { id: "B11356022", name: "洪偉強", score: 49 },
    { id: "B11356054", name: "張惠淨", score: 79 },
    { id: "B11356023", name: "鄭惠心", score: 44 },
    { id: "B11356057", name: "紀曼臻", score: 60 },
    { id: "B11356024", name: "陳長岳", score: 38 },
    { id: "B11356058", name: "王又正", score: 83 },
    { id: "B11356059", name: "陳佳榮", score: 55 },
    { id: "B11356026", name: "歐丞儒", score: 82 },
    { id: "B11356027", name: "李宗穎", score: 68 },
    { id: "B11356060", name: "陳思宇", score: 84 },
    { id: "B11356028", name: "張君愷", score: 64 },
    { id: "B11356029", name: "陳俊瑋", score: 71 },
    { id: "B11356030", name: "黃亭瑜", score: 64 },
  ];

  const filteredResults = useMemo(() => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return [];
    
    // 精確匹配：學號 9 碼或姓名完全符合
    return studentData.filter(student => 
      student.id.toUpperCase() === term || 
      student.name === searchTerm.trim()
    );
  }, [searchTerm]);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'sans-serif' }}>
      
      {/* 標題區 */}
      <div className="w-full max-w-md text-center mb-8">
        <div className="inline-flex p-4 bg-blue-600 rounded-3xl mb-4 shadow-xl shadow-blue-100">
          <GraduationCap className="text-white w-10 h-10" />
        </div>
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">成績查詢系統</h1>
        <p className="text-slate-500 mt-2 font-medium">114-1 資料結構期末考</p>
      </div>

      {/* 搜尋框 */}
      <div className="w-full max-w-md relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-400">
          <Search size={22} />
        </div>
        <input
          type="text"
          placeholder="輸入完整 9 碼學號或姓名"
          className="w-full pl-14 pr-6 py-5 bg-white border-2 border-slate-100 rounded-3xl shadow-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:outline-none transition-all text-lg font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="w-full max-w-md flex items-center gap-2 px-2 mb-8 text-slate-400">
        <Info size={14} />
        <p className="text-[11px] font-medium tracking-wide uppercase">請輸入完整資訊以確保隱私安全</p>
      </div>

      {/* 結果顯示區 */}
      <div className="w-full max-w-md">
        {searchTerm.trim() === '' ? (
          <div className="bg-white/50 border-2 border-dashed border-slate-200 rounded-[2.5rem] p-12 text-center">
            <p className="text-slate-400 font-medium">請輸入學號或姓名查詢分數</p>
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((student) => (
            <div 
              key={student.id} 
              className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-blue-900/5 border border-slate-50 animate-in fade-in zoom-in duration-500"
            >
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mb-1 block">Student Name</span>
                  <h2 className="text-3xl font-bold text-slate-800">{student.name}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-1 block">Student ID</span>
                  <div className="bg-slate-100 px-3 py-1 rounded-full text-sm font-mono font-bold text-slate-600">
                    {student.id}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-white rounded-3xl p-8 border border-slate-100">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-700">期末考總分</h3>
                    <div className="flex items-center gap-1.5 mt-1 text-emerald-600 font-bold text-xs uppercase">
                      <CheckCircle2 size={12} />
                      Verified Result
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-6xl font-black italic tracking-tighter ${
                      student.score >= 60 ? 'text-blue-600' : 'text-rose-500'
                    }`}>
                      {student.score}
                    </span>
                  </div>
                </div>
                {/* 背景裝飾數字 */}
                <div className="absolute -right-4 -bottom-8 text-9xl font-black text-slate-100/50 select-none pointer-events-none">
                  {student.score}
                </div>
              </div>

              <button 
                onClick={() => setSearchTerm('')}
                className="w-full mt-6 py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-200"
              >
                關閉結果
              </button>
            </div>
          ))
        ) : (
          searchTerm.length >= 3 && (
            <div className="bg-white rounded-[2.5rem] p-10 text-center border-2 border-slate-50 shadow-sm animate-in slide-in-from-bottom-4 duration-300">
              <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-800">未找到相符資料</h3>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                請確認是否輸入了完整的 9 碼學號<br/>或正確的姓名格式。
              </p>
            </div>
          )
        )}
      </div>

      <footer className="mt-auto pt-12 text-slate-300 text-[10px] font-bold tracking-[0.3em] uppercase">
        Data Structure 2025
      </footer>
    </div>
  );
};

export default App;
