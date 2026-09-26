import { createBrowserRouter, Navigate } from 'react-router'
import PhoneFrame from './PhoneFrame'
import StaffLayout from './StaffLayout'
import PlayerLayout from './PlayerLayout'
import NotFound from './NotFound'
import {
  Home,
  Login,
  Today,
  Calendar,
  Requests,
  Customers,
  CustomerDetail,
  Reports,
  Settings,
  Explore,
  Venue,
  Review,
  Confirmation,
  MyBookings,
  Profile,
  ResetDemo,
  SettingsVenue,
  SettingsPitches,
  SettingsHours,
  SettingsPricing,
  SettingsBlocked,
  SettingsBookingRules,
  SettingsTeam,
  SettingsNotifications,
  SettingsNewVenue,
} from './RouteScreens'

// Vite's base URL, without the trailing slash React Router doesn't expect
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

export const routes = [
  {
    element: <PhoneFrame />,
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'reset-demo', element: <ResetDemo /> },
      {
        path: 'v/:venueId',
        element: <StaffLayout />,
        children: [
          { index: true, element: <Navigate to="today" replace /> },
          { path: 'today', element: <Today /> },
          { path: 'calendar', element: <Calendar /> },
          { path: 'requests', element: <Requests /> },
          { path: 'customers', element: <Customers /> },
          { path: 'customers/:phone', element: <CustomerDetail /> },
          { path: 'reports', element: <Reports /> },
          { path: 'settings', element: <Settings /> },
          { path: 'settings/venue', element: <SettingsVenue /> },
          { path: 'settings/pitches', element: <SettingsPitches /> },
          { path: 'settings/hours', element: <SettingsHours /> },
          { path: 'settings/pricing', element: <SettingsPricing /> },
          { path: 'settings/blocked', element: <SettingsBlocked /> },
          { path: 'settings/booking-rules', element: <SettingsBookingRules /> },
          { path: 'settings/team', element: <SettingsTeam /> },
          { path: 'settings/notifications', element: <SettingsNotifications /> },
          { path: 'settings/new-venue', element: <SettingsNewVenue /> },
          { path: '*', element: <NotFound /> },
        ],
      },
      {
        element: <PlayerLayout />,
        children: [
          { path: 'explore', element: <Explore /> },
          { path: 'venues/:slug', element: <Venue /> },
          { path: 'book/review', element: <Review /> },
          { path: 'book/:ref', element: <Confirmation /> },
          { path: 'bookings', element: <MyBookings /> },
          { path: 'profile', element: <Profile /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]

export const router = createBrowserRouter(routes, { basename })
