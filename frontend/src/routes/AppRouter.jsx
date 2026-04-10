import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';

// Lazy load pages for performance
import Login from '../pages/Login/Login';
import Activation from '../pages/Login/Activation';
import Dashboard from '../pages/Dashboard/Dashboard';
import WargaAccountCreate from '../pages/Admin/WargaAccountCreate';

import HouseholdList from '../pages/Households/HouseholdList';
import HouseholdWizard from '../pages/Households/HouseholdWizard';
import HouseholdDocuments from '../pages/Households/HouseholdDocuments';
import ApplicationCreate from '../pages/Households/ApplicationCreate';
import AuditLogList from '../pages/Admin/AuditLogList';
import ComplaintCreate from '../pages/Complaints/ComplaintCreate';
import SurveyList from '../pages/Surveys/SurveyList';
import SurveyAction from '../pages/Surveys/SurveyAction';
import ApplicationList from '../pages/Applications/ApplicationList';
import ApplicationDetail from '../pages/Applications/ApplicationDetail';
import DistributionList from '../pages/Distributions/DistributionList';
import ComplaintReview from '../pages/Complaints/ComplaintReview';
import PublicDashboard from '../pages/Public/PublicDashboard';
import DonationForm from '../pages/Public/DonationForm';

// Placeholder components for other routes
const Placeholder = ({ title }) => (
  <div className="p-8"><h1 className="text-2xl font-bold">{title} Page Incoming...</h1></div>
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

      {/* Protected Routes inside DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboards */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'relawan', 'warga']} />}>
            <Route index element={<Dashboard />} />
          </Route>
          
          {/* Khusus Admin */}
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff']} />}>
            <Route index element={<Placeholder title="Users Management" />} />
          </Route>
          <Route path="/regions" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff']} />}>
            <Route index element={<Placeholder title="Regions Management" />} />
          </Route>
          <Route path="/aid-types" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff']} />}>
            <Route index element={<Placeholder title="Aid Types Management" />} />
          </Route>
          <Route path="/decisions" element={<ProtectedRoute allowedRoles={['admin_main']} />}>
             <Route index element={<Placeholder title="Decisions" />} />
          </Route>
          <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas']} />}>
            <Route index element={<AuditLogList />} />
          </Route>
          <Route path="/admin/create-warga" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff']} />}>
            <Route index element={<WargaAccountCreate />} />
          </Route>

          {/* Admin, Petugas, Warga */}
          <Route path="/applications" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'pengawas', 'warga']} />}>
            <Route index element={<ApplicationList />} />
            <Route path="new" element={<ApplicationCreate />} />
            <Route path=":id" element={<ApplicationDetail />} />
          </Route>

          {/* Admin, Petugas */}
          <Route path="/distributions" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'relawan']} />}>
             <Route index element={<DistributionList />} />
          </Route>
          
          {/* Relawan, Petugas, Warga */}
          <Route path="/households" element={<ProtectedRoute allowedRoles={['relawan', 'admin_staff', 'warga']} />}>
            <Route index element={<HouseholdList />} />
            <Route path=":id" element={<Placeholder title="Household Detail" />} />
            <Route path=":id/documents" element={<HouseholdDocuments />} />
            <Route path=":id/edit" element={<Placeholder title="Household Edit" />} />
            <Route path="create" element={<HouseholdWizard />} />
          </Route>

          {/* Relawan, Warga */}
          <Route path="/family-members" element={<ProtectedRoute allowedRoles={['relawan', 'warga']} />}>
            <Route index element={<Placeholder title="Family Members" />} />
          </Route>
          <Route path="/documents" element={<ProtectedRoute allowedRoles={['relawan', 'warga']} />}>
            <Route index element={<Placeholder title="Documents" />} />
          </Route>
          
          {/* Khusus Relawan */}
          <Route path="/surveys" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<SurveyList />} />
            <Route path=":id" element={<SurveyAction />} />
          </Route>
          <Route path="/survey-checklists" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<Placeholder title="Survey Checklists" />} />
          </Route>
          <Route path="/survey-photos" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<Placeholder title="Survey Photos" />} />
          </Route>
          
          {/* Admin, Petugas, Warga */}
          <Route path="/complaints" element={<ProtectedRoute allowedRoles={['admin_main', 'admin_staff', 'warga']} />}>
             <Route index element={<ComplaintReview />} />
             <Route path="create" element={<ComplaintCreate />} />
          </Route>
          
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
