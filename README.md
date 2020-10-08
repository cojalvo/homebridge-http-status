# homebridge-http-status

A Http status sensor plugin for homebridge (https://github.com/nfarina/homebridge).

## Installation
1. Install homebridge using: `npm install -g homebridge`
2. Install homebridge-http-status plugin: `npm install -g homebridge-http-status`
3. Update your config.json configuration file

## Configuration
Example config.json entry:

```$xslt
{
            "platform": "HttpStatus",
            "sensors": [
                {
                    "id": "check-api",
                    "name": "Api Health",
                    "okStatus" : 200,
                    "url": "https://some.api.com/health",
                    "interval": 180
                },
               ....
               ....
            ]
```

## Credits

This Plugin inspired by the https://github.com/jsworks/homebridge-ping-hosts 


## Support homebridge-http-status

**homebridge-http-status** is a free plugin under the BSD license. it was developed as a contribution to the homebridge/hoobs community with lots of love and thoughts.
Creating and maintaining Homebridge plugins consume a lot of time and effort and if you would like to share your appreciation, feel free to "Star" or donate.

<a target="blank" href="https://www.paypal.me/cojalvo"><img src="https://img.shields.io/badge/PayPal-Donate-blue.svg?logo=paypal"/></a><br>
