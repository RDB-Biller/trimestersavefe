import NextSteps from 'components/NextSteps';
import Button from "components/Button"
import Input from "components/Input"
import SVGs from "helpers/SVGs"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import authentication from "services/patient/authentication"

const ForgotPassword = () => {

    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ loading, setLoading ] = useState(false)
    const navigate = useNavigate()
    const [ err, setErr ] = useState('')

    const onSubmit = (data:any) => {
        setLoading(true)
        setErr('')

        const raw: string = (data.phone || '').trim()
        const userData: any = raw.includes('@') ? { email: raw } : { phone: raw.charAt(0) === '0' ? "+233" + raw.substring(1) : raw }
        authentication.ForgetPassword(userData).then(
            (res:any) => {
                setLoading(false)
                navigate('/reset_password')
            }
            ).catch(err=> {
                setLoading(false)
                setErr(err.response.data.error)
        })
    }

    return(
        <div className="login text-center mt-24 lg:mt-52">
            <h3>Forgot password</h3>
            <p className="text-grey_text my-4" >Enter the mobile number or email on your account and we will send you a reset code.</p>

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

            <form className="text-left mt-14 max-w-[450px] mx-auto relative" onSubmit={handleSubmit(onSubmit)}>
                <Input 
                    placeholder="Enter your phone number" 
                    name="phone" 
                    label="Mobile number or email" 
                    register={register} 
                    svg={SVGs.email}
                    error={errors.email && "Please enter your phone number"}
                    options={{
                        required: true,
                    }} />

                <Button title="Continue" loading={loading} />
            </form>
        </div>
    )
}

export default ForgotPassword