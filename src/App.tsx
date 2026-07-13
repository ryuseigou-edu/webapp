import { useState, useMemo } from 'react';
import IconWrapper from './components/IconWrapper';
import PortalDashboard from './components/PortalDashboard';
import ModernTroubleSearch from './components/ModernTroubleSearch';
import type { FaultData, IconName } from './types';

const SidebarItem = ({ icon, label, isActive, onClick, isOpen, badge }: { icon: IconName, label: string, isActive: boolean, onClick: () => void, isOpen: boolean, badge?: number }) => (
    <button onClick={onClick} className={`w-full flex items-center p-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-blue-50 text-blue-700 font-bold' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'}`}>
      <IconWrapper name={icon} className={`w-5 h-5 ${isActive ? 'text-blue-600' : ''}`} />
      {isOpen && <span className="ml-3 text-sm flex-1 text-left">{label}</span>}
      {isOpen && badge ? <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full">{badge}</span> : null}
    </button>
);

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
          isContactFailed: true,
          failedAttemptTime: '2026/7/3 11:29:45',
        },
        {
          productId: 'P-SW-042',
          productName: 'L2ネットワークスイッチ (Cisco)',
          serialNumber: 'SN-CS-5512',
          maintenanceCompany: 'Bネットワークス株式会社',
          inHoursContact: '03-XXXX-0002 (24時間受付)',
          outOfHoursContact: '03-XXXX-0002 (24時間受付)',
          isContactFailed: false,
          failedAttemptTime: null,
        }
      ]
    },
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

          <div className="flex-1 overflow-y-auto p-8 relative">
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