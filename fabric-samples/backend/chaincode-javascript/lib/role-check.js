'use strict';
const { ClientIdentity } = require('fabric-shim');

async function checkRole(ctx, role) {
    try {
        const clientObject = new ClientIdentity(ctx);
        const userRoles = clientObject.getAttributeValue('role');

        if (!userRoles) { // null check
            throw new Error('Access denied! User has no registered roles');
        }

        if (userRoles.includes(role)) {
            return true;
        }
        else {
            throw new Error(`Access denied! Insufficient permissions. Current role: ${userRoles} | Required role: ${role}`);
        }
    } catch (error) {
        console.error('An error occurred in checkRole:', error.message);
        throw error;
    }
}

async function checkRBAC(ctx, roles) {
    const clientObject = new ClientIdentity(ctx);
    const userRoles = clientObject.getAttributeValue('role');

    if (!userRoles) {
        throw new Error('Access denied! User has no registered roles.');
    }
    const hasRequiredRole = roles.some(role => userRoles.includes(role));

    if (hasRequiredRole) {
        return true;
    } else {
        throw new Error(`Access denied! Insufficient permissions. User roles: ${userRoles} | Required roles: ${roles.join(', ')}`);
    }
}


async function checkDoctorRole(ctx) {
    return await checkRole(ctx, 'doctor');
}

async function checkPatientRole(ctx) {
    return await checkRole(ctx, 'patient');
}

async function checkAsstDoctorRole(ctx) {
    return await checkRole(ctx, 'assistant_doctor');
}

async function checkReceptionistRole(ctx) {
    return await checkRole(ctx, 'receptionist');
}

async function checkCF1Role(ctx){
    const roles = ['role1', 'role2', 'role3', 'role4', 'role5', 'role6', 'role7', 'role8', 'role9', 'role10'];
    return await checkRBAC(ctx, roles);
}

async function checkCF2Role(ctx){
    const roles = ['role11', 'role12', 'role13', 'role14', 'role15', 'role16', 'role17', 'role18', 'role19', 'role20'];
    return await checkRBAC(ctx, roles);
}

async function checkCF3Role(ctx){
    const roles = ['role21', 'role22', 'role23', 'role24', 'role25', 'role26', 'role27', 'role28', 'role29', 'role30'];
    return await checkRBAC(ctx, roles);
}

async function checkCF4Role(ctx){
    const roles = ['role31', 'role32', 'role33', 'role34', 'role35', 'role36', 'role37', 'role38', 'role39', 'role40'];
    return await checkRBAC(ctx, roles);
}

async function checkCF5Role(ctx){
    const roles = ['role41', 'role42', 'role43', 'role44', 'role45', 'role46', 'role47', 'role48', 'role49', 'role50'];
    return await checkRBAC(ctx, roles);
}


module.exports = {
    checkPatientRole,
    checkDoctorRole,
    checkAsstDoctorRole,
    checkReceptionistRole,
    checkCF1Role,
    checkCF2Role,
    checkCF3Role,
    checkCF4Role,
    checkCF5Role
};