import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// locations
const Location = {
  List: React.lazy(() => import('./views/locations/List')),
  Create: React.lazy(() => import('./views/locations/Create')),
}

// users
const User = {
  List: React.lazy(() => import('./views/users/List')),
  Create: React.lazy(() => import('./views/users/Create')),
}

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/locations/list', name: 'Liste des locations', element: Location.List },
  { path: '/locations/create', name: 'Ajouter une location', element: Location.Create },

  { path: '/users/list', name: 'Liste des utilisateurs', element: User.List },
  { path: '/users/create', name: 'Ajouter un utilisateur', element: User.Create },
]

/** My routes */
export default routes
