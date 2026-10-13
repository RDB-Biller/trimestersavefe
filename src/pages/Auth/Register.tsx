/* eslint-disable no-useless-escape */
import Button from "components/Button"
import Input from "components/Input"
import { Dispatch, useState } from "react"
import { useForm } from "react-hook-form"
import SVGs from "helpers/SVGs"
import authentication from "services/patient/authentication"
import { useNavigate } from "react-router-dom"
import { setUser } from "helpers/utilities"
import { store } from "store"

export const dispatchStore = store.dispatch as
  | typeof store.dispatch
  | Dispatch<any>;

const Register = () => {

    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ loading, setLoading ] = useState(false)
    const [err, setErr] = useState('')
    const navigate = useNavigate()

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

        data.phone = data.phone.charAt(0) === '0' ? "+233" + data.phone.substring(1) : data.phone
        if(data.password === data.confirm_password){
            const userData={
                first_name: data.first_name,
                last_name: data.last_name,
                phone: data.phone,
                password: data.password
            }
            return authentication.RegisterPatient(userData, successCB, failedCB)
        }

        setLoading(false)
        setErr('Please your passwords have to match')
    }
    
    return(
        <div className="register text-center mt-20">
        <h3>Create a new Account</h3>
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
                        placeholder="Enter your first name" 
                        name="first_name" 
                        label="First Name" 
                        svg={SVGs.person}
                        register={register} 
                        error={errors.first_name && "Please enter your first name"}
                        options={{
                            required: true
                        }} />
                    <Input 
                        svg={SVGs.person}
                        placeholder="Enter your last name" 
                        name="last_name" 
                        label="Surname" 
                        register={register} 
                        error={errors.last_name && "Please enter your last name"}
                        options={{
                            required: true
                        }} />
                    <Input 
                        svg={SVGs.phone}
                        placeholder="Enter your Phone number" 
                        name="phone" 
                        type="tel"
                        label="Phone number" 
                        register={register} 
                        error={errors.last_name && "Please enter a correct phone number"}
                        options={{
                            required: true,
                            minLength: 6,
                            maxLenght: 10,
                            pattern: "^[0-9]*$",
                          }} />

                    {/* <Input 
                        placeholder="Enter your email" 
                        name="email" 
                        label="Email Address (optional)" 
                        register={register} 
                        error={errors.email && "Please enter your email"}
                        svg={SVGs.email}
                        options={{
                            required: false,
                            pattern: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g,
                          }} />
                   */}
                     <Input 
                        name="password" 
                        placeholder="Enter your password" 
                        type="password" 
                        label="Create Password" 
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

                    <Button  title="Create Account"  loading={loading} />

        </form>
    </div>
    )
}

export default Register