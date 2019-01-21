const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const Schema = mongoose.Schema;
const config = require('../config/config');
const Grade = require('../schema/grade');
const Course = require('../schema/course');
const { STUDENT_ROLE, TEACHER_ROLE, ADMIN_SECRET } = require('../config/config');

const UserSchema = new Schema({
    UserID: String,
    FullName: String,
    BirthDay: Date,
    Email: String,
    City: String,
    Country: String,
    Description: String,
    Role: String,
    Password: String,
    Courses: [String],
    Grades: [String]
});

UserSchema.statics.createUser = async (email, password, role) => {

    try{
        const user_tmp = await User.findOne({Email: email});

        if(user_tmp){
            console.log('This email was used');
            return null;
        }
        const user = await new User({
            Email: email, 
            Password: password,
            Role: role
        });

        var salt = (Math.random() * 20) + 1;

        user.Password = await bcryptjs.hashSync(user.Password, salt);
        console.log('Created new user');
        return user.save();
    }catch(err){
        throw err;
    }
}

UserSchema.statics.auth = async (email, password) => {

    try{
        const user = await User.findOne({Email: email});

        if(!user){
            console.log('Cannot find student!');
            return null;
        }

        const verify = await bcryptjs.compare(password, user.Password);

        if(!verify){
            console.log('Password is not match');
            return null;
        }

        const token = await jwt.sign({
            _id: user._id,
            userid: user.UserID,
            email: user.Email,
            role: user.Role
        }, config.SECRET, {expiresIn: '2d', algorithm: 'HS256'});

        console.log('Authenticated successfully!');

        return token;

    }catch(err){
        throw err;
    }
}

UserSchema.statics.updateUser = async (id, args) => {

    //id, userid, firstname, surname, brithday, email, city, country, description 

    var objUpdate = {};

    if(args.userid) objUpdate.UserID = args.userid;
    if(args.fullname) objUpdate.FullName = args.fullname;
    if(args.brithday) objUpdate.BirthDay = args.brithday; // consider this later
    if(args.email) objUpdate.Email = args.email;
    if(args.city) objUpdate.City = args.city;             // consider this later
    if(args.country) objUpdate.Country = args.country;    // consider this later
    if(args.description) objUpdate.Description = args.description;

    if(args.fullname){
        const grade = Grade.updateMany({UserID: id}, {StudentName: args.fullname}, (err, obj) => {
            if(err) return null;
            return obj;
        });
    }
    
    return User.findByIdAndUpdate(id, objUpdate, {'new': true}, (err, obj) => {
        if(err){
            console.log('Cannot update user!');
            console.log(err);
            return null;
        }
        console.log('Updated user info successfully!');
        return obj;
    });
}

UserSchema.statics.removeUser = async (ID) => {
    const course = Course.updateMany({Participants: {$all: [ID]}}, {$pull: {Participants: ID}}, (err, obj) => {
        if(err) return null;
        return obj;
    });
    const grade = Grade.remove({UserID: ID}, (err, obj) => {
        if(err) return null;
        return obj;
    });
    User.findByIdAndRemove(ID, (err) => {
        if(err) throw err;
        console.log('Removed a student!');
    });
}

const User = mongoose.model('User', UserSchema);
module.exports = User;