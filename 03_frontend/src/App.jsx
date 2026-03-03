// App.js
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Providers } from './components/Providers';
import { ProtectedLayout } from './components/ProtectedLayout';
import { ROUTES } from './constants/routes';
import LoadingSpinner from './components/LoadingSpinner';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const HistoryList = lazy(() => import('./pages/history/HistoryList'));
const PredictionForm = lazy(() => import('./pages/prediction/PredictionForm'));
const PredictionResult = lazy(() => import('./pages/prediction/PredictionResult'));
const PredictionDetail = lazy(() => import('./pages/history/PredictionDetail'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const Goals = lazy(() => import('./pages/tracking/Goals'));
const Medications = lazy(() => import('./pages/medications/MedicationList'));
const MedicationCalendar = lazy(() => import('./pages/medications/MedicationCalendar'));
const AddMedication = lazy(() => import('./pages/medications/AddMedication'));
const Symptoms = lazy(() => import('./pages/symptoms/SymptomLog'));
const AddSymptom = lazy(() => import('./pages/symptoms/AddSymptom'));
const SymptomTrends = lazy(() => import('./pages/symptoms/SymptomTrends'));
const Resources = lazy(() => import('./pages/resources/Resources'));
const Challenges = lazy(() => import('./pages/tracking/Challenges'));

// Family History Pages - Fixed imports
const FamilyHistoryList = lazy(() => import('./pages/family/FamilyHistoryList'));
const AddFamilyMember = lazy(() => import('./pages/family-history/AddFamilyMember'));
const EditFamilyMember = lazy(() => import('./pages/family/EditFamilyMember'));

// Wrapper component for lazy loading
const PageWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

function App() {
  return (
    <Providers>
      <Router>
        <Routes>
          {/* Public routes - No Layout */}
          <Route
            path={ROUTES.HOME}
            element={
              <PageWrapper>
                <LandingPage />
              </PageWrapper>
            }
          />
          <Route
            path={ROUTES.LOGIN}
            element={
              <PageWrapper>
                <Login />
              </PageWrapper>
            }
          />
          <Route
            path={ROUTES.REGISTER}
            element={
              <PageWrapper>
                <Register />
              </PageWrapper>
            }
          />
          <Route
            path={ROUTES.FORGOT_PASSWORD}
            element={
              <PageWrapper>
                <ForgotPassword />
              </PageWrapper>
            }
          />

          {/* Public assessment routes - No Layout */}
          <Route
            path={ROUTES.PREDICTIONS.NEW}
            element={
              <PageWrapper>
                <PredictionForm />
              </PageWrapper>
            }
          />

          {/* Public result route - No Layout */}
          <Route
            path={ROUTES.PREDICTIONS.RESULT}
            element={
              <PageWrapper>
                <PredictionResult />
              </PageWrapper>
            }
          />

          {/* Protected routes - With Layout */}
          <Route element={<ProtectedLayout />}>
            {/* Dashboard */}
            <Route
              path={ROUTES.DASHBOARD}
              element={
                <PageWrapper>
                  <Dashboard />
                </PageWrapper>
              }
            />

            {/* History */}
            <Route
              path={ROUTES.HISTORY}
              element={
                <PageWrapper>
                  <HistoryList />
                </PageWrapper>
              }
            />
            <Route
              path={ROUTES.PREDICTIONS.DETAIL}
              element={
                <PageWrapper>
                  <PredictionDetail />
                </PageWrapper>
              }
            />

            {/* Profile */}
            <Route
              path={ROUTES.PROFILE}
              element={
                <PageWrapper>
                  <Profile />
                </PageWrapper>
              }
            />
            <Route
              path={ROUTES.SETTINGS}
              element={
                <PageWrapper>
                  <Settings />
                </PageWrapper>
              }
            />

            {/* Family History Routes - All under /family path */}
            <Route
              path="/family"
              element={
                <PageWrapper>
                  <FamilyHistoryList />
                </PageWrapper>
              }
            />
            <Route
              path="/family/add"
              element={
                <PageWrapper>
                  <AddFamilyMember />
                </PageWrapper>
              }
            />
            <Route
              path="/family/edit/:id"
              element={
                <PageWrapper>
                  <EditFamilyMember />
                </PageWrapper>
              }
            />

            {/* Goals */}
            <Route
              path={ROUTES.GOALS}
              element={
                <PageWrapper>
                  <Goals />
                </PageWrapper>
              }
            />

            {/* Medications */}
            <Route
              path={ROUTES.MEDICATIONS.LIST}
              element={
                <PageWrapper>
                  <Medications />
                </PageWrapper>
              }
            />
            <Route
              path={ROUTES.MEDICATIONS.CALENDAR}
              element={
                <PageWrapper>
                  <MedicationCalendar />
                </PageWrapper>
              }
            />
            <Route
              path={ROUTES.MEDICATIONS.NEW}
              element={
                <PageWrapper>
                  <AddMedication />
                </PageWrapper>
              }
            />
            <Route
              path={ROUTES.MEDICATIONS.EDIT}
              element={
                <PageWrapper>
                  <AddMedication />
                </PageWrapper>
              }
            />

            {/* Symptoms */}
            <Route
              path={ROUTES.SYMPTOMS.LIST}
              element={
                <PageWrapper>
                  <Symptoms />
                </PageWrapper>
              }
            />
            <Route
              path={ROUTES.SYMPTOMS.NEW}
              element={
                <PageWrapper>
                  <AddSymptom />
                </PageWrapper>
              }
            />
            <Route
              path={ROUTES.SYMPTOMS.TRENDS}
              element={
                <PageWrapper>
                  <SymptomTrends />
                </PageWrapper>
              }
            />

            {/* Resources */}
            <Route
              path={ROUTES.RESOURCES}
              element={
                <PageWrapper>
                  <Resources />
                </PageWrapper>
              }
            />

            {/* Challenges */}
            <Route
              path={ROUTES.CHALLENGES}
              element={
                <PageWrapper>
                  <Challenges />
                </PageWrapper>
              }
            />
          </Route>

          {/* 404 Route */}
          <Route
            path="*"
            element={
              <PageWrapper>
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-6">Page not found</p>
                    <button
                      onClick={() => window.location.href = '/'}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Go Home
                    </button>
                  </div>
                </div>
              </PageWrapper>
            }
          />
        </Routes>
      </Router>
    </Providers>
  );
}

export default App;