const schema = require('./schema/app');
const express = require('express');
const multer = require('multer');
const bodyParser = require('body-parser');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const { applyMiddleware } = require('graphql-middleware');
const authorization = require('./permissions/authorize');
const getUser = require('./config/auth');
const {DBURI, PORT} = require('./config/config');

mongoose.connect(DBURI);
mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

const app = express();
app.use(express.static('uploads'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', "*"); //My frontend APP domain
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Access-Control-Allow-Origin, enctype');
    next();
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, `./uploads/profile/`);
    },
    filename: (req, file, cb) => {
        cb(null, `${req.body.UserID + '.' + file.mimetype.split('/')[1]}`);
    }
});

/*const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }
    else{
        cb(null, false);
    }
}*/

const upload = multer({
    storage: storage,
});

app.get('/', (req, res) => {
    res.send('Moodle server')
});

app.post('/upload', upload.single('UserProfileImage'), (req, res) => {
    console.log(req.file);
    
    res.send(req.file.path);
});

const SchemaWithPermission = applyMiddleware(schema, authorization);

const server = new ApolloServer({
    introspection: true,
    schema: SchemaWithPermission,
    context: ({req}) => {
        const token = req.headers.authorization;
        const auth_token = token ? token.split(' ')[1] : '';
        const user = getUser(auth_token);
        if(!user){
            console.log('Authenticated fail!');
            return {user: null};
        }
        console.log('User: ' + user);
        return {user: JSON.parse(user)};
    }
});

server.applyMiddleware({ app, path: '/graphql'});

app.listen(PORT, () => {
    console.log(`Apollo server listen on http://localhost:${PORT}/graphql`);
});