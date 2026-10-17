/* eslint-disable no-useless-escape */
import Button from "components/Button"
import Input from "components/Input"
import { Dispatch, useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import SVGs from "helpers/SVGs"
import authentication from "services/patient/authentication"
import { useNavigate } from "react-router-dom"
import { setUser } from "helpers/utilities"
import { store } from "store"
import { useI18n, currentLanguage } from "i18n"

export const dispatchStore = store.dispatch as
  | typeof store.dispatch
  | Dispatch<any>;

const Register = () => {

    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ loading, setLoading ] = useState(false)
    const [err, setErr] = useState('')
    const navigate = useNavigate()
    const { t } = useI18n()
    // Master Control decides whether a mobile phone is mandatory or an email address may be used instead.
    const [ opts, setOpts ] = useState<{ requirePhone: boolean, emailSignup: boolean }>({ requirePhone: false, emailSignup: true })
    useEffect(() => { authentication.AuthOptions().then(setOpts).catch(() => setOpts({ requirePhone: true, emailSignup: false })) }, [])

    // The account is created on the HNN Biller, which then texts the verification code through its own
    // SMS provider (Africa's Talking) - see services/patient/authentication.ts.
    const successCB = (data:any) => {
        setUser(data)
        authentication.ResendCode({ phone: data }).catch(() => null).finally(() => {
            setLoading(false)
            navigate('/verify')
        })
    }
    
    const failedCB =(data:any) => {
        setErr(data?.response?.data?.error || 'Could not create your account. Check your connection and try again.')
        setLoading(false)
    }

    const onSubmit = (data:any) => {
        setErr('')
        setLoading(true)

        const phone: string = (data.phone || '').trim()
        const email: string = opts.emailSignup ? (data.email || '').trim() : ''
        const fullPhone = phone.charAt(0) === '0' ? "+233" + phone.substring(1) : phone
        if(!fullPhone && !email){
            setLoading(false)
            setErr(opts.requirePhone ? 'Please enter your mobile phone number' : 'Please enter a mobile phone number or an email address')
            return
        }
        if(data.password === data.confirm_password){
            const userData: any = {
                first_name: data.first_name,
                last_name: data.last_name,
                password: data.password,
                language: currentLanguage()
            }
            if(fullPhone) userData.phone = fullPhone
            if(email) userData.email = email
            if(fullPhone) return authentication.RegisterPatient(userData, successCB, failedCB)
            // Email only: create the account, then email the confirmation code.
            return authentication.RegisterPatient(userData, () => {
                setUser(email)
                authentication.StartEmailAccount(email, data.password).catch(() => null).finally(() => {
                    setLoading(false)
                    navigate('/verify')
                })
            }, failedCB)
        }

        setLoading(false)
        setErr('Please your passwords have to match')
    }
    
    return(
        <div className="register text-center mt-20">
        <h3>{t('auth.signup_title')}</h3>
        <p className="text-grey_text my-4" >Kindly fill in the following information <br /> to get started</p>

        
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
                {err}
            </p>
            </div>
        )}

        <form className="text-left mt-10 max-w-[450px] mx-auto relative" onSubmit={handleSubmit(onSubmit)}>

                    <Input 
                        placeholder={t('auth.firstname')} 
                        name="first_name" 
                        label={t('auth.firstname')} 
                        svg={SVGs.person}
                        register={register} 
                        error={errors.first_name && "Please enter your first name"}
                        options={{
                            required: true
                        }} />
                    <Input 
                        svg={SVGs.person}
                        placeholder={t('auth.lastname')} 
                        name="last_name" 
                        label={t('auth.lastname')} 
                        register={register} 
                        error={errors.last_name && "Please enter your last name"}
                        options={{
                            required: true
                        }} />
                    <Input 
                        svg={SVGs.phone}
                        placeholder={t('auth.phone_ph')} 
                        name="phone" 
                        type="tel"
                        label={opts.requirePhone ? t('auth.phone') : t('auth.phone') + ' (optional if you use email)'} 
                        register={register} 
                        error={errors.phone && "Please enter a correct phone number"}
                        options={{
                            required: opts.requirePhone,
                            minLength: 6,
                            maxLenght: 10,
                            pattern: "^[0-9]*$",
                          }} />

                    {opts.emailSignup && <Input 
                        placeholder="Enter your email" 
                        name="email" 
                        type="email"
                        label="Email address (optional if you use a mobile number)" 
                        register={register} 
                        error={errors.email && "Please enter a valid email address"}
                        svg={SVGs.email}
                        options={{
                            required: false,
                          }} />}
                     <Input 
                        name="password" 
                        placeholder={t('auth.password_ph')} 
                        type="password" 
                        label={t('auth.password')} 
                        svg={SVGs.lock}
                        register={register} 
                        error={errors.password && "Please enter your password"}
                        options={{
                            required: true
                        }} />

                     <Input 
                        svg={SVGs.lock}
                        name="confirm_password" 
                        placeholder="Confirm your password" 
                        type="password" 
                        label="Confirm Password" 
                        error={errors.confirm_password && "Please make sure your passwords"}
                        register={register} 
                        options={{
                            required: true
                        }}
                         />

                    <Button  title={t('auth.signup')}  loading={loading} />

        </form>
    </div>
    )
}

export default Register