const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const {promisify} = require ('util')
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE_NAME
});



exports.login = async(req, res)=>{
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).render('login', {
                    message: "provide an email and password"
                }
            )
        }

        db.query('SELECT * FROM users WHERE email = ?', [email], async(error, results)=>{
                if(!results || !(await bcrypt.compare(password, results[0].password))){
                res.status(401).render('login', {
                        message: "Email or Password is incorrect"
                    })
                }else{
                    const id = results[0].id;
                    const token = jwt.sign({id}, process.env.JWT_SECRET, {
                        expiresIn: process.env.JWT_EXPIRES_IN
                    });

                    const cookieOptions = {
                        expires: new Date(
                            Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 *1000
                        ),
                        httpOnly: true
                    }

                    res.cookie('jwt', token, cookieOptions);
                    res.status(200).redirect("/profile")
                }
            })
    }catch(error){
        console.log(error)
    }
}

exports.register = (req, res)=>{
    console.log(req.body)

    

    // const name = req.body.name;
    // const email = req.body.email;
    // const password = req.body.password
    // const confirmPassword = req.body.confirmPassword

    // using destructuring method
    const{name, email, password, confirmPassword, gender} = req.body

    db.query('SELECT email FROM users WHERE email = ?', [email], async (err, results)=>{
        if(err)
            console.log(err)

        if(results.length>0){
            res.render('register', {
                message: 'That email is already in use'
            })
        }else if(password !== confirmPassword){
            res.render('register', {
                message: 'Password do not match'
            })
        }
        else{
        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword)

        db.query('INSERT INTO users SET ?', {name: name, email: email, password: hashedPassword, gender: gender}, (error, result)=>{
            if(error){
                console.log(error);
            }else{

                res.render('register', {
                    message: 'User registered'
                })
            }

            })
        }
        
    })
    
}

exports.isLoggedIn = async (req, res, next)=>{
    //console.log(req.cookies);
    if(req.cookies.jwt){
        try{
            //verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.jwt,
                process.env.JWT_SECRET
                );

            // check if the user still exists
            db.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error, result)=>{
                if(!result){
                    return next();
                }
                req.user =result[0]; 
                return next();
            })
        }catch(error){
            console.log(error)
            return next();

        }
    }else{
        next();
    }
    
}

exports.logout = async (req, res, next)=>{
    res.cookie('jwt', 'logout',{
        expires: new Date(Date.now() + 2*1000),
        httpOnly: true
    })
    res.status(200).redirect('/login')
}

