import {
  CAvatar,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import {
  cilLockLocked,
  cilSettings,
  cilUser,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import avatar8 from '../../../public/kadjiv-logo.png'

import { useApp } from '../../AppContext'
import { useNavigate } from 'react-router-dom'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const { logout } = useApp();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const Logout = async (e) => {
    e.preventDefault()

    const response = await logout();
    if (response.success) {
      // redirection
      navigate("/")
    }
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" className='_border shadow-sm border-yellow' />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">

        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Mon compte</CDropdownHeader>
        <CDropdownItem href="#">
          <CIcon icon={cilUser} className="me-2" />
          {user?.name || 'administrateur'}
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Rôle: <br /><strong className="text-success"> {user?.roles?.[0]?.name || 'admin'}</strong>
        </CDropdownItem>
        <CDropdownDivider />
        {
          user && (
            <CDropdownItem onClick={(e) => Logout(e)}>
              <CIcon icon={cilLockLocked} className="me-2" />
              Déconnexion
            </CDropdownItem>
          )
        }
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
