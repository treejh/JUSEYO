"use client";

import { useState, useEffect } from "react";
import styles from "./withdraw.module.css"; // CSS 모듈 임포트
import Link from "next/link";
import { useRouter } from "next/navigation"; // useRouter import 추가
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useCustomToast } from "@/utils/toast";

export default function WithdrawalPage() {
  const router = useRouter(); // router 정의
  const [isAgreed, setIsAgreed] = useState(false);
  const { isLogin, loginUser } = useGlobalLoginUser();

  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false); // 알림 모달 상태
  const toast = useCustomToast();

  useEffect(() => {
    // 로그인 여부 확인
    if (!isLogin) {
      router.push("/login/type");
      return;
    }
    // 로그인한 사용자의 소셜 로그인 제공자 설정
    //setIsAuthenticated(true)
  }, [isLogin, loginUser, router]);

  const handlePasswordAuth = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/validation/password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ password }),
        }
      );

      if (!response.ok) {
        throw new Error("비밀번호 인증에 실패했습니다.");
      }

      toast.success("비밀번호 인증에 성공했습니다.");
      setIsAuthenticated(true); // 인증 성공 시 상태 업데이트
    } catch (error) {
      console.error(error);
      toast.error("비밀번호가 일치하지 않습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/users/delete`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include", // 쿠키 포함
        }
      );

      if (response.status === 403) {
        toast.error(
          "최초 매니저는 회원 탈퇴 권한이 없습니다. 관리자에게 문의해주세요."
        );
      }

      if (!response.ok) {
        throw new Error("회원 탈퇴에 실패했습니다.");
      }

      toast.success("회원 탈퇴가 성공적으로 완료되었습니다.");
      window.location.href = "/"; // 새로고침된 상태로 메인 페이지로 이동
    } catch (error) {
      toast.error("회원 탈퇴 요청 중 오류 발생:");
    }
  };

  const handleAction = (action: () => void) => {
    if (!isAgreed) {
      setShowAlert(true); // 알림 모달 표시
      return;
    }
    action();
  };

  if (!isAuthenticated) {
    return (
      <div className={styles.container}>
        <div className={styles.authWrapper}>
          <h1 className={styles.title}>회원탈퇴 인증</h1>

          {!provider && (
            <div className={styles.section}>
              <h2 className={styles.subtitle}></h2>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className={`${styles.input} w-full`}
                style={{
                  border: "1px solid #d1d5db", // 얇은 회색 테두리
                  borderRadius: "4px", // 모서리 둥글게
                  padding: "8px", // 내부 여백
                  marginBottom: "16px", // 버튼과 간격 추가
                }}
              />
              <button
                type="button"
                onClick={handlePasswordAuth}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0047AB] hover:bg-[#0047AB] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0047AB]"
              >
                비밀번호 인증
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainWrapper}>
        <div className={styles.formContainer}>
          <div className={styles.formHeader}>
            <h1 className={styles.title}>회원탈퇴</h1>
          </div>

          <form className={styles.form}>
            <div>
              <div className={styles.subtitle}>
                <h2>회원탈퇴를 진행하시기 전에 아래내용을 확인해주세요.</h2>
              </div>
              <div className={styles.noticeList}>
                <p>
                  • 계정을 탈퇴하셔도 재고 및 거래 데이터는 시스템에 계속
                  보존됩니다.
                </p>
                <p>
                  • 탈퇴 후에도 동일한 이메일, 핸드폰번호로 다시 가입이
                  가능합니다.
                </p>
                <p>
                  • 탈퇴 시 개인정보는 비활성화 처리되지만, 데이터 복구는
                  지원되지 않습니다.
                </p>
                <p>• 탈퇴 후에는 계정 활동 및 알림 수신이 중단됩니다.</p>
                <p>• 탈퇴 전에 반드시 필요한 데이터는 별도로 백업해 주세요.</p>
              </div>

              <div className={styles.checkboxContainer}>
                <input
                  id="agree"
                  name="agree"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                />
                <label htmlFor="agree" className={styles.checkboxLabel}>
                  위 내용을 모두 확인하였으며, 이에 동의합니다.
                </label>
              </div>

              <div
                className={styles.buttonContainer}
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "16px",
                }}
              >
                <button
                  type="button"
                  onClick={() => handleAction(handleDeleteAccount)}
                  className={styles.withdrawButton}
                >
                  회원 탈퇴
                </button>
                <button
                  type="button"
                  onClick={() => router.push("/account/edit")} // edit 페이지로 이동
                  className={styles.cancelButton}
                >
                  취소
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* 알림 모달 */}
      {showAlert && (
        <div className={styles.alertOverlay}>
          <div className={styles.alertModal}>
            <p>체크박스를 선택해야 진행할 수 있습니다.</p>
            <button
              type="button"
              onClick={() => setShowAlert(false)} // 알림 닫기
              className={styles.alertButton}
            >
              확인
            </button>
          </div>
        </div>
      )}
      <footer className={styles.footer}>
        <div className={styles.footerDivider}></div>
        <div className={styles.footerLine}></div>
        <div className={styles.footerContent}></div>
        <div className={styles.footerText}>
          <span className={styles.copyright}>© 2025 All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
