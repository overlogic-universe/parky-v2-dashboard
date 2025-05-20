import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/AuthPages/SignIn";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import OnlyGuestRoute from "./layout/OnlyGuestRoute";
import PrivateRoute from "./layout/PrivateRoute";
import VehicleTable from "./components/tables/VehicleTables/VehicleTable";
import DashboardPage from "./pages/Dashboard/DashboardPage";
import CreateParkingAttendantPage from "./pages/CreateParkingAttendantPage.tsx/CreateParkingAttendantPage";
import CreateStudentPage from "./pages/CreateStudentPage/CreateStudentPage";
import ParkingAttendantTablePage from "./pages/Tables/ParkingAttendantTablePage";
import StudentTablePage from "./pages/Tables/StudentTablePage";
import CreateParkingLotPage from "./pages/CreateParkingLotPage/CreateParkingLotPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Auth Routes (Only accessible by guests) */}
          <Route
            path="/signin"
            element={
              <OnlyGuestRoute>
                <SignIn />
              </OnlyGuestRoute>
            }
          />

          {/* Private Routes (Only accessible by authenticated users) */}
          <Route
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index path="/" element={<DashboardPage />} />
            <Route index path="/student-table" element={<StudentTablePage />} />
            <Route index path="/parking-attendant-table" element={<ParkingAttendantTablePage />} />
            <Route index path="/vehicles" element={<VehicleTable />} />

            <Route index path="/create-parking-attendant" element={<CreateParkingAttendantPage />} />
            <Route index path="/create-student" element={<CreateStudentPage />} />
            <Route index path="/create-parking-lot" element={<CreateParkingLotPage />} />
            {/* <Route index path="/user-detail" element={<PatientDetailsPage />} />
            <Route path="/userprofiles" element={<UserProfiles />} />
            <Route path="/videos" element={<Videos />} />
            <Route path="/images" element={<Images />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/badges" element={<Badges />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/linechart" element={<LineChart />} />
            <Route path="/barchart" element={<BarChart />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/basictables" element={<BasicTables />} />
            <Route path="/formelements" element={<FormElements />} />
            <Route path="/blank" element={<Blank />} /> */}
          </Route>

          {/* Fallback Route (Page Not Found) */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
