import NextSteps from 'components/NextSteps';
import Button from "components/Button"
import Input, { Select } from "components/Input"
import Modal from "components/Modal"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { createBudget } from "services/patient/budget"

const AddBudget = ({ show, toggleClose }:any) => {
    
    const { register, handleSubmit, formState: {errors} } = useForm()
    const [ err, setErr ] = useState('')
    const [ loading, setLoading ] = useState(false)

    const onSubmit = (data:any) => {
        setErr('')
        setLoading(true)
        
        const budgetData={
            budget_type: data.budget_type,
            budget_date: data.date,
            description: data.description,
            amount: data.amount
          }

        createBudget(budgetData).then(
            res => {
                setLoading(false)
                toggleClose()

            }).catch(err => {
            setLoading(false)
            setErr(err.response.data.error)
        })
    }
    
    const budget_types = [
        {
            id: "ME",
            name: "medical"
        },
        {
            id: "FO",
            name: "food"
        },
        {
            id: "PE",
            name: "personal"
        },
        {
            id: "TR",
            name: "travel"
        },
        {
            id: "OT",
            name: "other"
        },
    ]


    return(
        <Modal show={show} toggleClose={toggleClose} >
        <div className="p-8" >
                    <h4>Add budget Informations</h4>

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
                        <Select name="budget_type" list={budget_types} placeholder="Select budget type" label={"Please select a budget type"} register={register}                        
                        />
                        <Input 
                            name="amount" register={register} 
                            label="amount" 
                            error={errors.value && 'Please enter an amount'} 
                            options={{required: true}}                            
                        />
                        <Input 
                            name="date" register={register}
                            type="date" 
                            label="date" error={errors.first_day_of_last_circle && 'Please enter First Day of Last Circle'} 
                            options={{ required: true }}                            
                        />
                        <Input 
                            name="description" register={register} 
                            label="Description" error={errors.description && 'Please enter description'} 
                            options={{ required: true }}                            
                        />

                        <Button  title="Add budget" loading={loading} />
                    </form>
                </div>
                </Modal>
    )
}

export default AddBudget