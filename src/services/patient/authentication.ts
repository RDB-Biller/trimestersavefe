import axios from "axios";
import URL from "../../helpers/URL"
import { startVerification, checkVerification } from "../birthprep"

class Authentication {
  authenticated: boolean;
  constructor() {
    this.authenticated = false;
  }

  LoginPatient(data: any, cb: any, failedCb: any) {
    axios
      .post(URL.loginPatient, data, { timeout: 100000 })
      .then((res) => {
        this.authenticated = true;
        const { data } = res;
        cb(data.result);
      })
      .catch((err) => {
        failedCb(err);
      });
  }

  RegisterPatient(data: any, cb: any, failedCb: any) {
    axios
      .post(URL.registerPatient, data, { timeout: 100000 })
      .then(res => {
        this.authenticated = true;
        cb(data.phone); // the phone; the verification code itself is sent through the biller next
      })
      .catch((err) => {
        failedCb(err);
      });
  }

  ForgetPassword(data: any) {
    return axios
      .patch(URL.forgotPassword, data, { timeout: 100000 })
  }

  /**
   * Phone verification goes through the HNN Biller's SMS provider (Africa's Talking), the same
   * configuration the biller uses, not the CRM backend's Twilio. The biller checks the code and
   * returns a signed receipt; the CRM backend is then told the phone is verified with that receipt
   * (PATCH patient/verify_phone { phone, code, receipt, verifiedAt, provider }). If the CRM backend
   * still runs its own check, that call fails softly and the app carries on with the biller's result.
   */
  VerifyCode(data: { phone: string; code: string }) {
    return checkVerification(data.phone, data.code).then(async (res) => {
      const receipt = res.data;
      try { localStorage.setItem("phone_verification", JSON.stringify(receipt)); } catch (e) { /* private mode */ }
      await axios.patch(URL.verifyPhone, { ...data, ...receipt }, { timeout: 100000 }).catch(() => null);
      return res;
    });
  }

  ResendCode(data: { phone: string }) {
    return startVerification(data.phone);
  }

  ResetPassword(code:any,data: any) {
    return axios.patch(URL.resetPassword +'?code='+ code , data, {timeout: 100000})
  }

//   Logout() {
//     axios.post(URL.logout, { timeout: 100000 }).then((res) => {
//       localStorage.removeItem("token");
//       this.authenticated = false;
//     });
//   }

  isAuthenticated() {
    return this.authenticated;
  }
}

export default new Authentication();
