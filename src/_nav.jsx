import CIcon from '@coreui/icons-react'
import {
  cibAutotask,
  cibDraugiemLv,
  cibFSecure,
  cibGnuPrivacyGuard,
  cibMathworks,
  cibMyspace,
  cibProxmox,
  cibR,
  cibSamsungPay,
  cibTrainerroad,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Dashboard',
    to: '/dashboard',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon btn-yellow rounded" />,
    badge: {
      color: 'info',
      text: 'KADJIV',
    },
  },

  {
    component: CNavTitle,
    name: "Gestion global"
  },

  // locations
  {
    component: CNavGroup,
    name: 'Locations',
    to: "/locations",
    icon: <CIcon icon={cibTrainerroad} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Liste des locations',
        to: '/locations/list',
      },
      {
        component: CNavItem,
        name: 'Ajouter une location',
        to: '/locations/create',
      },
    ]
  },

  // reglements
  {
    component: CNavGroup,
    name: 'Règlements',
    to: "/reglements",
    icon: <CIcon icon={cibSamsungPay} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Liste des règlements',
        to: '/reglements/list',
      },
      {
        component: CNavItem,
        name: 'Ajouter un règlement',
        to: '/reglements/create',
      },
    ]
  },

  // dépenses
  {
    component: CNavGroup,
    name: 'Dépenses',
    to: "/depenses",
    icon: <CIcon icon={cibProxmox} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Liste des dépenses',
        to: '/depenses/list',
      },
      {
        component: CNavItem,
        name: 'Ajouter une dépense',
        to: '/depenses/create',
      },
    ]
  },

  // statistiques
  {
    component: CNavTitle,
    name: 'Gestion des statistiques',
  },

  {
    component: CNavGroup,
    name: 'Statistiques',
    to: "/statistique",
    icon: <CIcon icon={cibMathworks} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Statistique périodique',
        to: '/statistiques/list',
      },
      {
        component: CNavItem,
        name: 'Statistique journalière',
        to: '/statistiques/create',
      },
    ]
  },


  /**
   * Les parametrages
   */
  {
    component: CNavTitle,
    name: 'Paramêtrage',
  },

  // les clients
  {
    component: CNavGroup,
    name: 'Clients',
    to: "/clients",
    icon: <CIcon icon={cibDraugiemLv} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Liste des clients',
        to: '/clients/list',
      },
      {
        component: CNavItem,
        name: 'Ajouter un client',
        to: '/clients/create',
      },
    ]
  },

  // les camions
  {
    component: CNavGroup,
    name: 'Camions',
    to: "/camions",
    icon: <CIcon icon={cibR} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Liste des camions',
        to: '/camions/list',
      },
      {
        component: CNavItem,
        name: 'Ajouter un client',
        to: '/camions/create',
      },
    ]
  },

  // les users
  {
    component: CNavGroup,
    name: 'Utilisateurs',
    to: "/users",
    icon: <CIcon icon={cibMyspace} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Liste des utilisateurs',
        to: '/users/list',
      },
      {
        component: CNavItem,
        name: 'Ajouter un utilisateur',
        to: '/users/create',
      },
    ]
  },

  // les roles
  {
    component: CNavGroup,
    name: 'Rôles',
    to: "/roles",
    icon: <CIcon icon={cibGnuPrivacyGuard} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Liste des rôles',
        to: '/roles/list',
      },
      {
        component: CNavItem,
        name: 'Ajouter un rôle',
        to: '/roles/create',
      },
    ]
  },

  // les types d'utilisateurs
  {
    component: CNavGroup,
    name: 'Type de locations',
    to: "/types",
    icon: <CIcon icon={cibAutotask} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Liste des types',
        to: '/types/list',
      },
      {
        component: CNavItem,
        name: 'Ajouter un type',
        to: '/types/create',
      },
    ]
  },
]

export default _nav
