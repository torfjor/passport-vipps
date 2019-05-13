# Example

Example app with passport-vips.

![](Screengrab.gif)

## Installation

Clone or download this repository

```bash
git clone https://github.com/torors/passport-vipps.git
```

## Usage
The example assumes the following environment variables are set:

* VIPPS_CLIENT_ID
* VIPPS_CLIENT_SECRET
* VIPPS_APP_KEY
* VIPPS_TOKEN_KEY
* VIPPS_MERCHANT_SERIAL_NUMBER

Get these values from the Vipps Developer Portal.

The example also assumes to find a MongoDB connection string under the following environment variable:
* DB

Make sure to set `callbackUrl`, `consentRemovalUrl` and `vippsCallback` to some externally accessible URLs, as the Vipps  API chokes on local addresses.

```bash
cd example/
npm install
node index.js
```
