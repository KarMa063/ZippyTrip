import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AuthForm from './components/AuthForm';
import Home from './pages/Home';
import Landing from './pages/Landing';
import Preferences from './pages/Preferences';
import GuestHouseBooking from './pages/GuestHouseBooking';
import SettingsPage from './pages/SettingsPage';
import BusRentalPage from './pages/BusRentalPage';
//import MyTickets from './pages/MyTickets';
import PopularDestinations from './pages/PopularDestinations';

import GLogin from './guesthouse/gpages/GLogin';
import GDashboard from './guesthouse/gpages/GDashboard';
import GProperties from './guesthouse/gpages/GProperties';
import PropertyDetails from './guesthouse/gpages/PropertyDetails';
import AddProperty from './guesthouse/gpages/AddProperty';
import EditProperty from "./guesthouse/gpages/EditProperty";
import AddRoom from './guesthouse/gpages/AddRoom';
import EditRooms from './guesthouse/gpages/EditRooms';
import GBooking from './guesthouse/gpages/GBooking';
import GMessages from './guesthouse/gpages/GMessages';
import { Layout } from './guesthouse/gcomponents/layout';
import { ThemeProvider } from './guesthouse/gcomponents/theme-provider';

function App() {
  return (
    <Router>
      <Toaster position="top-center" />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/preferences" element={<Preferences />} />
        <Route path="/setting" element={<SettingsPage />} />
        <Route path="/bus" element={<BusRentalPage />} />
        {/*<Route path="/tickets" element={<MyTickets />} />*/}
        <Route path="/attractions" element={<PopularDestinations />} />
        <Route path="/guesthouses" element={<GuestHouseBooking />} />

        {/* Guesthouse Owner Routes*/}
        <Route path="/glogin" element={<GLogin />} />
        <Route element={
          <ThemeProvider defaultTheme="dark">
            <Layout />
          </ThemeProvider>
        }>
          <Route path="/gdashboard" element={<GDashboard />} />
          <Route path="/gproperties" element={<GProperties />} />
          <Route path="/gproperties/:id" element={<PropertyDetails />} />
          <Route path="/gproperties/:id/add-room" element={<AddRoom />}/>
          <Route path="/gproperties/:id/rooms/:roomId/edit" element={<EditRooms />} />
          <Route path="/gproperties/add" element={<AddProperty />} />
          <Route path="/gproperties/edit/:id" element={<EditProperty />} />
          <Route path="/gbookings" element={<GBooking />} />
          <Route path="/gmessages" element={<GMessages />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
