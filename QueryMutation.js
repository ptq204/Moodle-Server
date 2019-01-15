// Login

const ADD_GRADE = gql`
   mutation AddGrade(
       $courseid: String!,
       $gradename: String!,
       $weight: Float!,
       $max: Float!
   ){
       addGrade(
           courseid: $courseid,
           gradename: $gradename,
           weight: $weight,
           max: $max
       ){
           CourseID
           GradeItemName
           Weight
           Max
       }
   }
`;

const IMPORT_STUDENT_GRADE = gql`
   mutation ImportStudentGrade(
       $gradeid: String!,
       $studentid: String!,
       $studentname: String,
       $grade: Float!,
       $feedback: String){
           importStudentGrade(
               gradeid: $gradeid,
               studentid: $studentid,
               studentname: $studentname,
               grade: $grade,
               feedback: $feedback
               ){
               StudentID
               StudentName
               Grade
           }
       }
`
const EDIT_GRADE = gql`
   mutation EditGradeInfo(
           $courseid: String!,
           $gradeid: String!,
           $gradename: String,
           $weight: Float
           $max: Float
   ){
       modifyGradeInfo(
           courseid: $courseid
           gradeid: $gradeid,
           gradename: $gradename,
           weight: $weight,
           max: $max
       ){
           GradeItemName
           Weight
           Max
       }
   }
`;

const EDIT_STUDENT_GRADE = gql`
   mutation EditStudentGrade(
       $gradeid: String!,
       $courseid: String!,
       $studentid: String!,
       $newstudentid: String,
       $studentname: String,
       $grade: Float,
       $feedback: String
       ){
           modifyStudentGrade(
               gradeid: $gradeid,
               studentid: $studentid,
               newstudentid: $newstudentid,
               courseid: $courseid,
               studentname: $studentname,
               grade: $grade,
               feedback: $feedback){
                   StudentID
                   StudentName
                   Grade
                   Feedback
           }
       }
`;

const GRADE = gql`
   query Grade($gradeid: String!){
       grade(gradeid: $gradeid){
           GradeItemName
           GradeList{
               StudentID
               StudentName
               Grade
               Feedback
               Percentage
           }
       }
   }
`;