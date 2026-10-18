import NextSteps from 'components/NextSteps';
import Button from "components/Button"
import Input from "components/Input"
import SVGs from "helpers/SVGs"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { useNavigate } from "react-router-dom"
import authentication from "services/patient/authentication"

const ResetPassword = () => {

    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ loading, setLoading ] = useState(false)
    const [ err, setErr ] = useState('')
    const navigate = useNavigate()

    const onSubmit = (data:any) => {
        setErr('')
        setLoading(true)

        if(data.password !== data.confirm_password) {
            setErr('Please your passwords have to be the same')
            return setLoading(false)
        }

        const passwordResetData={
            password: data.password
        }

        authentication.ResetPassword(data.code,passwordResetData)
        .then((res) => {
                setLoading(false)
                navigate('/')
            }
            ).catch(err => {
                setLoading(false)
                setErr(err.response.data.error)
            })
        }

    return(
        <div className="login text-center mt-24 lg:mt-52">
            <h3>Change Password</h3>
            <p className="text-grey_text my-4" >You can create a new password, <br /> please don't forget it too </p>

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
                        name="code" 
                        placeholder="XXXXXX" 
                        type="number" 
                        label="Reset Code" 
                        register={register} 
                        svg={SVGs.lock}
                         error={errors.password && "Please enter the reset password code"}
                        options={{
                            required: true
                        }} />
                    <Input 
                        name="password" 
                        placeholder="Enter your password" 
                        type="password" 
                        label="New Password" 
                        register={register} 
                        svg={SVGs.lock}
                         error={errors.password && "Please enter your new password"}
                        options={{
                            required: true
                        }} />

                     <Input 
                        svg={SVGs.lock}
                        name="confirm_password" 
                        placeholder="Confirm your password" 
                        type="password" 
                        label="Confirm Password" 
                        register={register} 
                         error={errors.confirm_password && "Please confirm your new password"}
                        options={{
                            required: true
                        }} />
            
                <Button title="Create New Password" loading={loading} />
            </form>
        </div>
    )
}

export default ResetPassword