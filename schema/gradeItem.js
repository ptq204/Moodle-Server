const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const { TEACHER_ROLE, ADMIN_SECRET } = require('../config/config')
const Course = require('../schema/course');

const GradeItemSchema = new Schema({
  UserID: String,
  GradeID: String,
  Grade: {type: Number, default: 0},
  Feedback: String,
});

GradeItemSchema.statics.createGradeItem = async (args) => {

  try{
    
    objCreate = {GradeID: args.gradeid, UserID: args.userid, Grade: args.grade};

    if(args.feedback) objCreate.Feedback = args.feedback;

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

        if(args.grade) objUpdate.Grade = args.grade;
        if(args.feedback) objUpdate.Feedback = args.feedback;

        return GradeItem.findOneAndUpdate(
            {GradeID: args.gradeid, UserID: args.userid}, 
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
        return null;
      }
    }
  }catch(err){
    throw err;
  }
}

const GradeItem = mongoose.model('GradeItem', GradeItemSchema);
module.exports = GradeItem;

