import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, Hash, GraduationCap, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // 強制注入樣式：這段邏輯會確保 Tailwind CDN 與基礎重置樣式直接寫入 HTML Head
  useEffect(() => {
    // 1. 注入 Tailwind CDN 腳本
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    // 2. 注入基礎樣式（確保在 CDN 載入前不會有奇怪的邊距）
    if (!document.getElementById('base-styles')) {
      const style = document.createElement('style');
      style.id = 'base-styles';
      style.innerHTML = `
        body { margin: 0; background-color: #f8fafc; font-family: sans-serif; }
        * { box-sizing: border-box; }
      `;
      document.head.appendChild(style);
    }
  }, []);

  const studentData = [
    { id: "B11111025", name: "洪昕妤", score: 86 },
    { id: "B11356031", name: "蕭睿騰", score: 40 },
    { id: "B11356001", name: "施景維", score: 63 },
    { id: "B11356032", name: "王育騰", score: 49 },
    { id: "B11356002", name: "鍾昀璋", score: 54 },
    { id: "B11356033", name: "林永富", score: 38 },
    { id: "B11356035", name: "陳嘉錡", score: 47 },
    { id: "B11356036", name: "鄭文傑", score: 46 },
    { id: "B11356038", name: "林政宏", score: 84 },
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
    
    return studentData.filter(student => 
      student.id.toUpperCase() === term || 
      student.name === searchTerm.trim()
    );
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 flex flex-col items-center antialiased">
      {/* 標題與裝飾 */}
      <div className="w-full max-w-md text-center mb-10">
        <div className="inline-flex p-4 bg-indigo-600 rounded-3xl mb-5 shadow-2xl shadow-indigo-200 transform hover:rotate-6 transition-transform">
          <GraduationCap className="text-white w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">成績查詢</h1>
        <p className="text-slate-500 mt-2 font-semibold tracking-wide">114-1 資料結構期末考試</p>
      </div>

      {/* 搜尋組件 */}
      <div className="w-full max-w-md relative mb-3">
        <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-indigo-500">
          <Search size={24} strokeWidth={2.5} />
        </div>
        <input
          type="text"
          placeholder="請輸入 9 碼學號或完整姓名"
          className="w-full pl-16 pr-6 py-6 bg-white border-0 rounded-[2rem] shadow-xl shadow-slate-200/50 focus:ring-4 focus:ring-indigo-500/10 focus:outline-none transition-all text-xl font-bold text-slate-700 placeholder:text-slate-300 placeholder:font-medium"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="w-full max-w-md flex items-center gap-2 px-6 mb-10 text-slate-400">
        <Info size={14} className="text-indigo-400" />
        <p className="text-[11px] font-bold tracking-widest uppercase">系統已啟動隱私保護模式</p>
      </div>

      {/* 結果內容 */}
      <div className="w-full max-w-md">
        {searchTerm.trim() === '' ? (
          <div className="bg-white/40 border-4 border-dashed border-slate-200 rounded-[3rem] p-16 text-center">
            <div className="mb-4 inline-block p-4 bg-slate-100 rounded-full text-slate-300">
              <Hash size={32} />
            </div>
            <p className="text-slate-400 font-bold text-lg">等待輸入資料</p>
          </div>
        ) : filteredResults.length > 0 ? (
          filteredResults.map((student) => (
            <div 
              key={student.id} 
              className="bg-white rounded-[3rem] p-10 shadow-2xl shadow-indigo-900/10 border border-slate-100 transform transition-all animate-in fade-in slide-in-from-bottom-8 duration-700"
            >
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[11px] font-black text-indigo-500 uppercase tracking-[0.3em] mb-2 block">Student</span>
                  <h2 className="text-4xl font-black text-slate-800 tracking-tighter">{student.name}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em] mb-2 block">Identification</span>
                  <div className="bg-indigo-50 px-4 py-2 rounded-2xl text-sm font-mono font-black text-indigo-600">
                    {student.id}
                  </div>
                </div>
              </div>

              <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-10 text-white shadow-lg">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-300">期末考分數</h3>
                    <div className="flex items-center gap-2 mt-2 text-indigo-400 font-black text-xs uppercase tracking-widest">
                      <CheckCircle2 size={14} />
                      Academic Verified
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-7xl font-black tracking-tighter ${
                      student.score >= 60 ? 'text-indigo-400' : 'text-rose-400'
                    }`}>
                      {student.score}
                    </span>
                  </div>
                </div>
                {/* 裝飾背影 */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              </div>

              <button 
                onClick={() => setSearchTerm('')}
                className="w-full mt-8 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase tracking-widest hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"
              >
                Clear Search
              </button>
            </div>
          ))
        ) : (
          searchTerm.length >= 2 && (
            <div className="bg-white rounded-[3rem] p-12 text-center border border-slate-100 shadow-xl animate-in fade-in duration-300">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <AlertCircle size={40} strokeWidth={2.5} />
              </div>
              <h3 className="text-2xl font-black text-slate-800">查無此學生</h3>
              <p className="text-slate-400 mt-3 font-medium text-sm leading-relaxed px-4">
                請確認您輸入的是正確的 <span className="text-indigo-500 font-bold">9 碼學號</span><br/>或是完整的姓名資料。
              </p>
            </div>
          )
        )}
      </div>

      <footer className="mt-auto pt-16 text-slate-300 text-[11px] font-black tracking-[0.4em] uppercase">
        Computer Science Department
      </footer>
    </div>
  );
};

export default App;
