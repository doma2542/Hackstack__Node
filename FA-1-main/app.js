
require("./db/db").connect()
const {User,Question,Answer} = require('./models/user')
const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const cookieParser = require("cookie-parser")
const auth = require('./middleware/mw')
const app = express()
app.set('view engine', 'ejs');
app.use(express.static('./public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser())
app.get("/", (req, res) => {
    res.redirect('login')
})
app.get("/login", (req, res) => {
    res.render("login")
}
)
app.get("/register", (req, res) => {
    res.render("register")
}
)
app.post("/register", async (req, res) => {
    try {
        // Get all data from body
        const { username, email, password } = req.body;

        // All the data should exist
        if (!(username && email && password)) {
            // return res.status(400).send('All fields are compulsory');
            return res.status(400).json({
                success: false,
                msg: "All fields are compulsory"
            })
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                msg: "Username is already taken"
            })

        }

        // Encrypt the password
        const myEncPassword = await bcrypt.hash(password, 10);

        // Save the user in db
        const user = await User.create({ username, email, password: myEncPassword });

        // Generate a token for user and send it
        const token = jwt.sign(
            {
                id: user._id,
                email: user.email,
                username:user.username
            },
            "shhhhh",
            {
                expiresIn: "2h"
            }
        );
        user.token = token;
        user.password = undefined;
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };
        res.cookie('token', token, options);

        res.status(201).json({
            success: true,
            redirect: "dashboard"
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            msg: "An error occurred"
        })

    }
});
app.post('/login', async (req, res) => {
    try {
        // Get email and password from the request body
        const { email, password } = req.body;

        // Validate presence of email and password
        if (!email || !password) {
            return res.status(400).json({ success: false, msg: "Both email and password are required" });
        }

        // Find user in database
        const user = await User.findOne({ email });

        // If user does not exist
        if (!user) {
            return res.status(400).json({ success: false, msg: "User does not exist" });
        }

        // Verify password
        if (user && await bcrypt.compare(password, user.password)) {
            // Generate JWT token
            const token = jwt.sign(
                { id: user._id, email: user.email,username:user.username },
                "shhhhh",
                { expiresIn: "2h" }
            );

            // Set token in cookie
            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            };
            res.cookie('token', token, options);

            return res.status(200).json({ success: true, redirect: "/dashboard" });
        } else {
            return res.status(400).json({ success: false, msg: "Wrong Password" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "An error occurred" });
    }
});



app.get("/dashboard", auth, async (req, res) => {
const username = req.user.username

    const questions =await  Question.find().sort().populate('postedBy','username')
    res.render('dashboard',{username,questions, loggedInUser: req.user})

}
)




app.get('/question',auth,(req,res) => {
  res.render('question')
}
)
app.post('/question',auth, async (req,res) => {
    try {const userId= req.user.id;
    const {title,description}=req.body;
    const newQuestion = new Question({
        title,description,postedBy:userId
    });
await newQuestion.save();
res.redirect('/dashboard')

    }
catch(error){

console.log(error)

}
  
}
)

app.post('/answer', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const { questionId, answerText } = req.body;
        
        const newAnswer = new Answer({
            answerText,
            question: questionId,
            postedBy: userId
        });

        await newAnswer.save();
        res.redirect('/dashboard');
    } catch (error) {
        console.error(error);
        res.status(500).send('Server Error');
    }
});

app.get('/:questionId',async (req,res) => {
    try{
const questionId = req.params.questionId;
const question= await Question.findById(questionId).populate('postedBy', 'username');
const answers = await Answer.find({ question: questionId }).populate('postedBy', 'username');
res.render('details',{question,answers})}
catch(error){
console.log(error)
}

  }
  )

  app.get('/:questionId/answer',async (req,res) => {
    try{
const questionId = req.params.questionId;
const question= await Question.findById(questionId).populate('postedBy', 'username');
const answers = await Answer.find({ question: questionId }).populate('postedBy', 'username');
res.render('answer',{question,answers})}
catch(error){
console.log(error)
}

  }
  )

  app.get('/profile/:userId', auth, async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

  
        const questions = await Question.find({ postedBy: userId }).sort({ datePosted: -1 });
        const answers = await Answer.find({ postedBy: userId }).populate('question').sort({ datePosted: -1 });

        res.render('profile', { user, questions, answers });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/logout', (req, res) => {
    
    res.clearCookie('token');
    res.status(200).send('Logged out successfully');
});

const PORT = 3000
app.listen(PORT, () => {
    console.log(`SERVER is running at port: ${PORT}`);
})

