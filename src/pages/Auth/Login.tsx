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

export const dispatchStore = store.dispatch as
  | typeof store.dispatch
  | Dispatch<any>;
 
const Login = () => {

    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ loading, setLoading ] = useState(false)
    const [ err, setErr ] = useState('')

    const navigate = useNavigate()

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
        data.phone = data.phone.charAt(0) === '0' ? "+233" + data.phone.substring(1) : data.phone
        const userData={
            phone: data.phone,
            password: data.password
        }
        authentication.LoginPatient(userData, successCB, failedCB)
    }

    return(
        <div className="login text-center mt-24 lg:mt-52">
            <h3>Welcome Back!</h3>
            <p className="text-grey_text my-4" >We've missed you. Sign In to access <br /> your account</p>
      
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
                    placeholder="Enter your phone number" 
                    name="phone" 
                    label="Phone number" 
                    register={register} 
                    svg={SVG.phone}
                    error={errors.phone && "Please enter a correct phone number"}
                        options={{
                            required: true,
                            minLength: 6,
                            maxLenght: 10,
                            pattern: "^[0-9]*$",
                        }}  />

                <Input 
                    name="password" 
                    placeholder="Enter your password" 
                    type="password" 
                    label="Password" 
                    register={register} 
                    svg={SVG.lock}
                    error={errors.password && "Please enter your password"}
                        options={{
                            required: true
                        }}  />
                    
                <p className="-mt-6 absolute right-0 cursor-pointer text-grey_text hover:text-primary" > <Link to='/forgot_password'>Forget password?</Link> </p>
                <Button title="Sign In" loading={loading} />
            </form>
        </div>
    )
}

export default Login
