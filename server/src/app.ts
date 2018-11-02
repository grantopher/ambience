import * as express from "express";
import * as compression from "compression";  // compresses requests
// import * as session from "express-session";
import * as bodyParser from "body-parser";
import * as dotenv from "dotenv";
// import * as mongo from "connect-mongo";
import * as path from "path";


// const MongoStore = mongo(session);

// Load environment variables from .env file, where API keys and passwords are configured
dotenv.config({ path: ".env.example" });

// Controllers (route handlers)


// API keys and Passport configuration
// import * as passportConfig from "./config/passport";

// Create Express server
const app = express();

// Connect to MongoDB


// Express configuration
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.use(
  express.static(path.join(__dirname, "client"), { maxAge: 31557600000 })
);

/**
 * Primary app routes.
 */
// app.get("/", homeController.index);


app.get('/', (request, response) => {
  console.log('anything');
  response.send('ITS WORKING');
});

// Boilerplate Shit
/**
 * API examples routes.
 */
// app.get("/api", apiController.getApi);
// app.get("/api/facebook", passportConfig.isAuthenticated, passportConfig.isAuthorized, apiController.getFacebook);

/**
 * OAuth authentication routes. (Sign in)
 */
// app.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email", "public_profile"] }));
// app.get("/auth/facebook/callback", passport.authenticate("facebook", { failureRedirect: "/login" }), (req, res) => {
//   res.redirect(req.session.returnTo || "/");
// });

export default app;