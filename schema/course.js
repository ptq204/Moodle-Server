const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
const Schema = mongoose.Schema;
const config = require('../config/config');

const CourseSchema = new Schema({
    CourseCode: String,
    CourseName: String,
    Year: Number,
    Semester: Number,
    Participants: [String]
});

CourseSchema.statics.createCourse = async (code, name, year, semester) => {

    try{
        const course_tmp = await Course.findOne({CourseCode: code, Semester: semester, Year: year});

        if(course_tmp){
            console.log('This course has been created! ' + course_tmp);
            return null;
        }

        const course = await new Course({CourseCode: code, CourseName: name, Year: year, Semester: semester});

        console.log('Created new course!');

        return course.save();
    }catch(err){
        throw err;
    }
}

const Course = mongoose.model('Course', CourseSchema);
module.exports = Course;