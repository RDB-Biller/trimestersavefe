import NextSteps from 'components/NextSteps';
import Button from "components/Button"
import Input, { Select } from "components/Input"
import Modal from "components/Modal"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { addVital } from "services/patient/vitals"

const AddVital = ({ show, toggleClose }:any) => {
    
    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ err, setErr ] = useState('')
    const [ loading, setLoading ] = useState(false)
    const [showCycleDate,setShowCycleDate] = useState(false)

    const onSubmit = (data:any) => {
        setErr('')
        setLoading(true)
        let vitalData
        if(showCycleDate){
            vitalData = {
                 vital_type: data.vital_type,
                 value: data.value,
                 interpretation: data.interpretation,
                first_day_of_last_circle: data.first_day_of_last_circle|| new Date(0),
                 description: data.description
            }
        }else{
            vitalData = {
                vital_type: data.vital_type,
                value: data.value,
                interpretation: data.interpretation,
                description: data.description 
        }
    }
        addVital(vitalData).then(
            res => {
                setLoading(false)
                toggleClose()

            }).catch(err => {
            setLoading(false)
            setErr(err.response.data.error)
        })
    }

    const vitals = [
        {
            id: "WE",
            name: "Weight"
        },
        {
            id: "GL",
            name: "Glucose Level"
        },
        {
            id: "BP",
            name: "Blood Pressure"
        },
        {
            id: "GE",
            name: "Cycle Date"
        },
    ]


    return(
        <Modal show={show} toggleClose={toggleClose} >
        <div className="p-8" >
                    <h4>Add Vital Informations</h4>

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

                    <form onSubmit={handleSubmit(onSubmit)} className="my-8" >
                        <Select name="vital_type" 
                            list={vitals} placeholder="Please select vital" 
                            label={"Please select a vital type"} 
                            register={register}
                            onChange={(e: any) => e.target.value ==="GE"? setShowCycleDate(true):setShowCycleDate(false)}                      
                        />
                        <div className={` ${ showCycleDate ? 'hidden' : 'block' }`}>
                            <Input 
                                name="value" register={register} 
                                label="Value" 
                                error={errors.value && 'Please enter a value'} 
                                options={{required: false}}                            
                            />
                            <Input 
                                name="interpretation" 
                                register={register} 
                                label="Interpretation" error={errors.interpretation && 'Please enter interpretation'} 
                                options={{required: false}}                            
                            />
                            <Input 
                                name="description" register={register} 
                                label="Description" error={errors.description && 'Please enter description'} 
                                options={{ required: false }}                            
                            />
                        </div>
                        
                        <div className={` ${ showCycleDate ? 'block' : 'hidden' }`}>
                            <Input 
                                name="first_day_of_last_circle" register={register}
                                type="date" 
                                label="Last Date of Cycle" error={errors.first_day_of_last_circle && 'Please enter First Day of Last menstrual Circle'} 
                                options={{ required: false }}                            
                            />
                        </div>
        
                        <Button  title="Add Vital" loading={loading} />
                    </form>
                </div>
                </Modal>
    )
}

export default AddVital