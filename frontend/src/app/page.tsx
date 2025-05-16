"use client";

import React, { useEffect, useState } from "react";
import { useGlobalLoginUser } from "@/stores/auth/loginMember";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Footer } from "@/components/Footer";

// particles.js의 타입 선언 추가
declare global {
  interface Window {
    particlesJS: any;
  }
}

export default function Home() {
  const { loginUser, isLogin } = useGlobalLoginUser();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  
  // 기능 소개 슬라이드 데이터
  const featureSlides = [
    {
      title: "재고 실시간 추적",
      description: "재고 수준을 실시간으로 모니터링하고 변화 추이를 그래프로 확인하세요",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "스마트 알림 시스템",
      description: "재고 부족, 유통기한 임박 등 중요 정보를 자동으로 알려드립니다",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      )
    },
    {
      title: "비품 요청 기능",
      description: "필요한 비품을 간편하게 요청하고 승인 과정을 실시간으로 확인하세요",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      )
    },
    {
      title: "채팅 기능",
      description: "팀원들과 실시간으로 소통하며 재고 관련 문의를 빠르게 해결하세요",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      )
    },
    {
      title: "엑셀 내보내기/입고",
      description: "재고 데이터를 손쉽게 엑셀로 관리하고 상품도 간편하게 입고하세요",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  ];
  
  // 슬라이드 자동 전환
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featureSlides.length);
    }, 3000); // 3초마다 슬라이드 전환
    
    return () => clearInterval(slideInterval);
  }, [featureSlides.length]);

  const handleAdminAction = () => {
    if (!loginUser.managementDashboardName) {
      // 관리자 페이지 생성 로직
      router.push("/dashboard/create");
    } else {
      // 관리자 페이지 접속 로직
      router.push("/dashboard");
    }
  };

  // 페이지 로딩 시 파티클 애니메이션 효과
  useEffect(() => {
    // 서버 사이드 렌더링 방지
    if (typeof window === 'undefined') return;
    
    // 파티클 스크립트 로드
    const loadParticles = () => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/particles.js/2.0.0/particles.min.js';
      script.async = true;
      
      script.onload = () => {
        if (window.particlesJS) {
          window.particlesJS('particles-js', {
            "particles": {
              "number": {
                "value": 80,
                "density": {
                  "enable": true,
                  "value_area": 800
                }
              },
              "color": {
                "value": "#1543a8"
              },
              "shape": {
                "type": "circle",
                "stroke": {
                  "width": 0,
                  "color": "#000000"
                }
              },
              "opacity": {
                "value": 0.5,
                "random": false,
                "anim": {
                  "enable": false,
                  "speed": 1,
                  "opacity_min": 0.1,
                  "sync": false
                }
              },
              "size": {
                "value": 3,
                "random": true,
                "anim": {
                  "enable": false,
                  "speed": 40,
                  "size_min": 0.1,
                  "sync": false
                }
              },
              "line_linked": {
                "enable": true,
                "distance": 150,
                "color": "#1543a8",
                "opacity": 0.4,
                "width": 1
              },
              "move": {
                "enable": true,
                "speed": 2,
                "direction": "none",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false,
                "attract": {
                  "enable": false,
                  "rotateX": 600,
                  "rotateY": 1200
                }
              }
            },
            "interactivity": {
              "detect_on": "canvas",
              "events": {
                "onhover": {
                  "enable": true,
                  "mode": "grab"
                },
                "onclick": {
                  "enable": true,
                  "mode": "push"
                },
                "resize": true
              },
              "modes": {
                "grab": {
                  "distance": 140,
                  "line_linked": {
                    "opacity": 1
                  }
                },
                "bubble": {
                  "distance": 400,
                  "size": 40,
                  "duration": 2,
                  "opacity": 8,
                  "speed": 3
                },
                "repulse": {
                  "distance": 200,
                  "duration": 0.4
                },
                "push": {
                  "particles_nb": 4
                },
                "remove": {
                  "particles_nb": 2
                }
              }
            },
            "retina_detect": true
          });
        }
      };
      
      document.body.appendChild(script);
      return script;
    };
    
    const script = loadParticles();
    
    // 클린업 함수
    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-50">
      {/* 파티클 배경 */}
      <div id="particles-js" className="absolute inset-0 z-0" />
      
      {/* 메인 컨텐츠 */}
      <div className="relative z-10">
        {/* 상단 섹션 - 비대칭 레이아웃 */}
        <section className="min-h-screen flex flex-col md:flex-row items-center relative">
          {/* 왼쪽 콘텐츠 - 비대칭 디자인 */}
          <div className="w-full md:w-2/3 px-8 py-16 md:py-0 md:pl-20 md:pr-12 flex flex-col justify-center min-h-[50vh] md:min-h-screen z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <h1 className="text-5xl md:text-7xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-800 to-indigo-600">
                JUSEYO
              </h1>
              <p className="text-2xl md:text-3xl font-medium text-slate-700 mb-8">
                재고 관리의 <span className="text-indigo-600">혁신</span>
              </p>

              {/* 로그인 정보 - 3D 카드 효과 */}
              {isLogin && (
                <motion.div 
                  className="bg-white mb-8 p-6 rounded-xl shadow-lg relative backdrop-blur-lg border border-blue-100 transform transition-all duration-300 hover:shadow-xl"
                  whileHover={{ scale: 1.02, rotateY: 5, rotateX: 5 }}
                >
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500 rounded-bl-full rounded-tr-xl -z-10 opacity-10"></div>
                  <h2 className="text-xl font-bold text-blue-800 mb-3">{loginUser.username}님 환영합니다!</h2>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">이메일:</span> {loginUser.email}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">전화번호:</span> {loginUser.phoneNumber}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">역할:</span> {loginUser.role}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">대시보드:</span> {loginUser.managementDashboardName || "없음"}
                    </p>
                    <p className="text-slate-600">
                      <span className="font-medium text-slate-800">부서:</span> {loginUser.departmentName || "없음"}
                    </p>
                  </div>
                </motion.div>
              )}

              <p className="text-slate-600 mb-8 max-w-xl">
                JUSEYO는 <span className="font-semibold text-blue-700">지능형 알고리즘</span>으로 재고 관리를 
                혁신적으로 변화시키는 솔루션입니다. <br/>실시간 분석과 직관적인 인터페이스로 비즈니스 성장을 가속화하세요.
              </p>


              <div className="flex flex-wrap gap-4">
                {isLogin ? (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAdminAction}
                    className="px-8 py-3 bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-full font-medium shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 group"
                  >
                    <span>{!loginUser.managementDashboardName ? "관리자 페이지 생성" : "관리자 페이지 접속"}</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </motion.button>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/login")}
                      className="px-8 py-3 bg-gradient-to-r from-blue-700 to-indigo-600 text-white rounded-full font-medium shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 group"
                    >
                      <span>로그인</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => router.push("/signup")}
                      className="px-8 py-3 border-2 border-blue-600 text-blue-700 bg-transparent rounded-full font-medium hover:bg-blue-50 transition-all"
                    >
                      회원가입
                    </motion.button>
                  </div>
                )}
                
                {/* 재고 부족 알림 테스트 버튼 - 고유한 디자인 */}
                {isLogin && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={async () => {
                      try {
                        const response = await fetch(
                          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/v1/notifications/test/stockDown`,
                          {
                            method: "POST",
                            credentials: "include",
                          }
                        );
                        if (response.ok) {
                          alert("재고 부족 알림 테스트가 실행되었습니다.");
                        } else {
                          alert("알림 테스트 실행에 실패했습니다.");
                        }
                      } catch (error) {
                        console.error("Error:", error);
                        alert("알림 테스트 실행 중 오류가 발생했습니다.");
                      }
                    }}
                    className="px-6 py-3 bg-white border border-indigo-300 text-indigo-700 rounded-full font-medium shadow hover:shadow-md transition-all flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-700" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                    재고 부족 알림 테스트
                  </motion.button>
                )}
              </div>
            </motion.div>
          </div>
          
          {/* 오른쪽 이미지/그래픽 영역 */}
          <div className="w-full md:w-1/3 md:h-screen bg-gradient-to-br from-blue-900 to-indigo-900 flex flex-col items-center justify-center relative overflow-hidden">
            {/* 심플한 배경 효과 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-white rounded-full blur-3xl translate-x-1/4 -translate-y-1/4"></div>
              <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-blue-300 rounded-full blur-3xl -translate-x-1/4 translate-y-1/4"></div>
            </div>
            
            {/* 타이틀 */}
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-8 text-center"
            >
              <h2 className="text-3xl font-bold text-white mb-2">주요 기능 소개</h2>
              <p className="text-blue-100 text-sm">JUSEYO가 제공하는 스마트한 기능들</p>
            </motion.div>
            
            {/* 기능 소개 슬라이드 - 확장된 크기와 디자인 */}
            <div className="relative w-full max-w-md px-4">
              <div className="relative h-80">
                {featureSlides.map((slide, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: currentSlide === index ? 1 : 0,
                      y: currentSlide === index ? 0 : 20,
                      scale: currentSlide === index ? 1 : 0.9
                    }}
                    transition={{ duration: 0.5 }}
                    className={`absolute inset-0 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 shadow-lg ${
                      currentSlide === index ? "z-10" : "z-0"
                    }`}
                  >
                    <div className="flex flex-col items-center h-full justify-center">
                      <div className="p-4 bg-white/20 rounded-xl mb-5 text-white">
                        {slide.icon}
                      </div>
                      <h4 className="text-2xl font-bold text-white mb-3 text-center">{slide.title}</h4>
                      <p className="text-blue-100 text-center">{slide.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              {/* 슬라이드 인디케이터 - 더 눈에 띄는 디자인 */}
              <div className="flex justify-center gap-3 mt-6">
                {featureSlides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-3 rounded-full transition-all duration-300 ${
                      currentSlide === index ? "bg-white w-8" : "bg-white/40 w-3"
                    }`}
                    aria-label={`슬라이드 ${index + 1}`}
                  />
                ))}
              </div>
            </div>
            
            {/* 추가 정보 버튼 */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="mt-8 px-6 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-full font-medium flex items-center gap-2 hover:bg-white/20 transition-all"
            >
              <span>더 많은 기능 살펴보기</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </motion.button>
          </div>
        </section>
        <Footer />
      </div>
    </div>
  );
}
