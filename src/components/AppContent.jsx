import React, { Suspense, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { CContainer, CSpinner } from '@coreui/react'
// routes config
import routes from '../routes'

const AppContent = () => {
  const user = localStorage.getItem("user")

  return (
    <CContainer className="px-4" lg>
      <Suspense fallback={<CSpinner color="dark" />}>
        <Routes>
          {routes.map((route, idx) => {
            // Protéger la route /dashboard
            // localStorage.clear()

            if (!user) {
              // redirection vers la page de login si non authentifié
              return <Route key={idx} path={route.path} element={<Navigate to="/" replace />} />
            }

            return (
              route.element && (
                <Route
                  key={idx}
                  path={route.path}
                  exact={route.exact}
                  name={route.name}
                  element={<route.element />}
                />
              )
            )
          })}
        </Routes>
      </Suspense>
    </CContainer>
  )
}

export default React.memo(AppContent)
