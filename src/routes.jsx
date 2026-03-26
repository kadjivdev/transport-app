import React from 'react'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'))

// locations
const Location = {
  List: React.lazy(() => import('./views/locations/List')),
  Create: React.lazy(() => import('./views/locations/Create')),
  StatistiqueDate: React.lazy(() => import('./views/locations/StatistiquesDate')),
  StatistiquePeriode: React.lazy(() => import('./views/locations/StatistiquesPeriode')),
  StatistiqueClient: React.lazy(() => import('./views/locations/StatistiquesClient')),
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

// acomptes
const Acompte = {
  List: React.lazy(() => import('./views/acomptes/List')),
  Create: React.lazy(() => import('./views/acomptes/Create')),
}

// depenses
const Depense = {
  List: React.lazy(() => import('./views/depenses/List')),
  Create: React.lazy(() => import('./views/depenses/Create')),
}

const routes = [
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },

  { path: '/locations/list', name: 'Liste des locations', element: Location.List },
  { path: '/locations/create', name: 'Ajouter une location', element: Location.Create },

  { path: '/locations/statistiques-date', name: 'Liste des locations', element: Location.StatistiqueDate },
  { path: '/locations/statistiques-periode', name: 'Liste des locations', element: Location.StatistiquePeriode },
  { path: '/locations/statistiques-client', name: 'Liste des locations', element: Location.StatistiqueClient },

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

  { path: '/acomptes/list', name: 'Liste des acompte', element: Acompte.List },
  { path: '/acomptes/create', name: 'Ajouter un acompte', element: Acompte.Create },

  { path: '/depenses/list', name: 'Liste des depenses', element: Depense.List },
  { path: '/depenses/create', name: 'Ajouter un depenses', element: Depense.Create },
]

/** My routes */
export default routes
