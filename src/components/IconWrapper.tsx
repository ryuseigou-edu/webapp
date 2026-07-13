import React from 'react';
import {
    FiAlertTriangle, FiBox, FiBriefcase, FiPhone, FiEdit, FiMenu,
    FiFileText, FiCheckSquare, FiDatabase, FiArrowRight, FiGrid,
    FiBell, FiSearch, FiServer, FiPlus, FiTool, FiX
} from 'react-icons/fi';
import type { IconName } from '../types';

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
        server: <FiServer className={className} />,
        plus: <FiPlus className={className} />,
        tool: <FiTool className={className} />,
        close: <FiX className={className} />
    };
    return <>{icons[name]}</>;
};

export default IconWrapper;