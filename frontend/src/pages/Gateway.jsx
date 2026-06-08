import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './gateway.css';

export default function Gateway() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="gateway-container">
      <div className="gateway-wrap">
        
        {/* Brand Header */}
        <div className="brand">
          <img className="mark" src="/logos/pnu-symbol-color.jpg" alt="부산대학교" />
          <div>
            <h1>부산대학교 <span>AI 거점대학육성사업단</span></h1>
            <div className="sub">A.U.R.A · Busan National University</div>
          </div>
        </div>

        {/* Hero Content Area */}
        <div className="gateway-box">
          <div className="gateway-video">
            <video 
              muted 
              autoPlay 
              loop 
              playsInline 
              preload="auto" 
              src="/media/pnu80-intro.mp4" 
              aria-label="부산대학교 소개 영상"
            />
          </div>

          <ul className="gateway-right" id="main">
            <li className="gateway-slogan">
              <span className="eyebrow">ARISE · AI University</span>
              <h2>AI로 여는 부산대학교의<br />다음 100년</h2>
              <p>원하는 메뉴를 선택하세요.</p>
            </li>

            {/* Menu 1: Modal Trigger */}
            <li>
              <button 
                className="gateway-btn aura"
                onClick={openModal}
              >
                <span className="num">01</span>
                <span className="org">AI 거점대학육성사업단</span>
                <strong>A.U.R.A 마스터플랜 및 데이터룸</strong>
                <span className="desc">부산대학교 AI 대전환 추진 전략 및 성과 분석 데이터룸</span>
                <span className="btn-arrow"><span className="arrow-icon"></span></span>
              </button>
            </li>

            {/* Menu 2: Google Partnership (Disabled/Coming Soon) */}
            <li>
              <div className="gateway-btn google">
                <span className="tag">준비중</span>
                <span className="num">02</span>
                <strong>Google 협력</strong>
                <span className="desc">Google과 함께하는 AI 교육·연구 협력 (오픈 예정)</span>
                <span className="btn-arrow"><span className="arrow-icon"></span></span>
              </div>
            </li>

            {/* Menu 3: Application process (Direct static page routing) */}
            <li>
              <a className="gateway-btn apply" href="/admission-v3-dark.html">
                <span className="num">03</span>
                <strong>학·석사 연계과정 신청</strong>
                <span className="desc">대학원 연계과정 안내 · 학과 디렉터리 · 사전 신청</span>
                <span className="btn-arrow"><span className="arrow-icon"></span></span>
              </a>
            </li>
          </ul>
        </div>

        <footer>ARISE PNU AI · 부산대학교 AI 거점대학</footer>
      </div>

      {/* Premium Glassmorphism Modal */}
      {isModalOpen && (
        <div className="gateway-modal-overlay" onClick={closeModal}>
          <div className="gateway-modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={closeModal} aria-label="닫기">
              &times;
            </button>
            <div className="modal-header">
              <span className="modal-subtitle">A.U.R.A Masterplan & Datarooms</span>
              <h2 className="modal-title">AI 거점대학육성사업단</h2>
              <p className="modal-desc">부산대학교 AI 대전환 추진 전략 및 성과 분석 데이터룸</p>
            </div>
            
            <div className="modal-sections">
              {/* A.U.R.A 마스터플랜 & 디자인 시안 — 위계 없이 동등한 형제 카드 */}
              <div className="modal-section">
                <div className="modal-variants-grid trio">
                  <a href="/s30/about/aura.html" className="modal-variant-card aura3d">
                    <strong>A.U.R.A v4.1 3D 마스터플랜</strong>
                    <span>Three.js 기반 인터랙티브 3D 여정으로 만나는 AI 대전환 비전</span>
                  </a>
                  <Link to="/bymonolog" className="modal-variant-card dark">
                    <strong>다크 시네마틱 시안</strong>
                    <span>고급스럽고 중후한 무비 스타일의 다크 모드 시안</span>
                  </Link>
                  <Link to="/tresmares" className="modal-variant-card light">
                    <strong>라이트 에디토리얼 시안</strong>
                    <span>매거진 느낌의 깔끔하고 화사한 라이트 모드 시안</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
