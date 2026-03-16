// src/App.jsx
import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Providers } from './components/Providers';
import ProtectedRoute from './components/ProtectedRoute';
import ProtectedLayout from './components/ProtectedLayout';
import PublicRoute from './components/PublicRoute';
import { ROUTES } from './constants/routes';
import LoadingSpinner from './components/LoadingSpinner';

// Import Providers
import { ResourcesProvider } from './context/ResourcesContext';
import { SymptomsProvider } from './context/SymptomsContext';
import { MedicationsProvider } from './context/MedicationsContext'; // Make sure this is imported

// Lazy load pages
const LandingPage = lazy(() => import('./pages/landing/LandingPage'));
const Login = lazy(() => import('./pages/auth/Login'));
const Register = lazy(() => import('./pages/auth/Register'));
const ForgotPassword = lazy(() => import('./pages/auth/ForgotPassword'));
const Dashboard = lazy(() => import('./pages/dashboard/Dashboard'));
const HistoryList = lazy(() => import('./pages/history/HistoryList'));
const PredictionDetail = lazy(() => import('./pages/history/PredictionDetail'));
const Profile = lazy(() => import('./pages/profile/Profile'));
const Settings = lazy(() => import('./pages/profile/Settings'));
const PredictionForm = lazy(() => import('./pages/prediction/PredictionForm'));
const PredictionResult = lazy(() => import('./pages/prediction/PredictionResult'));
const AdvancedAnalytics = lazy(() => import('./pages/analytics/AdvancedAnalytics'));
const HealthCoach = lazy(() => import('./pages/health-coach/HealthCoach'));
const ChatInterface = lazy(() => import('./pages/health-coach/ChatInterface'));
const DietPlanner = lazy(() => import('./pages/health-coach/DietPlanner'));
const MedicationTracker = lazy(() => import('./pages/health-coach/MedicationTracker'));
const SymptomChecker = lazy(() => import('./pages/health-coach/SymptomChecker'));
const Goals = lazy(() => import('./pages/tracking/Goals'));
const Challenges = lazy(() => import('./pages/tracking/Challenges'));

// Medication Management
const Medications = lazy(() => import('./pages/medications/MedicationList'));
const MedicationCalendar = lazy(() => import('./pages/medications/MedicationCalendar'));
const AddMedication = lazy(() => import('./pages/medications/AddMedication'));

// Symptom Management
const Symptoms = lazy(() => import('./pages/symptoms/SymptomLog'));
const AddSymptom = lazy(() => import('./pages/symptoms/AddSymptom'));
const SymptomTrends = lazy(() => import('./pages/symptoms/SymptomTrends'));

// Resources
const Resources = lazy(() => import('./pages/resources/Resources'));

// Family History Pages
const FamilyHistoryList = lazy(() => import('./pages/family/FamilyHistoryList'));
const AddFamilyMember = lazy(() => import('./pages/family/AddFamilyMember'));
const EditFamilyMember = lazy(() => import('./pages/family/EditFamilyMember'));

const PageWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner />}>
    {children}
  </Suspense>
);

function App() {
  return (
    <Providers>
      <Router>
        {/* Wrap with ALL providers */}
        <ResourcesProvider>
          <SymptomsProvider>
            <MedicationsProvider>  {/* Make sure MedicationsProvider is here */}
              <Routes>
                {/* Public Routes */}
                <Route path={ROUTES.HOME} element={<PageWrapper><LandingPage /></PageWrapper>} />

                {/* Auth Routes */}
                <Route element={<PublicRoute />}>
                  <Route path={ROUTES.LOGIN} element={<PageWrapper><Login /></PageWrapper>} />
                  <Route path={ROUTES.REGISTER} element={<PageWrapper><Register /></PageWrapper>} />
                  <Route path={ROUTES.FORGOT_PASSWORD} element={<PageWrapper><ForgotPassword /></PageWrapper>} />
                </Route>

                {/* Public Assessment Routes */}
                <Route path={ROUTES.PREDICTIONS.NEW} element={<PageWrapper><PredictionForm /></PageWrapper>} />
                <Route path={ROUTES.PREDICTIONS.RESULT} element={<PageWrapper><PredictionResult /></PageWrapper>} />

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<ProtectedLayout />}>
                    <Route path={ROUTES.DASHBOARD} element={<PageWrapper><Dashboard /></PageWrapper>} />
                    <Route path={ROUTES.ANALYTICS} element={<PageWrapper><AdvancedAnalytics /></PageWrapper>} />
                    <Route path={ROUTES.HISTORY} element={<PageWrapper><HistoryList /></PageWrapper>} />
                    <Route path={ROUTES.PREDICTIONS.DETAIL} element={<PageWrapper><PredictionDetail /></PageWrapper>} />
                    <Route path={ROUTES.PROFILE} element={<PageWrapper><Profile /></PageWrapper>} />
                    <Route path={ROUTES.SETTINGS} element={<PageWrapper><Settings /></PageWrapper>} />

                    {/* Health Coach Routes */}
                    <Route path={ROUTES.HEALTH_COACH.HOME} element={<PageWrapper><HealthCoach /></PageWrapper>} />
                    <Route path={ROUTES.HEALTH_COACH.CHAT} element={<PageWrapper><ChatInterface /></PageWrapper>} />
                    <Route path={ROUTES.HEALTH_COACH.DIET} element={<PageWrapper><DietPlanner /></PageWrapper>} />
                    <Route path={ROUTES.HEALTH_COACH.MEDICATIONS} element={<PageWrapper><MedicationTracker /></PageWrapper>} />
                    <Route path={ROUTES.HEALTH_COACH.SYMPTOMS} element={<PageWrapper><SymptomChecker /></PageWrapper>} />

                    {/* Family History */}
                    <Route path="/family" element={<PageWrapper><FamilyHistoryList /></PageWrapper>} />
                    <Route path="/family/add" element={<PageWrapper><AddFamilyMember /></PageWrapper>} />
                    <Route path="/family/edit/:id" element={<PageWrapper><EditFamilyMember /></PageWrapper>} />

                    {/* Goals & Challenges */}
                    <Route path={ROUTES.GOALS} element={<PageWrapper><Goals /></PageWrapper>} />
                    <Route path={ROUTES.CHALLENGES} element={<PageWrapper><Challenges /></PageWrapper>} />

                    {/* Medications Routes */}
                    <Route path={ROUTES.MEDICATIONS.LIST} element={<PageWrapper><Medications /></PageWrapper>} />
                    <Route path={ROUTES.MEDICATIONS.CALENDAR} element={<PageWrapper><MedicationCalendar /></PageWrapper>} />
                    <Route path={ROUTES.MEDICATIONS.NEW} element={<PageWrapper><AddMedication /></PageWrapper>} />
                    <Route path={ROUTES.MEDICATIONS.EDIT} element={<PageWrapper><AddMedication /></PageWrapper>} />

                    {/* Symptoms Routes */}
                    <Route path={ROUTES.SYMPTOMS.LIST} element={<PageWrapper><Symptoms /></PageWrapper>} />
                    <Route path={ROUTES.SYMPTOMS.NEW} element={<PageWrapper><AddSymptom /></PageWrapper>} />
                    <Route path={ROUTES.SYMPTOMS.TRENDS} element={<PageWrapper><SymptomTrends /></PageWrapper>} />

                    {/* Resources */}
                    <Route path={ROUTES.RESOURCES} element={<PageWrapper><Resources /></PageWrapper>} />
                  </Route>
                </Route>

                {/* 404 Route */}
                <Route path="*" element={
                  <PageWrapper>
                    <div className="min-h-screen flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                        <p className="text-gray-600 mb-6">Page not found</p>
                        <button
                          onClick={() => window.location.href = ROUTES.HOME}
                          className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                          Go Home
                        </button>
                      </div>
                    </div>
                  </PageWrapper>
                } />
              </Routes>
            </MedicationsProvider>
          </SymptomsProvider>
        </ResourcesProvider>
      </Router>
    </Providers>
  );
}

export default App;