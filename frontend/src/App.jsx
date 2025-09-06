import {
  BrowserRouter,
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import Home from "./components/Home";
import Jobs from "./components/Jobs";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import JobDescription from "./components/JobDescription";
import Companies from "./components/admin/Companies";
import CompanyCreate from "./components/admin/CompanyCreate";
import CompanySetup from "./components/admin/CompanySetup";
import AdminJobs from "./components/admin/AdminJobs";
import PostJob from "./components/admin/PostJob";
import Applicants from "./components/admin/Applicants";
import ErrorBoundary from "./components/ErrorBoundary";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/jobs",
    element: <Jobs />,
  },
  {
    path: "/description/:id",
    element: <JobDescription />,
  },
  {
    path: "/browse",
    element: <Browse />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },
  {
    path: "/ai/recommendations",
    element: <div className="p-8 text-center"><h1 className="text-2xl font-bold text-blue-600">🤖 AI Job Recommendations</h1><p className="mt-4 text-gray-600">Advanced AI-powered job matching system - Coming Soon!</p></div>,
  },
  {
    path: "/chat", 
    element: <div className="p-8 text-center"><h1 className="text-2xl font-bold text-green-600">💬 Real-time Chat System</h1><p className="mt-4 text-gray-600">WebSocket-powered instant messaging - Coming Soon!</p></div>,
  },
  {
    path: "/interview/:sessionId",
    element: <div className="p-8 text-center"><h1 className="text-2xl font-bold text-purple-600">🎥 Video Interview Platform</h1><p className="mt-4 text-gray-600">WebRTC-based video calling system - Coming Soon!</p></div>,
  },
  {
    path: "/notifications",
    element: <div className="p-8 text-center"><h1 className="text-2xl font-bold text-orange-600">🔔 Notification Center</h1><p className="mt-4 text-gray-600">Real-time notification system - Coming Soon!</p></div>,
  },
  {
    path: "/analytics",
    element: <div className="p-8 text-center"><h1 className="text-2xl font-bold text-red-600">📊 Analytics Dashboard</h1><p className="mt-4 text-gray-600">Advanced analytics and insights - Coming Soon!</p></div>,
  },
  //admin routes
  {
    path: "/admin/companies",
    element: <Companies />,
  },

  {
    path: "/admin/companies/create",
    element: <CompanyCreate />,
  },
  {
    path: "/admin/companies/:id",
    element: <CompanySetup />,
  },
  {
    path: "/admin/jobs",
    element: <AdminJobs />,
  },
  {
    path: "/admin/jobs/create",
    element: <PostJob />,
  },
  {
    path: "/admin/jobs/:id/applicants",
    element: <Applicants />,
  },
]);

function App() {
  return (
    <ErrorBoundary>
      <RouterProvider router={appRouter} />
    </ErrorBoundary>
  );
}

export default App;
