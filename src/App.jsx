import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, GraduationCap, AlertCircle, Info, CheckCircle2, 
  Loader2, BookOpen, Cpu, RefreshCw, ShieldAlert, 
  User, Hash, Lock, Eye, EyeOff, Plus, Trash2, X, Settings, LogOut, Save, ExternalLink
} from 'lucide-react';

// Google Apps Script API 網址
const API_BASE_URL = "https://script.google.com/macros/s/AKfycbzTUO_rRZh6fRz95M4zc7ewk0lmfPbyAVezsVKIKbQbXJBPoGHnZc4JnGmbCkRM2l7d/exec";

// 您的試算表連結
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1O22jKgoSb_qk2ItORCbhRCUikmlS4tO5LOx8wS81H6Y/edit?usp=sharing";

const App = () => {
  // --- 基礎狀態 ---
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [allData, setAllData] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  // --- 後台管理狀態 ---
  const [isCreating, setIsCreating] = useState(false);
  const [subjectsConfig, setSubjectsConfig] = useState(() => {
    const saved = localStorage.getItem('app_subjects_config');
    return saved ? JSON.parse(saved) : [
      { id: '1', name: '資料結構', isVisible: true },
      { id: '2', name: '物聯網', isVisible: true }
    ];
  });
  const [newSubjectName, setNewSubjectName] = useState('');

  // 監聽配置變化並存入 LocalStorage
  useEffect(() => {
    localStorage.setItem('app_subjects_config', JSON.stringify(subjectsConfig));
    
    const visibleSubjects = subjectsConfig.filter(s => s.isVisible);
    if (visibleSubjects.length > 0 && (!subject || !visibleSubjects.find(s => s.name === subject))) {
      setSubject(visibleSubjects[0].name);
    }
  }, [subjectsConfig]);

  // 設定 Viewport
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
      document.head.appendChild(meta);
    }
  }, []);

  // --- 資料抓取 ---
  const fetchData = async (targetSubject) => {
    if (!targetSubject) return;
    setLoading(true);
    setError(null);
    setAllData([]);

    try {
      const url = `${API_BASE_URL}?subject=${encodeURIComponent(targetSubject)}&t=${Date.now()}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`伺服器錯誤: ${response.status}`);
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setAllData(data);
      } else if (data.error) {
        throw new Error(data.error);
      } else {
        throw new Error("回傳資料格式異常");
      }
    } catch (err) {
      console.error("API 連線失敗:", err);
      setError("連線失敗。請確認是否已設定權限為『任何人』存取。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subject && !isAdminMode) {
      fetchData(subject);
    }
  }, [subject, isAdminMode]);

  // --- 查詢邏輯 ---
  const queryResult = useMemo(() => {
    const term = searchTerm.trim().toUpperCase();
    if (!term || allData.length === 0) return null;
    
    return allData.find(s => {
      const sId = (s.學號 ?? s.studentId ?? "").toString().toUpperCase();
      const sName = (s.姓名 ?? s.name ?? "").toString();
      return sId === term || sName === searchTerm.trim();
    });
  }, [searchTerm, allData]);

  const displayScore = useMemo(() => {
    if (!queryResult) return null;
    const val = queryResult.分數 ?? queryResult.score;
    return val !== undefined && val !== null ? val : "無資料";
  }, [queryResult]);

  const isPassed = useMemo(() => {
    const score = Number(displayScore);
    if (isNaN(score)) return false; 
    return score >= 60;
  }, [displayScore]);

  // --- 管理員操作 ---
  const handleLogin = () => {
    if (password === 'minar7917') {
      setIsLoggedIn(true);
      setPassword('');
    } else {
      alert('密碼錯誤');
    }
  };

  // 新增工作表並同步到 Google Sheets
  const addSubject = async () => {
    const name = newSubjectName.trim();
    if (!name) return;
    if (subjectsConfig.find(s => s.name === name)) {
      alert('科目名稱已存在');
      return;
    }

    setIsCreating(true);
    try {
      // 調用 API 告知 GAS 建立新分頁
      const url = `${API_BASE_URL}?action=createSheet&name=${encodeURIComponent(name)}&t=${Date.now()}`;
      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        const newSub = {
          id: Date.now().toString(),
          name: name,
          isVisible: true
        };
        setSubjectsConfig([...subjectsConfig, newSub]);
        setNewSubjectName('');
        alert(`成功！已在試算表中建立「${name}」工作表。`);
      } else {
        throw new Error(result.error || "建立失敗");
      }
    } catch (err) {
      console.error("同步失敗:", err);
      alert(`雲端同步失敗：${err.message}\n請確保 Google Apps Script 已更新支援建立功能。`);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteSubject = (id) => {
    if (window.confirm('確定要刪除此工作表設定嗎？（這不會刪除 Google Sheet 原始分頁）')) {
      setSubjectsConfig(subjectsConfig.filter(s => s.id !== id));
    }
  };

  const toggleVisibility = (id) => {
    setSubjectsConfig(subjectsConfig.map(s => 
      s.id === id ? { ...s, isVisible: !s.isVisible } : s
    ));
  };

  // --- 渲染組件 ---
  
  // 管理員登入畫面
  if (isAdminMode && !isLoggedIn) {
    return (
      <div className="app-main">
        <style>{appStyles}</style>
        <div className="card-ui" style={{marginTop: '100px', textAlign: 'center'}}>
           <div className="logo-ui" style={{background: '#1e293b'}}><Lock color="white" size={24} /></div>
           <h2 style={{fontWeight: 900, marginBottom: '20px'}}>管理員登入</h2>
           <input 
             type="password" 
             className="search-ui-input" 
             style={{paddingLeft: '20px', textAlign: 'center'}}
             placeholder="請輸入後台密碼"
             value={password}
             onChange={(e) => setPassword(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
           />
           <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
             <button className="admin-btn secondary" onClick={() => setIsAdminMode(false)}>取消</button>
             <button className="admin-btn primary" onClick={handleLogin}>登入系統</button>
           </div>
        </div>
      </div>
    );
  }

  // 管理員控制台
  if (isAdminMode && isLoggedIn) {
    return (
      <div className="app-main">
        <style>{appStyles}</style>
        <div className="header-ui">
          <div className="logo-ui" style={{background: '#1e293b'}}><Settings color="white" size={30} /></div>
          <h1 style={{fontSize: '24px', fontWeight: 900, margin: 0}}>後台管理中心</h1>
          <p style={{color: '#64748b', fontSize: '11px', fontWeight: 800, marginTop: '4px'}}>CONFIG & WORKSHEETS</p>
        </div>

        <div className="card-ui">
          <h3 style={{fontSize: '16px', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px'}}>
            <Plus size={18} /> 新增工作表
          </h3>
          <div style={{display: 'flex', gap: '10px', marginBottom: '24px'}}>
            <input 
              type="text" 
              className="search-ui-input" 
              style={{paddingLeft: '20px', fontSize: '14px'}}
              placeholder="輸入 Sheet 名稱 (例如: 期末考)"
              value={newSubjectName}
              disabled={isCreating}
              onChange={(e) => setNewSubjectName(e.target.value)}
            />
            <button 
              className="admin-btn primary" 
              style={{width: '80px'}} 
              onClick={addSubject}
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="spin" size={18} /> : "新增"}
            </button>
          </div>

          <h3 style={{fontSize: '16px', fontWeight: 800, marginBottom: '16px'}}>工作表清單</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
            {subjectsConfig.map(sub => (
              <div key={sub.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
                <span style={{fontWeight: 700}}>{sub.name}</span>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button 
                    onClick={() => toggleVisibility(sub.id)}
                    style={{padding: '8px', borderRadius: '10px', border: 'none', background: sub.isVisible ? '#dcfce7' : '#fee2e2', color: sub.isVisible ? '#166534' : '#991b1b', cursor: 'pointer'}}
                    title={sub.isVisible ? "目前為顯示狀態" : "目前為隱藏狀態"}
                  >
                    {sub.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button 
                    onClick={() => deleteSubject(sub.id)}
                    style={{padding: '8px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer'}}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {subjectsConfig.length === 0 && <p style={{textAlign: 'center', color: '#94a3b8', fontSize: '13px'}}>目前無任何工作表設定</p>}
          </div>

          <div style={{marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '24px'}}>
            <a 
              href={SPREADSHEET_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="admin-btn"
              style={{
                background: '#059669', 
                color: 'white', 
                textDecoration: 'none', 
                gap: '8px',
                width: 'auto'
              }}
            >
              <ExternalLink size={18} /> 編輯原始試算表
            </a>
          </div>
          
          <button className="admin-btn secondary" style={{marginTop: '16px', width: '100%', gap: '8px'}} onClick={() => {setIsAdminMode(false); setIsLoggedIn(false);}}>
            <LogOut size={18} /> 退出後台
          </button>
        </div>
      </div>
    );
  }

  // 使用者查詢畫面
  const visibleSubjects = subjectsConfig.filter(s => s.isVisible);

  return (
    <div className="app-main">
      <style>{appStyles}</style>

      {/* Admin Settings Entry - Top Right Gear Icon */}
      <button 
        className="settings-entry-btn" 
        onClick={() => setIsAdminMode(true)}
        aria-label="Admin Settings"
      >
        <Settings size={22} />
      </button>

      {/* Header Section */}
      <div className="header-ui">
        <div className="logo-ui"><GraduationCap color="white" size={30} /></div>
        <h1 style={{fontSize: '24px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px'}}>學期成績查詢</h1>
        <p style={{color: '#64748b', fontSize: '11px', fontWeight: 800, letterSpacing: '2px', marginTop: '6px', textTransform: 'uppercase'}}>Academic Portal v4.0</p>
      </div>

      {/* Subject Tabs */}
      {visibleSubjects.length > 0 ? (
        <div className="nav-ui">
          {visibleSubjects.map(sub => (
            <button 
              key={sub.id}
              className={`nav-btn ${subject === sub.name ? 'active' : ''}`} 
              onClick={() => setSubject(sub.name)}
            >
              {sub.name === '資料結構' ? <BookOpen size={16} /> : sub.name === '物聯網' ? <Cpu size={16} /> : <Hash size={16} />} 
              {sub.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="card-ui" style={{textAlign: 'center', color: '#94a3b8'}}>
          目前暫無開放查詢的科目
        </div>
      )}

      {loading ? (
        <div style={{marginTop: '80px', textAlign: 'center', color: '#6366f1'}}>
          <Loader2 className="spin" size={42} />
          <p style={{marginTop: '16px', fontWeight: 700, fontSize: '15px', color: '#4f46e5'}}>正在同步雲端資料庫...</p>
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
      ) : visibleSubjects.length > 0 && (
        <>
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

          {searchTerm.trim() !== '' ? (
            queryResult ? (
              <div className="card-ui">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px'}}>
                       <User size={12} color="#6366f1" />
                       <span style={{fontSize: '10px', color: '#6366f1', fontWeight: 800, letterSpacing: '1px', textTransform: 'uppercase'}}>Full Name</span>
                    </div>
                    <h2 style={{fontSize: '28px', fontWeight: 900, margin: 0}}>{queryResult.姓名 ?? queryResult.name}</h2>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '5px', marginBottom: '4px'}}>
                       <span style={{fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase'}}>Student ID</span>
                       <Hash size={10} color="#94a3b8" />
                    </div>
                    <div style={{background: '#f1f5f9', padding: '4px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#475569'}}>{queryResult.學號 ?? queryResult.studentId}</div>
                  </div>
                </div>

                <div className="score-display-box">
                  <div>
                    <p className="score-label">{subject} 期末成績</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '10px', fontWeight: 800, marginTop: '8px'}}>
                      <CheckCircle2 size={12} color={isPassed ? '#4ade80' : '#fb7185'} /> 
                      OFFICIAL CLOUD SYNC
                    </div>
                  </div>
                  <div 
                    className="score-val-ui" 
                    style={{
                      color: isPassed ? '#4ade80' : '#ef4444',
                      textShadow: isPassed 
                        ? '0 0 20px rgba(74, 222, 128, 0.4)' 
                        : '0 0 20px rgba(239, 68, 68, 0.4)'
                    }}
                  >
                    {displayScore}
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
                  <div style={{width: '64px', height: '64px', background: '#f8fafc', borderRadius: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
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

// --- 樣式設定 ---
const appStyles = `
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
    position: relative;
  }
  
  .settings-entry-btn {
    position: absolute;
    top: 24px;
    right: 24px;
    background: white;
    border: none;
    width: 44px;
    height: 44px;
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    z-index: 10;
  }
  .settings-entry-btn:hover {
    color: #4f46e5;
    transform: rotate(45deg);
    box-shadow: 0 6px 16px rgba(79, 70, 229, 0.1);
  }
  .settings-entry-btn:active {
    transform: scale(0.9) rotate(45deg);
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
    overflow-x: auto;
  }
  .nav-btn {
    flex: 1; padding: 12px 16px; border: none; border-radius: 12px;
    font-weight: 700; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    display: flex; align-items: center; justify-content: center; gap: 8px;
    background: transparent; color: #64748b; font-size: 14px;
    white-space: nowrap;
  }
  .nav-btn.active { 
    background: white; 
    color: #4f46e5; 
    box-shadow: 0 4px 12px -2px rgba(0,0,0,0.08);
    transform: translateY(-1px);
  }
  
  .search-card {
    width: 100%; max-width: 380px; background: white; padding: 8px;
    border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.04);
    position: relative; transition: transform 0.3s;
  }
  .search-ui-input {
    width: 100%; padding: 18px 20px 18px 56px; border-radius: 18px;
    border: 2px solid transparent; background: #f8fafc; font-size: 17px;
    font-weight: 600; outline: none; transition: all 0.3s; box-sizing: border-box;
    color: #1e293b;
  }
  .search-ui-input:focus { background: white; border-color: #c7d2fe; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.08); }
  .search-ui-icon { position: absolute; left: 24px; top: 50%; transform: translateY(-50%); color: #6366f1; }
  
  .card-ui {
    width: 100%; max-width: 380px; background: white; margin-top: 28px;
    border-radius: 28px; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.08);
    animation: popUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
  }
  @keyframes popUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
  
  .score-display-box {
    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; border-radius: 20px;
    padding: 24px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px;
  }
  .score-val-ui { font-size: 42px; font-weight: 900; }
  .score-label { font-size: 14px; color: #94a3b8; font-weight: 700; margin: 0; }
  
  .info-tip { display: flex; gap: 8px; width: 100%; max-width: 380px; margin-top: 14px; padding: 0 12px; }
  .info-tip-text { font-size: 12px; color: #94a3b8; line-height: 1.4; }

  .admin-btn {
    padding: 14px; border: none; border-radius: 14px; font-weight: 700; cursor: pointer;
    flex: 1; display: flex; align-items: center; justify-content: center; transition: all 0.2s;
  }
  .admin-btn.primary { background: #4f46e5; color: white; }
  .admin-btn.secondary { background: #f1f5f9; color: #64748b; }
  .admin-btn:active { transform: scale(0.98); }
  .admin-btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .spin { animation: spin 1s linear infinite; }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  
  @media (max-width: 480px) {
    .app-main { padding: 24px 16px; }
    .score-val-ui { font-size: 36px; }
    .settings-entry-btn { top: 16px; right: 16px; }
  }
`;

export default App;
