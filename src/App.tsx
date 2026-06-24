import React, { useState, useMemo } from 'react';

// ==========================================
// 1. 共通アイコンコンポーネント
// ==========================================
type IconName = 'fault' | 'product' | 'company' | 'phone' | 'log' | 'menu' | 'estimate' | 'contract' | 'database' | 'arrow-right' | 'dashboard' | 'bell' | 'search' | 'server';

interface IconProps {
  name: IconName;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ name, className = "" }) => {
  const icons: Record<IconName, string> = {
    fault: 'M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z',
    product: 'M21 7.5V18M15 7.5V18M3 7.5V18M9 7.5V18M18 7.5V18M12 7.5V18M6 7.5V18M3 18h18M3 7.5h18',
    company: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h18',
    phone: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-1.514 2.018a13.12 13.12 0 0 1-5.733-5.733l2.018-1.514c.362-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H3.122a2.25 2.25 0 0 0-2.25 2.25v.75Z',
    log: 'M16.862 4.487l1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10',
    menu: 'M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5',
    estimate: 'M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5A3.375 3.375 0 0 0 10.125 2.25H4.125A1.875 1.875 0 0 0 2.25 4.125v15.75c0 1.035.84 1.875 1.875 1.875h12c1.035 0 1.875-.84 1.875-1.875V14.25Z',
    contract: 'M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5.586a1 1 0 0 1 .707.293l5.414 5.414a1 1 0 0 1 .293.707V19a2 2 0 0 1-2 2Z',
    database: 'M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75m-16.5-3.75v3.75',
    'arrow-right': 'M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3',
    dashboard: 'M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z',
    bell: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0',
    search: 'm21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z',
    server: 'M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3V8.25a3 3 0 0 0-3-3H5.25ZM16.5 12a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0Zm0 3.75a.75.75 0 1 1 1.5 0 .75.75 0 0 1-1.5 0ZM4.5 9a.75.75 0 0 1 .75-.75h6a.75.75 0 0 1 0 1.5h-6A.75.75 0 0 1 4.5 9Zm.75 5.25a.75.75 0 0 0 0 1.5h6a.75.75 0 0 0 0-1.5h-6Z'
  };

  return (
      <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className={`min-w-[20px] min-h-[20px] max-w-[20px] max-h-[20px] ${className}`}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d={icons[name]} />
      </svg>
  );
};

// ==========================================
// 2. 型定義 (複数の関連機器に対応)
// ==========================================
interface InvolvedProduct {
  productId: string;
  productName: string;
  serialNumber: string;
  maintenanceCompany: string;
  inHoursContact: string;
  outOfHoursContact: string;
  isContactFailed: boolean;
  failedAttemptTime: string | null;
}

interface FaultData {
  id: string;
  status: '障害発生中' | '保守対応中' | '復旧済み';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  products: InvolvedProduct[]; // 複数の機器情報を内包する配列構造
}

interface MenuAction {
  id: string;
  title: string;
  description: string;
  icon: IconName;
  targetScreen: string;
  accentColor: string;
  badge?: string;
  colSpan?: string;
}

interface PortalDashboardProps {
  onNavigate: (screen: string) => void;
  activeFaultsCount: number;
}

// ==========================================
// 3. メイン親コンポーネント
// ==========================================
export default function AppContainer() {
  const [currentScreen, setCurrentScreen] = useState<string>('portal');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // 複数機器のデータを持つように疑似データを拡張
  const [faults, setFaults] = useState<FaultData[]>([
    {
      id: 'F-20260618-001',
      status: '障害発生中',
      severity: 'CRITICAL',
      description: 'データセンター内ラックBの電源瞬断に伴う、複数システムの連鎖障害。',
      products: [
        {
          productId: 'P-DB-001',
          productName: '基幹データベースサーバー群 (主系)',
          serialNumber: 'SN-YAMAHA-9921',
          maintenanceCompany: '株式会社システム保守A',
          inHoursContact: '03-XXXX-0001 (平日09:00-18:00)',
          outOfHoursContact: '090-XXXX-0001 (夜間・休日)',
          isContactFailed: true, // 督促アラート表示ルート通過
          failedAttemptTime: '2026-06-18 10:30',
        },
        {
          productId: 'P-SW-042',
          productName: 'L2ネットワークスイッチ (Cisco)',
          serialNumber: 'SN-CS-5512',
          maintenanceCompany: 'Bネットワークス株式会社',
          inHoursContact: '03-XXXX-0002 (24時間受付)',
          outOfHoursContact: '03-XXXX-0002 (24時間受付)',
          isContactFailed: false, // 連絡未試行または成功ルート通過
          failedAttemptTime: null,
        }
      ]
    },

    // パターン2: 単一機器・WARNING・連絡未失敗（基本フローの検証用）
    // 判定ルート: status === '障害発生中' 且つ isContactFailed === false
    {
      id: 'F-20260618-002',
      status: '障害発生中',
      severity: 'WARNING',
      description: 'ロードバランサへの接続遅延、冗長構成によりサービスは継続中。',
      products: [
        {
          productId: 'P-LB-002',
          productName: 'トラフィックコントローラ (BIG-IP)',
          serialNumber: 'SN-F5-8831',
          maintenanceCompany: 'Bネットワークス株式会社',
          inHoursContact: '03-XXXX-0002 (24時間受付)',
          outOfHoursContact: '03-XXXX-0002 (24時間受付)',
          isContactFailed: false,
          failedAttemptTime: null,
        }
      ]
    },

    // パターン3: 単一機器・保守対応中（ステータス絞り込みの検証用）
    // 判定ルート: status === '保守対応中' (「連絡失敗を記録」ボタンが非表示となるルート)
    {
      id: 'F-20260618-003',
      status: '保守対応中',
      severity: 'WARNING',
      description: '外部メール連携APIの応答遅延。保守会社がリモートログ解析を実施中。',
      products: [
        {
          productId: 'P-SVR-005',
          productName: 'メールゲートウェイアプリケーション',
          serialNumber: 'SN-MS-7741',
          maintenanceCompany: '株式会社セキュリティC',
          inHoursContact: '03-XXXX-0003 (平日09:00-17:30)',
          outOfHoursContact: '090-XXXX-0003 (緊急受付窓口)',
          isContactFailed: false,
          failedAttemptTime: null,
        }
      ]
    },

    // パターン4: 複数機器・復旧済み（ステータス絞り込みおよび過去ログ照会の検証用）
    // 判定ルート: status === '復旧済み' (「連絡失敗を記録」ボタンが非表示となるルート)
    {
      id: 'F-20260617-099',
      status: '復旧済み',
      severity: 'INFO',
      description: 'ストレージ容量枯渇の予兆検知。不要ログの削除およびパーティション拡張作業完了。',
      products: [
        {
          productId: 'P-STG-011',
          productName: 'SANストレージ筐体A',
          serialNumber: 'SN-EMC-1102',
          maintenanceCompany: '株式会社システム保守A',
          inHoursContact: '03-XXXX-0001 (平日09:00-18:00)',
          outOfHoursContact: '090-XXXX-0001 (夜間・休日)',
          isContactFailed: false,
          failedAttemptTime: null,
        },
        {
          productId: 'P-SVR-022',
          productName: 'ログ解析用仮想ホスト',
          serialNumber: 'SN-VM-3344',
          maintenanceCompany: '株式会社システム保守A',
          inHoursContact: '03-XXXX-0001 (平日09:00-18:00)',
          outOfHoursContact: '090-XXXX-0001 (夜間・休日)',
          isContactFailed: false,
          failedAttemptTime: null,
        }
      ]
    }
  ]);

  const activeFaultsCount = useMemo(() => {
    return faults.filter(f => f.status === '障害発生中').length;
  }, [faults]);

  return (
      <div className="flex h-screen bg-[#090e17] text-[#f1f5f9] font-sans overflow-hidden">

        {/* サイドバー */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-[#0f172a] border-r border-[#1e293b] flex flex-col`}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-[#1e293b]">
            {isSidebarOpen && <span className="font-black text-xl tracking-tight text-white">SYS<span className="text-[#22d3ee]">ADMIN</span></span>}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">
              <Icon name="menu" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarItem icon="dashboard" label="ダッシュボード" isActive={currentScreen === 'portal'} onClick={() => setCurrentScreen('portal')} isOpen={isSidebarOpen} />
            <SidebarItem icon="fault" label="障害対応管理" isActive={currentScreen === 'trouble_search'} onClick={() => setCurrentScreen('trouble_search')} isOpen={isSidebarOpen} badge={activeFaultsCount} />
            <SidebarItem icon="estimate" label="JSU見積作成" isActive={currentScreen === 'estimate'} onClick={() => setCurrentScreen('estimate')} isOpen={isSidebarOpen} />
            <SidebarItem icon="contract" label="保守契約" isActive={currentScreen === 'contract'} onClick={() => setCurrentScreen('contract')} isOpen={isSidebarOpen} />
            <SidebarItem icon="database" label="DBメンテ" isActive={currentScreen === 'db'} onClick={() => setCurrentScreen('db')} isOpen={isSidebarOpen} />
          </nav>
        </aside>

        {/* メインビュー */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden">
          <header className="h-16 bg-[#0f172a]/80 backdrop-blur-md border-b border-[#1e293b] flex items-center justify-between px-8 z-10">
            <div className="flex items-center bg-[#1e293b] rounded-lg px-3 py-1.5 w-64 border border-slate-700/50">
              <Icon name="search" className="text-slate-500 mr-2" />
              <input type="text" placeholder="全体検索..." className="bg-transparent border-none outline-none text-sm w-full text-white placeholder-slate-500" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-8">
            <div className="max-w-7xl mx-auto">
              {currentScreen === 'portal' && (
                  <PortalDashboard onNavigate={setCurrentScreen} activeFaultsCount={activeFaultsCount} />
              )}
              {currentScreen === 'trouble_search' && (
                  <ModernTroubleSearch faults={faults} setFaults={setFaults} />
              )}
            </div>
          </div>
        </main>
      </div>
  );
}

const SidebarItem = ({ icon, label, isActive, onClick, isOpen, badge }: { icon: IconName, label: string, isActive: boolean, onClick: () => void, isOpen: boolean, badge?: number }) => (
    <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#22d3ee]/10 text-[#22d3ee] font-bold' : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}>
      <Icon name={icon} className={isActive ? 'text-[#22d3ee]' : ''} />
      {isOpen && <span className="ml-3 text-sm flex-1 text-left">{label}</span>}
      {isOpen && badge ? <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span> : null}
    </button>
);

// ==========================================
// 4. 機能一覧 (ダッシュボードポータル)
// ==========================================
  const PortalDashboard: React.FC<PortalDashboardProps> = ({ onNavigate, activeFaultsCount }) => {
  const menuItems: MenuAction[] = [
    {
      id: 'sub-03',
      title: '障害対応管理',
      description: '障害IDから連鎖する複数の製品・機器を特定し、各保守会社の時間内・時間外連絡先をクロス検索します。',
      icon: 'fault',
      targetScreen: 'trouble_search',
      accentColor: 'from-cyan-900/40 to-[#0f172a] border-cyan-500/30 hover:border-cyan-400 group',
      badge: activeFaultsCount > 0 ? `${activeFaultsCount}件のアラート` : undefined,
      colSpan: 'md:col-span-2 lg:col-span-2',
    },
    { id: 'sub-01', title: '見積作成', description: 'JSU見積書の作成を行います。', icon: 'estimate', targetScreen: 'estimate', accentColor: 'from-indigo-900/30 to-[#0f172a] border-indigo-500/30 hover:border-indigo-400 group' },
    { id: 'sub-02', title: '保守契約', description: '契約更新と台帳管理を処理します。', icon: 'contract', targetScreen: 'contract', accentColor: 'from-purple-900/30 to-[#0f172a] border-purple-500/30 hover:border-purple-400 group' },
    { id: 'sub-04', title: 'マスターメンテ', description: '機器情報や保守会社のデータを管理します。', icon: 'database', targetScreen: 'db', accentColor: 'from-emerald-900/30 to-[#0f172a] border-emerald-500/30 hover:border-emerald-400 group' },
  ];

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-linear-to-br from-[#1e293b] to-[#0f172a] border border-[#334155] rounded-3xl p-8 flex flex-col justify-center">
            <h1 className="text-3xl font-black text-white mb-2">運用システム状況</h1>
            <p className="text-slate-400">機器・製品の保守契約状態および障害対応を監視しています。</p>
          </div>
          <div className="bg-[#1e293b]/50 border border-[#334155] rounded-3xl p-6 flex items-center justify-between">
            <div>
              <div className="text-slate-400 text-sm font-bold mb-1">現在の障害対応</div>
              <div className="text-5xl font-black text-white flex items-baseline gap-2">{activeFaultsCount} <span className="text-base font-normal text-slate-500">件</span></div>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${activeFaultsCount > 0 ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'}`}>
              <Icon name="fault" className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
              <div key={item.id} onClick={() => onNavigate(item.targetScreen)} className={`bg-linear-to-br border rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${item.colSpan} ${item.accentColor}`}>
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-white/5 p-3 rounded-2xl text-white"><Icon name={item.icon} /></div>
                    {item.badge && <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-bold">{item.badge}</span>}
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                  <p className="text-slate-400 text-sm mb-6">{item.description}</p>
                </div>
                <div className="flex items-center justify-end text-sm font-semibold gap-2 text-slate-500 group-hover:text-white pt-4">
                  <span>機能を開く</span>
                  <Icon name="arrow-right" />
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

// ==========================================
// 5. 障害対応画面コンポーネント (1対多レイアウト)
// ==========================================
interface ModernTroubleSearchProps {
  faults: FaultData[];
  setFaults: React.Dispatch<React.SetStateAction<FaultData[]>>;
}

const ModernTroubleSearch: React.FC<ModernTroubleSearchProps> = ({ faults, setFaults }) => {
  const [searchId, setSearchId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('すべて');

  // 例外フロー 7-b: 「複数のうち、1社でも連絡が取れなかった製品」のリストアップ
  const unreachableProducts = useMemo(() => {
    const list: { faultId: string; product: InvolvedProduct }[] = [];
    faults.forEach(fault => {
      if (fault.status === '障害発生中') {
        fault.products.forEach(p => {
          if (p.isContactFailed) {
            list.push({ faultId: fault.id, product: p });
          }
        });
      }
    });
    return list;
  }, [faults]);

  // 検索フィルタ（障害IDまたは内包する製品名でヒット）
  const filteredFaults = useMemo(() => {
    return faults.filter(fault => {
      const matchId = fault.id.includes(searchId);
      const matchProductName = fault.products.some(p => p.productName.includes(searchId));
      const matchStatus = filterStatus === 'すべて' || fault.status === filterStatus;
      return (matchId || matchProductName) && matchStatus;
    });
  }, [faults, searchId, filterStatus]);

  // 個別の製品ごとに連絡失敗を記録する処理（例外フロー 7-a）
  const handleProductFailure = (faultId: string, productId: string) => {
    const currentTime = new Date().toLocaleString('ja-JP');
    setFaults(prevFaults =>
        prevFaults.map(fault => {
          if (fault.id !== faultId) return fault;
          return {
            ...fault,
            products: fault.products.map(p =>
                p.productId === productId
                    ? { ...p, isContactFailed: true, failedAttemptTime: currentTime }
                    : p
            )
          };
        })
    );
  };

  return (
      <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-white">障害対応管理</h1>
          <p className="text-sm text-slate-500 mt-1">障害関連製品の特定および連絡先一括照会</p>
        </div>

        {/* 例外フロー 7-b: 督促表示（複数機器対応） */}
        {unreachableProducts.length > 0 && (
            <div className="bg-red-950/40 border border-red-500/50 text-red-300 p-5 rounded-2xl shadow-[0_0_15px_rgba(239,68,68,0.15)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-500/20 p-2 rounded-full text-red-500"><Icon name="fault" /></div>
                <p className="font-bold">要確認: 以下の保守会社（製品）への連絡が取れていません</p>
              </div>
              <div className="pl-11 space-y-2 text-sm">
                {unreachableProducts.map(({ faultId, product }) => (
                    <div key={`${faultId}-${product.productId}`} className="bg-black/20 p-3 rounded-xl border border-red-500/10 flex justify-between items-center">
                      <div>
                        障害ID: <span className="font-mono text-white font-bold">{faultId}</span> / 対象: <span className="text-white">{product.productName}</span> ({product.maintenanceCompany})
                      </div>
                      <div className="text-xs text-red-400">試行時刻: {product.failedAttemptTime}</div>
                    </div>
                ))}
              </div>
            </div>
        )}

        {/* 検索・絞り込みエリア */}
        <div className="bg-[#1e293b]/50 p-4 rounded-2xl flex gap-4 items-center border border-[#334155]">
          <div className="flex-1 relative">
            <input
                type="text"
                className="w-full bg-black/30 border border-[#334155] rounded-xl px-4 py-2.5 pl-11 text-white text-sm focus:outline-none focus:border-[#22d3ee] transition"
                placeholder="障害ID、または製品名を入力..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"><Icon name="search" /></div>
          </div>
          <div className="w-48">
            <select
                className="w-full bg-black/30 border border-[#334155] rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#22d3ee] transition"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">全ステータス</option>
              <option value="障害発生中">障害発生中</option>
              <option value="保守対応中">保守対応中</option>
              <option value="復旧済み">復旧済み</option>
            </select>
          </div>
        </div>

        {/* 障害対応メインカードリスト */}
        <div className="space-y-6">
          {filteredFaults.map((fault) => (
              <div key={fault.id} className="bg-[#1e293b]/90 border border-[#334155] rounded-3xl p-6 shadow-xl flex flex-col gap-6">

                {/* カード上部: 障害基本情報 */}
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-black text-white tracking-tight">{fault.id}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${fault.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-amber-500/20 text-amber-400'}`}>{fault.severity}</span>
                    </div>
                    <p className="text-sm text-slate-400">{fault.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-3 py-1 rounded-full font-semibold">{fault.status}</span>
                    {/* 進捗管理情報作成要求ボタン (基本フロー 8) */}
                    <button className="p-2.5 bg-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-cyan-600 transition shadow" title="進捗管理情報の作成要求">
                      <Icon name="log" />
                    </button>
                  </div>
                </div>

                {/* カード中部: 紐づく複数機器の一覧（グリッド/個別パネル化） */}
                <div>
                  <div className="text-xs font-bold text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <Icon name="server" className="text-[#22d3ee]" /> 影響・関連対象製品 ({fault.products.length}台)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fault.products.map((product) => (
                        <div key={product.productId} className="bg-black/30 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-700 transition">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <div>
                                <div className="text-white font-bold text-sm">{product.productName}</div>
                                <div className="text-[11px] text-slate-500 font-mono">ID: {product.productId} / {product.serialNumber}</div>
                              </div>
                            </div>

                            <div className="space-y-1.5 text-xs text-slate-300 pt-1">
                              <div className="flex items-center gap-2"><Icon name="company" className="text-slate-500" /> {product.maintenanceCompany}</div>
                              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-800 space-y-1 mt-1">
                                <div className="text-slate-400 flex items-center gap-1"><Icon name="phone" className="w-3.5 h-3.5" /> 障害時連絡先</div>
                                <div className="text-white font-medium pl-4">時間内: {product.inHoursContact.split(' ')[0]}</div>
                                <div className="text-[#22d3ee] font-bold pl-4">時間外: {product.outOfHoursContact.split(' ')[0]}</div>
                              </div>
                            </div>
                          </div>

                          {/* 各機器に対する連絡失敗の個別記録ボタン（例外フロー 7-a） */}
                          {fault.status === '障害発生中' && (
                              <div className="mt-4 pt-3 border-t border-slate-900">
                                <button
                                    onClick={() => handleProductFailure(fault.id, product.productId)}
                                    className={`w-full text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${product.isContactFailed ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-pink-500/10 text-pink-500 border border-pink-500/20 hover:bg-pink-600 hover:text-white'}`}
                                    disabled={product.isContactFailed}
                                >
                                  <Icon name="fault" className="w-3.5 h-3.5" />
                                  {product.isContactFailed ? '連絡失敗として記録済' : '連絡失敗を記録'}
                                </button>
                              </div>
                          )}
                        </div>
                    ))}
                  </div>
                </div>

              </div>
          ))}
        </div>
      </div>
  );
};