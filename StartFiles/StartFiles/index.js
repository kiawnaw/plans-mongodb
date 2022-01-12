// import dependencies you will use
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
//setting up Express Validator
const {check, validationResult} = require('express-validator'); // ES6 standard for destructuring an object

// setup databse connection - to connect front end application with back end database
// Databse credentials -- Database name is mystore and collection name is orders 
const mongoose = require('mongoose');
mongoose.connect('mongodb://localhost:27017/isp',{
    useNewUrlParser: true,
    useUnifiedTopology: true   
});



// set up the model for the order 

const Order = mongoose.model('Order',{
            name : String,
            email : String,
            phone : String, 
            plan1 : String,
            plan2: String,
            plan3: String,
            subtotal: Number,
            discount: Number,
            tax: Number,
            total: Number
            
});

// set up variables to use packages
var myApp = express();
myApp.use(bodyParser.urlencoded({extended:false}));


// set path to public folders and view folders

myApp.set('views', path.join(__dirname, 'views'));
//use public folder for CSS etc.
myApp.use(express.static(__dirname+'/public'));
myApp.set('view engine', 'ejs');
// set up different routes (pages) of the website

//home page
myApp.get('/', function(req, res){
    res.render('form'); // no need to add .ejs to the file name
});

//defining regular expressions
var phoneRegex = /^[0-9]{3}\-[0-9]{3}\-[0-9]{4}$/;
var nameRegex = /^[a-zA-z]+$/;

//function to check a value using regular expression
function checkRegex(userInput, regex){
    if(regex.test(userInput)){
        return true;
    }
    else{
        return false;
    }
}
// Custom phone validation function
function customPhoneValidation(value){
    if(!checkRegex(value, phoneRegex)){
        throw new Error('Phone should be in the format xxx-xxx-xxxx');
    }
    return true;
}
//Custom name validation
function customNameValidation(value){
    if(!checkRegex(value, nameRegex)){
        throw new Error('Name should be only characters');
    }
    return true;
}


myApp.post('/', [
    check('name', 'Must have a name').custom(customNameValidation).notEmpty(),
    check('email', 'Please write the email in a correct format').isEmail(),
    check('phone').custom(customPhoneValidation).notEmpty(),
    
    
],function(req, res){

    const errors = validationResult(req);
    if (!errors.isEmpty()){
        //console.log(errors); // check what is the structure of errors
        res.render('form', {
            errors:errors.array()
        });
    }
    else{
        var name = req.body.name;
        var email = req.body.email;
        var phone = req.body.phone;
        var plan1 = req.body.plan1;
        var plan2 = req.body.plan2;
        var plan3 = req.body.plan3;
        var subTotal = 0;
        subTotal += plan1 * 25.99;
        subTotal += plan2 * 65.99;
        subTotal += plan3 * 250;
        var discount = plan3 * 250  * 0.2;
        var tax = subTotal * 0.13;
        var total = subTotal - discount + tax;


       

        var pageData = {
            name : name,
            email : email,
            phone : phone, 
            plan1 : plan1,
            plan2 : plan2,
            plan3 : plan3,
            subTotal : subTotal,
            discount : discount,
            tax : tax,
            total : total
        }

        // Create an object for the model Order,
        //in this application we already have pageData with desired data values 
        
        var myOrder = new Order(pageData);
        
        // save this order

        myOrder.save().then( ()=>{
            console.log('New order information saved in database');
        });
        
        res.render('form', pageData);
    }
});


// Route before data retreival 
// render allorder page with detailed order information 
// express route for all orders page 

//myApp.get('/allorders', function(req,res){
 //   res.render('allorders');
//});

// This is express route for all orders with data retrival procedure 
myApp.get('/allorders',function(req,res){
    Order.find({}).exec(function(err,orders){
        res.render('allorders',{orders:orders});
    });
});



//author page
myApp.get('/author',function(req,res){
    res.render('author',{
        name : 'Kiana Karamouz',
        studentNumber : '8655104'
    }); 
});

// start the server and listen at a port
myApp.listen(8080);

//tell everything was ok
console.log('Everything executed fine.. website at port 8080....');


