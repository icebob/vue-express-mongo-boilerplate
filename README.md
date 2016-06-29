# vue-express-mongo-boilerplate #
This is a VueJS webapp boilerplate project with ExpressJS + Mongo server.

Inspired by [dstroot/skeleton](https://github.com/dstroot/skeleton) and [sahat/hackathon-starter](https://github.com/sahat/hackathon-starter)

## Features
**Server-side**
* **[Node.JS](https://nodejs.org)**
* **[Express](https://github.com/expressjs/express)**
* [MongoDB](https://www.mongodb.com/) with [Mongoose](https://github.com/Automattic/mongoose)
* [NodeMailer](https://github.com/nodemailer/nodemailer) with SMTP, MailGun or SendGrid
* [Helmet](https://github.com/helmetjs/helmet)
* [Express-validator](https://github.com/ctavan/express-validator)
* [winston](https://github.com/winstonjs/winston)

**Client-side**
* **[VueJS](https://github.com/vuejs/vue)**
* [Vuex](https://github.com/vuejs/vuex)
* [Vue-router](https://github.com/vuejs/vue-router)
* [Vue-resource](https://github.com/vuejs/vue-resource)
* **[socket.io](https://github.com/socketio/socket.io) connection with namespaces & authorization**
* [Jade](https://github.com/pugjs/pug)
* [Webpack](https://github.com/webpack/webpack)
* SCSS
* [PostCSS](https://github.com/postcss/postcss) with precss and autoprefixer
* [Toastr](https://github.com/CodeSeven/toastr)
* Babel
* [Passwordless](https://www.sitepoint.com/passwordless-authentication-works/) mode
* **[Passport.JS](http://passportjs.org/)**
	* Social signup/login with Facebook, Google, Twitter, Github
	* API key authentication for REST API calls

## Usage
For development
```bash
$ npm run dev
```

Build web app scripts and styles:
```bash
$ npm run build
```

For production
```bash
$ NODE_ENV=production npm start
```


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

## TODO
* [ ] rewrite account.js response handlers
* [ ] try Apollo graphql stack
* [ ] eslint
* [ ] toastr
* [ ] signup enable/disable in config
* [ ] remove not verified accounts with agenda after 1 day
* [ ] add test with nightmare & mocha, chai, sinon
		https://github.com/MikaelSoderstrom/nightmarejs-demo


## Contribution
Please send pull requests improving the usage and fixing bugs, improving documentation and providing better examples, or providing some testing, because these things are important.

## License
vue-express-mongo-boilerplate is available under the [MIT license](https://tldrlegal.com/license/mit-license).

## Contact

Copyright (C) 2016 Icebob

[![@icebob](https://img.shields.io/badge/github-icebob-green.svg)](https://github.com/icebob) [![@icebob](https://img.shields.io/badge/twitter-Icebobcsi-blue.svg)](https://twitter.com/Icebobcsi)
