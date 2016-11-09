# vue-express-mongo-boilerplate #
[![Known Vulnerabilities](https://snyk.io/test/github/icebob/vue-express-mongo-boilerplate/badge.svg)](https://snyk.io/test/github/icebob/vue-express-mongo-boilerplate)

<img src="http://vuejs.org/images/logo.png" width="50">
<img src="https://coligo.io/images/express.svg" width="100">
<img src="https://upload.wikimedia.org/wikipedia/en/thumb/4/45/MongoDB-Logo.svg/527px-MongoDB-Logo.svg.png" width="100">
<img src="https://worldvectorlogo.com/logos/nodejs-icon.svg" width="50">
<img src="https://camo.githubusercontent.com/66747a6e05a799aec9c6e04a3e721ca567748e8b/68747470733a2f2f662e636c6f75642e6769746875622e636f6d2f6173736574732f313336353838312f313931383337332f32653035373166612d376462632d313165332d383436352d3839356632393164343366652e706e67" width="100">

**This project is under heavy development!!!**

This is a VueJS webapp boilerplate project with ExpressJS + Mongo server.

Inspired by [dstroot/skeleton](https://github.com/dstroot/skeleton) and [sahat/hackathon-starter](https://github.com/sahat/hackathon-starter)

*This is just my personal boilerplate, it may or may not be a good fit for your project(s).*

### [Live Demo](http://vemapp.e-paper.space/)

## Features
**Server-side**
* [x] **[Node.JS](https://nodejs.org)**
* [x] **[Express](https://github.com/expressjs/express)**
* [x] [MongoDB](https://www.mongodb.com/) with [Mongoose](https://github.com/Automattic/mongoose)
* [x] [NodeMailer](https://github.com/nodemailer/nodemailer) with SMTP, MailGun or SendGrid
* [x] [Helmet](https://github.com/helmetjs/helmet)
* [x] [Express-validator](https://github.com/ctavan/express-validator)
* [x] [winston](https://github.com/winstonjs/winston) + 6 transports
* [x] **[GraphQL](http://graphql.org/)** with [Apollo stack](http://www.apollostack.com/)
* [x] [i18next](http://i18next.com/) as the internationalization ecosystem
* [x] **[HTTP/2 Server Push](https://en.wikipedia.org/wiki/HTTP/2_Server_Push)** with [netjet](https://github.com/cloudflare/netjet)
* [x] Bundled server-side code with [Webpack](https://webpack.github.io/)

**Client-side**
* [x] **[VueJS](https://github.com/vuejs/vue)**
* [x] [Vuex](https://github.com/vuejs/vuex)
* [x] [Vue-router](https://github.com/vuejs/vue-router)
* [x] [Vue-resource](https://github.com/vuejs/vue-resource)
* [x] **[socket.io](https://github.com/socketio/socket.io) connection with namespaces & authorization**
* [x] [Jade](https://github.com/pugjs/pug)
* [x] **[Webpack](https://github.com/webpack/webpack)**
* [x] [SCSS](http://sass-lang.com/)
* [x] [PostCSS](https://github.com/postcss/postcss) with precss and autoprefixer
* [x] [Babel](https://babeljs.io/)
* [x] [Passwordless](https://www.sitepoint.com/passwordless-authentication-works/) mode
* [x] [Passport.JS](http://passportjs.org/)
	* Social signup/login with Facebook, Google, Twitter and Github
	* API key authentication for REST API calls
* [x] [Toastr](https://github.com/CodeSeven/toastr)

**Supported remote logging services**
* [x] [Papertrail](https://papertrailapp.com/)
* [x] [Graylog](https://www.graylog.org/)
* [x] [LogEntries](https://logentries.com/)
* [x] [Loggly](https://www.loggly.com/)
* [x] [Logsene](https://sematext.com/logsene/)
* [x] [Logz.io](http://logz.io/)

## Usage
For development
```bash
$ npm install nodemon -g
$ npm run dev
```

Build web app scripts and styles:
```bash
$ npm run build
```

For production
```bash
$ npm start
```

## Screenshots
### Login screen
![Login screen](https://cloud.githubusercontent.com/assets/306521/20032026/e2241716-a381-11e6-8ec2-4e0263308762.png)
### Index page after login
![Index page](https://cloud.githubusercontent.com/assets/306521/20032034/e401f10c-a381-11e6-86bb-5325671d32bf.png)
### Devices page
![Devices module](https://cloud.githubusercontent.com/assets/306521/20032035/e5e7ec60-a381-11e6-9481-e1db97126797.png)

## Directory structure
```txt
+---client
|   +---app
|   |   +---core
|   |   +---modules
|   |       +---demo
|   |       +---devices
|   |       +---home
|   |       +---posts
|   |       +---session
|   |                   
|   +---frontend
|   +---images
|   +---scss
|                   
+---data
+---logs
+---server
|   |   bundle.js
|   |   bundle.js.map
|   |   dev.js
|   |   index.js
|   +---applogic
|   |   +---libs
|   |   +---modules
|   |       +---counter
|   |       +---devices
|   |       +---posts
|   |       +---session
|   +---config
|   |       default.js
|   |       index.js
|   |       prod.js
|   |       test.js
|   |       
|   +---core
|   +---libs
|   +---locales
|   |   +---en
|   |   +---hu
|   +---models
|   |       user.js
|   +---public
|   +---routes
|   +---schema
|   +---services
|   +---views
+---tests
|
|   package.json
|   secrets.json

```

## Bundled server-side
If you want to bundle your NodeJS server-side code run webpack on server code with `npm run build && npm run build:server` command. It if was success, run the server: `npm run start:bundle`

If you want to export bundled version copy these folders & files to the new place:
- server
	- locales
	- public
	- views
	- bundle.js
- package.json
- secrects.json (optional)

Before start, you have to install production dependencies with npm: `npm install --production`

## Obtaining API keys for social signup/login

<img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/1000px-Google_2015_logo.svg.png" width="100">
- Visit [Google Cloud Console](https://cloud.google.com/console/project)
- Click on the **Create Project** button
- Enter *Project Name*, then click on **Create** button
- Then click on *APIs & auth* in the sidebar and select *API* tab
- Click on **Google+ API** under *Social APIs*, then click **Enable API**
- Next, under *APIs & auth* in the sidebar click on *Credentials* tab
- Click on **Create new Client ID** button
- Select *Web Application* and click on **Configure Consent Screen**
- Fill out the required fields then click on **Save**
- In the *Create Client ID* modal dialog:
 - **Application Type**: Web Application
 - **Authorized Javascript origins**: http://localhost:3000
 - **Authorized redirect URI**: http://localhost:3000/auth/google/callback
- Click on **Create Client ID** button
- Copy and paste *Client ID* and *Client secret* keys into `secrets.json` file

<hr>

<img src="http://www.doit.ba/img/facebook.jpg" width="100">
- Visit [Facebook Developers](https://developers.facebook.com/)
- Click **My Apps**, then select **Add a New App* from the dropdown menu
- Select **Website** platform and enter a new name for your app
- Click on the **Create New Facebook App ID** button
- Choose a **Category** that best describes your app
- Click on **Create App ID** button
- In the upper right corner click on **Skip Quick Star**
- Copy and paste *App ID* and *App Secret* keys into `secrets.json` file
 - **Note:** *App ID* is **clientID**, *App Secret* is **clientSecret**
- Click on the *Settings* tab in the left nav, then click on **+ Add Platform**
- Select **Website**
- Enter `http://localhost:3000` under *Site URL*

**Note:** After a successful sign in with Facebook, a user will be redirected back to home page with appended hash `#_=_` in the URL. It is *not* a bug. See this [Stack Overflow](https://stackoverflow.com/questions/7131909/facebook-callback-appends-to-return-url) discussion for ways to handle it.

<hr>

<img src="https://github.global.ssl.fastly.net/images/modules/logos_page/GitHub-Logo.png" width="100">
- Go to [Account Settings](https://github.com/settings/profile)
- Select **Applications** from the sidebar
- Then inside **Developer applications** click on **Register new application**
- Enter *Application Name* and *Homepage URL*
- For *Authorization Callback URL*: http://localhost:3000/auth/github/callback
- Click **Register application**
- Now copy and paste *Client ID* and *Client Secret* keys into `secrets.json` file

<hr>

<img src="https://g.twimg.com/ios_homescreen_icon.png" width="45">
- Sign in at [https://apps.twitter.com/](https://apps.twitter.com/)
- Click **Create a new application**
- Enter your application name, website and description
- For **Callback URL**: http://127.0.0.1:3000/auth/twitter/callback
- Go to **Settings** tab
- Under *Application Type* select **Read and Write** access
- Check the box **Allow this application to be used to Sign in with Twitter**
- Click **Update this Twitter's applications settings**
- Copy and paste *Consumer Key* and *Consumer Secret* keys into `secrets.json` file

## License
vue-express-mongo-boilerplate is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact

Copyright (C) 2016 Icebob

[![@icebob](https://img.shields.io/badge/github-icebob-green.svg)](https://github.com/icebob) [![@icebob](https://img.shields.io/badge/twitter-Icebobcsi-blue.svg)](https://twitter.com/Icebobcsi)
