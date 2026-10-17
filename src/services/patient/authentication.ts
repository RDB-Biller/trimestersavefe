import axios from "axios";
import URL from "../../helpers/URL"
import { startVerification, checkVerification } from "../birthprep"
import { setToken, getToken } from "../../helpers/utilities"

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

  /** Whether the Biller lets people open an account with an email address (Master Control setting). */
  AuthOptions(): Promise<{ requirePhone: boolean; emailSignup: boolean }> {
    return axios.get(URL.authOptions, { timeout: 30000 }).then((res) => res.data.result);
  }

  /** Email-only sign-up: sign in with the new account, then email it a confirmation code. */
  async StartEmailAccount(identifier: string, password: string) {
    const login = await axios.post(URL.loginPatient, { identifier, password }, { timeout: 100000 });
    const token = login.data?.result?.tokens?.[0]?.token;
    if (token) setToken(token);
    return axios.post(URL.startEmail, {}, { headers: { Authorization: `Bearer ${token}` }, timeout: 100000 });
  }

  ResendEmailCode() {
    return axios.post(URL.startEmail, {}, { headers: { Authorization: `Bearer ${getToken()}` }, timeout: 100000 });
  }

  VerifyEmailCode(code: string) {
    return axios.patch(URL.verifyEmail, { code }, { headers: { Authorization: `Bearer ${getToken()}` }, timeout: 100000 });
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
      // The Biller holds the account: present its signed receipt and it returns a signed-in session.
      const done = await axios.patch(URL.verifyPhone, { ...data, ...receipt }, { timeout: 100000 });
      const token = done.data?.result?.tokens?.[0]?.token;
      if (token) setToken(token);
      return done;
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
