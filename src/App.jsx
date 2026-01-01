import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Search, GraduationCap, AlertCircle, CheckCircle2, 
  Loader2, BookOpen, Cpu, RefreshCw, ShieldAlert, 
  User, Hash, Lock, Eye, EyeOff, Trash2, Settings, 
  LogOut, ExternalLink, RotateCw
} from 'lucide-react';

const API_BASE_URL = "https://script.google.com/macros/s/AKfycbzTUO_rRZh6fRz95M4zc7ewk0lmfPbyAVezsVKIKbQbXJBPoGHnZc4JnGmbCkRM2l7d/exec";
const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1O22jKgoSb_qk2ItORCbhRCUikmlS4tO5LOx8wS81H6Y/edit?usp=sharing";

const App = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [subject, setSubject] = useState(''); 
  const [searchTerm, setSearchTerm] = useState(''); 
  const [allData, setAllData] = useState([]); 
  const [loading, setLoading] = useState(false); 
  const [error, setError] = useState(null);

  const [isSyncing, setIsSyncing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  // 科目配置狀態
  const [subjectsConfig, setSubjectsConfig] = useState([]);
  const [newSubjectName, setNewSubjectName] = useState('');

  // 1. 核心同步邏輯：確保 id 絕對唯一且穩定
  const syncFromCloud = useCallback(async () => {
    setIsSyncing(true);
    try {
      const url = `${API_BASE_URL}?action=listSheets&t=${Date.now()}`;
      const response = await fetch(url);
      const cloudData = await response.json();

      if (Array.isArray(cloudData)) {
        // 使用名稱 + 索引作為 ID，解決名稱重複導致的 Key 衝突
        const formattedData = cloudData.map((item, index) => ({
          id: `sub-${index}-${item.name || 'unnamed'}`,
          name: item.name || `未知科目-${index}`,
          isVisible: item.isVisible !== false 
        }));
        setSubjectsConfig(formattedData);
      }
    } catch (err) {
      console.error("同步失敗:", err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    syncFromCloud();
  }, [syncFromCloud]);

  // 2. 自動切換預設科目
  useEffect(() => {
    const visibleOnes = subjectsConfig.filter(s => s.isVisible);
    if (visibleOnes.length > 0 && (!subject || !visibleOnes.find(s => s.name === subject))) {
      setSubject(visibleOnes[0].name);
    }
  }, [subjectsConfig, subject]);

  // 3. 後台切換隱藏
  const toggleVisibility = async (subName, currentStatus) => {
    const nextStatus = !currentStatus;
    setSubjectsConfig(prev => prev.map(s => s.name === subName ? {...s, isVisible: nextStatus} : s));

    try {
      const url = `${API_BASE_URL}?action=updateVisibility&name=${encodeURIComponent(subName)}&isVisible=${nextStatus}&t=${Date.now()}`;
      const res = await fetch(url);
      const result = await res.json();
      if (!result.success) throw new Error("雲端更新失敗");
    } catch (err) {
      alert("無法同步隱藏設定到雲端。");
      syncFromCloud();
    }
  };

  // 查詢成績資料
  const fetchData = async (targetSubject) => {
    if (!targetSubject) return;
    setLoading(true);
    setError(null);
    try {
      const url = `${API_BASE_URL}?subject=${encodeURIComponent(targetSubject)}&t=${Date.now()}`;
      const response = await fetch(url);
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllData(data);
      } else {
        throw new Error(data.error || "資料格式異常");
      }
    } catch (err) {
      setError("連線失敗。請確認網路狀態。");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (subject && !isAdminMode) fetchData(subject);
  }, [subject, isAdminMode]);

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

  const isPassed = useMemo(() => Number(displayScore) >= 60, [displayScore]);

  const handleLogin = () => {
    if (password === 'minar7917') {
      setIsLoggedIn(true);
      setPassword('');
    } else { alert('密碼錯誤'); }
  };

  const addSubject = async () => {
    const name = newSubjectName.trim();
    if (!name) return;
    setIsCreating(true);
    try {
      const url = `${API_BASE_URL}?action=createSheet&name=${encodeURIComponent(name)}&t=${Date.now()}`;
      const res = await fetch(url);
      const result = await res.json();
      if (result.success) {
        setNewSubjectName('');
        await syncFromCloud();
      } else { alert(result.error); }
    } catch (err) { alert("建立失敗。"); }
    finally { setIsCreating(false); }
  };

  const appStyles = `
    .app-main { min-height: 100vh; background: #f1f5f9; padding: 32px 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; }
    .card { background: white; border-radius: 24px; padding: 24px; width: 100%; max-width: 400px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); margin-bottom: 20px; box-sizing: border-box; }
    .logo-ui { width: 50px; height: 50px; background: #4f46e5; border-radius: 15px; display: flex; align-items: center; justify-content: center; margin-bottom: 15px; }
    .nav-tabs { display: flex; gap: 8px; overflow-x: auto; width: 100%; max-width: 400px; margin-bottom: 20px; padding: 4px; scrollbar-width: none; }
    .nav-tabs::-webkit-scrollbar { display: none; }
    .tab-btn { padding: 10px 20px; border: none; border-radius: 12px; background: #e2e8f0; color: #64748b; font-weight: 700; cursor: pointer; white-space: nowrap; transition: all 0.2s; }
    .tab-btn.active { background: white; color: #4f46e5; box-shadow: 0 4px 10px rgba(0,0,0,0.05); }
    .input-ui { width: 100%; padding: 15px; border-radius: 15px; border: 2px solid #f1f5f9; font-size: 16px; outline: none; box-sizing: border-box; transition: border-color 0.2s; }
    .input-ui:focus { border-color: #4f46e5; }
    .btn-primary { width: 100%; padding: 15px; background: #4f46e5; color: white; border: none; border-radius: 15px; font-weight: 700; cursor: pointer; margin-top: 10px; transition: opacity 0.2s; }
    .score-box { background: #1e293b; color: white; padding: 20px; border-radius: 20px; display: flex; justify-content: space-between; align-items: center; margin-top: 20px; }
    .spin { animation: spin 1s linear infinite; }
    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes popUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
  `;

  if (isAdminMode && !isLoggedIn) {
    return (
      <div className="app-main">
        <style>{appStyles}</style>
        <div className="card" style={{textAlign: 'center', animation: 'popUp 0.3s ease'}}>
          <div className="logo-ui" style={{margin: '0 auto 20px'}}><Lock color="white" /></div>
          <h2 style={{marginBottom: '20px'}}>管理員登入</h2>
          <input className="input-ui" type="password" placeholder="請輸入管理密碼" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
          <button className="btn-primary" onClick={handleLogin}>登入</button>
          <button style={{marginTop: '15px', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontWeight: 600}} onClick={() => setIsAdminMode(false)}>返回查詢頁</button>
        </div>
      </div>
    );
  }

  if (isAdminMode && isLoggedIn) {
    return (
      <div className="app-main">
        <style>{appStyles}</style>
        <div className="card" style={{animation: 'popUp 0.3s ease'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px'}}>
            <h2 style={{margin: 0}}>管理控制台</h2>
            <button onClick={syncFromCloud} disabled={isSyncing} style={{border: 'none', background: 'none', cursor: 'pointer', padding: '5px'}}>
              <RotateCw size={20} className={isSyncing ? 'spin' : ''} color="#64748b" />
            </button>
          </div>
          
          <div style={{marginBottom: '24px'}}>
            <p style={{fontSize: '14px', color: '#64748b', fontWeight: 800, marginBottom: '12px'}}>科目顯示設定 (所有人可見)</p>
            {subjectsConfig.length > 0 ? subjectsConfig.map((sub) => (
              <div key={sub.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '12px', marginBottom: '8px', border: '1px solid #e2e8f0'}}>
                <span style={{fontWeight: 700, color: sub.isVisible ? '#1e293b' : '#94a3b8'}}>{sub.name} {!sub.isVisible && "(隱藏中)"}</span>
                <button 
                  onClick={() => toggleVisibility(sub.name, sub.isVisible)} 
                  style={{border: 'none', background: sub.isVisible ? '#dcfce7' : '#f1f5f9', color: sub.isVisible ? '#166534' : '#64748b', padding: '6px 14px', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600}}
                >
                  {sub.isVisible ? <><Eye size={16}/> 顯示中</> : <><EyeOff size={16}/> 已隱藏</>}
                </button>
              </div>
            )) : <p style={{color: '#94a3b8', textAlign: 'center'}}>尚無科目資料</p>}
          </div>

          <div style={{borderTop: '2px dashed #f1f5f9', paddingTop: '20px'}}>
            <p style={{fontSize: '14px', color: '#64748b', fontWeight: 800, marginBottom: '12px'}}>新增考試科目</p>
            <input className="input-ui" style={{marginBottom: '10px'}} placeholder="請輸入新科目名稱" value={newSubjectName} onChange={e => setNewSubjectName(e.target.value)} />
            <button className="btn-primary" onClick={addSubject} disabled={isCreating}>{isCreating ? "同步雲端中..." : "新增並同步雲端"}</button>
            <button className="btn-primary" style={{background: '#f1f5f9', color: '#64748b', marginTop: '10px'}} onClick={() => {setIsLoggedIn(false); setIsAdminMode(false);}}>退出管理後台</button>
          </div>
        </div>
      </div>
    );
  }

  const visibleSubjects = subjectsConfig.filter(s => s.isVisible);

  return (
    <div className="app-main">
      <style>{appStyles}</style>
      <button style={{position: 'absolute', top: '24px', right: '24px', background: 'white', border: 'none', padding: '12px', borderRadius: '14px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.05)'}} onClick={() => setIsAdminMode(true)}><Settings size={20} color="#94a3b8" /></button>

      <div style={{textAlign: 'center', marginBottom: '32px'}}>
        <div className="logo-ui" style={{margin: '0 auto 15px'}}><GraduationCap color="white" size={28} /></div>
        <h1 style={{margin: 0, fontSize: '26px', fontWeight: 900, color: '#1e293b'}}>Minar成績查詢</h1>
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginTop: '8px'}}>
          <p style={{fontSize: '13px', color: '#94a3b8', margin: 0, fontWeight: 600}}>龔旭陽實驗室所有</p>
          <button onClick={handleManualRefresh} disabled={isSyncing || loading} style={{background: 'none', border: 'none', cursor: 'pointer', display: 'flex'}}>
            <RotateCw size={14} className={(isSyncing || loading) ? 'spin' : ''} color="#cbd5e1" />
          </button>
        </div>
      </div>

      <div className="nav-tabs">
        {visibleSubjects.length > 0 && visibleSubjects.map((sub) => (
          <button key={sub.id} className={`tab-btn ${subject === sub.name ? 'active' : ''}`} onClick={() => setSubject(sub.name)}>{sub.name}</button>
        ))}
      </div>

      {isSyncing ? (
        <div style={{marginTop: '40px', textAlign: 'center'}}>
          <Loader2 className="spin" size={32} color="#4f46e5" />
          <p style={{color: '#94a3b8', fontSize: '14px', marginTop: '10px'}}>正在同步最新成績...</p>
        </div>
      ) : visibleSubjects.length > 0 ? (
        <>
          <div className="card" style={{marginBottom: '15px'}}>
            <div style={{position: 'relative'}}>
              <Search style={{position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1'}} size={20} />
              <input className="input-ui" style={{paddingLeft: '45px'}} placeholder={`輸入學號或姓名查詢 ${subject}`} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
            </div>
          </div>

          {searchTerm.trim() && (
            queryResult ? (
              <div className="card" style={{animation: 'popUp 0.3s ease'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px'}}>
                  <div>
                    <span style={{fontSize: '12px', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '2px'}}>STUDENT NAME</span>
                    <h2 style={{margin: 0, fontSize: '24px', fontWeight: 900}}>{queryResult.姓名 ?? queryResult.name}</h2>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    <span style={{fontSize: '12px', color: '#94a3b8', fontWeight: 700, display: 'block', marginBottom: '2px'}}>ID NUMBER</span>
                    <div style={{background: '#f1f5f9', padding: '4px 12px', borderRadius: '10px', fontWeight: 700, color: '#475569'}}>{queryResult.學號 ?? queryResult.studentId}</div>
                  </div>
                </div>
                <div className="score-box">
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{width: '8px', height: '8px', borderRadius: '50%', background: isPassed ? '#4ade80' : '#f87171'}}></div>
                    <span style={{fontWeight: 700, fontSize: '15px'}}>{subject} 分數</span>
                  </div>
                  <span style={{fontSize: '38px', fontWeight: 900, color: isPassed ? '#4ade80' : '#f87171', textShadow: '0 0 15px rgba(255,255,255,0.1)'}}>{displayScore}</span>
                </div>
                <button onClick={() => setSearchTerm('')} style={{width: '100%', border: 'none', background: '#f8fafc', padding: '12px', borderRadius: '12px', color: '#cbd5e1', fontWeight: 700, cursor: 'pointer', marginTop: '20px', fontSize: '13px'}}>清除查詢</button>
              </div>
            ) : searchTerm.length >= 2 && (
              <div className="card" style={{textAlign: 'center', background: '#fffcfc', border: '1px solid #fee2e2'}}>
                <AlertCircle size={30} color="#f87171" style={{margin: '0 auto 10px'}} />
                <p style={{color: '#ef4444', fontWeight: 700, margin: 0}}>查無此資料</p>
                <p style={{color: '#94a3b8', fontSize: '13px', marginTop: '5px'}}>請檢查輸入內容或確認選擇科目是否正確</p>
              </div>
            )
          )}
        </>
      ) : (
        <div style={{marginTop: '60px', textAlign: 'center', color: '#94a3b8'}}>
          <BookOpen size={40} style={{margin: '0 auto 15px', opacity: 0.3}} />
          <p style={{fontWeight: 600}}>目前暫無開放查詢科目</p>
        </div>
      )}

      {error && !loading && (
        <div style={{position: 'fixed', bottom: '20px', padding: '10px 20px', background: '#ef4444', color: 'white', borderRadius: '12px', fontWeight: 700, boxShadow: '0 10px 20px rgba(239, 68, 68, 0.2)', fontSize: '14px'}}>
          {error}
        </div>
      )}
    </div>
  );

  async function handleManualRefresh() {
    await syncFromCloud();
    if (subject && !isAdminMode) await fetchData(subject);
  }
};

export default App;
