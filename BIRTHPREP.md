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
REACT_APP_BILLER_URL=https://nextgenhnnbiller-production-bdf1.up.railway.app
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

## Accounts and SMS now run on the Biller

Sign-up, login, profile, password reset, budgets and vitals call the Biller's `/patient-api/v1`
(see `src/helpers/URL.ts`), and every text message (verification and password reset codes) is sent by the
Biller's Africa's Talking configuration. The old `tms-crm-backend` on Heroku is no longer called.
Appointments (with an SMS reminder the day before), notifications (the header bell) and the document vault are also served by the Biller and have pages in the app.

## Languages

The app is available in English, French, Portuguese, Spanish, Arabic (right-to-left), Chinese, Hindi, German and
Swahili, with Twi, Hausa, Yoruba and Ga prepared but hidden until a native speaker has reviewed them (set
`REACT_APP_SHOW_UNREVIEWED_LANGUAGES=true` at build time to show them for testing). The picker is in the header and on
the sign-in / sign-up screens; the choice is remembered, sent to the HNN Biller with registration, and used for the
SMS codes and reminders the Biller sends. Strings live in `src/i18n/locales/*.json` (the same catalogs the Biller
serves at `/i18n/api/catalog/:lang`); any missing key falls back to English. To translate a new screen, use
`const { t } = useI18n()` and add the key to `en.json` and the other catalogs.
