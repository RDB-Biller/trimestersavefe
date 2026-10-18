import NextSteps from 'components/NextSteps';
import { useState, useEffect } from "react"
import Button from "components/Button"
import Input from "components/Input"
import SVGs from "helpers/SVGs"
import { useForm } from "react-hook-form"
import { updateUserProfile,getUserProfile } from "services/patient/settings"

const Settings = () => {

    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ err, setErr ] = useState('')
    const [ loading, setLoading ] = useState(false)
    const [successMessage, setSuccessMessage] = useState("");
    const [elementDisabled, setElementDisabled] = useState(true);
    const [userData, setUserData] = useState({
        first_name: "",
        last_name: "",
        spouse_name: "",
        spouse_phone: "",
        country: "",
        city: "",
        town: "",
        address: "",
        email: "",
        ghana_card: ""
    });

    const elementDisabledStyle:any={
        pointerEvents: elementDisabled ? 'none':'auto'
    }

    useEffect(()=> {
        getUserProfile().then(
            res => {
                const obj = {
                    first_name: res.data.result.user.first_name,
                    last_name: res.data.result.user.last_name,
                    spouse_name: res.data.result.user.spouse_name,
                    spouse_phone: res.data.result.user.spouse_phone,
                    country: res.data.result.user.country,
                    city: res.data.result.user.city,
                    town: res.data.result.user.town,
                    address: res.data.result.user.address,
                    email: res.data.result.user.email,
                    ghana_card: res.data.result.user.ghana_card
                }
                setUserData(obj)
            }
        )
    },[])

    const onSubmit = (data:any) => {
        setErr('')
        setLoading(true)

        const userData = {
            first_name: data.first_name,
            last_name: data.last_name,
            spouse_name: data.spouse_name,
            spouse_phone: data.spouse_phone,
            country: data.country,
            city: data.city,
            town: data.town,
            address: data.address,
            email: data.email,
            ghana_card: data.ghana_card
          }
          updateUserProfile(userData).then(
            res => {
                setLoading(false)
                setSuccessMessage("Your records have being successfully updated")
                console.log(res.data)
            }).catch(err => {
            setLoading(false)
            setErr(err.response.data.error)
        })
    }

    return(

        <div className="p-10" >
        <div>
            <h4>Settings</h4>
            
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
            {(!!successMessage) && (
                <div
                className={`  ${
                    !!successMessage && "bg-green-500 bg-opacity-10 text-black "
                }   w-full text-center p-4 mb-4 rounded-md`}
                >
                <p
                    className={` ${
                    !!successMessage && "text-black "
                    }   text-xs`}
                >
                    {successMessage}
                </p>
                </div>
            )}
            
            <form className="mt-10" action="" id="settings_form">
                <div className="flex w-full flex-col md:flex-row max-w-5xl gap-10"  style={elementDisabledStyle}>
                    <div className="w-full" >
                        <Input 
                            placeholder= {userData.first_name? userData.first_name: "Enter your first name"} 
                            name="first_name" 
                            label="First Name"
                            svg={SVGs.person}
                            register={register} 
                            error={errors.first_name && "Please enter your first name"}
                            options={{}}
                            
                            />
                    </div>
                    <div className="w-full" >
                        <Input 
                            svg={SVGs.person}
                            placeholder={userData.last_name ? userData.last_name: "enter your last name"} 
                            name="last_name" 
                            label="Last name" 
                            register={register} 
                            error={errors.last_name && "Please enter your last name"}
                            options={{}} 
                            />
                    </div>

                </div>
                <div className="flex w-full flex-col md:flex-row  max-w-5xl gap-10" style={elementDisabledStyle}>
                    <div className="w-full" >
                            <Input 
                                placeholder={userData.spouse_name ? userData.spouse_name: "enter your spouse name"} 
                                name="spouse_name" 
                                label="Spouse Name" 
                                svg={SVGs.person}
                                register={register} 
                                error={errors.first_name && "Please enter your spouse name"}
                                options={{
                                    
                                }} />
                    </div>
                    <div className="w-full" >
                        <Input 
                            svg={SVGs.phone}
                            placeholder={userData.spouse_phone ? userData.spouse_phone: "enter your spouse's Phone number"}    
                            name="spouse_phone" 
                            label="Spouse phone number" 
                            register={register} 
                            error={errors.last_name && "Please enter a correct phone number"}
                            options={{
                                minLength: 6,
                                maxLenght: 10,
                                pattern: "^[0-9]*$",
                            }} />
                        
                    </div>
                </div>

                <div className="flex w-full flex-col md:flex-row  max-w-5xl gap-10" style={elementDisabledStyle}>
                    <div className="w-full" >
                        <Input 
                            placeholder={userData.country ? userData.country: "country" }   
                            name="country"
                            label="Country" 
                            register={register} 
                            error={errors.last_name && "Please enter a country"}
                            svg={SVGs.grid}
                            options={{}} />
        
                    </div>
                    <div className="w-full" >
                        <Input 
                            placeholder={userData.city ? userData.city: "city" }   
                            name="city" 
                            // value={user?.email || ''}
                            label="City" 
                            register={register} 
                            error={errors.email && "Please enter your city"}
                            svg={SVGs.grid}
                            options={{}} />

                    </div>
                </div>

                <div className="flex w-full flex-col md:flex-row  max-w-5xl gap-10" style={elementDisabledStyle} >
                    <div className="w-full" >
                        <Input 
                            svg={SVGs.grid}
                            placeholder={userData.town ? userData.town: "town" }   
                            name="town"
                            label="Town" 
                            register={register} 
                            error={errors.last_name && "Please enter a town"}
                            options={{}} />
                        
                    </div>
                    <div className="w-full" >
                        <Input 
                            placeholder={userData.address ? userData.address: "address"}    
                            name="address" 
                            // value={user?.email || ''}
                            label="Address" 
                            register={register} 
                            error={errors.email && "Please enter your address"}
                            svg={SVGs.email}
                            options={{}} />

                    </div>
                </div>

                <div className="flex w-full flex-col md:flex-row  max-w-5xl gap-10" style={elementDisabledStyle} >
                    <div className="w-full" >
                        <Input 
                            svg={SVGs.file}
                            placeholder={userData.ghana_card ? userData.ghana_card: "GHA-XXXXXXXX-X" }   
                            name="ghana_card"
                            label="Ghana Card ID number" 
                            register={register} 
                            error={errors.last_name && "Please enter a correct Ghana Card ID"}
                            options={{}} />
                        
                    </div>
                    <div className="w-full" >
                        <Input 
                            placeholder={userData.email ? userData.email: "enter your email" }   
                            name="email" 
                            label="Email" 
                            type="email"
                            register={register} 
                            error={errors.email && "Please enter your email"}
                            svg={SVGs.email}
                            options={{}} />

                    </div>


                </div>
                  
                  <div className="flex flex-col gap-10 md:flex-row max-w-5xl ">
                    <div className="w-full">
                        <Button
                            title="Edit"
                            type="button"
                            onClick={() =>{setElementDisabled(false)}}
                        />
                    </div>
                    <div className="w-full" style={elementDisabledStyle}>
                        <Button
                            title="Update records"
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                        />     
                    </div>
                    <div className="w-full" style={elementDisabledStyle}>
                        <Button
                            title="Cancel"
                            type="reset"
                            secondary
                        />
                    </div>
                  </div>
            </form>
        </div>
        </div>
    )
}


export default Settings