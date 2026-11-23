[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Introduction

The TMS Afriyie web application is a patient-facing application that offers healthcare-focused financial solutions and skills such as savings and budgeting whilst leveraging insights from their healthcare journey, especially during pregnancy, childbirth and the first years of life of their children. <br/>
Health is wealth but in emerging economies wealth can also mean the difference between good and bad. Afriyie is therefore an Out-of-the-box approach to health premised on the fact that finance is a determinant of health.

## Installation
Use the initialization CLI or Clone the repository

After Cloning the repository, 
* Run `npm install` to install packages.
* Run `npm start` to run the project locally.


## Contributing
We've released Afriyie because it helps us better scale and supports OSS projects at Trimester Save Ltd. We hope that other organizations and individuals can benefit from the project. We are thankful for any contributions from the community.

### Code of Conduct
Trimester Save Ltd has adopted a Code of Conduct that we expect project participants to adhere to. Please read the [full text](https://github.com/Trimester-Save-Ltd/tms-afriyie-backend/blob/main/Code%20of%20Conduct.md) so that you can understand what actions will and will not be tolerated.

## Contact
For any info contact us at info@trimestersave.com

##  License
Afriyie is [MIT licensed](https://github.com/Trimester-Save-Ltd/tms-afriyie-backend/blob/main/LICENSE) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)



## Dry Run (iteration)

The app is ready to be opened for iteration in Dry Run. `public/dryrun/dryrun.js` is the Dry Run page script: on a normal visit it does nothing, and inside the Dry Run Workroom it shows iterations as overlays on the real `/birthprep` page. To make the site Dry Run signed, add the site in Dry Run, copy its token from the install panel, and set `DRYRUN_TOKEN` on the service (optionally `DRYRUN_ORIGIN`, default `https://dryrun.hnnworld.com`). The next build writes `/.well-known/dryrun.json` through `scripts/dryrun-manifest.js`; then press Check the site in Dry Run. Without the token nothing changes.
