// Login
mutation{
    login(email: "dbtien@gmail.com", password:"123456")
}

// Create user - Admin does this
mutation{
    createUser(email:"dbtien@gmail.com", password: "123456"){
      UserID
      FirstName
      SurName
    }
}

// Update user - Admin does this
mutation{
    updateUser(userid:"4561012", firstname:"Dinh Ba", surname:"Tien"){
      UserID
      FirstName
      SurName
    }
}

// Students - Admin does this
{
    students{
      id
      UserID
      FirstName
      SurName
      Email
      Courses{
        CourseCode
        CourseName
      }
    }
}

// List all course
{
    courses{
      CourseCode
      CourseName
      Year
      Semester
      Participants{
        UserID
        FirstName
        SurName
        Email
      }
    }
  }

// Create new course (Teacher or Admin does this -> later)
mutation{
    createCourse(code:"CS300", name:"Software engineering", year:2018, semester:2){
      id
      CourseCode
      CourseName
      Year
      Semester
      Participants{
        UserID
        FirstName
        SurName
      }
    }
}

// Enroll course
mutation{
    enrollCourse(coursecode:"CS300", year:2018, semester:2){
      UserID
      FirstName
      SurName
      Courses{
        CourseCode
        CourseName
        Year
        Semester
      }
    }
}


// Leave a course
mutation{
	leaveCourse(coursecode:"CS300", year:2018, semester: 2){
		UserID
    FirstName
    SurName
  }
}


// View participants of a course
{
    viewParticipants(course_code:"CS320", year:2018, semester:1){
      UserID
      FirstName
      SurName
      Email
    }
}

// Modify score - Teacher | Admin does this
mutation{
    modifyGrade(userid:"1651022", coursecode: "CS300", year:2018, semester:2, assignment:10){
      CourseCode
      Assignment
      Midterm
      Final
    }
}