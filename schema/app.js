const graphql = require('graphql');
const graphql_iso_date = require('graphql-iso-date');
const Course = require('../schema/course');
const Student = require('../schema/student');
const Teacher = require('../schema/teacher');
const User = require('../schema/user');
const Grade = require('../schema/grade');
const config = require('../config/config');

const {
    GraphQLObjectType,
    GraphQLID,
    GraphQLString,
    GraphQLFloat,
    GraphQLList,
    GraphQLNonNull,
    GraphQLInt,
    GraphQLSchema,
    GraphQLEnumType,
} = graphql

const { GraphQLDate } = graphql_iso_date

const SemesterType = new GraphQLEnumType({
    name: 'Semester',
    values: {
        summer: {value: 0},
        fall  : {value: 1},
        winter: {value: 2},
        spring: {value: 3}
    }
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: () => ({
        id: {type: GraphQLID},
        UserID: {type: GraphQLString}, // MSSV/MSGV
        Class: {type: GraphQLString},
        FullName: {type: GraphQLString},
        BirthDay: {type: GraphQLDate},
        Email: {type: GraphQLString},
        City: {type: GraphQLString},
        Country: {type: GraphQLString},
        Description: {type: GraphQLString},
        Role: {type: GraphQLString},
        Courses: {
            type: new GraphQLList(new GraphQLNonNull(CourseType)),
            resolve(parent, args){
                return Course.find({Participants: {$all: [parent.id]}});
            }
        }
    })
});

const GradeType = new GraphQLObjectType({
    name: 'Grade',
    fields: () => ({
        UserID: {type: GraphQLString},
        CourseID: {type: GraphQLString},
        StudentName: {type: GraphQLString},
        StudentID: {type: GraphQLString},
        Assignment: {type: GraphQLFloat},
        Midterm: {type: GraphQLFloat},
        Final: {type: GraphQLFloat}
    })
});

const CourseType = new GraphQLObjectType({
    name: 'Course',
    fields: () => ({
        id: {type: GraphQLID},
        CourseCode: {type: GraphQLString},
        CourseName: {type: GraphQLString},
        Year: {type: GraphQLInt},
        Semester: {type: SemesterType},

        Grades:{
            type: new GraphQLList(new GraphQLNonNull(GradeType)),
            resolve(parent, args, context){
                if(context.user.role === config.STUDENT_ROLE){
                    return Grade.find(
                        {
                            UserID: context.user._id,
                            CourseID: parent.id
                        }, (err, obj) => {
                            if(err) return null;
                            return obj;
                        });
                }
                else if(context.user.role === config.TEACHER_ROLE || context.user.role === config.ADMIN_SECRET){
                    return Grade.find({CourseID: parent.id});
                }
            }
        },
        
        Teacher: {
            type: new GraphQLList(new GraphQLNonNull(UserType)),
            resolve(parent, args){
                return User.find(
                    {Role: config.TEACHER_ROLE, Courses: {$all: [parent.CourseCode]}},
                );
            }
        },
        Learners: {
            type: new GraphQLList(new GraphQLNonNull(UserType)),
            resolve(parent, args){
                return User.find({Role: config.STUDENT_ROLE, Courses: {$all: [parent.CourseCode]}});
            }
        },
        Participants: {
            type: new GraphQLList(new GraphQLNonNull(UserType)),
            resolve(parent, args){
               return User.find({Courses: {$all: [parent.id]}});
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        students: {
            type: new GraphQLList(new GraphQLNonNull(UserType)),
            args: {
                class: {type: GraphQLString}
            },
            resolve(parent, args, context){
                if(args.class){
                    return User.find({Class: args.class, Role: config.STUDENT_ROLE});
                }
                else{
                    return User.find({Role: config.STUDENT_ROLE});
                }
            }
        },

        user: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)},
            },
            resolve(parent, args){
                return User.findById(args.id);
            }
        },

        teachers: {
            type: new GraphQLList(new GraphQLNonNull(UserType)),
            resolve(parent, args, context){
                return User.find({Role: config.TEACHER_ROLE});
            }
        },

        viewParticipants: {
            type: new GraphQLList(new GraphQLNonNull(UserType)),
            args: {
                courseid: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args, context){

                return User.find({
                    Courses: {
                        $all: [ args.courseid ]
                    }
                });
            }
        },

        courses: {
            type: new GraphQLList(new GraphQLNonNull(CourseType)),
            resolve(parent, args, context){
                if(context.user.role === config.TEACHER_ROLE){
                    return Course.find({Participants: {$all: [context.user._id]}});
                }
                return Course.find({});
            }
        },

        course: {
            type: CourseType,
            args: {
                courseid: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args){
                return Course.findById(args.courseid);
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'MutationType',
    fields: {

        login: {
            type: GraphQLString,
            args: {
                email: {type: new GraphQLNonNull(GraphQLString)},
                password: {type: new GraphQLNonNull(GraphQLString)}
            },
            resolve(parent, args){
                return User.auth(args.email, args.password);
            }
        },

        createUser: {
            type: UserType,
            args: {
                email: {type: GraphQLString},
                password: {type: GraphQLString},
                role: {type: GraphQLString}
            },
            resolve(parent, args){
                return User.createUser(args.email, args.password, args.role);
            }
        },

        // change id to context.user.id later
        updateUser: {
            type: UserType,
            args: {
                id: {type: GraphQLID},
                userid: {type: GraphQLString},
                fullname: {type: GraphQLString}, 
                birthday: {type: GraphQLDate}, 
                email: {type: GraphQLString}, 
                city: {type: GraphQLString}, 
                country: {type: GraphQLString}, 
                description: {type: GraphQLString}
            },
            resolve(parent, args, context){
                var id = '';
                if(context.user.role === config.STUDENT_ROLE || context.user.role === config.TEACHER_ROLE){
                    id = context.user._id;
                }
                else if(context.user.role === config.ADMIN_SECRET){
                    id = args.id;
                }
                return User.updateUser(id, args);
            }
        },

        removeUser: {
            type: UserType,
            args: {
                id: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args, context){
                return User.removeUser(args.id);
            }
        },

        // change id to context.user.id later
        enrollCourse: {
            type: UserType,
            args: {
                courseid: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args, context){
                
                if(context.user.role === config.STUDENT_ROLE){
                    const user = User.findById(context.user._id, (err, obj) => {
                        if(err) return null;
                        Grade.createGrade(args.courseid, context.user._id, obj.FullName, obj.UserID);
                    });
                }
                return Course.findByIdAndUpdate(
                    args.courseid,
                    {$addToSet: {Participants: context.user._id}},
                    {'new': true},
                    (err1, course) => {
                        if(err1) throw err1;
                        return User.update(
                            {_id: context.user._id},
                            {$addToSet: {Courses: args.courseid}},
                            {'new': true},
                            (err2, user2) => {
                                if(err2) throw err2;
                                return user2;
                        });
                });
            }
        },

        assignUserToCourse: {
            type: UserType,
            args: {
                courseid: {type: new GraphQLNonNull(GraphQLID)},
                userid: {type: new GraphQLNonNull(GraphQLID)}
            },
            resolve(parent, args, context){
								
                if(context.user.role === config.ADMIN_SECRET){
                    return Course.findByIdAndUpdate(
                        args.courseid,
                        {$addToSet: {Participants: args.userid}},
                        {'new': true},
                        (err, course) => {
                            if(err) throw err;
                            console.log(`Added user to course`);
                            return User.update(
                                {_id: args.userid},
                                {$addToSet: {Courses: args.courseid}},
                                {'new': true},
                                (err2, user) => {
                                    if(err2) throw err2;
                                    console.log(`Added course to user course list`);
                                    return user;
                                }
                            );
                        }
                    );
                }
                return null;
            }
        },
        // Change this later
        leaveCourse: {
            type: UserType,
            args: {
                courseid: {type: GraphQLID}
            },
            resolve(parent, args, context){
                
                Grade.removeGrade(args.courseid, context.user.userid);
                return Course.findByIdAndUpdate(
                    args.courseid,
                    {$pull: {Participants: context.user.userid}},
                    {'new': true},
                    (err1, course) => {
                        if(err1) throw err1;
                        return User.update(
                            {_id: context.user._id},
                            {$pull: {Courses: args.courseid}},
                            {'new': true},
                            (err2, user2) => {
                                if(err2) throw err2;
                                return user2;
                        });
                });
            }
        },

        modifyGrade: {
            type: GradeType,
            args: {
                userid: {type: new GraphQLNonNull(GraphQLString)},
                courseid: {type: new GraphQLNonNull(GraphQLString)},
                assignment: {type: GraphQLFloat},
                midterm: {type: GraphQLFloat},
                final: {type: GraphQLFloat}
            },
            resolve(parent, args, context){
                return Grade.modifyGrade(args, context.user);
            }
        },

        createCourse: {
            type: CourseType,
            args: {
                code: {type: new GraphQLNonNull(GraphQLString)}, 
                name: {type: new GraphQLNonNull(GraphQLString)}, 
                year: {type: new GraphQLNonNull(GraphQLInt)},
                semester: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve(parent, args){
                return Course.createCourse(args.code, args.name, args.year, args.semester);
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
});

/*const StudentType = new GraphQLObjectType({
    name: 'Student',
    fields: () => ({
        ID: {type: GraphQLID},
        Class: {type: GraphQLString},
        FirstName: {type: GraphQLString},
        SurName: {type: GraphQLString},
        BirthDay: {type: GraphQLDate},
        Email: {type: GraphQLString},
        City: {type: GraphQLString},
        Country: {type: GraphQLString},
        Description: {type: GraphQLString},
        Role: {type:  GraphQLString},
        Courses: {
            type: new GraphQLList(new GraphQLNonNull(CourseType)),
            resolve(parent, args){
                const courses = Course.find({});
                var arr_courses = [];
                for(let i = 0; i < courses.length; i++){
                    const learners = courses[i].Learners;
                    for(let j = 0; j < learners.length; j++){
                        if(learners[i].ID === parent.ID){
                            arr_courses.push(courses[i]);
                            break;
                        }
                    }
                }
                return arr_courses;
            }
        }
    })
});

const TeacherType = new GraphQLObjectType({
    name: 'Teacher',
    fields: () => ({
        ID: {type: GraphQLID},
        FirstName: {type: GraphQLString},
        SurName: {type: GraphQLString},
        Email: {type: GraphQLString},
        Role: {type: GraphQLString},
        Courses: {
            type: new GraphQLList(new GraphQLNonNull(CourseType)),
            resolve(parent, args){
                const courses = Course.find({});
                var arr_courses = [];
                for(let i = 0; i < courses.length; i++){
                    const lecturer = courses[i].Lecturer;
                    if(lecturer.ID === parent.ID){
                        arr_courses.push(courses[i]);
                        break;
                    }
                }
                return arr_courses;
            }
        }
    })
});*/
