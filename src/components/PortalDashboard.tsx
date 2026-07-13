import React from 'react';
import IconWrapper from './IconWrapper';
import type { MenuAction } from '../types';

interface PortalDashboardProps {
    onNavigate: (screen: string) => void;
    activeFaultsCount: number;
}

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

export default PortalDashboard;