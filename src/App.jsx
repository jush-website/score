import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, AlertCircle, Info, CheckCircle2, Loader2, BookOpen, Cpu, RefreshCw, XCircle, ShieldAlert } from 'lucide-react';

// 使用您提供的確定可用的 API 網址
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbzTUO_rRZh6fRz95M4zc7ewk0lmfPbyAVezsVKIKbQbXJBPoGHnZc4JnGmbCkRM2l7d/exec";

const App = () => {
  const [subject, setSubject] = useState('資料結構'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [allData, setAllData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null); 
  const [retryCount, setRetryCount] = useState(0);

  // 自動注入 Viewport，解決手機縮放問題
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
      document.head.appendChild(meta);
    }
  }, []);

  // 抓取資料函式 (針對跨網域請求優化)
  const fetchData = async (targetSubject, attempt = 0) => {
    if (attempt === 0) {
      setLoading(true);
      setError(null);
    }

    try {
      // 構建乾淨的請求 URL
      const url = `${API_BASE_URL}?subject=${encodeURIComponent(targetSubject)}&t=${Date.now()}`;
      
      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors', // 強制使用 CORS 模式
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`伺服器回應錯誤 (${response.status})`);
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllData(data);
        setError(null);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        setAllData([]);
      }
      
      setLoading(false);
      setRetryCount(0);
    } catch (err) {
      console.error(`Fetch error (Attempt ${attempt + 1}):`, err);
      
      // 如果是 Failed to fetch，通常是 CORS 或者是 GAS 部署設定問題
      if (err.message === 'Failed to fetch') {
        setError("連線被瀏覽器攔截 (CORS Error)。請確認 Google Apps Script 部署時的『誰可以存取』已設定為『所有人 (Anyone)』，而不僅是您的帳號。");
        setLoading(false);
        return;
      }

      const maxRetries = 2;
      if (attempt < maxRetries) {
        setRetryCount(attempt + 1);
        const delay = (attempt + 1) * 2000;
        setTimeout(() => fetchData(targetSubject, attempt + 1), delay);
      } else {
        setError("連線逾時或不穩定。請檢查網路連線後點選下方的重新整理按鈕。");
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData(subject);
  }, [subject]);

  // 搜尋比對
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
    <div className="app-main">
      <style>{`
        .app-main {
          min-height: 100vh;
          background-color: #f1f5f9;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 24px 16px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          box-sizing: border-box;
          color: #1e293b;
        }
        .header-section { text-align: center; margin-bottom: 24px; width: 100%; }
        .brand-icon {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          width: 56px; height: 56px; border-radius: 18px; display: flex;
          align-items: center; justify-content: center; margin: 0 auto 16px;
          box-shadow: 0 10px 15px -3px rgba(79, 70, 229, 0.3);
        }
        .subject-nav {
          display: flex; background: #e2e8f0; padding: 4px;
          border-radius: 16px; margin-bottom: 24px; width: 100%; max-width: 360px;
        }
        .nav-btn {
          flex: 1; padding: 12px 8px; border: none; border-radius: 12px;
          font-weight: 700; cursor: pointer; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
          background: transparent; color: #64748b; font-size: 14px;
        }
        .nav-btn.active {
          background: white; color: #4f46e5; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }
        .search-area { width: 100%; max-width: 360px; position: relative; margin-bottom: 8px; }
        .search-field {
          width: 100%; padding: 16px 16px 16px 52px; border-radius: 16px;
          border: 2px solid transparent; background: white;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          font-size: 16px; font-weight: 600; outline: none; transition: all 0.2s;
          box-sizing: border-box;
        }
        .search-field:focus { border-color: #4f46e5; }
        .search-icon-pos { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #4f46e5; }
        
        .result-card {
          width: 100%; max-width: 360px; background: white; margin-top: 20px;
          border-radius: 24px; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
          animation: popIn 0.3s ease-out;
        }
        @keyframes popIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        
        .score-panel {
          background: #0f172a; color: white; border-radius: 20px;
          padding: 20px; display: flex; justify-content: space-between; align-items: center;
          margin-top: 20px; position: relative; overflow: hidden;
        }
        .score-text { font-size: 48px; font-weight: 900; line-height: 1; }
        .loading-state { margin-top: 60px; text-align: center; color: #4f46e5; }
        .spin-anim { animation: rotate 1s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 480px) {
          .app-main { padding: 16px 12px; }
          .search-field { font-size: 16px; }
        }
      `}</style>

      {/* 頁面標題 */}
      <div className="header-section">
        <div className="brand-icon">
          <GraduationCap color="white" size={28} />
        </div>
        <h1 style={{fontSize: '22px', fontWeight: 800, margin: '0 0 4px 0'}}>成績即時查詢</h1>
        <p style={{color: '#94a3b8', fontSize: '10px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase'}}>Direct API Connection</p>
      </div>

      {/* 科目切換器 */}
      <div className="subject-nav">
        <button className={`nav-btn ${subject === '資料結構' ? 'active' : ''}`} onClick={() => setSubject('資料結構')}>
          <BookOpen size={16} /> 資料結構
        </button>
        <button className={`nav-btn ${subject === '物聯網' ? 'active' : ''}`} onClick={() => setSubject('物聯網')}>
          <Cpu size={16} /> 物聯網
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="spin-anim" size={36} />
          <p style={{marginTop: '12px', fontWeight: 700, fontSize: '14px'}}>
            連線至 Google 試算表...
            {retryCount > 0 && <span style={{display: 'block', fontSize: '11px', opacity: 0.6, marginTop: '4px'}}>嘗試重新連線 ({retryCount})</span>}
          </p>
        </div>
      ) : error ? (
        <div className="result-card" style={{border: '1px solid #fee2e2', textAlign: 'center'}}>
          <ShieldAlert size={40} color="#ef4444" style={{margin: '0 auto 12px'}} />
          <h3 style={{margin: '0 0 8px 0', fontSize: '18px'}}>連線異常</h3>
          <p style={{color: '#991b1b', fontWeight: 600, fontSize: '13px', lineHeight: '1.6'}}>{error}</p>
          <button 
            onClick={() => fetchData(subject)} 
            style={{marginTop: '20px', width: '100%', padding: '12px', backgroundColor: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}}
          >
            <RefreshCw size={16} /> 點擊重新載入
          </button>
        </div>
      ) : (
        <>
          <div className="search-area">
            <Search className="search-icon-pos" size={20} strokeWidth={2.5} />
            <input
              className="search-field"
              type="text"
              placeholder={`輸入${subject}學號或姓名`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{width: '100%', maxWidth: '360px', display: 'flex', gap: '6px', padding: '8px 8px', color: '#94a3b8'}}>
            <Info size={14} style={{flexShrink: 0, marginTop: '1px'}} />
            <p style={{fontSize: '11px', fontWeight: 600, margin: 0}}>請輸入完整學號或姓名。資料為加密同步之雲端結果。</p>
          </div>

          {/* 結果顯示 */}
          {searchTerm.trim() !== '' && (
            queryResult ? (
              <div className="result-card">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px'}}>
                  <div>
                    <span style={{fontSize: '9px', fontWeight: 800, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '1px'}}>Student Name</span>
                    <h2 style={{fontSize: '24px', fontWeight: 900, margin: '2px 0 0 0'}}>{queryResult.姓名 || queryResult.name}</h2>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <span style={{fontSize: '9px', fontWeight: 800, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '1px'}}>ID</span>
                    <div style={{background: '#f1f5f9', padding: '3px 8px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, color: '#475569', marginTop: '4px'}}>
                      {queryResult.學號 || queryResult.studentId}
                    </div>
                  </div>
                </div>

                <div className="score-panel">
                  <div>
                    <h3 style={{fontSize: '13px', fontWeight: 700, margin: 0, color: '#94a3b8'}}>{subject} 成績</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', fontSize: '9px', fontWeight: 800, marginTop: '6px'}}>
                      <CheckCircle2 size={12} /> VERIFIED DATA
                    </div>
                  </div>
                  <div className="score-text" style={{color: (queryResult.分數 || queryResult.score) >= 60 ? '#818cf8' : '#fb7185'}}>
                    {queryResult.分數 || queryResult.score}
                  </div>
                </div>
                
                <button onClick={() => setSearchTerm('')} style={{width: '100%', marginTop: '16px', border: 'none', background: '#f8fafc', padding: '10px', borderRadius: '12px', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '12px'}}>清除結果</button>
              </div>
            ) : (
              searchTerm.length >= 2 && (
                <div className="result-card" style={{textAlign: 'center', padding: '40px 20px'}}>
                  <AlertCircle size={36} color="#e2e8f0" style={{margin: '0 auto 12px'}} />
                  <h3 style={{fontSize: '16px', fontWeight: 800, margin: 0}}>查無此資料</h3>
                  <p style={{color: '#94a3b8', fontSize: '12px', marginTop: '6px'}}>請確認科目是否選對，並輸入完整學號。</p>
                </div>
              )
            )
          )}
        </>
      )}

      <footer style={{marginTop: 'auto', paddingTop: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: '#cbd5e1'}}>
        <RefreshCw size={10} className={loading ? 'spin-anim' : ''} />
        <span style={{fontSize: '8px', fontWeight: 800, letterSpacing: '2px', textTransform: 'uppercase'}}>
          Cloud Connection Status: {loading ? 'Syncing...' : 'Active'}
        </span>
      </footer>
    </div>
  );
};

export default App;
