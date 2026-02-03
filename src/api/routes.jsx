// BASE URL
const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:8000/api/v1"

const myRoutes = {
  // auth routes
  login: `${baseUrl}/login`,
  logout: `${baseUrl}/logout`,
  refresh: `${baseUrl}/refresh`,
  verifyToken: `${baseUrl}/verify-token`,

  // user's routes
  allUser: `${baseUrl}/users`,
  createUser: `${baseUrl}/users`,
  retrieveUser: (id) => (`${baseUrl}/users/${id}`),
  updateUser: (id) => (`${baseUrl}/users/${id}`),
  deleteUser: (id) => (`${baseUrl}/users/${id}`),

  // role's routes
  allRole: `${baseUrl}/roles`,
  createRole: `${baseUrl}/roles`,
  affectRole: `${baseUrl}/affect-role`,
  retrieveRole: (id) => (`${baseUrl}/roles/${id}`),
  updateRole: (id) => (`${baseUrl}/roles/${id}`),
  deleteRole: (id) => (`${baseUrl}/roles/${id}`),

  // permissions
  allPermission: `${baseUrl}/permissions`,

  // locations's routes
  allLocation: `${baseUrl}/locations`,
  createLocation: `${baseUrl}/locations`,
  retrieveLocation: (id) => (`${baseUrl}/locations/${id}`),
  updateLocation: (id) => (`${baseUrl}/locations/${id}`),
  deleteLocation: (id) => (`${baseUrl}/locations/${id}`),

  // reglements's routes
  allReglement: `${baseUrl}/reglements`,
  createReglement: `${baseUrl}/reglements`,
  retrieveReglement: (id) => (`${baseUrl}/reglements/${id}`),
  updateReglement: (id) => (`${baseUrl}/reglements/${id}`),
  deleteReglement: (id) => (`${baseUrl}/reglements/${id}`),

  // depenses's routes
  allDepense: `${baseUrl}/depenses`,
  createDepense: `${baseUrl}/depenses`,
  retrieveDepense: (id) => (`${baseUrl}/depenses/${id}`),
  updateDepense: (id) => (`${baseUrl}/depenses/${id}`),
  deleteDepense: (id) => (`${baseUrl}/depenses/${id}`),

  /**
   * Les routes de settings
   */

  // camion's routes
  allCamion: `${baseUrl}/camions`,
  createCamion: `${baseUrl}/camions`,
  retrieveCamion: (id) => (`${baseUrl}/camions/${id}`),
  updateCamion: (id) => (`${baseUrl}/camions/${id}`),
  deleteCamion: (id) => (`${baseUrl}/camions/${id}`),

  // client's routes
  allClient: `${baseUrl}/clients`,
  createClient: `${baseUrl}/clients`,
  retrieveClient: (id) => (`${baseUrl}/clients/${id}`),
  updateClient: (id) => (`${baseUrl}/clients/${id}`),
  deleteClient: (id) => (`${baseUrl}/clients/${id}`),

  // Locations types's routes
  allLocationType: `${baseUrl}/location-types`,
  createLocationType: `${baseUrl}/location-types`,
  retrieveLocationType: (id) => (`${baseUrl}/location-types/${id}`),
  updateLocationType: (id) => (`${baseUrl}/location-types/${id}`),
  deleteLocationType: (id) => (`${baseUrl}/location-types/${id}`),
}

export default myRoutes