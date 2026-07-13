export type IconName = 'fault' | 'product' | 'company' | 'phone' | 'log' | 'menu' | 'estimate' | 'contract' | 'database' | 'arrow-right' | 'dashboard' | 'bell' | 'search' | 'server' | 'plus' | 'tool' | 'close';

export interface InvolvedProduct {
    productId: string;
    productName: string;
    serialNumber: string;
    maintenanceCompany: string;
    inHoursContact: string;
    outOfHoursContact: string;
    isContactFailed: boolean;
    failedAttemptTime: string | null;
}

export interface FaultData {
    id: string;
    status: '障害発生中' | '保守対応中' | '復旧済み';
    severity: 'CRITICAL' | 'WARNING' | 'INFO';
    description: string;
    products: InvolvedProduct[];
}

export interface MenuAction {
    id: string;
    title: string;
    description: string;
    icon: IconName;
    targetScreen: string;
    accentColor: string;
    badge?: string;
    colSpan?: string;
}