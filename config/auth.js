const jwt = require('jsonwebtoken');
const {STUDENT_ROLE, TEACHER_ROLE, SECRET} = require('../config/config');

const getUser = (token) => {

    console.log('Token: ' + token);

    verifyOptions = {
        expiresIn: '2d',
        algorithm: ['HS256']
    }

    try{
        const verify = jwt.verify(token, SECRET, verifyOptions);
        const data = JSON.stringify(verify);
        return data;

    }catch(err){
        console.log(err);
        return null;
    }
}

module.exports = getUser;