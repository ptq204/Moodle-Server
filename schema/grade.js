const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Course = require('../schema/course');
const { ADMIN_SECRET } = require('../config/config');

const GradeSchema = new Schema({
    CourseID: String,
    Weight: Number,
    Max: Number,
    GradeItemName: String,
    GradeList: [{}]
});

GradeSchema.statics.createGrade = async (courseid, gradename, weight, max) => {

    try{
        const grade = await new Grade({CourseID: courseid, GradeItemName: gradename, Weight: weight, Max: max});
        return grade.save();
    }catch(err){
        throw err;
    }
}

GradeSchema.statics.modifyGradeInfo = async (args, modifiers) => {

    try{
        const course = await Course.findById(args.courseid);

        if(!course){
            console.log('Cannot find this course!');
            return null;
        }
        else{
            if(course.Participants.includes(modifiers._id) || modifiers.role === ADMIN_SECRET){

                var objUpdate = {};

                if(args.gradename) objUpdate.GradeItemName = args.gradename;
                if(args.weight) objUpdate.Weight = args.weight;
								if(args.max) objUpdate.Max = args.max;

                return Grade.findOneAndUpdate(
                    {
                        _id: args.gradeid,
                    },
                    objUpdate, {'new': true}, (err, obj) => {
                    if(err){
                        console.log('Cannot find this grade to update');
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

GradeSchema.statics.modifyStudentGrade = async (args, modifiers) => {

    try{
        const course = await Course.findById(args.courseid)
        if(!course){
          console.log('Cannot find course!');
          return null;
        }
        else{
            if(course.Participants.includes(modifiers._id) || modifiers.role === ADMIN_SECRET){

                var objUpdate = {};
                if(args.grade) objUpdate['GradeList.$.Grade'] = args.grade;
                if(args.feedback) objUpdate['GradeList.$.Feedback'] = args.feedback;

                Grade.updateOne(
                    {_id: args.gradeid, 'GradeList.UserID': args.userid},
                    {$set: objUpdate},
                    {'new': true},
                    (err, obj) => {
                        if(err) throw err;
                        return obj;
                });
            }
            else{
                console.log('This modifiers does not belong to this course!');
            }
        }
        return null;
    }catch(err){
        throw err;
    }
}

GradeSchema.statics.removeGrade = async (courseid, userid) => {
    
    Grade.findOneAndRemove({CourseID: courseid}, (err)=>{
        if(err) throw err;
        console.log('Removed this grade!');
    });
}

const Grade = mongoose.model('Grade', GradeSchema);
module.exports = Grade;