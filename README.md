# Sumazon Server
## What is this repository?
This is the server side for a quarter long project in my software architecture course at Seattle U.  This is a very basic eCommerce site using a 3-tier architecture.  The server side utilizes PassportJS for authentication and Mongoose for database operations. 
### What's the stack?
This uses the MEVN stack.
- MongoDB is the database we are using for the third/data tier.
- Express and Node used for the second/server tier.
	- Helmet for setting HTTP response headers.
	- Express-rate-limit for rate limiting.
	- PassportJS for authentication.
	- Mongoose for database operations.
	- Node-Cache for caching images.
- Vue.js is what we are using for the first/client tier. 
### How do I check it out?
The frontend is hosted live [here](https://sumazon-frontend.vercel.app/). 
Or if you are feeling ambitious you can clone this respository and do the following.
1. Open the directory you cloned the repo to and run npm install.
2. Once installed, you can then run npm run dev, and open a browser to http://localhost:5173 (The server portion is running on vercel.)
