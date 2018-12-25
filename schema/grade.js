const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Course = require('../schema/course');
const { ADMIN_SECRET } = require('../config/config');

const GradeSchema = new Schema({
    UserID: String,
    StudentName: String,
    StudentID: String,
    CourseID: String,
    Assignment: {type: Number, default: 0},
    Midterm: {type: Number, default: 0},
    Final: {type: Number, default: 0},
});

GradeSchema.statics.createGrade = async (courseid, userid, name, studentid) => {

    try{

        const grade = await new Grade({UserID: userid, CourseID: courseid, StudentName: name, StudentID: studentid});
        grade.save();

    }catch(err){
        throw err;
    }
}

GradeSchema.statics.modifyGrade = async (args, modifiers) => {

    try{
        const course = await Course.findById(args.courseid);

        if(!course){
            console.log('Cannot find this course!');
            return null;
        }
        else{
            if(course.Participants.includes(modifiers._id) || modifiers.role === ADMIN_SECRET){

                var objUpdate = {};

                if(args.assignment) objUpdate.Assignment = args.assignment;
                if(args.midterm) objUpdate.Midterm = args.midterm;
                if(args.final) objUpdate.Final = args.final;

                return Grade.findOneAndUpdate(
                    {
                        CourseID: args.courseid,
                        UserID: args.userid
                    },
                    objUpdate, {'new': true}, (err, obj) => {
                    if(err){
                        console.log('Cannot find userid/course to update');
                        return null;
                    }
                    else{
                        console.log('Modified successfully!');
                        return obj;
                    }
                });
            }
            else{
                console.log('This teacher does not belong to this course!');
                return null;
            }
        }        
   }catch(err){
        console.log(err);
        return null;
    }
}

GradeSchema.statics.removeGrade = async (courseid, userid) => {
    
    Grade.findOneAndRemove({CourseID: courseid, UserID: userid}, (err)=>{
        if(err) throw err;
        console.log('Removed student grade!');
    });
}

const Grade = mongoose.model('Grade', GradeSchema);
module.exports = Grade;