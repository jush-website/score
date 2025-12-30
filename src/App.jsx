import React, { useState, useMemo, useEffect } from 'react';
import { Search, User, Hash, GraduationCap, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

// 從 PDF 提取的學生成績資料
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
    { id: "B11356015", name: "陳駿宏", score: "需補考" },
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

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // 1. 強制注入 Viewport Meta - 這是解決手機顯示問題的關鍵
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
      document.head.appendChild(meta);
    }

    // 2. 注入 Tailwind CDN - 確保即便沒有 index.css 也能運作
    if (!document.getElementById('tailwind-cdn')) {
      const script = document.createElement('script');
      script.id = 'tailwind-cdn';
      script.src = 'https://cdn.tailwindcss.com';
      document.head.appendChild(script);
    }

    // 3. 注入基本樣式重置 - 防止手機版預設樣式干擾
    const styleId = 'global-fix-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: sans-serif; -webkit-tap-highlight-color: transparent; }
        input { font-size: 16px !important; } /* iOS 防止輸入時放大縮小 */
      `;
      document.head.appendChild(style);
    }
  }, []);

  // 查詢邏輯：精確匹配 9 碼或姓名
  const result = useMemo(() => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return null;
    return studentData.find(s => s.id.toUpperCase() === term || s.name === searchTerm.trim());
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center p-6 sm:p-12 antialiased">
      {/* 標題區域 */}
      <div className="w-full max-w-md text-center mt-4 mb-10">
        <div className="inline-flex p-4 bg-indigo-600 rounded-[2rem] shadow-2xl shadow-indigo-100 mb-6 transform rotate-3 hover:rotate-0 transition-transform">
          <GraduationCap className="text-white w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">成績查詢系統</h1>
        <p className="text-slate-500 mt-2 font-bold tracking-widest text-xs uppercase">114-1 Data Structure Final</p>
      </div>

      {/* 搜尋組件 */}
      <div className="w-full max-w-md space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none text-indigo-500">
            <Search size={22} strokeWidth={3} />
          </div>
          <input
            type="text"
            placeholder="請輸入完整 9 碼學號或姓名"
            className="w-full pl-16 pr-6 py-5 bg-white border-none rounded-[1.5rem] shadow-xl shadow-slate-200/60 focus:ring-4 focus:ring-indigo-500/10 transition-all text-lg font-bold text-slate-800 placeholder:text-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2 px-6 text-slate-400">
          <Info size={14} className="text-indigo-400" />
          <p className="text-[10px] font-black uppercase tracking-widest">系統僅顯示完全匹配之結果</p>
        </div>

        {/* 結果卡片 */}
        <div className="mt-8">
          {!searchTerm.trim() ? (
            <div className="bg-white/40 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
              <p className="text-slate-400 font-bold text-sm">請輸入學號進行查詢</p>
            </div>
          ) : result ? (
            <div className="bg-white rounded-[2.5rem] p-8 shadow-2xl shadow-indigo-900/10 border border-slate-100 animate-in fade-in zoom-in duration-500">
              <div className="flex justify-between items-start mb-10">
                <div>
                  <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-1 block">Identification</span>
                  <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{result.name}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 block">Student ID</span>
                  <div className="bg-slate-50 px-3 py-1 rounded-xl text-sm font-mono font-bold text-slate-500 border border-slate-100">
                    {result.id}
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-400">期末考試成績</h3>
                    <div className="flex items-center gap-1.5 mt-2 text-indigo-400 font-black text-[10px] uppercase tracking-widest">
                      <CheckCircle2 size={12} />
                      Academic Pass
                    </div>
                  </div>
                  <div className={`text-6xl font-black italic tracking-tighter ${result.score >= 60 ? 'text-indigo-400' : 'text-rose-400'}`}>
                    {result.score}
                  </div>
                </div>
                {/* 裝飾背景數字 */}
                <div className="absolute -right-6 -bottom-10 text-[10rem] font-black text-white/5 select-none pointer-events-none italic">
                  {result.score}
                </div>
              </div>
            </div>
          ) : (
            searchTerm.length >= 2 && (
              <div className="bg-white rounded-[2rem] p-10 text-center border border-slate-100 shadow-xl animate-in fade-in duration-300">
                <AlertCircle size={48} className="mx-auto text-rose-100 mb-4" strokeWidth={2.5} />
                <h3 className="text-xl font-black text-slate-800">未找到相符資料</h3>
                <p className="text-slate-400 mt-2 text-xs font-bold leading-relaxed">
                  請確認輸入的是完整 <span className="text-indigo-500">9 碼學號</span><br/>或是正確的姓名
                </p>
              </div>
            )
          )}
        </div>
      </div>

      <footer className="mt-auto pt-16 text-slate-300 text-[10px] font-black tracking-[0.4em] uppercase">
        © 2025 Computer Science
      </footer>
    </div>
  );
};

export default App;
