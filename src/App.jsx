import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, GraduationCap, AlertCircle, Info, CheckCircle2, 
  Loader2, BookOpen, Cpu, RefreshCw, ShieldAlert, 
  User, Hash, Lock, Eye, EyeOff, Plus, Trash2, X, Settings, 
  LogOut, Save, ExternalLink, RotateCcw, Archive, ChevronRight, RotateCw
} from 'lucide-react';

// 更新後的 Google Apps Script API 網址
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // 目前顯示中的工作表設定
  const [subjectsConfig, setSubjectsConfig] = useState(() => {
    const saved = localStorage.getItem('app_subjects_config');
    return saved ? JSON.parse(saved) : [];
  });

  // 已刪除/隱藏的工作表設定 (回收站)
  const [deletedSubjects, setDeletedSubjects] = useState(() => {
    const saved = localStorage.getItem('app_deleted_subjects');
    return saved ? JSON.parse(saved) : [];
  });

  const [newSubjectName, setNewSubjectName] = useState('');

  // 1. 設定 Viewport
  useEffect(() => {
    if (!document.querySelector('meta[name="viewport"]')) {
      const meta = document.createElement('meta');
      meta.name = "viewport";
      meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0";
      document.head.appendChild(meta);
    }
    // 首次載入自動與雲端同步一次
    initialSync();
  }, []);

  // 2. 監聽配置變化並存入 LocalStorage
  useEffect(() => {
    localStorage.setItem('app_subjects_config', JSON.stringify(subjectsConfig));
    localStorage.setItem('app_deleted_subjects', JSON.stringify(deletedSubjects));
    
    const visibleSubjects = subjectsConfig.filter(s => s.isVisible);
    if (visibleSubjects.length > 0 && (!subject || !visibleSubjects.find(s => s.name === subject))) {
      setSubject(visibleSubjects[0].name);
    }
  }, [subjectsConfig, deletedSubjects]);


  // --- 核心同步邏輯 (自動處理雲端刪除) ---
  const initialSync = async () => {
    setIsSyncing(true);
    try {
      const url = `${API_BASE_URL}?action=listSheets&t=${Date.now()}`;
      const response = await fetch(url);
      const cloudSheets = await response.json();

      if (Array.isArray(cloudSheets)) {
        // 更新目前清單：只保留還存在於雲端的分頁
        const updatedConfig = subjectsConfig.filter(local => cloudSheets.includes(local.name));
        
        // 補齊清單：如果雲端有但目前清單與回收站都沒有的分頁，自動加入
        const currentNames = updatedConfig.map(s => s.name);
        const deletedNames = deletedSubjects.map(s => s.name);
        
        const newlyFound = cloudSheets
          .filter(name => !currentNames.includes(name) && !deletedNames.includes(name))
          .map(name => ({
            id: `cloud-${Date.now()}-${name}`,
            name: name,
            isVisible: true
          }));

        setSubjectsConfig([...updatedConfig, ...newlyFound]);
        
        // 同步清理回收站：如果雲端已經沒了，回收站也要清掉
        setDeletedSubjects(prev => prev.filter(d => cloudSheets.includes(d.name)));
      }
    } catch (err) {
      console.error("同步失敗:", err);
    } finally {
      setIsSyncing(false);
    }
  };

  // --- 資料抓取 ---
  const fetchData = async (targetSubject) => {
    if (!targetSubject) return;
    setLoading(true);
    setError(null);
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
      setError("連線失敗。請點擊重新整理或稍後重試。");
    } finally {
      setLoading(false);
    }
  };

  // 切換科目自動抓資料
  useEffect(() => {
    if (subject && !isAdminMode) {
      fetchData(subject);
    }
  }, [subject, isAdminMode]);

  // 手動點擊重新整理按鈕 (保持在目前 Mode)
  const handleManualRefresh = async () => {
    await initialSync(); // 同步清單(處理刪除)
    if (subject && !isAdminMode) {
      await fetchData(subject); // 若在查詢頁，同步目前分數
    }
  };

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
    return !isNaN(score) && score >= 60;
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

  const addSubject = async () => {
    const name = newSubjectName.trim();
    if (!name) return;
    if (subjectsConfig.find(s => s.name === name)) {
      alert('該項目已存在');
      return;
    }

    setIsCreating(true);
    try {
      const url = `${API_BASE_URL}?action=createSheet&name=${encodeURIComponent(name)}&t=${Date.now()}`;
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setSubjectsConfig([...subjectsConfig, { id: Date.now().toString(), name, isVisible: true }]);
        setNewSubjectName('');
        setDeletedSubjects(deletedSubjects.filter(s => s.name !== name));
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      alert(`建立失敗：${err.message}`);
    } finally {
      setIsCreating(false);
    }
  };

  const deleteSubject = (id) => {
    const sub = subjectsConfig.find(s => s.id === id);
    if (window.confirm(`移除「${sub.name}」？此操作僅從系統列表移除，不會刪除雲端試算表原始資料。`)) {
      setDeletedSubjects([...deletedSubjects, sub]);
      setSubjectsConfig(subjectsConfig.filter(s => s.id !== id));
    }
  };

  const restoreSubject = (id) => {
    const sub = deletedSubjects.find(s => s.id === id);
    setSubjectsConfig([...subjectsConfig, sub]);
    setDeletedSubjects(deletedSubjects.filter(s => s.id !== id));
  };

  const toggleVisibility = (id) => {
    setSubjectsConfig(subjectsConfig.map(s => s.id === id ? { ...s, isVisible: !s.isVisible } : s));
  };

  // --- 樣式設定 ---
  const appStyles = `
    .app-main {
      min-height: 100vh;
      background: linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%);
      display: flex; flex-direction: column; align-items: center;
      padding: 32px 20px; font-family: -apple-system, system-ui, sans-serif;
      box-sizing: border-box; color: #1e293b; position: relative;
    }
    .settings-entry-btn {
      position: absolute; top: 24px; right: 24px; background: white; border: none;
      width: 44px; height: 44px; border-radius: 14px; display: flex;
      align-items: center; justify-content: center; color: #94a3b8; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s; z-index: 10;
    }
    .settings-entry-btn:hover { color: #4f46e5; transform: rotate(45deg); }

    .refresh-btn {
      background: white; border: none; width: 44px; height: 44px; border-radius: 14px;
      display: flex; align-items: center; justify-content: center; color: #6366f1;
      cursor: pointer; box-shadow: 0 4px 12px rgba(0,0,0,0.05); transition: all 0.3s;
      margin-left: 10px;
    }
    .refresh-btn:hover { background: #f5f7ff; color: #4f46e5; }
    .refresh-btn:active { transform: scale(0.9); }

    .header-ui { text-align: center; margin-bottom: 32px; width: 100%; display: flex; flex-direction: column; align-items: center; }
    .header-row { display: flex; align-items: center; justify-content: center; margin-bottom: 8px; width: 100%; position: relative; }
    .logo-ui {
      background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
      width: 56px; height: 56px; border-radius: 20px; display: flex; 
      align-items: center; justify-content: center; margin: 0 auto 16px;
      box-shadow: 0 12px 24px -8px rgba(79, 70, 229, 0.4);
    }
    .nav-ui {
      display: flex; background: #e2e8f0; padding: 5px;
      border-radius: 16px; margin-bottom: 28px; width: 100%; max-width: 380px;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); overflow-x: auto;
    }
    .nav-btn {
      flex: 1; padding: 12px 16px; border: none; border-radius: 12px;
      font-weight: 700; cursor: pointer; transition: all 0.3s;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      background: transparent; color: #64748b; font-size: 14px; white-space: nowrap;
    }
    .nav-btn.active { background: white; color: #4f46e5; box-shadow: 0 4px 12px -2px rgba(0,0,0,0.08); transform: translateY(-1px); }
    
    .search-card {
      width: 100%; max-width: 380px; background: white; padding: 8px;
      border-radius: 24px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.04);
      position: relative; transition: transform 0.3s;
    }
    .search-ui-input {
      width: 100%; padding: 18px 20px 18px 56px; border-radius: 18px;
      border: 2px solid transparent; background: #f8fafc; font-size: 17px;
      font-weight: 600; outline: none; transition: all 0.3s; box-sizing: border-box; color: #1e293b;
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
    
    .admin-btn {
      padding: 14px; border: none; border-radius: 14px; font-weight: 700; cursor: pointer;
      display: flex; align-items: center; justify-content: center; transition: all 0.2s;
      width: 100%; box-sizing: border-box; font-size: 15px;
    }
    .admin-btn.primary { background: #4f46e5; color: white; }
    .admin-btn.secondary { background: #f1f5f9; color: #64748b; }
    .admin-btn.success { background: #059669; color: white; }
    .admin-btn:hover { filter: brightness(1.05); transform: translateY(-1px); }
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

  // --- 畫面渲染 ---

  // 管理員登入畫面
  if (isAdminMode && !isLoggedIn) {
    return (
      <div className="app-main">
        <style>{appStyles}</style>
        <div className="card-ui" style={{marginTop: '100px', textAlign: 'center'}}>
           <div className="logo-ui" style={{background: '#1e293b'}}><Lock color="white" size={24} /></div>
           <h2 style={{fontWeight: 900, marginBottom: '20px'}}>管理員登入</h2>
           <input type="password" className="search-ui-input" style={{paddingLeft: '20px', textAlign: 'center'}} placeholder="請輸入密碼" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
           <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
             <button className="admin-btn secondary" style={{flex: 1}} onClick={() => setIsAdminMode(false)}>取消</button>
             <button className="admin-btn primary" style={{flex: 1}} onClick={handleLogin}>登入</button>
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
          <div className="header-row">
            <h1 style={{fontSize: '24px', fontWeight: 900, margin: 0}}>管理後台</h1>
            <button className="refresh-btn" onClick={handleManualRefresh} disabled={isSyncing} title="同步雲端清單">
              <RotateCw size={20} className={isSyncing ? 'spin' : ''} />
            </button>
          </div>
          <p style={{color: '#64748b', fontSize: '11px', fontWeight: 800, marginTop: '4px'}}>SETTINGS & CLOUD SYNC</p>
        </div>

        <div className="card-ui">
          <h3 style={{fontSize: '15px', fontWeight: 800, marginBottom: '12px'}}>建立新分頁</h3>
          <div style={{display: 'flex', gap: '10px', marginBottom: '32px'}}>
            <input type="text" className="search-ui-input" style={{paddingLeft: '20px', fontSize: '14px'}} placeholder="Sheet 名稱" value={newSubjectName} disabled={isCreating} onChange={(e) => setNewSubjectName(e.target.value)} />
            <button className="admin-btn primary" style={{width: '70px', padding: '10px'}} onClick={addSubject} disabled={isCreating}>{isCreating ? <Loader2 className="spin" size={18} /> : "建立"}</button>
          </div>

          <h3 style={{fontSize: '15px', fontWeight: 800, marginBottom: '12px'}}>目前科目 (已同步雲端)</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px'}}>
            {subjectsConfig.map(sub => (
              <div key={sub.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0'}}>
                <span style={{fontWeight: 700}}>{sub.name}</span>
                <div style={{display: 'flex', gap: '8px'}}>
                  <button onClick={() => toggleVisibility(sub.id)} style={{padding: '8px', borderRadius: '10px', border: 'none', background: sub.isVisible ? '#dcfce7' : '#fee2e2', color: sub.isVisible ? '#166534' : '#991b1b', cursor: 'pointer'}}>
                    {sub.isVisible ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button onClick={() => deleteSubject(sub.id)} style={{padding: '8px', borderRadius: '10px', border: 'none', background: '#f1f5f9', color: '#64748b', cursor: 'pointer'}}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
            {subjectsConfig.length === 0 && <p style={{textAlign: 'center', color: '#94a3b8', fontSize: '13px', padding: '20px'}}>雲端清單為空，請點擊上方重新整理或建立新分頁</p>}
          </div>

          {deletedSubjects.length > 0 && (
            <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '2px dashed #e2e8f0'}}>
              <h3 style={{fontSize: '14px', fontWeight: 800, color: '#64748b', marginBottom: '12px'}}>資源回收站</h3>
              {deletedSubjects.map(sub => (
                <div key={sub.id} style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px', background: '#fafafa', border: '1px dashed #cbd5e1', borderRadius: '12px', marginBottom: '8px'}}>
                  <span style={{fontSize: '14px', color: '#64748b'}}>{sub.name}</span>
                  <button onClick={() => restoreSubject(sub.id)} style={{padding: '5px 12px', borderRadius: '8px', border: '1px solid #4f46e5', background: 'white', color: '#4f46e5', cursor: 'pointer', fontSize: '12px', fontWeight: 700}}>復原</button>
                </div>
              ))}
            </div>
          )}

          <div style={{marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px'}}>
            <a 
              href={SPREADSHEET_URL} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="admin-btn success"
              style={{ textDecoration: 'none', gap: '8px' }}
            >
              <ExternalLink size={18} /> 開啟 Google 試算表編輯
            </a>
            
            <button 
              className="admin-btn secondary" 
              style={{ gap: '8px' }} 
              onClick={() => {setIsAdminMode(false); setIsLoggedIn(false);}}
            >
              <LogOut size={18} /> 退出後台
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 使用者查詢畫面
  const visibleSubjects = subjectsConfig.filter(s => s.isVisible);

  return (
    <div className="app-main">
      <style>{appStyles}</style>

      <button className="settings-entry-btn" onClick={() => setIsAdminMode(true)}><Settings size={22} /></button>

      <div className="header-ui">
        <div className="logo-ui"><GraduationCap color="white" size={30} /></div>
        <div className="header-row">
          <h1 style={{fontSize: '24px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px'}}>Minar成績查詢</h1>
          
          <button 
            className="refresh-btn" 
            onClick={handleManualRefresh} 
            disabled={loading || isSyncing}
            title="重新整理雲端資料"
          >
            <RotateCw size={20} className={(loading || isSyncing) ? 'spin' : ''} />
          </button>
        </div>
        <div>
          <h2 style={{fontSize: '24px', fontWeight: 900, margin: 0, letterSpacing: '-0.5px'}}>系統為龔旭陽實驗室所有，仿冒必究</h2>
        </div>
      </div>

      {visibleSubjects.length > 0 ? (
        <div className="nav-ui">
          {visibleSubjects.map(sub => (
            <button key={sub.id} className={`nav-btn ${subject === sub.name ? 'active' : ''}`} onClick={() => setSubject(sub.name)}>
              {sub.name === '資料結構' ? <BookOpen size={16} /> : sub.name === '物聯網' ? <Cpu size={16} /> : <Hash size={16} />} 
              {sub.name}
            </button>
          ))}
        </div>
      ) : (
        <div className="card-ui" style={{textAlign: 'center', color: '#94a3b8', padding: '40px'}}>目前暫無開放查詢的科目</div>
      )}

      {loading || isSyncing ? (
        <div style={{marginTop: '80px', textAlign: 'center'}}>
          <Loader2 className="spin" size={42} color="#4f46e5" />
          <p style={{marginTop: '16px', fontWeight: 700, color: '#4f46e5'}}>正在同步雲端資料庫...</p>
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
            <input className="search-ui-input" type="text" placeholder={`輸入學號或姓名`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          {searchTerm.trim() !== '' ? (
            queryResult ? (
              <div className="card-ui">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '4px'}}>
                       <User size={12} color="#6366f1" />
                       <span style={{fontSize: '10px', color: '#6366f1', fontWeight: 800, textTransform: 'uppercase'}}>Full Name</span>
                    </div>
                    <h2 style={{fontSize: '28px', fontWeight: 900, margin: 0}}>{queryResult.姓名 ?? queryResult.name}</h2>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyToken: 'flex-end', gap: '5px', marginBottom: '4px'}}>
                       <span style={{fontSize: '10px', color: '#94a3b8', fontWeight: 800}}>Student ID</span>
                       <Hash size={10} color="#94a3b8" />
                    </div>
                    <div style={{background: '#f1f5f9', padding: '4px 10px', borderRadius: '10px', fontSize: '13px', fontWeight: 700, color: '#475569'}}>{queryResult.學號 ?? queryResult.studentId}</div>
                  </div>
                </div>

                <div className="score-display-box">
                  <div>
                    <p style={{fontSize: '14px', color: '#94a3b8', fontWeight: 700, margin: 0}}>{subject} 成績</p>
                    <div style={{display: 'flex', alignItems: 'center', gap: '6px', color: '#94a3b8', fontSize: '10px', fontWeight: 800, marginTop: '8px'}}>
                      <CheckCircle2 size={12} color={isPassed ? '#4ade80' : '#fb7185'} /> 
                      CLOUDSYNC VERIFIED
                    </div>
                  </div>
                  <div className="score-val-ui" style={{ color: isPassed ? '#4ade80' : '#ef4444', textShadow: isPassed ? '0 0 20px rgba(74, 222, 128, 0.4)' : '0 0 20px rgba(239, 68, 68, 0.4)' }}>
                    {displayScore}
                  </div>
                </div>
                
                <button onClick={() => setSearchTerm('')} style={{width: '100%', marginTop: '20px', border: 'none', background: '#f8fafc', padding: '14px', borderRadius: '14px', color: '#94a3b8', fontWeight: 700, cursor: 'pointer', fontSize: '13px'}}>清除結果</button>
              </div>
            ) : (
              searchTerm.length >= 2 && (
                <div className="card-ui" style={{textAlign: 'center', padding: '48px 24px'}}>
                  <AlertCircle size={32} color="#e2e8f0" style={{margin: '0 auto 16px'}} />
                  <h3 style={{fontSize: '18px', fontWeight: 800, margin: 0}}>查無此資料</h3>
                  <p style={{color: '#94a3b8', fontSize: '13px', marginTop: '8px'}}>請確認分頁與姓名是否正確，或點擊上方按鈕更新資料。</p>
                </div>
              )
            )
          ) : (
            <div className="empty-state" style={{textAlign: 'center', marginTop: '60px', opacity: 0.1}}>
              <Search size={48} style={{marginBottom: '12px'}} />
              <p style={{fontSize: '14px', fontWeight: 600}}>等待輸入查詢資料...</p>
            </div>
          )}
        </>
      )}

      <footer style={{marginTop: 'auto', paddingTop: '40px', color: '#cbd5e1', fontSize: '10px', fontWeight: 800, letterSpacing: '2px', display: 'flex', alignItems: 'center', gap: '8px'}}>
        <RefreshCw size={12} className={(loading || isSyncing) ? 'spin' : ''} />
        LIVE STATUS: {(loading || isSyncing) ? 'UPDATING' : 'SECURED'}
      </footer>
    </div>
  );
};

export default App;
