import { Link, Outlet, useLocation } from "react-router-dom";
import BG from 'assets/images/bg-auth.png'
import logo from 'assets/images/logo.png'
import { Helmet } from "react-helmet";
import { useI18n } from "i18n";
import LanguageSwitcher from "components/LanguageSwitcher";

const Auth = () => {

    const location = useLocation()
    const { t } = useI18n()
    
    return(
        <div className="grid relative lg:grid-cols-2 h-full">
            <Helmet>
                <title>Trimester Save</title>
                <meta name="description" content="TMS" />
            </Helmet>

            <div className="bg-primary hidden lg:block min-h-screen float-left" >
                <div className="flex fixed w-1/2 h-screen p-8 justify-center items-center" >
                    <img src={BG} alt="bg" className="h-auto  max-w-2xl w-full object-cover" />

                </div>
            </div>
            <div className="p-6 move-left w-screen lg:w-auto md:p-10 md:px-16 h-full overflow-y-auto " >
                <header className="flex justify-center md:justify-between items-center" >
                    <div>
                        <img src={logo} alt="logo " />
                    </div>
                    <LanguageSwitcher className="absolute top-4 right-4 md:static" />
                </header>
                <div >
                    <Outlet />
                    { location.pathname !== '/' ?
                    <p className="text-grey_text text-center mt-10" >{t('auth.have_account')} <span className=" font-bold" ><Link to='/' className="text-secondary" >{t('auth.signin')}</Link></span> </p>
                    : <p className="text-grey_text text-center mt-10" >{t('auth.new_here')} <span className=" font-bold" ><Link to='/register' className="text-secondary" >{t('auth.signup')}</Link></span> </p>
                    }
                    <p className="text-grey_text text-center mt-4" >{t('auth.savings_cta')} <span className="font-bold"><Link to='/birthprep' className="text-secondary">{t('auth.savings_link')}</Link></span> — {t('auth.no_account_needed')}.</p>
                </div>

            </div>
        </div>
    )
}

export default Auth