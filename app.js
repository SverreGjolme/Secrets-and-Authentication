//jshint esversion:6
require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const encrypt = require("mongoose-encryption");

const app = express();

console.log(process.env.API_KEY);

app.use(express.static("public"));                  //adding public folder as static resource
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));


mongoose.connect("mongodb://localhost:27017/userDB")      //bruker mongoose til å connecte til den locale databasen, som er: mongodb://localhost:27017. /userDB er navnet på databasen

const userSchema = new mongoose.Schema ({                 //userSchema
    email: String,
    password: String
});

userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password'] });     //Spesifiserer at vi kun ønsker å kryptere password delen i databasen vår, ikke brukernavnet, som er emailen
                                                                                                //secret er lik SECRET i .env filen
const User = new mongoose.model("User", userSchema);      //User som heter User(singular, blir flertall i databasen) basert på userSchema


app.get("/", function(req, res){
    res.render("home");
});

app.get("/login", function(req, res){
    res.render("login");
});

app.get("/register", function(req, res){
    res.render("register");
});


app.post("/register", function(req, res){               //Når man poster fra /register havner man her
    const newUser = new User({                          //Lager ny user med navn newUser som bygger på modellen som heter User
        email: req.body.username,                       //Setter email og password lik hva brukeren skrev på /register siden
        password: req.body.password
    });
    newUser.save(function(err){                         //Må ikke sende med en funksjon med (err), kan velge å si newUser.save();
        if (err) {                                      //Men vi gjør det for å sjekke om alt gikk bra, og sier ifra hva som skjedde
            console.log(err);
        } else {
            res.render("secrets");                      //Hvis bruker successfully created og saved, så render vi secrets pagen
        }
    });
});

app.post("/login", function(req, res){
    const username = req.body.username;                 //Får tak i username og password fra formet på login siden
    const password = req.body.password;

    User.findOne({email: username}, function(err, foundUser){   //sender med email: username inn i foundUser responsen, så hvis de eksisterer, sendes det med videre
        if (err) {
            console.log(err);
        } else {
            if (foundUser) {                                    //Hvis foundUser eksisterer
                if (foundUser.password === password) {          //så sjekker vi om passordet til useren vi har stemmer med passordet som ble skrevet inn.
                    res.render("secrets");                      //Hvis det stemmer så renderer vi secrets siden
                }
            }
        }
    });
});


app.listen(3000, function() {
    console.log("Server running on part 3000.");
});