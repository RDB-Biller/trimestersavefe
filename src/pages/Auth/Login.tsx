import NextSteps from 'components/NextSteps';
import Button from "components/Button"
import Input from "components/Input"
import { Dispatch, useState } from "react"
import { useForm } from "react-hook-form"
import { Link, useNavigate } from "react-router-dom"
import SVG from "helpers/SVGs"
import authentication from "services/patient/authentication"
import { store } from "store"
import { setToken } from "helpers/utilities"
import { setUser } from "helpers/utilities"
import { useI18n } from "i18n"

export const dispatchStore = store.dispatch as
  | typeof store.dispatch
  | Dispatch<any>;
 
const Login = () => {

    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ loading, setLoading ] = useState(false)
    const [ err, setErr ] = useState('')

    const navigate = useNavigate()
    const { t } = useI18n()

    const successCB = (data:any) => {
        setToken(data.tokens[0].token)
        setUser(data._id)
        setLoading(false)
        navigate('/dashboard')
    }
    
    const failedCB =(data:any) => {
        setLoading(false)
        setErr(data?.response?.data?.error || 'Could not sign in. Check your connection and try again.')
    }
    const onSubmit = (data:any) => {
        setLoading(true)
        // Mobile number or email address: the Biller accepts either as the identifier.
        const raw: string = (data.phone || '').trim()
        const identifier = raw.includes('@') ? raw : (raw.charAt(0) === '0' ? "+233" + raw.substring(1) : raw)
        const userData={
            identifier,
            password: data.password
        }
        authentication.LoginPatient(userData, successCB, failedCB)
    }

    return(
        <div className="login text-center mt-24 lg:mt-52">
            <h3>{t('auth.welcome')}</h3>
            <p className="text-grey_text my-4" >{t('auth.welcome_sub')}</p>
      
            {(!!err) && (
                <div
                className={`  ${
                    !!err && "bg-secondary bg-opacity-10 text-red "
                }   w-full text-center p-4 mb-4 rounded-md`}
                >
                <p
                    className={` ${
                    !!err && "text-secondary "
                    }   text-xs`}
                >
                    {err}</p><NextSteps message={err} />
                </div>
            )}

            <form className="text-left mt-10 max-w-[450px] mx-auto relative" onSubmit={handleSubmit(onSubmit)}>
                <Input 
                    placeholder={t('auth.phone_ph')} 
                    name="phone" 
                    label={t('auth.phone') + ' or email'} 
                    register={register} 
                    svg={SVG.phone}
                    error={errors.phone && t('auth.phone_err')}
                        options={{
                            required: true,
                        }}  />

                <Input 
                    name="password" 
                    placeholder={t('auth.password_ph')} 
                    type="password" 
                    label={t('auth.password')} 
                    register={register} 
                    svg={SVG.lock}
                    error={errors.password && t('auth.password_err')}
                        options={{
                            required: true
                        }}  />
                    
                <p className="-mt-6 absolute right-0 cursor-pointer text-grey_text hover:text-primary" > <Link to='/forgot_password'>{t('auth.forgot')}</Link> </p>
                <Button title={t('auth.signin')} loading={loading} />
            </form>
        </div>
    )
}

export default Login
