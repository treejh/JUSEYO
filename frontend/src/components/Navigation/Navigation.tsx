"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './Navigation.css';

type NavigationProps = {
  userRole?: 'user' | 'manager';
  onPageChange?: (page: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
};

type NotificationCount = {
  chat: number;
  alert: number;
};

export default function Navigation({ 
  userRole = 'user', 
  onPageChange,
  isSidebarCollapsed = false,
  onToggleSidebar
}: NavigationProps) {
  const [notifications, setNotifications] = useState<NotificationCount>({ chat: 0, alert: 0 });
  const [role, setRole] = useState<'user' | 'manager'>(userRole);
  const pathname = usePathname();
  
  // 현재 경로에 따라 활성 메뉴 설정
  const getActiveMenu = () => {
    if (pathname.includes('dashboard')) return 'dashboard';
    if (pathname.includes('chat')) return 'chat';
    if (pathname.includes('notifications')) return 'notifications';
    if (pathname.includes('search')) return 'search';
    if (pathname.includes('inventory')) return 'inventory';
    if (pathname.includes('request')) return 'request';
    if (pathname.includes('incoming')) return 'incoming';
    if (pathname.includes('outgoing')) return 'outgoing';
    if (pathname.includes('page-management')) return 'page-management';
    if (pathname.includes('department')) return 'department';
    if (pathname.includes('category')) return 'category';
    if (pathname.includes('user-management')) return 'user-management';
    if (pathname.includes('request-history')) return 'request-history';
    if (pathname.includes('inventory-view')) return 'inventory-view';
    return '';
  };

  const activeMenu = getActiveMenu();

  // 알림 개수 설정 메서드
  const setNotificationCount = (type: 'chat' | 'alert', count: number) => {
    setNotifications(prev => ({ ...prev, [type]: count }));
  };

  // 사용자 역할 변경 메서드
  const changeRole = (newRole: 'user' | 'manager') => {
    setRole(newRole);
  };

  // 사이드바 접기/펼치기 토글 버튼
  const renderCollapseButton = () => (
    <button 
      onClick={onToggleSidebar}
      className="collapse-button"
      aria-label={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
    >
      {isSidebarCollapsed ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      )}
    </button>
  );

  // 공통 메뉴 렌더링
  const renderCommonMenu = () => (
    <div className="menu-section">
      <ul className="menu-list">
        <li className="menu-item">
          <Link 
            href="/dashboard" 
            className={`menu-link ${activeMenu === 'dashboard' ? 'active' : ''}`}
            onClick={() => onPageChange?.('dashboard')}
          >
            <span className="menu-icon">📊</span>
            <span>대시보드</span>
          </Link>
        </li>
        <li className="menu-item">
          <Link 
            href="/chat" 
            className={`menu-link ${activeMenu === 'chat' ? 'active' : ''}`}
            onClick={() => onPageChange?.('chat')}
          >
            <span className="menu-icon">💬</span>
            <span>채팅</span>
            {notifications.chat > 0 && (
              <span className="badge badge-red notification-chat-count">{notifications.chat}</span>
            )}
          </Link>
        </li>
        <li className="menu-item">
          <Link 
            href="/notifications" 
            className={`menu-link ${activeMenu === 'notifications' ? 'active' : ''}`}
            onClick={() => onPageChange?.('notifications')}
          >
            <span className="menu-icon">🔔</span>
            <span>알림</span>
            {notifications.alert > 0 && (
              <span className="badge badge-red notification-alert-count">{notifications.alert}</span>
            )}
          </Link>
        </li>
        <li className="menu-item">
          <Link 
            href="/search" 
            className={`menu-link ${activeMenu === 'search' ? 'active' : ''}`}
            onClick={() => onPageChange?.('search')}
          >
            <span className="menu-icon">🔍</span>
            <span>검색</span>
          </Link>
        </li>
      </ul>
    </div>
  );

  // 매니저 메뉴 렌더링
  const renderManagerMenu = () => (
    <>
      <div className="menu-section">
        <h3 className="menu-title">비품 관리</h3>
        <ul className="menu-list">
          <li className="menu-item">
            <Link 
              href="/inventory" 
              className={`menu-link ${activeMenu === 'inventory' ? 'active' : ''}`}
              onClick={() => onPageChange?.('inventory')}
            >
              <span className="menu-icon">📦</span>
              <span>비품 관리</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              href="/request" 
              className={`menu-link ${activeMenu === 'request' ? 'active' : ''}`}
              onClick={() => onPageChange?.('request')}
            >
              <span className="menu-icon">📝</span>
              <span>비품 요청</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              href="/incoming" 
              className={`menu-link ${activeMenu === 'incoming' ? 'active' : ''}`}
              onClick={() => onPageChange?.('incoming')}
            >
              <span className="menu-icon">📥</span>
              <span>입고 관리</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              href="/outgoing" 
              className={`menu-link ${activeMenu === 'outgoing' ? 'active' : ''}`}
              onClick={() => onPageChange?.('outgoing')}
            >
              <span className="menu-icon">📤</span>
              <span>출고 관리</span>
            </Link>
          </li>
        </ul>
      </div>
      
      <div className="menu-section">
        <h3 className="menu-title">관리자 설정</h3>
        <ul className="menu-list">
          <li className="menu-item">
            <Link 
              href="/page-management" 
              className={`menu-link ${activeMenu === 'page-management' ? 'active' : ''}`}
              onClick={() => onPageChange?.('page-management')}
            >
              <span className="menu-icon">🏢</span>
              <span>페이지 관리</span>
            </Link>
          </li>
          <li className="menu-item submenu-item">
            <Link 
              href="/department" 
              className={`menu-link ${activeMenu === 'department' ? 'active' : ''}`}
              onClick={() => onPageChange?.('department')}
            >
              <span className="menu-icon">🏬</span>
              <span>부서 관리</span>
            </Link>
          </li>
          <li className="menu-item submenu-item">
            <Link 
              href="/category" 
              className={`menu-link ${activeMenu === 'category' ? 'active' : ''}`}
              onClick={() => onPageChange?.('category')}
            >
              <span className="menu-icon">🗂️</span>
              <span>카테고리 관리</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link 
              href="/user-management" 
              className={`menu-link ${activeMenu === 'user-management' ? 'active' : ''}`}
              onClick={() => onPageChange?.('user-management')}
            >
              <span className="menu-icon">👥</span>
              <span>사용자 관리</span>
            </Link>
          </li>
        </ul>
      </div>
    </>
  );

  // 일반 사용자 메뉴 렌더링
  const renderUserMenu = () => (
    <div className="menu-section">
      <h3 className="menu-title">비품 사용</h3>
      <ul className="menu-list">
        <li className="menu-item">
          <Link 
            href="/request" 
            className={`menu-link ${activeMenu === 'request' ? 'active' : ''}`}
            onClick={() => onPageChange?.('request')}
          >
            <span className="menu-icon">📝</span>
            <span>비품 요청</span>
          </Link>
        </li>
        <li className="menu-item">
          <Link 
            href="/request-history" 
            className={`menu-link ${activeMenu === 'request-history' ? 'active' : ''}`}
            onClick={() => onPageChange?.('request-history')}
          >
            <span className="menu-icon">📋</span>
            <span>비품 요청 내역</span>
          </Link>
        </li>
        <li className="menu-item">
          <Link 
            href="/inventory-view" 
            className={`menu-link ${activeMenu === 'inventory-view' ? 'active' : ''}`}
            onClick={() => onPageChange?.('inventory-view')}
          >
            <span className="menu-icon">🔎</span>
            <span>비품 조회</span>
          </Link>
        </li>
      </ul>
    </div>
  );
  
  // 메인 링크 렌더링
  const renderMainLink = () => (
    <div className="menu-section main-link-section">
      <ul className="menu-list">
        <li className="menu-item">
          <Link 
            href="/" 
            className="menu-link"
            onClick={() => onPageChange?.('home')}
          >
            <span className="menu-icon">🏠</span>
            <span>메인으로</span>
          </Link>
        </li>
      </ul>
    </div>
  );

  return (
    <aside className="juseyo-sidebar">
      <div className="juseyo-menu-container">
        {/* 사이드바 접기/펼치기 버튼 */}
        {onToggleSidebar && (
          <div className="sidebar-toggle-container">
            {renderCollapseButton()}
          </div>
        )}
        
        {renderCommonMenu()}
        {role === 'manager' ? renderManagerMenu() : renderUserMenu()}
        {renderMainLink()}
      </div>
    </aside>
  );
}

// 외부에서 사용할 수 있는 메서드
export { type NavigationProps }; 