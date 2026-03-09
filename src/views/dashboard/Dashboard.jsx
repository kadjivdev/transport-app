import classNames from 'classnames'

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCol,
  CProgress,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
} from '@coreui/icons'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

// 
import axiosInstance from "../../api/axiosInstance";
import apiRoutes from "../../api/routes"
import { useApp } from "../../AppContext";
import { useEffect, useState } from 'react'

const Dashboard = () => {

  const progressExample = [
    { title: 'Visits', value: '29.703 Users', percent: 40, color: 'success' },
    { title: 'Unique', value: '24.093 Users', percent: 20, color: 'info' },
    { title: 'Pageviews', value: '78.706 Views', percent: 60, color: 'warning' },
    { title: 'New Users', value: '22.123 Users', percent: 80, color: 'danger' },
    { title: 'Bounce Rate', value: 'Average Rate', percent: 40.15, color: 'primary' },
  ]

  const { setStatus, setLoading, setMessage, setStatusCode } = useApp();

  // Gestion des totaux
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0); totalCount
  const [resteAregler, setResteAregler] = useState(0);
  const [regler, setRegler] = useState(0);
  const [depenseAmount, setDepenseAmount] = useState(0);

  // initialization
  useEffect(function () {
    initialize();
  }, []);

  // submit form
  const initialize = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const response = await axiosInstance.get(apiRoutes.dashbaord);
      let responseData = response.data

      // set locations

      setStatus('success');
      setMessage("Résumé de toutes les opérations!");
      setStatusCode(200);

      // synchronisation des totaux
      setTotalCount(responseData.totaux?.total_count)
      setTotalAmount(responseData?.totaux?.total_amount);
      setRegler(responseData?.totaux?.total_regler);
      setResteAregler(responseData?.totaux?.total_reste_a_regler);
      setDepenseAmount(responseData?.totaux?.total_depense_amount);

      // return navigate("/locations/statistiques");
    } catch (error) {
      console.log('Erreur lors de la modification de la location :', error);
      let errMessage = '';

      if (error.response?.status === 422) {
        // Erreurs de validation
        errMessage = `Des erreurs de validation sont survenues. Veuillez vérifier les champs `;
        setErrors(error.response?.data?.errors);
      } else {
        errMessage = `Une erreur inattendue est survenue. Veuillez réessayer. (${error.response?.data?.error || 'Erreure survenue'})`;
      }

      console.log(errMessage)
      setLoading(false);
      setStatus('error');
      setMessage(errMessage);
      setStatusCode(error.response?.status);
    }
  }

  return (
    <>
      <WidgetsDropdown
        className="mb-4"
        totalCount={totalCount}
        totalAmount={totalAmount}
        resteAregler={resteAregler}
        regler={regler}
        depenseAmount={depenseAmount}
      />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Traffic
              </h4>
              <div className="small text-body-secondary">January - July 2023</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Month'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {progressExample.map((item, index, items) => (
              <CCol
                className={classNames({
                  'd-none d-xl-block': index + 1 === items.length,
                })}
                key={index}
              >
                <div className="text-body-secondary">{item.title}</div>
                <div className="fw-semibold text-truncate">
                  {item.value} ({item.percent}%)
                </div>
                <CProgress thin className="mt-2" color={item.color} value={item.percent} />
              </CCol>
            ))}
          </CRow>
        </CCardFooter>
      </CCard>
      <br /><br /><br />
    </>
  )
}

export default Dashboard
