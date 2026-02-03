import logo from '../../public/transport-crocked.png';
import styles from '../assets/Home.module.css';
import LoginForm from './LoginForm';
const Home = () => {
    return (
        <>
            <div className="row p-0 mx-0 vh-100">
                <div className={`col-md-8 col-sm-6 col-xm-12 ${styles.leftContainer}`}>
                    <div className="text-center">
                        <img src={logo} alt="" className='mx-3 img-fluid' /> <br /><br />
                        <p className=""> <strong className="text-yellow">Bienvenue</strong> sur le logiciel de transport de Kadjiv</p>
                    </div>
                </div>
                <div className={`col-md-4 col-sm-6 col-xm-12 ${styles.rightContainer}`}>
                    {/* Login Form Component */}
                    <LoginForm />
                </div>
            </div>
        </>
    )
}

export default Home;