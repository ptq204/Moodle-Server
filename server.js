const schema = require('./schema/app');
const express = require('express');
const { ApolloServer, gql } = require('apollo-server-express');
const mongoose = require('mongoose');
const { applyMiddleware } = require('graphql-middleware');
const getUser = require('./config/auth');
const {DBURI, PORT} = require('./config/config');

mongoose.connect(DBURI);
mongoose.connection.once('open', () => {
    console.log('Connected to database');
});

const app = express();

app.get('/', (req, res) => {
    res.send('Moodle server')
});

const server = new ApolloServer({
    introspection: true,
    schema,
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