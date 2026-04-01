import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/layout/ProtectedRoute';
import DashboardLayout from '../components/layout/DashboardLayout';
import useAuthStore from '../store/authStore';

// Lazy load pages for performance
import Login from '../pages/Login/Login';
import Dashboard from '../pages/Dashboard/Dashboard';

import HouseholdList from '../pages/Households/HouseholdList';

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

      {/* Public / Donatur Routes (No Auth Required) */}
      <Route path="/public-dashboard" element={<Placeholder title="Public Dashboard" />} />
      <Route path="/donasi" element={<Placeholder title="Donasi" />} />

      {/* Protected Routes inside DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Dashboards (Admin, Petugas, Warga) */}
          <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'petugas', 'warga']} />}>
            <Route index element={<Dashboard />} />
          </Route>
          
          {/* Khusus Admin */}
          <Route path="/users" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Placeholder title="Users Management" />} />
          </Route>
          <Route path="/regions" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Placeholder title="Regions Management" />} />
          </Route>
          <Route path="/aid-types" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Placeholder title="Aid Types Management" />} />
          </Route>
          <Route path="/decisions" element={<ProtectedRoute allowedRoles={['admin']} />}>
             <Route index element={<Placeholder title="Decisions" />} />
          </Route>
          <Route path="/audit-logs" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<Placeholder title="Audit Logs" />} />
          </Route>

          {/* Admin, Petugas, Warga */}
          <Route path="/applications" element={<ProtectedRoute allowedRoles={['admin', 'petugas', 'warga']} />}>
            <Route index element={<Placeholder title="Applications" />} />
          </Route>

          {/* Admin, Petugas */}
          <Route path="/distributions" element={<ProtectedRoute allowedRoles={['admin', 'petugas']} />}>
             <Route index element={<Placeholder title="Distributions" />} />
          </Route>
          
          {/* Relawan, Petugas, Warga */}
          <Route path="/households" element={<ProtectedRoute allowedRoles={['relawan', 'petugas', 'warga']} />}>
            <Route index element={<HouseholdList />} />
            <Route path=":id" element={<Placeholder title="Household Detail" />} />
            <Route path=":id/edit" element={<Placeholder title="Household Edit" />} />
            <Route path="create" element={<Placeholder title="Household Create" />} />
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
            <Route index element={<Placeholder title="Surveys" />} />
          </Route>
          <Route path="/survey-checklists" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<Placeholder title="Survey Checklists" />} />
          </Route>
          <Route path="/survey-photos" element={<ProtectedRoute allowedRoles={['relawan']} />}>
            <Route index element={<Placeholder title="Survey Photos" />} />
          </Route>
          
          {/* Khusus Warga */}
          <Route path="/complaints" element={<ProtectedRoute allowedRoles={['warga']} />}>
             <Route index element={<Placeholder title="Complaints" />} />
          </Route>
          
        </Route>
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRouter;
