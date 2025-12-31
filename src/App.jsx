import React, { useState, useMemo, useEffect } from 'react';
import { Search, GraduationCap, AlertCircle, Info, CheckCircle2, Loader2, BookOpen, Cpu, RefreshCw, ShieldAlert, ExternalLink } from 'lucide-react';

// 這是您的 Google Apps Script 基礎網址
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbzTUO_rRZh6fRz95M4zc7ewk0lmfPbyAVezsVKIKbQbXJBPoGHnZc4JnGmbCkRM2l7d/exec";

const App = () => {
  const [subject, setSubject] = useState('資料結構'); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [allData, setAllData] = useState([]); 
  const [loading, setLoading] = useState(true); 
  const [error, setError] = useState(null);

  // 1. 初始化 Viewport 確保手機顯示比例正確
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
      document.head.appendChild(meta);
    }
  }, []);

  // 2. 抓取資料函式
  const fetchData = async (targetSubject) => {
    setLoading(true);
    setError(null);
    setAllData([]); // 清空舊資料

    try {
      // 構建與您提供的網址完全一致的格式
      const url = `${API_BASE_URL}?subject=${encodeURIComponent(targetSubject)}`;
      
      console.log("正在請求網址:", url);

      const response = await fetch(url, {
        method: 'GET',
        mode: 'cors',      // 跨網域模式
        redirect: 'follow', // 必須跟隨 GAS 的 302 重導向
      });

      if (!response.ok) throw new Error(`伺服器回應錯誤: ${response.status}`);
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllData(data);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("回傳資料格式不符，請確認 Google Sheet 欄位標題。");
      }
      
      setLoading(false);
    } catch (err) {
      console.error("連線錯誤詳情:", err);
      // 如果瀏覽器能開但這裡不能開，通常是 CORS 被某些瀏覽器插件或環境攔截
      setError(err.message === 'Failed to fetch' 
        ? "連線被攔截。這通常發生在網路不穩或 API 權限設定不完全時。請確認 GAS 部署為『所有人』存取。" 
        : err.message
      );
      setLoading(false);
    }
  };

  // 當科目切換時，觸發 API 請求
  useEffect(() => {
    fetchData(subject);
  }, [subject]);

  // 搜尋邏輯：精確匹配 9 碼學號或完整姓名
  const queryResult = useMemo(() => {
    const term = searchTerm.trim().toUpperCase();
    if (!term || allData.length === 0) return null;
    
    return allData.find(s => {
      // 確保欄位名稱與您的 Google Sheet 一致（學號、姓名、分數）
      const sId = (s.學號 || s.studentId || "").toString().toUpperCase();
      const sName = (s.姓名 || s.name || "").toString();
      return sId === term || sName === searchTerm.trim();
    });
  }, [searchTerm, allData]);

  return (
    <div className="main-wrapper">
      <style>{`
        .main-wrapper {
          min-height: 100vh;
          background-color: #f8fafc;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 30px 20px;
          font-family: "PingFang TC", "Microsoft JhengHei", sans-serif;
          box-sizing: border-box;
          color: #334155;
        }
        .header { text-align: center; margin-bottom: 30px; }
        .logo-ring {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          width: 56px; height: 56px; border-radius: 18px; display: flex; 
          align-items: center; justify-content: center; margin: 0 auto 15px;
          box-shadow: 0 10px 15px rgba(79, 70, 229, 0.25);
        }
        .nav-container {
          display: flex; background: #e2e8f0; padding: 4px;
          border-radius: 14px; margin-bottom: 24px; width: 100%; max-width: 380px;
        }
        .nav-tab {
          flex: 1; padding: 12px; border: none; border-radius: 10px;
          font-weight: 700; cursor: pointer; transition: 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          background: transparent; color: #64748b; font-size: 14px;
        }
        .nav-tab.active { background: white; color: #4f46e5; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .search-container { width: 100%; max-width: 380px; position: relative; }
        .search-input {
          width: 100%; padding: 16px 16px 16px 52px; border-radius: 18px;
          border: 2px solid #e2e8f0; background: white; font-size: 16px;
          font-weight: 600; outline: none; transition: 0.2s; box-sizing: border-box;
        }
        .search-input:focus { border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79,70,229,0.1); }
        .icon-search { position: absolute; left: 18px; top: 50%; transform: translateY(-50%); color: #4f46e5; }
        .result-card {
          width: 100%; max-width: 380px; background: white; margin-top: 25px;
          border-radius: 28px; padding: 28px; box-shadow: 0 15px 30px rgba(0,0,0,0.05);
          animation: slideUp 0.3s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .score-pill {
          background: #0f172a; color: white; border-radius: 20px;
          padding: 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px;
        }
        .score-val { font-size: 48px; font-weight: 900; color: #818cf8; }
        .loading-state { margin-top: 60px; text-align: center; color: #4f46e5; }
        .spin { animation: rotate-loop 1s linear infinite; }
        @keyframes rotate-loop { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        @media (max-width: 480px) {
          .main-wrapper { padding: 20px 15px; }
          .search-input { font-size: 16px; }
        }
      `}</style>

      {/* 頁面標題 */}
      <div className="header">
        <div className="logo-ring"><GraduationCap color="white" size={32} /></div>
        <h1 style={{fontSize: '24px', fontWeight: 800, margin: 0}}>成績即時查詢</h1>
        <p style={{color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '2px', marginTop: '5px'}}>GOOGLE SHEETS SYNC</p>
      </div>

      {/* 科目切換 */}
      <div className="nav-container">
        <button className={`nav-tab ${subject === '資料結構' ? 'active' : ''}`} onClick={() => setSubject('資料結構')}>
          <BookOpen size={16} /> 資料結構
        </button>
        <button className={`nav-tab ${subject === '物聯網' ? 'active' : ''}`} onClick={() => setSubject('物聯網')}>
          <Cpu size={16} /> 物聯網
        </button>
      </div>

      {loading ? (
        <div className="loading-state">
          <Loader2 className="spin" size={40} />
          <p style={{marginTop: '15px', fontWeight: 700}}>讀取雲端資料中...</p>
        </div>
      ) : error ? (
        <div className="result-card" style={{border: '1px solid #fee2e2', textAlign: 'center'}}>
          <ShieldAlert size={40} color="#ef4444" style={{margin: '0 auto 12px'}} />
          <h3 style={{color: '#991b1b', margin: '0 0 10px 0'}}>連線異常</h3>
          <p style={{fontSize: '13px', color: '#7f1d1d', lineHeight: '1.6'}}>{error}</p>
          <div style={{marginTop: '15px', display: 'flex', flexDirection: 'column', gap: '8px'}}>
            <button onClick={() => fetchData(subject)} style={{padding: '12px', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 700, cursor: 'pointer'}}>重新整理</button>
            <a href={`${API_BASE_URL}?subject=${encodeURIComponent(subject)}`} target="_blank" rel="noreferrer" style={{fontSize: '11px', color: '#6366f1', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
               <ExternalLink size={12} /> 在新分頁測試 API
            </a>
          </div>
        </div>
      ) : (
        <>
          {/* 搜尋框 */}
          <div className="search-container">
            <Search className="icon-search" size={20} strokeWidth={2.5} />
            <input
              className="search-input"
              type="text"
              placeholder={`輸入${subject}的姓名或學號`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{width: '100%', maxWidth: '380px', display: 'flex', gap: '6px', padding: '10px 8px', color: '#94a3b8'}}>
            <Info size={14} style={{flexShrink: 0, marginTop: '2px'}} />
            <p style={{fontSize: '11px', fontWeight: 600, margin: 0}}>請輸入完整學號或姓名。資料為實時同步之結果。</p>
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

                <div className="score-pill">
                  <div>
                    <h3 style={{fontSize: '14px', margin: 0, color: '#94a3b8'}}>{subject} 分數</h3>
                    <div style={{display: 'flex', alignItems: 'center', gap: '4px', color: '#818cf8', fontSize: '9px', fontWeight: 800, marginTop: '6px'}}>
                      <CheckCircle2 size={12} /> SECURE DATA
                    </div>
                  </div>
                  <div className="score-val" style={{color: (queryResult.分數 || queryResult.score) >= 60 ? '#818cf8' : '#f87171'}}>
                    {queryResult.分數 || queryResult.score}
                  </div>
                </div>
                
                <button onClick={() => setSearchTerm('')} style={{width: '100%', marginTop: '16px', border: 'none', background: '#f8fafc', padding: '10px', borderRadius: '12px', color: '#64748b', fontWeight: 700, cursor: 'pointer', fontSize: '12px'}}>清除搜尋</button>
              </div>
            ) : (
              searchTerm.length >= 2 && (
                <div className="result-card" style={{textAlign: 'center', padding: '40px 20px'}}>
                  <AlertCircle size={36} color="#e2e8f0" style={{margin: '0 auto 12px'}} />
                  <h3 style={{fontSize: '18px', fontWeight: 800, margin: 0}}>查無資料</h3>
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
          Cloud Connection: {loading ? 'Syncing...' : 'Active'}
        </span>
      </footer>
    </div>
  );
};

export default App;
