import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, AlertCircle, Info, CheckCircle2, Loader2, BookOpen, Cpu, RefreshCw, ShieldAlert, ExternalLink, Globe } from 'lucide-react';

// Google Apps Script API 網址 - 確保此網址正確無誤
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbzTUO_rRZh6fRz95M4zc7ewk0lmfPbyAVezsVKIKbQbXJBPoGHnZc4JnGmbCkRM2l7d/exec";

const App = () => {
  const [subject, setSubject] = useState('資料結構'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [allData, setAllData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  // 初始化 Viewport
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
      document.head.appendChild(meta);
    }
  }, []);

  // 抓取資料函式 - Vercel 環境優化版
  const fetchData = async (targetSubject) => {
    setLoading(true);
    setError(null);
    setAllData([]);

    try {
      // 構建帶有參數的 URL，不添加自訂 Header 以確保為「簡單請求 (Simple Request)」
      const url = `${API_BASE_URL}?subject=${encodeURIComponent(targetSubject)}`;
      
      console.log(`[Vercel Sync] 正在連線: ${url}`);

      // 在 Vercel 環境下，最保險的做法是使用最少參數的 fetch
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`伺服器回傳狀態碼: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllData(data);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("回傳資料格式異常。");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("Fetch 失敗原因:", err);
      
      // 針對 Failed to fetch 提供具體排錯指引
      if (err.message === 'Failed to fetch') {
        setError("瀏覽器安全性限制 (CORS)。這通常發生在 API 權限未完全開放、或是 Google 帳號登入衝突。");
      } else {
        setError(err.message);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(subject);
  }, [subject]);

  const queryResult = useMemo(() => {
    const term = searchTerm.trim().toUpperCase();
    if (!term || allData.length === 0) return null;
    
    return allData.find(s => {
      const sId = (s.學號 || s.studentId || s.ID || "").toString().toUpperCase();
      const sName = (s.姓名 || s.name || s.Name || "").toString();
      return sId === term || sName === searchTerm.trim();
    });
  }, [searchTerm, allData]);

  return (
    <div className="app-container">
      <style>{`
        .app-container {
          min-height: 100vh;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Microsoft JhengHei", sans-serif;
          box-sizing: border-box;
          color: #1e293b;
        }
        .app-header { text-align: center; margin-bottom: 25px; width: 100%; }
        .logo-ring {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          width: 56px; height: 56px; border-radius: 18px; display: flex; 
          align-items: center; justify-content: center; margin: 0 auto 16px;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }
        .tab-switcher {
          display: flex; background: #e2e8f0; padding: 4px;
          border-radius: 14px; margin-bottom: 24px; width: 100%; max-width: 380px;
        }
        .tab-item {
          flex: 1; padding: 12px; border: none; border-radius: 10px;
          font-weight: 700; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: transparent; color: #64748b; font-size: 14px;
        }
        .tab-item.active { background: white; color: #4f46e5; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .search-box { width: 100%; max-width: 380px; position: relative; }
        .search-input {
          width: 100%; padding: 16px 16px 16px 52px; border-radius: 18px;
          border: 2px solid #e2e8f0; background: white; font-size: 16px;
          font-weight: 600; outline: none; transition: 0.2s; box-sizing: border-box;
          -webkit-appearance: none;
        }
        .search-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
        .search-icon { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #4f46e5; }
        
        .result-card {
          width: 100%; max-width: 380px; background: white; margin-top: 20px;
          border-radius: 28px; padding: 28px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          animation: slideIn 0.4s ease-out;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        
        .score-box {
          background: #0f172a; color: white; border-radius: 20px;
          padding: 20px; display: flex; justify-content: space-between; align-items: center;
          margin-top: 20px; position: relative; overflow: hidden;
        }
        .score-num { font-size: 48px; font-weight: 900; line-height: 1; color: #818cf8; }
        .loader { margin-top: 60px; text-align: center; color: #4f46e5; }
        .spin { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .vercel-badge {
          margin-top: 15px; font-size: 10px; background: #000; color: #fff;
          padding: 4px 10px; border-radius: 20px; font-weight: 800; display: inline-flex;
          align-items: center; gap: 5px; opacity: 0.8;
        }
        @media (max-width: 480px) {
          .app-container { padding: 20px 15px; }
          .search-input { font-size: 16px; }
        }
      `}</style>

      {/* 頁面標題 */}
      <div className="app-header">
        <div className="logo-ring">
          <GraduationCap color="white" size={32} />
        </div>
        <h1 style={{fontSize: '24px', fontWeight: 800, margin: 0}}>成績即時查詢</h1>
        <div className="vercel-badge">
          <Globe size={10} /> DEPLOYED ON VERCEL
        </div>
      </div>

      {/* 科目切換器 */}
      <div className="tab-switcher">
        <button className={`tab-item ${subject === '資料結構' ? 'active' : ''}`} onClick={() => setSubject('資料結構')}>
          <BookOpen size={16} /> 資料結構
        </button>
        <button className={`tab-item ${subject === '物聯網' ? 'active' : ''}`} onClick={() => setSubject('物聯網')}>
          <Cpu size={16} /> 物聯網
        </button>
      </div>

      {loading ? (
        <div className="loader">
          <Loader2 className="spin" size={40} />
          <p style={{marginTop: '15px', fontWeight: 700}}>正在從 Google 雲端同步...</p>
        </div>
      ) : error ? (
        <div className="result-card" style={{border: '1px solid #fee2e2', textAlign: 'center'}}>
          <ShieldAlert size={40} color="#ef4444" style={{margin: '0 auto 12px'}} />
          <h3 style={{color: '#991b1b', margin: '0 0 10px 0'}}>連線異常</h3>
          <p style={{fontSize: '13px', color: '#7f1d1d', lineHeight: '1.6'}}>{error}</p>
          <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <button onClick={() => fetchData(subject)} style={{padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}>
              <RefreshCw size={16} /> 重新嘗試連線
            </button>
            <a href={API_BASE_URL + "?subject=資料結構"} target="_blank" rel="noreferrer" style={{fontSize: '11px', color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
               <ExternalLink size={12} /> 手動開啟 API 網址診斷
            </a>
          </div>
          <p style={{fontSize: '10px', color: '#94a3b8', marginTop: '15px'}}>提示：若手動開啟後要求登入，請將 GAS 權限改為「所有人 (Anyone)」。</p>
        </div>
      ) : (
        <>
          {/* 搜尋區域 */}
          <div className="search-box">
            <Search className="search-icon" size={20} strokeWidth={2.5} />
            <input
              className="search-input"
              type="text"
              placeholder={`輸入${subject}學號或姓名`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{width: '100%', maxWidth: '380px', display: 'flex', gap: '6px', padding: '10px 8px', color: '#94a3b8'}}>
            <Info size={14} style={{flexShrink: 0, marginTop: '1px'}} />
            <p style={{fontSize: '11px', fontWeight: 600, margin: 0}}>請輸入完整學號或姓名。Vercel 正透過安全加密連線抓取資料。</p>
          </div>

          {/* 結果卡片 */}
          {searchTerm.trim() !== '' && (
            queryResult ? (
              <div className="result-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <span style={{fontSize: '10px', color: '#4f46e5', fontWeight: 800, letterSpacing: '1px'}}>STUDENT</span>
                    <h2 style={{fontSize: '28px', fontWeight: 900, margin: '2px 0 0 0'}}>{queryResult.姓名 || queryResult.name}</h2>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <span style={{fontSize: '10px', color: '#94a3b8', fontWeight: 800}}>ID</span>
                    <div style={{background: '#f1f5f9', padding: '4px 8px', borderRadius: '8px', fontSize: '13px', fontWeight: 700, color: '#475569', marginTop: '4px'}}>{queryResult.學號 || queryResult.studentId}</div>
                  </div>
                </div>

                <div className="score-box">
                  <div>
                    <h3 style={{fontSize: '14px', margin: 0, color: '#94a3b8'}}>{subject} 分數</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', fontSize: '9px', fontWeight: 800, marginTop: '6px'}}>
                      <CheckCircle2 size={12} /> VERIFIED BY CLOUD
                    </div>
                  </div>
                  <div className="score-num" style={{color: (queryResult.分數 || queryResult.score) >= 60 ? '#818cf8' : '#f87171'}}>
                    {queryResult.分數 || queryResult.score}
                  </div>
                </div>
                
                <button onClick={() => setSearchTerm('')} style={{width: '100%', marginTop: '16px', border: 'none', background: '#f8fafc', padding: '10px', borderRadius: '12px', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '12px'}}>清除結果</button>
              </div>
            ) : (
              searchTerm.length >= 2 && (
                <div className="result-card" style={{textAlign: 'center', padding: '40px 20px'}}>
                  <AlertCircle size={36} color="#e2e8f0" style={{margin: '0 auto 12px'}} />
                  <h3 style={{fontSize: '18px', fontWeight: 800, margin: 0}}>查無此資料</h3>
                  <p style={{color: '#94a3b8', fontSize: '12px', marginTop: '6px'}}>請確認分頁與姓名是否完全相符。</p>
                </div>
              )
            )
          )}
        </>
      )}

      <footer style={{marginTop: 'auto', paddingTop: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1'}}>
        <RefreshCw size={10} className={loading ? 'spin' : ''} />
        <span style={{fontSize: '8px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase'}}>
          Live Sync • {loading ? 'Fetching' : 'Active'}
        </span>
      </footer>
    </div>
  );
};

export default App;
