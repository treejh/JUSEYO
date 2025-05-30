"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "./Navigation.css";

type NavigationProps = {
  userRole?: "ADMIN" | "MANAGER" | "USER";
  onPageChange?: (page: string) => void;
  isSidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
};

type NotificationCount = {
  chat: number;
  alert: number;
};

export default function Navigation({
  userRole = "USER",
  onPageChange,
  isSidebarCollapsed = false,
  onToggleSidebar,
}: NavigationProps) {
  const [notifications, setNotifications] = useState<NotificationCount>({
    chat: 0,
    alert: 0,
  });
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isPageManagementOpen, setIsPageManagementOpen] = useState(false);
  const pathname = usePathname();

  // 현재 경로에 따라 활성 메뉴 설정
  const getActiveMenu = () => {
    if (pathname.includes("dashboard")) return "dashboard";
    if (pathname.includes("chat")) return "chat";
    if (pathname.includes("notifications")) return "notifications";
    if (pathname.includes("settings/approve")) return "user-management";
    if (pathname.includes("search")) return "search";
    if (pathname.includes("item/supplyrequest/list/user"))
      return "supply-request-user";
    if (pathname.includes("item/supplyrequest/list/manage"))
      return "supply-request-manage";
    if (pathname.includes("/item/user")) return "inventory";
    if (pathname.includes("request")) return "request";
    if (pathname.includes("inbound")) return "inbound";
    if (pathname.includes("outbound")) return "outbound";
    if (pathname.includes("iteminstance")) return "iteminstance";
    if (pathname.includes("chase")) return "chase";
    if (pathname.includes("page-management")) return "page-management";
    if (pathname.includes("department")) return "department";
    if (pathname.includes("category")) return "category";
    if (pathname.includes("request-history")) return "request-history";
    if (pathname.includes("inventory-view")) return "inventory-view";
    if (pathname.includes("return")) return "return";
    if (pathname.includes("item/manage")) return "item-manage";
    return "";
  };

  const activeMenu = getActiveMenu();

  // 알림 개수 설정 메서드
  const setNotificationCount = (type: "chat" | "alert", count: number) => {
    setNotifications((prev) => ({ ...prev, [type]: count }));
  };

  // 사이드바 접기/펼치기 토글 버튼
  const renderCollapseButton = () => (
    <button
      onClick={onToggleSidebar}
      className="collapse-button"
      aria-label={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
    >
      {isSidebarCollapsed ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
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
            className={`menu-link ${
              activeMenu === "dashboard" ? "active" : ""
            }`}
            onClick={() => onPageChange?.("dashboard")}
          >
            <span className="menu-icon">📊</span>
            <span>대시보드</span>
          </Link>
        </li>
        <li className="menu-item">
          <Link
            href="/chat/select"
            className={`menu-link ${activeMenu === "chat" ? "active" : ""}`}
            onClick={() => onPageChange?.("chat")}
          >
            <span className="menu-icon">💬</span>
            <span>채팅</span>
            {notifications.chat > 0 && (
              <span className="badge badge-red notification-chat-count">
                {notifications.chat}
              </span>
            )}
          </Link>
        </li>
        <li className="menu-item">
          <Link
            href="/notifications"
            className={`menu-link ${
              activeMenu === "notifications" ? "active" : ""
            }`}
            onClick={() => onPageChange?.("notifications")}
          >
            <span className="menu-icon">🔔</span>
            <span>알림</span>
            {notifications.alert > 0 && (
              <span className="badge badge-red notification-alert-count">
                {notifications.alert}
              </span>
            )}
          </Link>
        </li>
        <li className="menu-item">
          <Link
            href="/search"
            className={`menu-link ${activeMenu === "search" ? "active" : ""}`}
            onClick={() => onPageChange?.("search")}
          >
            <span className="menu-icon">🔍</span>
            <span>검색</span>
          </Link>
        </li>
        <li className="menu-item">
          <Link
            href="/item/supplyrequest/list/user"
            className={`menu-link ${activeMenu === "request" ? "active" : ""}`}
            onClick={() => onPageChange?.("request")}
          >
            <span className="menu-icon">✏️</span>
            <span>비품 요청</span>
          </Link>
        </li>
      </ul>
    </div>
  );

  // 매니저/관리자 메뉴 렌더링
  const renderManagerMenu = () => (
    <>
      <div className="menu-section">
        <h3 className="menu-title">비품 관리</h3>
        <ul className="menu-list">
          <li className="menu-item">
            <Link
              href="/item/user"
              className={`menu-link ${
                activeMenu === "inventory" ? "active" : ""
              }`}
              onClick={() => onPageChange?.("inventory")}
            >
              <span className="menu-icon">🗂️</span>
              <span>비품 조회</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link
              href="/item/supplyrequest/list/manage"
              className={`menu-link ${
                activeMenu === "supply-request-manage" ? "active" : ""
              }`}
              onClick={() => onPageChange?.("supply-request-manage")}
            >
              <span className="menu-icon">📋</span>
              <span>비품 요청 내역</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link
              href="/return"
              className={`menu-link ${activeMenu === "return" ? "active" : ""}`}
              onClick={() => onPageChange?.("return")}
            >
              <span className="menu-icon">🔄</span>
              <span>비품 반납 내역</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link
              href="/inbound"
              className={`menu-link ${
                activeMenu === "inbound" ? "active" : ""
              }`}
              onClick={() => onPageChange?.("incoming")}
            >
              <span className="menu-icon">📥</span>
              <span>입고 관리</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link
              href="/outbound"
              className={`menu-link ${
                activeMenu === "outbound" ? "active" : ""
              }`}
              onClick={() => onPageChange?.("outgoing")}
            >
              <span className="menu-icon">📤</span>
              <span>출고 관리</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link
              href="/item/chase"
              className={`menu-link ${activeMenu === "chase" ? "active" : ""}`}
              onClick={() => onPageChange?.("chase")}
            >
              <span className="menu-icon">🔍</span>
              <span>비품추적</span>
            </Link>
          </li>
        </ul>
      </div>

      <div className="menu-section">
        <h3 className="menu-title">관리자 설정</h3>
        <ul className="menu-list">
          <li className="menu-item">
            <button
              onClick={() => setIsPageManagementOpen(!isPageManagementOpen)}
              className={`menu-link w-full flex justify-between items-center ${
                activeMenu === "page-management" ||
                activeMenu === "department" ||
                activeMenu === "category"
                  ? "active"
                  : ""
              }`}
            >
              <div className="flex items-center">
                <span className="menu-icon">⚙️</span>
                <span>페이지 관리</span>
              </div>
              <svg
                className={`w-4 h-4 transition-transform ${
                  isPageManagementOpen ? "rotate-180" : ""
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            {isPageManagementOpen && (
              <ul className="submenu-list mt-1">
                <li>
                  <Link
                    href="/settings/departments"
                    className={`menu-link ${
                      activeMenu === "department" ? "active" : ""
                    }`}
                    onClick={() => onPageChange?.("department")}
                  >
                    <span className="menu-icon">🏢</span>
                    <span>부서 관리</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/settings/categories"
                    className={`menu-link ${
                      activeMenu === "category" ? "active" : ""
                    }`}
                    onClick={() => onPageChange?.("category")}
                  >
                    <span className="menu-icon">📁</span>
                    <span>카테고리 관리</span>
                  </Link>
                </li>
              </ul>
            )}
          </li>
          <li className="menu-item">
            <Link
              href="/item/manage"
              className={`menu-link ${
                activeMenu === "item-manage" ? "active" : ""
              }`}
              onClick={() => onPageChange?.("item-manage")}
            >
              <span className="menu-icon">📦</span>
              <span>비품 관리</span>
            </Link>
          </li>
          <li className="menu-item">
            <Link
              href="/settings/approve"
              className={`menu-link ${
                activeMenu === "user-management" ? "active" : ""
              }`}
              onClick={() => onPageChange?.("user-management")}
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
      <h3 className="menu-title">비품</h3>
      <ul className="menu-list">
        <li className="menu-item">
          <Link
            href="/item/user"
            className={`menu-link ${
              activeMenu === "inventory-view" ? "active" : ""
            }`}
            onClick={() => onPageChange?.("inventory-view")}
          >
            <span className="menu-icon">🔍</span>
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
            onClick={() => onPageChange?.("home")}
          >
            <span className="menu-icon">🏠</span>
            <span>메인으로</span>
          </Link>
        </li>
      </ul>
    </div>
  );

  return (
    <aside
      className={`juseyo-sidebar ${
        isSidebarCollapsed ? "sidebar-collapsed" : ""
      }`}
    >
      <div className="juseyo-menu-container">
        {/* 사이드바 접기/펼치기 버튼 */}
        {onToggleSidebar && (
          <div className="sidebar-toggle-container">
            {renderCollapseButton()}
          </div>
        )}

        {renderCommonMenu()}
        {userRole === "ADMIN" || userRole === "MANAGER"
          ? renderManagerMenu()
          : renderUserMenu()}
        {renderMainLink()}
      </div>
    </aside>
  );
}

// 외부에서 사용할 수 있는 메서드
export { type NavigationProps };
