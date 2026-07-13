import { useEffect, useRef } from 'react';
import type { FC, ReactNode } from 'react';
import { createPortal } from 'react-dom'; // ポータル機能をインポート
import IconWrapper from './IconWrapper';
import type { IconName } from '../types';

interface SlideOverProps {
    title: string;
    subtitle?: string;
    icon?: IconName;
    onClose: () => void;
    children: ReactNode;
    footer?: ReactNode;
    widthClass?: string;
}

const SlideOver: FC<SlideOverProps> = ({ title, subtitle, icon, onClose, children, footer, widthClass = 'max-w-xl' }) => {
    const contentRef = useRef<HTMLDivElement>(null);

    // 1. 背景のスクロールロックとESCキー制御
    useEffect(() => {
        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKey);

        return () => {
            document.body.style.overflow = originalOverflow;
            window.removeEventListener('keydown', handleKey);
        };
    }, [onClose]);

    // 2. コンテンツ領域を確実に最上部へスクロール
    useEffect(() => {
        const frameId = requestAnimationFrame(() => {
            if (contentRef.current) {
                contentRef.current.scrollTop = 0;
            }
        });

        return () => cancelAnimationFrame(frameId);
    }, [children]);

    // 3. createPortal を使用して、DOMツリー上の配置を document.body 直下へ転送
    return createPortal(
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* 背景マスク（滑らかにフェードイン） */}
            <div
                onClick={onClose}
                className="absolute inset-0 bg-slate-950/40 backdrop-blur-md animate-in fade-in duration-300"
            />

            {/* 本体パネル（右からスライドイン・常に本文がスクロール可能） */}
            <div className={`relative h-full w-full ${widthClass} bg-slate-50 shadow-2xl flex flex-col animate-in slide-in-drawer duration-300`}>
                {/* ヘッダー（固定） */}
                <div className="shrink-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="bg-blue-50 text-blue-600 p-2.5 rounded-xl">
                                <IconWrapper name={icon} className="w-5 h-5" />
                            </div>
                        )}
                        <div>
                            <h2 className="text-lg font-bold text-slate-800 leading-tight">{title}</h2>
                            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 p-2 rounded-full transition" aria-label="閉じる">
                        <IconWrapper name="close" className="w-5 h-5" />
                    </button>
                </div>

                {/* コンテンツ領域（独立してスクロール） */}
                <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6" ref={contentRef}>
                    {children}
                </div>

                {/* フッター（固定） */}
                {footer && (
                    <div className="shrink-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-end gap-3">
                        {footer}
                    </div>
                )}
            </div>
        </div>,
        document.body // 転送先のDOM要素を指定
    );
};

export default SlideOver;