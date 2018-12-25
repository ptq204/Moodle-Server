const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const Schema = mongoose.Schema;
const config = require('../config/config');

const TeacherSchema = new Schema({

    FirstName: String,
    SurName: String,
    Email: String,
    Role: String,
    Password: String
});

TeacherSchema.statics.createTeacher = async(email, password) => {

    try{
        const teacher_tmp = await Teacher.findOne({Email: email});

        if(teacher_tmp){
            console.log('This email was used');
            return null;
        }
        const teacher = await new Teacher({
            Email: email, 
            Password: password,
            Role: config.TEACHER_ROLE
        });
        teacher.Password = bcryptjs.hashSync(teacher.Password, 10);
        console.log('Created new teacher');
        return teacher.save();
    }catch(err){
        throw err;
    }
}

TeacherSchema.statics.auth = async(email, password) => {

    try{

        const teacher = Teacher.findOne({Email: email});

        if(!teacher){
            console.log('Cannot find an account!');
            return null;
        }

        const verify = bcryptjs.compare(teacher.Password, password);

        if(!verify){
            console.log('Password is not match');
            return null;
        }

        const token = await jwt.sign({
            _id: Teacher._id,
            email: email,
            role: config.TEACHER_ROLE
        }, config.SECRET, {expiresIn: '2d', algorithm: 'RSA'});

        console.log('Authenticated successfully!');

        return token;

    }catch(err){
        throw err;
    }
}

TeacherSchema.statics.removeTeacher = async (ID) => {
    Teacher.findByIdAndRemove(ID, (err) => {
        if(err) throw err;
        console.log('Removed a teacher!');
    });
}

const Teacher = mongoose.model('Teacher', TeacherSchema);
module.exports = Teacher;