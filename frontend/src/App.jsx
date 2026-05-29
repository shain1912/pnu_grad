import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';

function RedirectToAdmission() {
  useEffect(() => { window.location.replace('/admission.html'); }, []);
  return <div className="container">이동 중...</div>;
}

export default function App() {
  return (
    <Routes>
      {/* admin (자체 ID/PW) — 신청자 OAuth와 격리, 시안 redirect보다 우선 */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* 신청자 OAuth 에러 표시 */}
      <Route path="/login" element={<Login />} />

      {/* 나머지: 시안 인덱스로 */}
      <Route path="*" element={<RedirectToAdmission />} />
    </Routes>
  );
}
