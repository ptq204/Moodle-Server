const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const Schema = mongoose.Schema;
const config = require('../config/config');

const StudentSchema = new Schema({
    FirstName: String,
    SurName: String,
    BirthDay: Date,
    Email: String,
    City: String,
    Country: String,
    Description: String,
    Role: String,
    Password: String
});

StudentSchema.statics.createStudent = async (email, password) => {

    try{
        const student_tmp = await Student.findOne({Email: email});

        if(student_tmp){
            console.log('This email was used');
            return null;
        }
        const student = await new Student({
            Email: email, 
            Password: password,
            Role: config.STUDENT_ROLE
        });
        student.Password = bcryptjs.hashSync(student.Password, 10);
        console.log('Created new student');
        return student.save();
    }catch(err){
        throw err;
    }
}

StudentSchema.statics.auth = async (email, password) => {

    try{
        const student = await Student.findOne({Email: email});

        if(!student){
            console.log('Cannot find student!');
            return null;
        }

        const verify = bcryptjs.compareSync(student.Password, password);

        if(!verify){
            console.log('Password is not match');
            return null;
        }

        const token = await jwt.sign({
            _id: student._id,
            email: student.Email,
            role: student.Role
        }, config.SECRET, {expiresIn: '2d', algorithm: 'RSA'});

        console.log('Authenticated successfully!');

        return token;

    }catch(err){
        throw err;
    }
}

StudentSchema.statics.removeStudent = async (ID) => {
    Student.findByIdAndRemove(ID, (err) => {
        if(err) throw err;
        console.log('Removed a student!');
    });
}

const Student = mongoose.model('Student', StudentSchema);
module.exports = Student;