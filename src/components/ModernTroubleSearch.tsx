import { useState, useMemo, useEffect } from 'react';
import type { FC, Dispatch, SetStateAction } from 'react';
import IconWrapper from './IconWrapper';
import SlideOver from './SlideOver';
import type { FaultData, InvolvedProduct } from '../types';

interface ModernTroubleSearchProps {
    faults: FaultData[];
    setFaults: Dispatch<SetStateAction<FaultData[]>>;
    onShowToast: (message: string) => void;
}

const ConfirmItem = ({ label, value }: { label: string; value: string }) => (
    <div className="py-3 border-b border-slate-100 last:border-0">
        <div className="text-xs font-bold text-slate-500 mb-1">{label}</div>
        <div className="text-sm font-medium text-slate-900 whitespace-pre-wrap">{value || '（未入力）'}</div>
    </div>
);

const ModernTroubleSearch: FC<ModernTroubleSearchProps> = ({ faults, setFaults, onShowToast }) => {
    const [searchId, setSearchId] = useState<string>('');
    const [filterStatus, setFilterStatus] = useState<string>('すべて');
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    const [isRegisterModalOpen, setRegisterModalOpen] = useState<boolean>(false);
    const [activeResultModalFault, setActiveResultModalFault] = useState<string | null>(null);
    const [activeReportModalFault, setActiveReportModalFault] = useState<string | null>(null);

    const [registerStep, setRegisterStep] = useState<'input' | 'confirm'>('input');
    const [resultStep, setResultStep] = useState<'input' | 'confirm'>('input');
    const [reportStep, setReportStep] = useState<'input' | 'confirm'>('input');

    const [registerForm, setRegisterForm] = useState({
        occurredAt: '',
        discoverer: 'システム管理者',
        situation: 'サーバーの応答が遅延している。',
        initialInvestigation: '',
        deviceIdentified: '特定',
        causeIdentified: '特定あり',
        consultation: '',
        cause: '',
        unknownReason: '',
        progress: '',
        notifySales: false,
        notifyTech: false,
        notifyMaintenance: false,
    });

    const [resultForm, setResultForm] = useState({
        startAt: '',
        endAt: '',
        worker: '技術担当B',
        content: '該当スイッチの再起動を実施。',
        status: '保守対応中',
        unknownReason: '',
    });

    const [reportForm, setReportForm] = useState({
        content: '保守結果から自動入力されたシステム復旧報告内容です。',
        notes: '',
        method: '印刷',
        emailContent: '',
    });

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
        onShowToast('連絡失敗として記録しました。');
    };

    const openRegisterModal = () => {
        setRegisterStep('input');
        setRegisterModalOpen(true);
    };

    const openResultModal = (faultId: string) => {
        setResultStep('input');
        setActiveResultModalFault(faultId);
    };

    const openReportModal = (faultId: string) => {
        setReportStep('input');
        setActiveReportModalFault(faultId);
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
                        onClick={openRegisterModal}
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
                                        onClick={() => openResultModal(fault.id)}
                                        className="p-2.5 bg-slate-100 rounded-xl text-slate-600 hover:text-blue-700 hover:bg-blue-50 transition border border-slate-200 shadow-sm ml-2"
                                        title="保守結果の記録"
                                    >
                                        <IconWrapper name="tool" className="w-4 h-4" />
                                    </button>
                                )}

                                {fault.status === '復旧済み' && (
                                    <button
                                        onClick={() => openReportModal(fault.id)}
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
                    subtitle={registerStep === 'input' ? "新規障害の受付・初期情報の記録" : "入力内容の確認"}
                    icon="plus"
                    widthClass="max-w-2xl"
                    onClose={() => setRegisterModalOpen(false)}
                    resetScrollDependency={registerStep} // 追加
                    footer={
                        registerStep === 'input' ? (
                            <>
                                <button onClick={() => setRegisterModalOpen(false)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">取り消し</button>
                                <button onClick={() => setRegisterStep('confirm')} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">確認画面へ進む</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setRegisterStep('input')} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">戻る</button>
                                <button onClick={() => {
                                    setRegisterModalOpen(false);
                                    onShowToast('障害情報を新規登録しました。');
                                }} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">確定</button>
                            </>
                        )
                    }
                >
                    {registerStep === 'input' ? (
                        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700">
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                                通信処理等の結果メッセージ表示領域
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-slate-700">
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
                                    <input type="datetime-local" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" value={registerForm.occurredAt} onChange={e => setRegisterForm({...registerForm, occurredAt: e.target.value})} />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">発見者</label>
                                    <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" value={registerForm.discoverer} onChange={e => setRegisterForm({...registerForm, discoverer: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">発生状況</label>
                                <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={registerForm.situation} onChange={e => setRegisterForm({...registerForm, situation: e.target.value})}></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">初期調査内容</label>
                                <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={registerForm.initialInvestigation} onChange={e => setRegisterForm({...registerForm, initialInvestigation: e.target.value})}></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-6 text-slate-700">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">障害機器特定</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="deviceIdentified" value="特定" checked={registerForm.deviceIdentified === '特定'} onChange={e => setRegisterForm({...registerForm, deviceIdentified: e.target.value})} className="w-4 h-4 text-blue-600" /> 特定</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="deviceIdentified" value="特定できない" checked={registerForm.deviceIdentified === '特定できない'} onChange={e => setRegisterForm({...registerForm, deviceIdentified: e.target.value})} className="w-4 h-4 text-blue-600" /> 特定できない</label>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">原因特定情報</label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="causeIdentified" value="特定" checked={registerForm.causeIdentified === '特定'} onChange={e => setRegisterForm({...registerForm, causeIdentified: e.target.value})} className="w-4 h-4 text-blue-600" /> 特定</label>
                                        <label className="flex items-center gap-2 text-sm"><input type="radio" name="causeIdentified" value="特定できない" checked={registerForm.causeIdentified === '特定できない'} onChange={e => setRegisterForm({...registerForm, causeIdentified: e.target.value})} className="w-4 h-4 text-blue-600" /> 特定できない</label>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">保守会社相談内容</label>
                                <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={registerForm.consultation} onChange={e => setRegisterForm({...registerForm, consultation: e.target.value})}></textarea>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">原因</label>
                                    <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={registerForm.cause} onChange={e => setRegisterForm({...registerForm, cause: e.target.value})}></textarea>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-1">原因不明理由</label>
                                    <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={registerForm.unknownReason} onChange={e => setRegisterForm({...registerForm, unknownReason: e.target.value})}></textarea>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">進捗内容</label>
                                <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={registerForm.progress} onChange={e => setRegisterForm({...registerForm, progress: e.target.value})}></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">通知先</label>
                                <div className="flex gap-6 text-slate-700">
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={registerForm.notifySales} onChange={e => setRegisterForm({...registerForm, notifySales: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" /> 営業部</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={registerForm.notifyTech} onChange={e => setRegisterForm({...registerForm, notifyTech: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" /> 技術部</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={registerForm.notifyMaintenance} onChange={e => setRegisterForm({...registerForm, notifyMaintenance: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" /> 保守会社</label>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-200">
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-6">
                                以下の内容で登録処理を実行します。よろしければ「確定」を押してください。
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <ConfirmItem label="障害ID" value="（自動採番）" />
                                <ConfirmItem label="現在の状態" value="障害発生中" />
                                <ConfirmItem label="発生日時" value={registerForm.occurredAt.replace('T', ' ')} />
                                <ConfirmItem label="発見者" value={registerForm.discoverer} />
                                <ConfirmItem label="発生状況" value={registerForm.situation} />
                                <ConfirmItem label="初期調査内容" value={registerForm.initialInvestigation} />
                                <ConfirmItem label="障害機器特定" value={registerForm.deviceIdentified} />
                                <ConfirmItem label="原因特定情報" value={registerForm.causeIdentified} />
                                <ConfirmItem label="保守会社相談内容" value={registerForm.consultation} />
                                <ConfirmItem label="原因" value={registerForm.cause} />
                                <ConfirmItem label="原因不明理由" value={registerForm.unknownReason} />
                                <ConfirmItem label="進捗内容" value={registerForm.progress} />
                                <ConfirmItem label="通知先" value={[registerForm.notifySales && '営業部', registerForm.notifyTech && '技術部', registerForm.notifyMaintenance && '保守会社'].filter(Boolean).join('、')} />
                            </div>
                        </div>
                    )}
                </SlideOver>
            )}

            {activeResultModalFault && (
                <SlideOver
                    title="保守結果記録"
                    subtitle={resultStep === 'input' ? "作業実績・進捗状況の記録" : "入力内容の確認"}
                    icon="tool"
                    onClose={() => setActiveResultModalFault(null)}
                    resetScrollDependency={resultStep} // 追加
                    footer={
                        resultStep === 'input' ? (
                            <>
                                <button onClick={() => setActiveResultModalFault(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">取り消し</button>
                                <button onClick={() => setResultStep('confirm')} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">確認画面へ進む</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setResultStep('input')} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">戻る</button>
                                <button onClick={() => {
                                    setActiveResultModalFault(null);
                                    onShowToast('保守結果の記録を完了しました。');
                                }} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">確定</button>
                            </>
                        )
                    }
                >
                    {resultStep === 'input' ? (
                        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">障害ID</label>
                                <div className="font-mono font-bold text-lg text-slate-900">{activeResultModalFault}</div>
                            </div>

                            <div className="text-slate-700">
                                <label className="block text-sm font-bold text-slate-700 mb-1">作業日時</label>
                                <div className="flex items-center gap-2">
                                    <input type="datetime-local" className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" value={resultForm.startAt} onChange={e => setResultForm({...resultForm, startAt: e.target.value})} />
                                    <span className="text-slate-400">～</span>
                                    <input type="datetime-local" className="flex-1 border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" value={resultForm.endAt} onChange={e => setResultForm({...resultForm, endAt: e.target.value})} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">作業者</label>
                                <input type="text" className="w-full border border-slate-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" value={resultForm.worker} onChange={e => setResultForm({...resultForm, worker: e.target.value})} />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">作業内容</label>
                                <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-24 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={resultForm.content} onChange={e => setResultForm({...resultForm, content: e.target.value})}></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">進捗状況</label>
                                <div className="flex gap-6 text-slate-700">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="status" value="保守対応中" checked={resultForm.status === '保守対応中'} onChange={(e) => setResultForm({...resultForm, status: e.target.value})} className="w-4 h-4 text-blue-600" /> 保守対応中</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="status" value="完了" checked={resultForm.status === '完了'} onChange={(e) => setResultForm({...resultForm, status: e.target.value})} className="w-4 h-4 text-emerald-600" /> 完了</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="status" value="未回復" checked={resultForm.status === '未回復'} onChange={(e) => setResultForm({...resultForm, status: e.target.value})} className="w-4 h-4 text-red-600" /> 未回復</label>
                                </div>
                            </div>

                            {resultForm.status === '未回復' && (
                                <div className="animate-in fade-in duration-300">
                                    <label className="block text-sm font-bold text-red-700 mb-1">未回復理由</label>
                                    <textarea className="w-full border border-red-300 bg-red-50 rounded-lg p-2.5 text-sm h-24 focus:ring-2 focus:ring-red-400 focus:outline-none" value={resultForm.unknownReason} onChange={e => setResultForm({...resultForm, unknownReason: e.target.value})}></textarea>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-200">
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-6">
                                以下の内容で保守結果を記録します。
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <ConfirmItem label="障害ID" value={activeResultModalFault!} />
                                <ConfirmItem label="作業日時" value={`${resultForm.startAt ? resultForm.startAt.replace('T', ' ') : '未入力'} ～ ${resultForm.endAt ? resultForm.endAt.replace('T', ' ') : '未入力'}`} />                                <ConfirmItem label="作業者" value={resultForm.worker} />
                                <ConfirmItem label="作業内容" value={resultForm.content} />
                                <ConfirmItem label="進捗状況" value={resultForm.status} />
                                {resultForm.status === '未回復' && <ConfirmItem label="未回復理由" value={resultForm.unknownReason} />}
                            </div>
                        </div>
                    )}
                </SlideOver>
            )}

            {activeReportModalFault && (
                <SlideOver
                    title="復旧報告書作成"
                    subtitle={reportStep === 'input' ? "復旧内容の報告書出力・送付" : "入力内容の確認"}
                    icon="estimate"
                    onClose={() => setActiveReportModalFault(null)}
                    resetScrollDependency={reportStep} // 追加
                    footer={
                        reportStep === 'input' ? (
                            <>
                                <button onClick={() => setActiveReportModalFault(null)} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">取り消し</button>
                                <button onClick={() => setReportStep('confirm')} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">確認画面へ進む</button>
                            </>
                        ) : (
                            <>
                                <button onClick={() => setReportStep('input')} className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition">戻る</button>
                                <button onClick={() => {
                                    setActiveReportModalFault(null);
                                    onShowToast('復旧報告書の作成処理を完了しました。');
                                }} className="px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition">確定</button>
                            </>
                        )
                    }
                >
                    {reportStep === 'input' ? (
                        <div className="space-y-6 animate-in fade-in duration-200 text-slate-700">
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
                                <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-32 bg-slate-50 text-slate-600 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={reportForm.content} onChange={e => setReportForm({...reportForm, content: e.target.value})}></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-1">特記事項</label>
                                <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-20 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={reportForm.notes} onChange={e => setReportForm({...reportForm, notes: e.target.value})}></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 mb-2">作成方法</label>
                                <div className="flex gap-6">
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="reportMethod" value="印刷" checked={reportForm.method === '印刷'} onChange={(e) => setReportForm({...reportForm, method: e.target.value})} className="w-4 h-4 text-blue-600" /> 印刷</label>
                                    <label className="flex items-center gap-2 text-sm"><input type="radio" name="reportMethod" value="電子メール" checked={reportForm.method === '電子メール'} onChange={(e) => setReportForm({...reportForm, method: e.target.value})} className="w-4 h-4 text-blue-600" /> 電子メール</label>
                                </div>
                            </div>

                            {reportForm.method === '電子メール' && (
                                <div className="animate-in fade-in duration-300">
                                    <label className="block text-sm font-bold text-slate-700 mb-1">メール内容</label>
                                    <textarea className="w-full border border-slate-300 rounded-lg p-2.5 text-sm h-32 focus:ring-2 focus:ring-blue-400 focus:outline-none" value={reportForm.emailContent} onChange={e => setReportForm({...reportForm, emailContent: e.target.value})}></textarea>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-right-8 duration-200">
                            <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg text-sm mb-6">
                                以下の内容で復旧報告書を作成・出力します。
                            </div>
                            <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                                <ConfirmItem label="対象障害ID" value={activeReportModalFault!} />
                                <ConfirmItem label="報告内容" value={reportForm.content} />
                                <ConfirmItem label="特記事項" value={reportForm.notes} />
                                <ConfirmItem label="作成・出力方法" value={reportForm.method} />
                                {reportForm.method === '電子メール' && (
                                    <ConfirmItem label="メール内容" value={reportForm.emailContent} />
                                )}
                            </div>
                        </div>
                    )}
                </SlideOver>
            )}
        </div>
    );
};

export default ModernTroubleSearch;