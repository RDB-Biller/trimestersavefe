# BirthPrep in Afriyie

The Afriyie app now lets anyone in the general population start and follow a **BirthPrep savings
plan**, and verifies phones through the **HNN Biller's SMS provider (Africa's Talking)** instead
of the CRM backend's Twilio.

## What the app does

- `/birthprep` (public, no account): three-step sign-up — who you are, what you are saving for
  (delivery / planned procedure / anything else) over 9, 6, 3 months or other, the hospital you
  plan to use, the pregnancy facts; a one-time code is texted; the plan is worked out by the biller
  (obstetric pathways, the hospital's prices, and anything the hospital already knows about you).
- `/dashboard/birthprep` ("Savings plans" in the sidebar): every plan linked to your phone, with
  progress, milestones, how the target was worked out, advice, the InsureCredit bridge, and a
  questionnaire whose answers re-plan the target. Plans opened on a device are remembered there.
- Registration (`/register` -> `/verify`): the code is now sent and checked by the biller. On
  success the biller returns a signed receipt `{ phone, verifiedAt, receipt }`, which the app stores
  and passes to the CRM (`PATCH patient/verify_phone`).

## Configuration

`.env`:

```
REACT_APP_BILLER_URL=https://nextgenhnnbiller-production.up.railway.app
```

All backend resources stay on Railway (the biller). The biller endpoints used are public and
phone-verified: `GET /savings/api/facilities`, `POST /savings/api/verify/start`,
`POST /savings/api/verify/check`, `POST /savings/api/signup`, `POST /savings/api/my-plans`,
`GET /savings/api/{token}`, `POST /savings/api/{token}/answers`.

## What the TMS backend (tms-afriyie-backend) should change

1. **Stop sending Twilio codes** on `patient/register` and `patient/send_verification_code`; the app
   no longer calls the latter.
2. **Accept the biller's receipt** on `PATCH patient/verify_phone`: the body now carries
   `{ phone, code, receipt, verifiedAt, provider: 'africastalking' }`. Mark the patient verified when
   `HMAC-SHA256(phone + '|' + verifiedAt, PHONE_VERIFY_SIGNING_KEY)` equals `receipt` (the key is
   set on the biller as `PHONE_VERIFY_SIGNING_KEY`), or ask the biller:
   `POST {BILLER}/savings-hooks/{secret}/verify-receipt { phone, verifiedAt, receipt }` -> `{ valid }`.
3. **Post wallet deposits to the plan** so the plan tracks the money TrimesterSave holds:
   `POST {BILLER}/savings-hooks/{secret}/contribution { planNo, amount, reference }` (idempotent on
   reference). The secret is shown in the biller's Master Control -> Product Lab -> BirthPrep savings.

Until step 2 is done the app still works: it verifies with the biller and carries on; the CRM call
fails softly.
