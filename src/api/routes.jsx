// BASE URL
const baseUrl = import.meta.env.VITE_LOGIN_API_URL

const myRoutes = {
  // auth routes
  login: `login`,
  logout: `logout`,
  refresh: `refresh`,
  verifyToken: `verify-token`,

  // user's routes
  allUser: `users`,
  createUser: `users`,
  retrieveUser: (id) => (`users/${id}`),
  updateUser: (id) => (`users/${id}`),
  deleteUser: (id) => (`users/${id}`),

  // role's routes
  allRole: `roles`,
  createRole: `roles`,
  affectRole: `affect-role`,
  retrieveRole: (id) => (`roles/${id}`),
  updateRole: (id) => (`roles/${id}`),
  deleteRole: (id) => (`roles/${id}`),

  // permissions
  allPermission: `permissions`,

  // locations's routes
  allLocation: `locations`,
  createLocation: `locations`,
  retrieveLocation: (id) => (`locations/${id}`),
  updateLocation: (id) => (`locations/${id}`),
  validateLocation: (id) => (`locations/validate/${id}`),
  deleteLocation: (id) => (`locations/${id}`),

  // reglements's routes
  allReglement: `reglements`,
  createReglement: `reglements`,
  retrieveReglement: (id) => (`reglements/${id}`),
  updateReglement: (id) => (`reglements/${id}`),
  validateReglement: (id) => (`reglements/validate/${id}`),
  deleteReglement: (id) => (`reglements/${id}`),

  // depenses's routes
  allDepense: `depenses`,
  createDepense: `depenses`,
  retrieveDepense: (id) => (`depenses/${id}`),
  updateDepense: (id) => (`depenses/${id}`),
  deleteDepense: (id) => (`depenses/${id}`),

  /**
   * Les routes de settings
   */

  // camion's routes
  allCamion: `camions`,
  createCamion: `camions`,
  retrieveCamion: (id) => (`camions/${id}`),
  updateCamion: (id) => (`camions/${id}`),
  deleteCamion: (id) => (`camions/${id}`),

  // client's routes
  allClient: `clients`,
  createClient: `clients`,
  retrieveClient: (id) => (`clients/${id}`),
  updateClient: (id) => (`clients/${id}`),
  deleteClient: (id) => (`clients/${id}`),

  // Locations types's routes
  allLocationType: `location-types`,
  createLocationType: `location-types`,
  retrieveLocationType: (id) => (`location-types/${id}`),
  updateLocationType: (id) => (`location-types/${id}`),
  deleteLocationType: (id) => (`location-types/${id}`),
}

export default myRoutes