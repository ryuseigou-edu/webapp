import React, { useState, useMemo, useEffect } from 'react';
import {
  FiAlertTriangle,
  FiBox,
  FiBriefcase,
  FiPhone,
  FiEdit,
  FiMenu,
  FiFileText,
  FiCheckSquare,
  FiDatabase,
  FiArrowRight,
  FiGrid,
  FiBell,
  FiSearch,
  FiServer
} from 'react-icons/fi';

// ==========================================
// 1. 共通アイコン描画用ラッパー
// ==========================================
type IconName = 'fault' | 'product' | 'company' | 'phone' | 'log' | 'menu' | 'estimate' | 'contract' | 'database' | 'arrow-right' | 'dashboard' | 'bell' | 'search' | 'server';

interface IconProps {
  name: IconName;
  className?: string;
}

const IconWrapper: React.FC<IconProps> = ({ name, className = "" }) => {
  const icons: Record<IconName, React.ReactNode> = {
    fault: <FiAlertTriangle className={className} />,
    product: <FiBox className={className} />,
    company: <FiBriefcase className={className} />,
    phone: <FiPhone className={className} />,
    log: <FiEdit className={className} />,
    menu: <FiMenu className={className} />,
    estimate: <FiFileText className={className} />,
    contract: <FiCheckSquare className={className} />,
    database: <FiDatabase className={className} />,
    'arrow-right': <FiArrowRight className={className} />,
    dashboard: <FiGrid className={className} />,
    bell: <FiBell className={className} />,
    search: <FiSearch className={className} />,
    server: <FiServer className={className} />
  };
  return <>{icons[name]}</>;
};

// ==========================================
// 2. 型定義
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
  products: InvolvedProduct[];
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

interface ModernTroubleSearchProps {
  faults: FaultData[];
  setFaults: React.Dispatch<React.SetStateAction<FaultData[]>>;
}

// ==========================================
// 3. メイン親コンポーネント (アプリ全体の枠組み)
// ==========================================
export default function AppContainer() {
  const [currentScreen, setCurrentScreen] = useState<string>('portal');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">

        {/* サイドバー */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 bg-white border-r border-slate-200 flex flex-col z-20`}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200">
            {isSidebarOpen && <span className="font-black text-xl tracking-tight text-slate-800">SYS<span className="text-blue-600">ADMIN</span></span>}
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100">
              <IconWrapper name="menu" className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <SidebarItem icon="dashboard" label="ポータル画面" isActive={currentScreen === 'portal'} onClick={() => setCurrentScreen('portal')} isOpen={isSidebarOpen} />
            <SidebarItem icon="fault" label="障害対応管理" isActive={currentScreen === 'trouble_search'} onClick={() => setCurrentScreen('trouble_search')} isOpen={isSidebarOpen} badge={activeFaultsCount} />
            <SidebarItem icon="estimate" label="JSU見積作成" isActive={currentScreen === 'estimate'} onClick={() => setCurrentScreen('estimate')} isOpen={isSidebarOpen} />
            <SidebarItem icon="contract" label="保守契約" isActive={currentScreen === 'contract'} onClick={() => setCurrentScreen('contract')} isOpen={isSidebarOpen} />
            <SidebarItem icon="database" label="DBメンテ" isActive={currentScreen === 'db'} onClick={() => setCurrentScreen('db')} isOpen={isSidebarOpen} />
          </nav>
        </aside>

        {/* メインビュー */}
        <main className="flex-1 flex flex-col h-full relative overflow-hidden">
          <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10">
            <div className="flex items-center bg-slate-100 rounded-lg px-3 py-1.5 w-64 border border-slate-200 focus-within:border-blue-400 transition-colors">
              <IconWrapper name="search" className="text-slate-400 w-4 h-4 mr-2" />
              <input type="text" placeholder="全体検索..." className="bg-transparent border-none outline-none text-sm w-full text-slate-800 placeholder-slate-400" />
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-500 hover:text-slate-800 transition">
                <IconWrapper name="bell" className="w-5 h-5" />
                {activeFaultsCount > 0 && <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>}
              </button>
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
    <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
      <IconWrapper name={icon} className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
      {isOpen && <span className="ml-3 text-sm flex-1 text-left">{label}</span>}
      {isOpen && badge ? <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span> : null}
    </button>
);

// ==========================================
// 4. 機能一覧 (ポータル画面)
// ==========================================
const PortalDashboard: React.FC<PortalDashboardProps> = ({ onNavigate, activeFaultsCount }) => {
  const menuItems: MenuAction[] = [
    {
      id: 'sub-03',
      title: '障害対応管理',
      description: '障害IDから連鎖する複数の製品・機器を特定し、各保守会社の時間内・時間外連絡先をクロス検索します。',
      icon: 'fault',
      targetScreen: 'trouble_search',
      accentColor: 'border-slate-200 hover:border-red-300 hover:shadow-md group',
      badge: activeFaultsCount > 0 ? `${activeFaultsCount}件のアラート` : undefined,
      colSpan: 'md:col-span-2 lg:col-span-2',
    },
    { id: 'sub-01', title: '見積作成', description: 'JSU見積書の作成を行います。', icon: 'estimate', targetScreen: 'estimate', accentColor: 'border-slate-200 hover:border-blue-300 hover:shadow-md group' },
    { id: 'sub-02', title: '保守契約', description: '契約更新と台帳管理を処理します。', icon: 'contract', targetScreen: 'contract', accentColor: 'border-slate-200 hover:border-purple-300 hover:shadow-md group' },
    { id: 'sub-04', title: 'マスターメンテ', description: '機器情報や保守会社のデータを管理します。', icon: 'database', targetScreen: 'db', accentColor: 'border-slate-200 hover:border-emerald-300 hover:shadow-md group' },
  ];

  return (
      <div className="space-y-8 animate-in fade-in duration-500">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden shadow-sm">
            <div className="relative z-10">
              <h1 className="text-3xl font-black text-slate-800 mb-2">運用システム状況</h1>
              <p className="text-slate-600">機器・製品の保守契約状態および障害対応を監視しています。</p>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
          </div>
          <div className="bg-white border border-slate-200 rounded-3xl p-6 flex items-center justify-between shadow-sm">
            <div>
              <div className="text-slate-500 text-sm font-bold mb-1">現在の障害対応</div>
              <div className="text-5xl font-black text-slate-800 flex items-baseline gap-2">{activeFaultsCount} <span className="text-base font-normal text-slate-500">件</span></div>
            </div>
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${activeFaultsCount > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
              <IconWrapper name="fault" className="w-8 h-8" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
              <div key={item.id} onClick={() => onNavigate(item.targetScreen)} className={`bg-white border rounded-3xl p-6 flex flex-col justify-between cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${item.colSpan} ${item.accentColor}`}>
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <div className="bg-slate-100 text-slate-600 p-3 rounded-2xl group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                      <IconWrapper name={item.icon} className="w-6 h-6" />
                    </div>
                    {item.badge && <span className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full font-bold">{item.badge}</span>}
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-sm mb-6">{item.description}</p>
                </div>
                <div className="flex items-center justify-end text-sm font-semibold gap-2 text-slate-400 group-hover:text-blue-600 pt-4 border-t border-slate-100">
                  <span>機能を開く</span>
                  <IconWrapper name="arrow-right" className="w-4 h-4" />
                </div>
              </div>
          ))}
        </div>
      </div>
  );
};

// ==========================================
// 5. 障害対応画面 (連絡先動的強調表示版)
// ==========================================
const ModernTroubleSearch: React.FC<ModernTroubleSearchProps> = ({ faults, setFaults }) => {
  const [searchId, setSearchId] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('すべて');
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // NodeJSのタイマーと混同しないよう window.setInterval を明示
    const timer = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => window.clearInterval(timer);
  }, []);

  const isInHours = useMemo(() => {
    const day = currentTime.getDay();
    const hours = currentTime.getHours();
    const isWeekday = day >= 1 && day <= 5;
    const isBusinessHours = hours >= 9 && hours < 18;
    return isWeekday && isBusinessHours;
  }, [currentTime]);

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

  const filteredFaults = useMemo(() => {
    return faults.filter(fault => {
      const matchId = fault.id.includes(searchId);
      const matchProductName = fault.products.some(p => p.productName.includes(searchId));
      const matchStatus = filterStatus === 'すべて' || fault.status === filterStatus;
      return (matchId || matchProductName) && matchStatus;
    });
  }, [faults, searchId, filterStatus]);

  const handleProductFailure = (faultId: string, productId: string) => {
    const timeString = new Date().toLocaleString('ja-JP');
    setFaults(prevFaults =>
        prevFaults.map(fault => {
          if (fault.id !== faultId) return fault;
          return {
            ...fault,
            products: fault.products.map(p =>
                p.productId === productId
                    ? { ...p, isContactFailed: true, failedAttemptTime: timeString }
                    : p
            )
          };
        })
    );
  };

  return (
      <div className="animate-in slide-in-from-right-4 duration-300 space-y-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tighter text-slate-800">障害対応管理</h1>
            <p className="text-sm text-slate-500 mt-1">障害関連製品の特定および連絡先一括照会</p>
          </div>
          <div className="text-xs bg-slate-200 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-700">
            判定基準時刻: {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
            <span className={`ml-2 inline-block px-2 py-0.5 rounded text-white font-bold ${isInHours ? 'bg-emerald-600' : 'bg-blue-600'}`}>
            {isInHours ? '現在時間内' : '現在時間外'}
          </span>
          </div>
        </div>

        {unreachableProducts.length > 0 && (
            <div className="bg-red-50 border border-red-200 text-red-800 p-5 rounded-2xl shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-red-100 p-2 rounded-full text-red-600"><IconWrapper name="fault" className="w-5 h-5" /></div>
                <p className="font-bold">要確認: 以下の保守会社（製品）への連絡が取れていません</p>
              </div>
              <div className="pl-12 space-y-2 text-sm">
                {unreachableProducts.map(({ faultId, product }) => (
                    <div key={`${faultId}-${product.productId}`} className="bg-white p-3 rounded-xl border border-red-100 flex justify-between items-center shadow-sm">
                      <div>
                        障害ID: <span className="font-mono text-slate-900 font-bold">{faultId}</span> / 対象: <span className="text-slate-700">{product.productName}</span> ({product.maintenanceCompany})
                      </div>
                      <div className="text-xs text-red-600 font-semibold">試行時刻: {product.failedAttemptTime}</div>
                    </div>
                ))}
              </div>
            </div>
        )}

        <div className="bg-white p-4 rounded-2xl flex gap-4 items-center border border-slate-200 shadow-sm">
          <div className="flex-1 relative">
            <input
                type="text"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pl-11 text-slate-800 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                placeholder="障害ID、または製品名を入力..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
            />
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"><IconWrapper name="search" className="w-4 h-4" /></div>
          </div>
          <div className="w-48">
            <select
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-800 text-sm focus:outline-none focus:border-blue-400 focus:bg-white transition"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="すべて">全ステータス</option>
              <option value="障害発生中">障害発生中</option>
              <option value="保守対応中">保守対応中</option>
              <option value="復旧済み">復旧済み</option>
            </select>
          </div>
        </div>

        <div className="space-y-6">
          {filteredFaults.map((fault) => (
              <div key={fault.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col gap-6">

                <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-2xl font-black text-slate-800 tracking-tight">{fault.id}</span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${fault.severity === 'CRITICAL' ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>{fault.severity}</span>
                    </div>
                    <p className="text-sm text-slate-600">{fault.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                <span className={`text-m   px-4 py-2 rounded-full font-semibold border ${fault.status === '障害発生中' ? 'bg-red-50 text-red-600 border-red-200' : fault.status === '復旧済み' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  {fault.status}
                </span>
                    <button className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition border border-slate-200 shadow-sm" title="進捗管理情報の作成要求">
                      <IconWrapper name="log" className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                    <IconWrapper name="server" className="text-blue-500 w-4 h-4" /> 影響・関連対象製品 ({fault.products.length}台)
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fault.products.map((product) => (
                        <div key={product.productId} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-300 transition">
                          <div className="space-y-3">
                            <div>
                              <div className="text-slate-800 font-bold text-sm">{product.productName}</div>
                              <div className="text-[11px] text-slate-500 font-mono">ID: {product.productId} / {product.serialNumber}</div>
                            </div>

                            <div className="space-y-2 text-xs text-slate-600 pt-1">
                              <div className="flex items-center gap-2"><IconWrapper name="company" className="text-slate-400 w-3.5 h-3.5" /> {product.maintenanceCompany}</div>

                              <div className="space-y-2 mt-2">
                                <div className="text-slate-500 flex items-center gap-1 mb-1">
                                  <IconWrapper name="phone" className="w-3.5 h-3.5" /> 障害時連絡先
                                </div>

                                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                                    isInHours
                                        ? 'bg-emerald-50/60 border-emerald-300 text-emerald-900 font-bold ring-1 ring-emerald-300'
                                        : 'bg-white border-slate-200 text-slate-500 opacity-60'
                                }`}>
                                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded mr-2 ${isInHours ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>時間内</span>
                                  {product.inHoursContact}
                                </div>

                                <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                                    !isInHours
                                        ? 'bg-blue-50/60 border-blue-300 text-blue-900 font-bold ring-1 ring-blue-300'
                                        : 'bg-white border-slate-200 text-slate-500 opacity-60'
                                }`}>
                                  <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded mr-2 ${!isInHours ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>時間外</span>
                                  {product.outOfHoursContact}
                                </div>
                              </div>

                            </div>
                          </div>

                          {fault.status === '障害発生中' && (
                              <div className="mt-4 pt-3 border-t border-slate-200">
                                <button
                                    onClick={() => handleProductFailure(fault.id, product.productId)}
                                    className={`w-full text-xs font-bold py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 ${product.isContactFailed ? 'bg-slate-200 text-slate-500 cursor-not-allowed' : 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100'}`}
                                    disabled={product.isContactFailed}
                                >
                                  <IconWrapper name="fault" className="w-3.5 h-3.5" />
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