const { rule, shield, and, or, not } = require('graphql-shield');
const {STUDENT_ROLE, TEACHER_ROLE, ADMIN_SECRET} = require('../config/config');
const schema = require('../schema/app');

const isAuthenticated = rule()(async (parent, args, ctx, info) => {
    return ctx.user !== null;
})

const isAdmin = rule()(async (parent, args, ctx, info) => {
    return ctx.user.role === ADMIN_SECRET;
})

const isStudent = rule()(async (parent, args, ctx, info) => {
    return ctx.user.role === STUDENT_ROLE;
})

const isTeacher = rule()(async (parent, args, ctx, info) => {
    return ctx.user.role === TEACHER_ROLE;
})

const permissions = shield({
    RootQueryType: {
        students: and(isAuthenticated, isAdmin),
        user: and(isAuthenticated, isAdmin),
        teachers: and(isAuthenticated, isAdmin),
        viewParticipants: and(isAuthenticated, or(isAdmin, isStudent, isTeacher)),
        courses: and(isAuthenticated, or(isAdmin, isStudent, isTeacher)),
    },

    MutationType: {
        createUser: and(isAuthenticated, isAdmin),
        updateUser: and(isAuthenticated, or(isAdmin, isStudent, isTeacher)),
        enrollCourse: and(isAuthenticated, isStudent),
        assignUserToCourse: and(isAuthenticated, isAdmin),
        createCourse: and(isAuthenticated, isAdmin),
        modifyGrade: and(isAuthenticated, or(isAdmin, isTeacher))
    }
})

