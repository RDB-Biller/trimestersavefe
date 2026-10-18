import NextSteps from 'components/NextSteps';
import Button from "components/Button"
import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import authentication from "services/patient/authentication"
import { getUser, setUser, clearUser } from "helpers/utilities"

const Verify = () => {

    const [ loading, setLoading] = useState(false)
    const [ err, setErr ] = useState('')
    const [ info, setInfo ] = useState('')
    
    const navigate = useNavigate()
    const [ changing, setChanging ] = useState(false)
    const [ newPhone, setNewPhone ] = useState('')
    const [ pw, setPw ] = useState('')
    // An account opened with an email address confirms it with an emailed code (the stored value is the email).
    const isEmail = getUser().includes('@')

    const onSubmit = () => {
        setErr('')
        setInfo('')
        setLoading(true)

        const userData = {
          phone: getUser(),
          code: otp.join(""), 
        }
        
        const verify = isEmail ? authentication.VerifyEmailCode(otp.join("")) : authentication.VerifyCode(userData)
        verify
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
        
        const again = isEmail ? authentication.ResendEmailCode() : authentication.ResendCode(userData)
        again
        .then((res: any) => {
            setLoading(false)
            const body = res.data?.result || res.data
            setInfo(body.codeSandbox ? `Code sent (test mode: ${body.codeSandbox}).` : `A new code was sent to ${body.to}.`)
        }).catch(err=> {
            setErr(err?.response?.data?.error || 'Could not send the code')
            setLoading(false)
        })
    }

    // Wrong number? Replace it (while unconfirmed), then text the new one.
    const changeNumber = () => {
        setErr(''); setInfo('')
        const t = newPhone.trim()
        const p = t.charAt(0) === '0' ? '+233' + t.substring(1) : t
        if (!/^\+\d{8,15}$/.test(p)) { setErr('Enter a valid mobile number, with the country code if it is not Ghana.'); return }
        if (!pw) { setErr('Enter your password to confirm it is your account.'); return }
        setLoading(true)
        authentication.ChangePhone({ identifier: getUser(), password: pw, newPhone: p })
        .then(() => { setUser(p); return authentication.ResendCode({ phone: p }) })
        .then((res: any) => {
            const body = res.data?.result || res.data
            setInfo(body?.codeSandbox ? `Number changed. Code sent (test mode: ${body.codeSandbox}).` : `Number changed. A code was sent to ${body?.to || p}.`)
            setChanging(false); setNewPhone(''); setPw('')
        }).catch(e => setErr(e?.response?.data?.error || 'Could not change the number. Check your password and try again.'))
        .finally(() => setLoading(false))
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
            <p className="text-grey_text my-4" >{isEmail ? 'Enter the code we emailed to you' : 'Please enter the verification code'}</p>
      
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
                    {err || info}</p>{!!err && <NextSteps message={err} />}
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
            {!isEmail && (changing ? (
              <div className="text-left max-w-[450px] mx-auto pt-6">
                <label className="text-lg">Your correct mobile number</label>
                <input className="w-full border rounded-lg p-3 mt-2" inputMode="tel" autoComplete="tel" placeholder="024 123 4567" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
                <label className="text-lg block mt-4">Your password</label>
                <input className="w-full border rounded-lg p-3 mt-2" type="password" autoComplete="current-password" value={pw} onChange={e => setPw(e.target.value)} />
                <Button title="Use this number and text me a code" type="button" loading={loading} onClick={changeNumber} />
                <p className="cursor-pointer text-secondary pt-4 text-center" onClick={() => { setChanging(false); setErr('') }}>Keep the current number</p>
              </div>
            ) : <p className="pt-4">Wrong number? <span className="cursor-pointer text-secondary underline" onClick={() => { setErr(''); setInfo(''); setChanging(true) }}>Change it</span></p>)}
        </div>
    )
}

export default Verify