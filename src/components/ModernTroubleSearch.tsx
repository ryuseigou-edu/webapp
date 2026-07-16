import React, { useState, useMemo, useEffect } from 'react';
import IconWrapper from './IconWrapper';
import SlideOver from './SlideOver';
import type { FaultData, InvolvedProduct } from '../types';

interface ModernTroubleSearchProps {
    faults: FaultData[];
    setFaults: React.Dispatch<React.SetStateAction<FaultData[]>>;
}

const ModernTroubleSearch: React.FC<ModernTroubleSearchProps> = ({ faults, setFaults }) => {
    const [searchId, setSearchId] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('すべて');
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    const [isRegisterModalOpen, setRegisterModalOpen] = useState<boolean>(false);
    const [activeResultModalFault, setActiveResultModalFault] = useState<string | null>(null);
    const [activeReportModalFault, setActiveReportModalFault] = useState<string | null>(null);

    const [recoveryStatus, setRecoveryStatus] = useState<string>('保守対応中');
    const [reportMethod, setReportMethod] = useState<string>('印刷');

    useEffect(() => {
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
                <div className="flex items-center gap-4">
                    <div className="text-xs bg-slate-200 border border-slate-300 rounded-lg px-3 py-2 font-medium text-slate-700">
                        判定基準時刻: {currentTime.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        <span className={`ml-2 inline-block px-2 py-0.5 rounded text-white font-bold ${isInHours ? 'bg-emerald-600' : 'bg-blue-600'}`}>
              {isInHours ? '現在時間内' : '現在時間外'}
            </span>
                    </div>
                    <button
                        onClick={() => setRegisterModalOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md flex items-center gap-2 transition"
                    >
                        <IconWrapper name="plus" className="w-4 h-4" /> 障害情報の登録
                    </button>
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
                        <option value="すべて">全状態</option>
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
                            <div className="flex items-center gap-2">
                <span className={`text-xs px-3 py-1 rounded-full font-semibold border ${fault.status === '障害発生中' ? 'bg-red-50 text-red-600 border-red-200' : fault.status === '復旧済み' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-blue-50 text-blue-600 border-blue-200'}`}>
                  {fault.status}
                </span>

                                {(fault.status === '障害発生中' || fault.status === '保守対応中') && (
                                    <button
                                        onClick={() => setActiveResultModalFault(fault.id)}
                                        className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition border border-slate-200 shadow-sm ml-2"
                                        title="保守結果の記録"
                                    >
                                        <IconWrapper name="tool" className="w-4 h-4" />
                                    </button>
                                )}

                                {fault.status === '復旧済み' && (
                                    <button
                                        onClick={() => setActiveReportModalFault(fault.id)}
                                        className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition border border-slate-200 shadow-sm ml-2"
                                        title="復旧報告書の作成"
                                    >
                                        <IconWrapper name="estimate" className="w-4 h-4" />
                                    </button>
                                )}

                                <button
                                    className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-200 transition border border-slate-200 shadow-sm ml-2"
                                    title="進捗管理情報の編集"
                                >
                                    <IconWrapper name="log" className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div>
                            <div className="text-xs font-bold text-slate-500 mb-3 tracking-wider flex items-center gap-1.5">
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
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded mr-2 ${isInHours ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>時間内</span>
                                                        {product.inHoursContact}
                                                    </div>

                                                    <div className={`p-2.5 rounded-xl border transition-all duration-300 ${
                                                        !isInHours
                                                            ? 'bg-blue-50/60 border-blue-300 text-blue-900 font-bold ring-1 ring-blue-300'
                                                            : 'bg-white border-slate-200 text-slate-500 opacity-60'
                                                    }`}>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded mr-2 ${!isInHours ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-600'}`}>時間外</span>
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

            {isRegisterModalOpen && (
                <SlideOver
                    title="障害情報の登録"
                    subtitle="新規障害の受付・初期情報の記録"
                    icon="plus"
                    widthClass="max-w-2xl"
                    onClose={() => setRegisterModalOpen(false)}
                    footer={
                        <>
                            <button onClick={() => setRegisterModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">取り消し</button>
                            <button onClick={() => setRegisterModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">登録</button>
                        </>
                    }
                >
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        通信処理等の結果メッセージ表示領域
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-black">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">障害ID</label>
                            <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" placeholder="自動採番" disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">現在の状態</label>
                            <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm bg-slate-100 text-slate-600 font-bold" value="障害発生中" disabled />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">発生日時</label>
                            <input type="datetime-local" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">発見者</label>
                            <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">発生状況</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">初期調査内容</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6 text-slate-700">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">障害機器特定</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="deviceIdentified" value="特定" className="w-4 h-4 text-blue-600" defaultChecked /> 特定</label>
                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="deviceIdentified" value="特定できない" className="w-4 h-4 text-blue-600" /> 特定できない</label>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">原因特定情報</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="causeIdentified" value="特定あり" className="w-4 h-4 text-blue-600" defaultChecked /> 特定あり</label>
                                <label className="flex items-center gap-2 text-sm"><input type="radio" name="causeIdentified" value="特定なし" className="w-4 h-4 text-blue-600" /> 特定なし</label>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">保守会社相談内容</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">原因</label>
                            <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">原因不明理由</label>
                            <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">進捗内容</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">通知先</label>
                        <div className="flex gap-6 text-slate-700">
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" /> 営業部</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" /> 技術部</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" className="w-4 h-4 text-blue-600 rounded" /> 保守会社</label>
                        </div>
                    </div>

                    <div className="text-right text-xs text-slate-400">最終更新日時: - (自動更新)</div>
                </SlideOver>
            )}

            {activeResultModalFault && (
                <SlideOver
                    title="保守結果記録"
                    subtitle="作業実績・進捗状況の記録"
                    icon="tool"
                    onClose={() => setActiveResultModalFault(null)}
                    footer={
                        <>
                            <button onClick={() => setActiveResultModalFault(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">取り消し</button>
                            <button onClick={() => setActiveResultModalFault(null)} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">完了</button>
                        </>
                    }
                >
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">障害ID</label>
                        <div className="font-mono font-bold text-lg text-slate-900">{activeResultModalFault}</div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">作業日時</label>
                        <div className="flex items-center gap-2 text-black">
                            <input type="datetime-local" className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                            <span className="text-slate-400">～</span>
                            <input type="datetime-local" className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">作業者</label>
                        <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">作業内容</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-24 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">進捗状況</label>
                        <div className="flex gap-6 text-slate-700">
                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="status" value="保守対応中" checked={recoveryStatus === '保守対応中'} onChange={(e) => setRecoveryStatus(e.target.value)} className="w-4 h-4 text-blue-600" /> 保守対応中</label>
                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="status" value="完了" checked={recoveryStatus === '完了'} onChange={(e) => setRecoveryStatus(e.target.value)} className="w-4 h-4 text-emerald-600" /> 完了</label>
                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="status" value="未回復" checked={recoveryStatus === '未回復'} onChange={(e) => setRecoveryStatus(e.target.value)} className="w-4 h-4 text-red-600" /> 未回復</label>
                        </div>
                    </div>

                    {recoveryStatus === '未回復' && (
                        <div className="animate-in fade-in duration-300">
                            <label className="block text-sm font-bold text-red-700 mb-1">未回復理由</label>
                            <textarea className="w-full border border-red-300 bg-red-50 rounded-lg p-2.5 text-sm h-24 focus:ring-2 focus:ring-red-400 focus:outline-none"></textarea>
                        </div>
                    )}
                </SlideOver>
            )}

            {activeReportModalFault && (
                <SlideOver
                    title="復旧報告書作成"
                    subtitle="復旧内容の報告書出力・送付"
                    icon="estimate"
                    onClose={() => setActiveReportModalFault(null)}
                    footer={
                        <>
                            <button onClick={() => setActiveReportModalFault(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">取り消し</button>
                            <button onClick={() => setActiveReportModalFault(null)} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">完了</button>
                        </>
                    }
                >
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">障害ID</label>
                            <div className="font-mono font-bold text-slate-900">{activeReportModalFault}</div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">製品ID</label>
                            <div className="font-mono text-sm text-slate-600">P-DB-001, P-SW-042</div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">報告内容</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-32 bg-slate-50 text-slate-600 focus:ring-2 focus:ring-blue-400 focus:outline-none" defaultValue="保守結果から自動入力される領域です。"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">特記事項</label>
                        <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">作成方法</label>
                        <div className="flex gap-6 text-slate-700">
                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="reportMethod" value="印刷" checked={reportMethod === '印刷'} onChange={(e) => setReportMethod(e.target.value)} className="w-4 h-4 text-blue-600" /> 印刷</label>
                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="reportMethod" value="電子メール" checked={reportMethod === '電子メール'} onChange={(e) => setReportMethod(e.target.value)} className="w-4 h-4 text-blue-600" /> 電子メール</label>
                        </div>
                    </div>

                    {reportMethod === '電子メール' && (
                        <div className="animate-in fade-in duration-300">
                            <label className="block text-sm font-bold text-slate-700 mb-1">メール内容</label>
                            <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-32 focus:ring-2 focus:ring-blue-400 focus:outline-none"></textarea>
                        </div>
                    )}
                </SlideOver>
            )}

        </div>
    );
};

export default ModernTroubleSearch;