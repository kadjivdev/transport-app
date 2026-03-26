import CIcon from '@coreui/icons-react'
import {
  cibDraugiemLv,
  cibGnuPrivacyGuard,
  cibMathworks,
  cibMyspace,
  cibProxmox,
  cibR,
  cibSamsungPay,
  cibTrainerroad,
  cilAlignCenter,
  cilMoney,
  cilSpeedometer,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const getNavigation = (permissions = []) => {
  const checkPermission = (name) => {
    return permissions?.some((p) => p.name === name)
  }

  return [
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
    ...(checkPermission("location.view") || checkPermission("location.create") ? [{
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

        // les types de locations
        {
          component: CNavGroup,
          name: 'Types de locations',
          to: "/locations/types",
          icon: <CIcon icon={cilAlignCenter} customClassName="nav-icon" />,
          items: [
            {
              component: CNavItem,
              name: 'Liste des types',
              to: '/locations/types/list',
            },
            {
              component: CNavItem,
              name: 'Ajouter un type',
              to: '/locations/types/create',
            },
          ]
        },
      ]
    }] : []),

    // reglements
    ...(checkPermission("reglement.view") || checkPermission("reglement.create") ? [{
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
    }] : []),

    // dépenses
    ...(checkPermission("depense.view") || checkPermission("depense.create") ? [{
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
    }] : []),

    // acomptes
    ...(checkPermission("acompte.view") || checkPermission("acompte.create") ? [{
      component: CNavGroup,
      name: 'Acomptes',
      to: "/acomptes",
      icon: <CIcon icon={cilMoney} customClassName="nav-icon" />,
      items: [
        {
          component: CNavItem,
          name: 'Liste des acomptes',
          to: '/acomptes/list',
        },
        {
          component: CNavItem,
          name: 'Ajouter un acompte',
          to: '/acomptes/create',
        },
      ]
    }] : []),

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
          name: 'Journalière',
          to: '/locations/statistiques-date',
        },
        {
          component: CNavItem,
          name: 'Périodique',
          to: '/locations/statistiques-periode',
        },
        {
          component: CNavItem,
          name: 'Par Client',
          to: '/locations/statistiques-client',
        }
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
    ...(checkPermission("client.view") || checkPermission("client.create") ? [{
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
    }] : []),

    // les camions
    ...(checkPermission("camion.view") || checkPermission("camion.create") ? [{
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
          name: 'Ajouter un Camion',
          to: '/camions/create',
        },
      ]
    }] : []),

    // les users
    ...(checkPermission("utilisateur.view") || checkPermission("utilisateur.create") ? [
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
      }
    ] : []),

    // les roles
    ...(checkPermission("role.view") || checkPermission("role.create") ? [{
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
    }] : []),
  ]
}

export default getNavigation
