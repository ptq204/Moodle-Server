const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { TEACHER_ROLE, ADMIN_SECRET } = require('../config/config')
const Course = require('../schema/course');

const GradeItemSchema = new Schema({
  GradeID: String,
  StudentID: String,
  StudentName: String,
  Grade: {type: Number, default: 0},
  Feedback: String,
});

GradeItemSchema.statics.createGradeItem = async (args) => {

  try{
    
    objCreate = {GradeID: args.gradeid, StudentID: args.studentid, Grade: args.grade};

    if(args.feedback) objCreate.Feedback = args.feedback;
    if(args.studentname) objCreate.StudentName = args.studentname;

    const gradeitem = await new GradeItem(objCreate);
    return gradeitem.save();

  }catch(err){
    throw err;
  }
}

GradeItemSchema.statics.modifyStudentGrade = async (args, modifiers) => {

  try{

    const course = await Course.findById(args.courseid)
    if(!course){
      console.log('Cannot find course!');
      return null;
    }
    else{
      if(course.Participants.includes(modifiers._id) || modifiers.role === ADMIN_SECRET){

        var objUpdate = {};
        if(args.studentname) objUpdate.StudentName = args.studentname;
        if(args.newstudentid) objUpdate.StudentID = args.newstudentid;
        if(args.grade) objUpdate.Grade = args.grade;
        if(args.feedback) objUpdate.Feedback = args.feedback;

        return GradeItem.findOneAndUpdate(
            {GradeID: args.gradeid, StudentID: args.studentid}, 
            objUpdate, {'new': true},
            (err, obj) => {
              if(err){
                console.log('Cannot find this grade of student to update!');
                return null;
              }
              console.log('Modified successfully!');
              return obj;
            }
        )
      }
      else{
        console.log('This modifiers does not belong to this course!');
      }
    }
    return 
  }catch(err){
    throw err;
  }
}

const GradeItem = mongoose.model('GradeItem', GradeItemSchema);
module.exports = GradeItem;

