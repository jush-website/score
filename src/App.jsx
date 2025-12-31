import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, AlertCircle, Info, CheckCircle2, Loader2, BookOpen, Cpu, RefreshCw, ShieldAlert, ExternalLink, Lock, UserX, User, Hash } from 'lucide-react';

// Google Apps Script API 網址
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbzoJC30nR0TgW_t--bs_TXwy54CsadsVjyt-cz5zGjJgAZkBU_8U4ve9QOgDYxGxtVa/exec";

const App = () => {
  const [subject, setSubject] = useState('資料結構'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [allData, setAllData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
      document.head.appendChild(meta);
    }
  }, []);

  const fetchData = async (targetSubject) => {
    setLoading(true);
    setError(null);
    setAllData([]);

    try {
      const url = `${API_BASE_URL}?subject=${encodeURIComponent(targetSubject)}&t=${Date.now()}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`伺服器錯誤: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllData(data);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("回傳資料格式異常");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("API 連線失敗:", err);
      setError("連線失敗。請確認是否已設定權限為『任何人』存取。");
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
      const sId = (s.學號 || s.studentId || "").toString().toUpperCase();
      const sName = (s.姓名 || s.name || "").toString();
      return sId === term || sName === searchTerm.trim();
    });
  }, [searchTerm, allData]);

  return (
    <div className="app-main">
      <style>{`
        .app-main {
          min-height: 100vh;
          background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 32px 20px;
          font-family: -apple-system, system-ui, "SF Pro Display", sans-serif;
          box-sizing: border-box;
          color: #1e293b;
        }
        .header-ui { text-align: center; margin-bottom: 32px; width: 100%; }
        .logo-ui {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          width: 56px; height: 56px; border-radius: 20px; display: flex; 
          align-items: center; justify-content: center; margin: 0 auto 16px;
          box-shadow: 0 12px 24px -8px rgba(79, 70, 229, 0.4);
        }
        .nav-ui {
          display: flex; background: #e2e8f0; padding: 5px;
          border-radius: 16px; margin-bottom: 28px; width: 100%; max-width: 380px;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }
        .nav-btn {
          flex: 1; padding: 12px; border: none; border-radius: 12px;
          font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: transparent; color: #64748b; font-size: 14px;
        }
        .nav-btn.active { 
          background: white; 
          color: #4f46e5; 
          box-shadow: 0 4px 12px -2px rgba(0,0,0,0.08);
          transform: translateY(-1px);
        }
        
        .search-card {
          width: 100%;
          max-width: 380px;
          background: white;
          padding: 8px;
          border-radius: 24px;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.04), 0 8px 10px -6px rgba(0,0,0,0.04);
          position: relative;
          transition: transform 0.3s;
        }
        .search-ui-input {
          width: 100%; 
          padding: 18px 20px 18px 56px; 
          border-radius: 18px;
          border: 2px solid transparent; 
          background: #f8fafc; 
          font-size: 17px;
          font-weight: 600; 
          outline: none; 
          transition: all 0.3s; 
          box-sizing: border-box;
          color: #1e293b;
        }
        .search-ui-input::placeholder { color: #94a3b8; font-weight: 500; }
        .search-ui-input:focus { 
          background: white;
          border-color: #c7d2fe;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08);
        }
        .search-ui-icon { 
          position: absolute; 
          left: 24px; 
          top: 50%; 
          transform: translateY(-50%); 
          color: #6366f1;
          transition: all 0.3s;
        }
        .search-card:focus-within .search-ui-icon {
          transform: translateY(-50%) scale(1.1);
          color: #4f46e5;
        }
        
        .info-tip {
          display: flex; gap: 8px; width: 100%; max-width: 380px;
          margin-top: 14px; padding: 0 12px;
        }
        .info-tip-text { font-size: 12px; color: #94a3b8; font-weight: 500; line-height: 1.4; }

        .card-ui {
          width: 100%; max-width: 380px; background: white; margin-top: 28px;
          border-radius: 28px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08);
          animation: popUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        @keyframes popUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        
        .score-display-box {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
          color: white; border-radius: 20px;
          padding: 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px;
          position: relative; overflow: hidden;
        }
        .score-val-ui { font-size: 48px; font-weight: 900; color: #818cf8; text-shadow: 0 0 20px rgba(129, 140, 248, 0.3); }
        .score-label { font-size: 14px; color: #94a3b8; font-weight: 700; margin: 0; }
        
        .empty-state {
          text-align: center; margin-top: 60px; color: #cbd5e1;
        }
        
        @media (max-width: 480px) {
          .app-main { padding: 24px 16px; }
          .search-ui-input { font-size: 16px; }
        }
      `}</style>

      {/* Header Section */}
      <div className="header-ui">
        <div className="logo-ui"><GraduationCap color="white" size={30} /></div>
        <h1 style={{fontSize: '24px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px'}}>學期成績查詢</h1>
        <p style={{color: '#64748b', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', marginTop: '6px', textTransform: 'uppercase'}}>Academic Portal v4.0</p>
      </div>

      {/* Subject Tabs */}
      <div className="nav-ui">
        <button className={`nav-btn ${subject === '資料結構' ? 'active' : ''}`} onClick={() => setSubject('資料結構')}>
          <BookOpen size={16} /> 資料結構
        </button>
        <button className={`nav-btn ${subject === '物聯網' ? 'active' : ''}`} onClick={() => setSubject('物聯網')}>
          <Cpu size={16} /> 物聯網
        </button>
      </div>

      {loading ? (
        <div style={{marginTop: '80px', textAlign: 'center', color: '#6366f1'}}>
          <Loader2 style={{animation: 'spin 1s linear infinite'}} size={42} />
          <p style={{marginTop: '16px', fontWeight: 700, fontSize: '15px', color: '#4f46e5'}}>正在同步雲端資料庫...</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : error ? (
        <div className="card-ui" style={{border: '1.5px solid #fee2e2', background: '#fffcfc'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px'}}>
            <ShieldAlert size={28} color="#ef4444" />
            <h3 style={{color: '#991b1b', margin: 0, fontSize: '18px', fontWeight: 800}}>連線受阻</h3>
          </div>
          <p style={{fontSize: '13px', color: '#7f1d1d', fontWeight: 600, lineHeight: 1.5}}>{error}</p>
          <button onClick={() => fetchData(subject)} style={{marginTop: '20px', width: '100%', padding: '14px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '14px', fontWeight: 700, cursor: 'pointer'}}>重新嘗試連線</button>
        </div>
      ) : (
        <>
          {/* Enhanced Search Input */}
          <div className="search-card">
            <Search className="search-ui-icon" size={22} strokeWidth={2.5} />
            <input 
              className="search-ui-input" 
              type="text" 
              placeholder={`輸入 9 碼學號或姓名全名`} 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="info-tip">
            <Info size={14} color="#6366f1" style={{flexShrink: 0, marginTop: '1px'}} />
            <p className="info-tip-text">為了您的隱私安全，系統僅會在輸入<b>完全正確</b>的學號或姓名時顯示分數。</p>
          </div>

          {/* Results Area */}
          {searchTerm.trim() !== '' ? (
            queryResult ? (
              <div className="card-ui">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px'}}>
                       <User size={12} color="#6366f1" />
                       <span style={{fontSize: '10px', color: '#6366f1', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase'}}>Full Name</span>
                    </div>
                    <h2 style={{fontSize: '28px', fontWeight: 900, margin: 0}}>{queryResult.姓名 || queryResult.name}</h2>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', marginBottom: '4px'}}>
                       <span style={{fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase'}}>Student ID</span>
                       <Hash size={10} color="#94a3b8" />
                    </div>
                    <div style={{background: '#f1f5f9', padding: '4px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#475569'}}>{queryResult.學號 || queryResult.studentId}</div>
                  </div>
                </div>

                <div className="score-display-box">
                  <div>
                    <p className="score-label">{subject} 期末成績</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#818cf8', fontSize: '10px', fontWeight: 800, marginTop: '8px'}}>
                      <CheckCircle2 size={12} /> OFFICIAL CLOUD SYNC
                    </div>
                  </div>
                  <div className="score-val-ui" style={{color: (queryResult.分數 || queryResult.score) >= 60 ? '#818cf8' : '#fb7185'}}>
                    {queryResult.分數 || queryResult.score}
                  </div>
                </div>
                
                <button 
                  onClick={() => setSearchTerm('')} 
                  style={{width: '100%', marginTop: '20px', border: 'none', background: '#f8fafc', padding: '14px', borderRadius: '14px', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '13px', transition: 'all 0.2s'}}
                  onMouseOver={(e) => e.target.style.color = '#4f46e5'}
                  onMouseOut={(e) => e.target.style.color = '#94a3b8'}
                >
                  清除查詢結果
                </button>
              </div>
            ) : (
              searchTerm.length >= 2 && (
                <div className="card-ui" style={{textAlign: 'center', padding: '48px 24px'}}>
                  <div style={{width: '64px', height: '64px', background: '#f8fafc', borderRadius: '100%', display: 'flex', alignItems: 'center', justifyCenter: 'center', margin: '0 auto 16px'}}>
                    <AlertCircle size={32} color="#e2e8f0" style={{margin: '0 auto'}} />
                  </div>
                  <h3 style={{fontSize: '18px', fontWeight: 800, margin: 0}}>查無此資料</h3>
                  <p style={{color: '#94a3b8', fontSize: '13px', marginTop: '8px', lineHeight: 1.5}}>請確認科目分頁是否選擇正確，<br/>並輸入完整的學號或姓名。</p>
                </div>
              )
            )
          ) : (
            <div className="empty-state">
              <Search size={48} style={{opacity: 0.1, marginBottom: '12px'}} />
              <p style={{fontSize: '14px', fontWeight: 600}}>等待輸入查詢資料...</p>
            </div>
          )}
        </>
      )}

      <footer style={{marginTop: 'auto', paddingTop: '40px', color: '#cbd5e1', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px'}}>
        <RefreshCw size={12} className={loading ? 'spin' : ''} />
        LIVE STATUS: {loading ? 'SYNCING' : 'SECURED'}
      </footer>
    </div>
  );
};

export default App;
