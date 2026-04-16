import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';

import Login from '../pages/Login/Login';
import Activation from '../pages/Login/Activation';
import Dashboard from '../pages/dashboard/Dashboard';
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
import MySurveyResults from '../pages/Surveys/MySurveyResults';
import ApplicationList from '../pages/Applications/ApplicationList';
import ApplicationDetail from '../pages/Applications/ApplicationDetail';
import DistributionList from '../pages/Distributions/DistributionList';
import ComplaintReview from '../pages/Complaints/ComplaintReview';
import PublicDashboard from '../pages/Public/PublicDashboard';
import RegionList from '../pages/Regions/RegionList';
import AidTypeList from '../pages/AidTypes/AidTypeList';
import DonationForm from '../pages/Public/DonationForm';

import EconomicConditionList from '../pages/HouseholdData/EconomicConditionList';
import HousingConditionList from '../pages/HouseholdData/HousingConditionList';
import HouseholdAssetList from '../pages/HouseholdData/HouseholdAssetList';
import VulnerabilityList from '../pages/HouseholdData/VulnerabilityList';

import DocumentVerificationList from '../pages/Applications/DocumentVerificationList';
import ScoringResultList from '../pages/Applications/ScoringResultList';
import SurveyResultList from '../pages/Applications/SurveyResultList';
import DecisionList from '../pages/Applications/DecisionList';
import EligibilityReportList from '../pages/Applications/EligibilityReportList';

import DistributionTracking from '../pages/Distributions/DistributionTracking';
import DistributionProofs from '../pages/Distributions/DistributionProofs';
import DistributionHistory from '../pages/Distributions/DistributionHistory';

import UserActivityList from '../pages/Admin/UserActivityList';
import UserList from '../pages/Admin/UserList';

const Placeholder = ({ title, description }) => (
  <div className="space-y-4 animate-fade-in">
    <div>
      <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{title}</h1>
      <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
        {description || 'Halaman ini sedang dalam tahap pengembangan.'}
      </p>
    </div>
    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-6 text-center">
      <p className="text-amber-700 dark:text-amber-400 font-medium">Coming Soon</p>
      <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">Fitur ini akan dibangun setelah core system stabil.</p>
    </div>
  </div>
);

const AppRouter = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/activation" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Activation />} />

      <Route path="/public-dashboard" element={<PublicDashboard />} />
      <Route path="/donasi" element={<DonationForm />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga']} />}>
            <Route index element={<Dashboard />} />
          </Route>

          <Route path="/households" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'relawan']} />}>
            <Route index element={<HouseholdList />} />
            <Route path=":id" element={<HouseholdDetail />} />
            <Route path=":id/documents" element={<ProtectedRoute allowedRoles={['admin_staff', 'relawan']} />}>
              <Route index element={<HouseholdDocuments />} />
            </Route>
            <Route path=":id/edit" element={<ProtectedRoute allowedRoles={['admin_staff', 'relawan']} />}>
              <Route index element={<Placeholder title="Edit Rumah Tangga" />} />
            </Route>
            <Route path="create" element={<ProtectedRoute allowedRoles={['admin_staff', 'relawan']} />}>
              <Route index element={<HouseholdWizard />} />
            </Route>
          </Route>

          <Route path="/family-members" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'relawan', 'warga']} />}>
            <Route index element={<FamilyMemberList />} />
          </Route>
          <Route path="/economic-conditions" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<EconomicConditionList />} />
          </Route>
          <Route path="/housing-conditions" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<HousingConditionList />} />
          </Route>
          <Route path="/household-assets" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<HouseholdAssetList />} />
          </Route>
          <Route path="/vulnerabilities" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<VulnerabilityList />} />
          </Route>

          <Route path="/applications" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas']} />}>
            <Route index element={<ApplicationList />} />
            <Route path="new" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff']} />}>
              <Route index element={<ApplicationCreate />} />
            </Route>
            <Route path=":id" element={<ApplicationDetail />} />
          </Route>
          <Route path="/eligibility-reports" element={<ProtectedRoute allowedRoles={['admin_main', 'pengawas']} />}>
            <Route index element={<EligibilityReportList />} />
          </Route>
          <Route path="/document-verification" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<DocumentVerificationList />} />
          </Route>
          <Route path="/survey-results" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<SurveyResultList />} />
          </Route>
          <Route path="/scoring-results" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<ScoringResultList />} />
          </Route>
          <Route path="/decisions" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<DecisionList defaultTab="finalize" />} />
          </Route>
          <Route path="/decision-reports" element={<ProtectedRoute allowedRoles={['admin_staff']} />}>
            <Route index element={<DecisionList defaultTab="report" />} />
          </Route>

          <Route path="/distributions" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'relawan']} />}>
            <Route index element={<DistributionList />} />
          </Route>
          <Route path="/distribution-tracking" element={<ProtectedRoute allowedRoles={['admin_main', 'pengawas']} />}>
            <Route index element={<DistributionTracking />} />
          </Route>
          <Route path="/distribution-proofs" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas']} />}>
            <Route index element={<DistributionProofs />} />
          </Route>
          <Route path="/distribution-history" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas']} />}>
            <Route index element={<DistributionHistory />} />
          </Route>

          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<UserList />} />
          </Route>
          <Route path="/admin/create-warga" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<WargaAccountCreate />} />
          </Route>

          <Route path="/regions" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<RegionList />} />
          </Route>

          <Route path="/aid-types" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<AidTypeList />} />
          </Route>

          <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['admin_main', 'pengawas']} />}>
            <Route index element={<AuditLogList />} />
          </Route>
          <Route path="/user-activity" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
            <Route index element={<UserActivityList />} />
          </Route>

          <Route path="/complaints" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'warga']} />}>
            <Route index element={<ComplaintReview />} />
            <Route path="create" element={<ProtectedRoute allowedRoles={['warga']} />}>
              <Route index element={<ComplaintCreate />} />
            </Route>
          </Route>

          <Route path="/surveys" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<SurveyList />} />
            <Route path=":id" element={<SurveyAction />} />
          </Route>
          <Route path="/my-survey-results" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<MySurveyResults />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
