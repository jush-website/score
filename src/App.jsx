import React, { useState, useMemo } from 'react';
import { Search, User, Hash, GraduationCap, AlertCircle, Info, CheckCircle2 } from 'lucide-react';

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');

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

  const result = useMemo(() => {
    const term = searchTerm.trim().toUpperCase();
    if (!term) return null;
    return studentData.find(s => s.id.toUpperCase() === term || s.name === searchTerm.trim());
  }, [searchTerm]);

  return (
    <div className="container">
      {/* 直接注入 CSS 樣式塊 */}
      <style>{`
        .container {
          min-height: 100vh;
          background-color: #f0f2f5;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .icon-box {
          background-color: #4f46e5;
          padding: 15px;
          border-radius: 20px;
          display: inline-flex;
          box-shadow: 0 10px 20px rgba(79, 70, 229, 0.2);
          margin-bottom: 15px;
        }
        .title {
          font-size: 28px;
          font-weight: 900;
          color: #1e293b;
          margin: 0;
        }
        .subtitle {
          color: #64748b;
          margin-top: 5px;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 1px;
        }
        .search-wrapper {
          width: 100%;
          max-width: 400px;
          position: relative;
        }
        .search-input {
          width: 100%;
          padding: 18px 20px 18px 50px;
          border-radius: 18px;
          border: none;
          background: white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          font-size: 16px;
          font-weight: 600;
          outline: none;
          box-sizing: border-box;
        }
        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: #4f46e5;
        }
        .info-text {
          font-size: 11px;
          color: #94a3b8;
          margin-top: 10px;
          text-align: left;
          width: 100%;
          max-width: 400px;
          padding-left: 10px;
        }
        .result-card {
          width: 100%;
          max-width: 400px;
          background: white;
          margin-top: 30px;
          border-radius: 30px;
          padding: 30px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
          animation: slideUp 0.5s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .score-box {
          background: #1e293b;
          color: white;
          border-radius: 20px;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 20px;
        }
        .score-value {
          font-size: 48px;
          font-weight: 900;
          font-style: italic;
        }
        .id-badge {
          background: #f1f5f9;
          padding: 4px 10px;
          border-radius: 10px;
          font-family: monospace;
          font-size: 13px;
          color: #64748b;
        }
        .not-found {
          text-align: center;
          background: white;
          padding: 40px;
          border-radius: 30px;
          margin-top: 30px;
          width: 100%;
          max-width: 400px;
          box-sizing: border-box;
        }
        /* 手機版優化 */
        @media (max-width: 480px) {
          .title { font-size: 24px; }
          .container { padding: 30px 15px; }
        }
      `}</style>

      {/* 標題 */}
      <div className="header">
        <div className="icon-box">
          <GraduationCap color="white" size={32} />
        </div>
        <h1 className="title">成績查詢系統</h1>
        <p className="subtitle">114-1 資料結構期末考</p>
      </div>

      {/* 搜尋 */}
      <div className="search-wrapper">
        <Search className="search-icon" size={20} />
        <input
          className="search-input"
          type="text"
          placeholder="輸入 9 碼學號或完整姓名"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="info-text">
        <Info size={10} style={{marginRight: 4}} />
        請輸入完整資訊以保護隱私
      </div>

      {/* 結果 */}
      {searchTerm.trim() !== '' && (
        result ? (
          <div className="result-card">
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: 20}}>
              <div>
                <div style={{fontSize: 10, fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: 2}}>Student</div>
                <div style={{fontSize: 28, fontWeight: 900, color: '#334155'}}>{result.name}</div>
              </div>
              <div style={{textAlign: 'right'}}>
                <div style={{fontSize: 10, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 2}}>ID Number</div>
                <div className="id-badge">{result.id}</div>
              </div>
            </div>

            <div className="score-box">
              <div>
                <div style={{fontSize: 14, color: '#94a3b8', fontWeight: 600}}>期末考試成績</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 5, color: '#818cf8', fontSize: 10, fontWeight: 800, marginTop: 4}}>
                  <CheckCircle2 size={12} /> VERIFIED
                </div>
              </div>
              <div className="score-value" style={{color: result.score >= 60 ? '#818cf8' : '#f87171'}}>
                {result.score}
              </div>
            </div>
          </div>
        ) : (
          searchTerm.length >= 2 && (
            <div className="not-found">
              <AlertCircle size={40} color="#fecdd3" style={{marginBottom: 15}} />
              <div style={{fontWeight: 800, fontSize: 18, color: '#1e293b'}}>查無資料</div>
              <p style={{fontSize: 13, color: '#94a3b8', marginTop: 8}}>請確認輸入的是完整學號或姓名</p>
            </div>
          )
        )
      )}

      <footer style={{marginTop: 'auto', paddingTop: 40, color: '#cbd5e1', fontSize: 10, fontWeight: 800, letterSpacing: 3}}>
        CS DEPARTMENT 2025
      </footer>
    </div>
  );
};

export default App;
