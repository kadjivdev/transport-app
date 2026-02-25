import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// locations
const Location = {
  List: React.lazy(() => import('./views/locations/List')),
  Create: React.lazy(() => import('./views/locations/Create')),
  Type: {
    List: React.lazy(() => import('./views/locations/types/List')),
    Create: React.lazy(() => import('./views/locations/types/Create')),
  }
}

// users
const User = {
  List: React.lazy(() => import('./views/users/List')),
  Create: React.lazy(() => import('./views/users/Create')),
}

// roles
const Role = {
  List: React.lazy(() => import('./views/roles/List')),
  Create: React.lazy(() => import('./views/roles/Create')),
}

// clients
const Client = {
  List: React.lazy(() => import('./views/clients/List')),
  Create: React.lazy(() => import('./views/clients/Create')),
}

// camions
const Camion = {
  List: React.lazy(() => import('./views/camions/List')),
  Create: React.lazy(() => import('./views/camions/Create')),
}

// reglements
const Reglement = {
  List: React.lazy(() => import('./views/reglements/List')),
  Create: React.lazy(() => import('./views/reglements/Create')),
}

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/locations/list', name: 'Liste des locations', element: Location.List },
  { path: '/locations/create', name: 'Ajouter une location', element: Location.Create },
  { path: '/locations/types/list', name: 'Liste des types de location', element: Location.Type.List },
  { path: '/locations/types/create', name: 'Ajouter un type de location', element: Location.Type.Create },

  { path: '/users/list', name: 'Liste des utilisateurs', element: User.List },
  { path: '/users/create', name: 'Ajouter un utilisateur', element: User.Create },

  { path: '/roles/list', name: 'Liste des rôles', element: Role.List },
  { path: '/roles/create', name: 'Ajouter un rôle', element: Role.Create },

  { path: '/clients/list', name: 'Liste des clients', element: Client.List },
  { path: '/clients/create', name: 'Ajouter un client', element: Client.Create },

  { path: '/camions/list', name: 'Liste des camion', element: Camion.List },
  { path: '/camions/create', name: 'Ajouter un camion', element: Camion.Create },

  { path: '/reglements/list', name: 'Liste des reglements', element: Reglement.List },
  { path: '/reglements/create', name: 'Ajouter un reglement', element: Reglement.Create },
]

/** My routes */
export default routes
