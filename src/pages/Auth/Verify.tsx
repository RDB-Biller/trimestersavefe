import Button from "components/Button"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import authentication from "services/patient/authentication"
import { getUser, clearUser } from "helpers/utilities"

const Verify = () => {

    const [ loading, setLoading] = useState(false)
    const [ err, setErr ] = useState('')
    const [ info, setInfo ] = useState('')
    
    const navigate = useNavigate()

    const onSubmit = () => {
        setErr('')
        setInfo('')
        setLoading(true)

        const userData = {
          phone: getUser(),
          code: otp.join(""), 
        }
        
        authentication.VerifyCode(userData)
        .then(res => {
            setLoading(false)
            clearUser()
            navigate('/dashboard')
        }).catch(err=> {
            const e = err?.response?.data?.error
            setErr(e === 'code_invalid' ? 'That code is not right.' : e === 'code_expired_or_missing' ? 'The code has expired. Resend it.' : e === 'too_many_attempts' ? 'Too many attempts. Resend a new code.' : (e || 'Could not verify'))
            setLoading(false)
        })  
    }

    const resend = () => {
      setErr('')
        setLoading(true)

        const userData = {
          phone: getUser()
        }
        
        authentication.ResendCode(userData)
        .then(res => {
            setLoading(false)
            setInfo(res.data.codeSandbox ? `Code sent (test mode: ${res.data.codeSandbox}).` : `A new code was sent to ${res.data.to}.`)
        }).catch(err=> {
            setErr(err?.response?.data?.error || 'Could not send the code')
            setLoading(false)
        })
    }

    const [otp, setOtp] = useState(new Array(6).fill(""));
    const [activeOtpIndex, setActiveOtpIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);
  
    useEffect(() => {
      inputRef?.current?.focus();
    }, [activeOtpIndex]);
  
    const handleChange = (
      { target }: React.ChangeEvent<HTMLInputElement>,
      index: number
    ): void => {
      const { value } = target;
      const newOTP: string[] = [...otp];
      newOTP[index] = value.substring(value.length - 1);
  
      if (!value) setActiveOtpIndex(index - 1);
      else setActiveOtpIndex(index + 1);
  
      setOtp(newOTP);
    };
  
    const handleKeyDown = (
      { key }: React.KeyboardEvent<HTMLInputElement>,
      index: number
    ) => {
      if (key === "Backspace") {
        setActiveOtpIndex(index - 1);
      }
    };

    return(
        <div className="login text-center mt-16 lg:mt-24">
            <h3>Verification</h3>
            <p className="text-grey_text my-4" >Please enter the verification code</p>
      
            {(!!err || !!info) && (
                <div
                className={`  ${
                    !!err && "bg-secondary bg-opacity-10 text-red "
                } ${
                  !!info && "bg-tertiary text-green-600 "
              }   w-full text-center p-4 mb-4 rounded-md`}
                >
                <p
                    className={` ${
                    !!err && "text-secondary "
                    }   text-xs`}
                >
                    {err || info}
                </p>
                </div>
            )}

            <form className="text-left pt-16 max-w-[450px] mx-auto relative">
              <label className="lg:text-label_text mb-2 mt-16 text-lg">code </label>
              <div className="flex mt-2 gap-4 justify-between mx-auto w-full">
                {otp.map((el, index) => (
                  <input
                    key={index}
                    ref={index === activeOtpIndex ? inputRef : null}
                    type="text"
                    className="w-12 px-4 flex justify-center items-center p-4 h-14 border rounded-lg text-xl"
                    onChange={(e) => handleChange(e, index)}
                    value={otp[index]}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                  />
                ))}
              </div>

              <Button
                title="Verify Code"
                type="button"
                loading={loading}
                onClick={onSubmit}
              />
            </form>

            <p className="cursor-pointer text-secondary pt-8" onClick={resend} >Resend code</p>
        </div>
    )
}

export default Verify