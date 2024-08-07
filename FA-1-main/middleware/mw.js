const jwt = require('jsonwebtoken')

const auth= (req,res,next) => {
    
        // grab token from cookie
        const token = req.cookies.token
        // if no token,stop there
        if(!token){
            res.status(403).send('PLEASE LOGIN FIRST')
        }
        // decode that token and get id
        try{
            const decode=jwt.verify(token,'shhhhh')
            console.log(decode)
       

            req.user= decode
        }catch(error){
           console.log(error);
          return res.status(401).send('Invalid Token')

        }
        
         
    
      
        
          return next()
        }
        
  


module.exports= auth