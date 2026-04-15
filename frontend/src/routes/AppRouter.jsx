import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';

// Lazy load pages for performance
import Login from '../pages/Login/Login';
import Activation from '../pages/Login/Activation';
import Dashboard from '../pages/dashboard/Dashboard';
import ForgotPassword from '../pages/auth/ForgotPassword';
import ResetPassword from '../pages/auth/ResetPassword';
import WargaAccountCreate from '../pages/Admin/WargaAccountCreate';

import HouseholdList from '../pages/Households/HouseholdList';
import HouseholdDetail from '../pages/Households/HouseholdDetail';
import HouseholdWizard from '../pages/Households/HouseholdWizard';
import HouseholdDocuments from '../pages/Households/HouseholdDocuments';
import FamilyMemberList from '../pages/Households/FamilyMemberList';
import ApplicationCreate from '../pages/Households/ApplicationCreate';
import AuditLogList from '../pages/Admin/AuditLogList';
import ComplaintCreate from '../pages/Complaints/ComplaintCreate';
import SurveyList from '../pages/Surveys/SurveyList';
import SurveyAction from '../pages/Surveys/SurveyAction';
import SurveyChecklistList from '../pages/Surveys/SurveyChecklistList';
import SurveyPhotoGallery from '../pages/Surveys/SurveyPhotoGallery';
import ApplicationList from '../pages/Applications/ApplicationList';
import ApplicationDetail from '../pages/Applications/ApplicationDetail';
import DistributionList from '../pages/Distributions/DistributionList';
import ComplaintReview from '../pages/Complaints/ComplaintReview';
import PublicDashboard from '../pages/Public/PublicDashboard';
import RegionList from '../pages/Regions/RegionList';
import AidTypeList from '../pages/AidTypes/AidTypeList';
import DonationForm from '../pages/Public/DonationForm';

// Household Data Pages (Fase 2)
import EconomicConditionList from '../pages/HouseholdData/EconomicConditionList';
import HousingConditionList from '../pages/HouseholdData/HousingConditionList';
import HouseholdAssetList from '../pages/HouseholdData/HouseholdAssetList';
import VulnerabilityList from '../pages/HouseholdData/VulnerabilityList';

// Permohonan Bantuan Pages (Fase 3)
import DocumentVerificationList from '../pages/Applications/DocumentVerificationList';
import ScoringResultList from '../pages/Applications/ScoringResultList';
import SurveyResultList from '../pages/Applications/SurveyResultList';
import DecisionList from '../pages/Applications/DecisionList';

// Distribusi Bantuan Pages (Fase 4)
import DistributionTracking from '../pages/Distributions/DistributionTracking';
import DistributionProofs from '../pages/Distributions/DistributionProofs';
import DistributionHistory from '../pages/Distributions/DistributionHistory';

// Audit & Monitoring Pages (Fase 5)
import UserActivityList from '../pages/Admin/UserActivityList';

// Admin / Manajemen Pengguna Pages (Fase 6)
import UserList from '../pages/Admin/UserList';

// Placeholder for pages that will be built in later phases
const Placeholder = ({ title, description }) => (
  <div className="space-y-4 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{title}</h1>
      <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
        {description || 'Halaman ini sedang dalam tahap pengembangan.'}
      </p>
    </div>
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
      <p className="text-amber-700 dark:text-amber-400 font-medium">🚧 Coming Soon — Fase berikutnya</p>
      <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">Fitur ini akan dibangun setelah core system stabil.</p>
    </div>
  </div>
);

const AppRouter = () => {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        path="/activation"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Activation />}
      />

      {/* Public Routes (No Auth Required) */}
      <Route path="/public-dashboard" element={<PublicDashboard />} />
      <Route path="/donasi" element={<DonationForm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Protected Routes inside DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* ═══════════════════════════════════════════ */}
          {/* 1. DASHBOARD                               */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga']} />}>
            <Route index element={<Dashboard />} />
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* 2. DATA WARGA                              */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/households" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga']} />}>
            <Route index element={<HouseholdList />} />
            <Route path=":id" element={<HouseholdDetail />} />
            <Route path=":id/documents" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'relawan', 'warga']} />}>
              <Route index element={<HouseholdDocuments />} />
            </Route>
            <Route path=":id/edit" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'relawan', 'warga']} />}>
              <Route index element={<Placeholder title="Edit Rumah Tangga" />} />
            </Route>
            <Route path="create" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'relawan', 'warga']} />}>
              <Route index element={<HouseholdWizard />} />
            </Route>
          </Route>
          <Route path="/family-members" element={<ProtectedRoute allowedRoles={['admin_main', 'relawan', 'warga']} />}>
            <Route index element={<FamilyMemberList />} />
          </Route>
          <Route path="/economic-conditions" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<EconomicConditionList />} />
          </Route>
          <Route path="/housing-conditions" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<HousingConditionList />} />
          </Route>
          <Route path="/household-assets" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<HouseholdAssetList />} />
          </Route>
          <Route path="/vulnerabilities" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<VulnerabilityList />} />
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* 3. PERMOHONAN BANTUAN                      */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/applications" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'warga']} />}>
            <Route index element={<ApplicationList />} />
            <Route path="new" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'warga']} />}>
              <Route index element={<ApplicationCreate />} />
            </Route>
            <Route path=":id" element={<ApplicationDetail />} />
          </Route>
          <Route path="/document-verification" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<DocumentVerificationList />} />
          </Route>
          <Route path="/survey-results" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<SurveyResultList />} />
          </Route>
          <Route path="/scoring-results" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<ScoringResultList />} />
          </Route>
          <Route path="/decisions" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<DecisionList />} />
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* 4. DISTRIBUSI BANTUAN                      */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/distributions" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'relawan']} />}>
            <Route index element={<DistributionList />} />
          </Route>
          <Route path="/distribution-tracking" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<DistributionTracking />} />
          </Route>
          <Route path="/distribution-proofs" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas']} />}>
            <Route index element={<DistributionProofs />} />
          </Route>
          <Route path="/distribution-history" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas']} />}>
            <Route index element={<DistributionHistory />} />
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* 5. MANAJEMEN PENGGUNA (admin_main only)    */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<UserList />} />
          </Route>
          <Route path="/admin/create-warga" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<WargaAccountCreate />} />
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* 6. WILAYAH                                 */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/regions" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff']} />}>
            <Route index element={<RegionList />} />
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* 7. JENIS BANTUAN                           */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/aid-types" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff']} />}>
            <Route index element={<AidTypeList />} />
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* 8. AUDIT & MONITORING                      */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas']} />}>
            <Route index element={<AuditLogList />} />
          </Route>
          <Route path="/user-activity" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<UserActivityList />} />
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* 9. PENGADUAN                               */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/complaints" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'warga']} />}>
            <Route index element={<ComplaintReview />} />
            <Route path="create" element={<ProtectedRoute allowedRoles={['warga']} />}>
              <Route index element={<ComplaintCreate />} />
            </Route>
          </Route>

          {/* ═══════════════════════════════════════════ */}
          {/* MODUL RELAWAN                              */}
          {/* ═══════════════════════════════════════════ */}
          <Route path="/surveys" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<SurveyList />} />
            <Route path=":id" element={<SurveyAction />} />
          </Route>
          <Route path="/survey-checklists" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<SurveyChecklistList />} />
          </Route>
          <Route path="/survey-photos" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<SurveyPhotoGallery />} />
          </Route>

          {/* MODUL WARGA */}
          <Route path="/documents" element={<ProtectedRoute allowedRoles={['relawan', 'warga']} />}>
            <Route index element={<Placeholder title="Dokumen Saya" />} />
          </Route>

        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
