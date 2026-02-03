import React from 'react'
import { CFooter } from '@coreui/react'

const AppFooter = () => {
  return (
    <CFooter className="fixed-bottom mt-5">
      <div className="w-100 text-center">
        <span className="ms-1">&copy; Copyright {new Date().getFullYear()} | <strong className="text-yellow">Kadjiv'Sarl</strong> | Tous droit réservés.</span>
      </div>
    </CFooter>

  )
}

export default React.memo(AppFooter)
