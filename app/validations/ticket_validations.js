
const { checkSchema } = require('express-validator');

exports.getTicketsByRoleValidations = checkSchema(
    {

        role: {
            in: ['body'],
            exists: {
                errorMessage: 'Role is required',
            },
            isIn: {
                options: [['ROLE_MANAGER', 'ROLE_ATTENDER', 'ROLE_ADMIN']],
                errorMessage: 'Invalid role specified'
            }
        },

        user_id: {
            in: ['body'],
            exists: {
                errorMessage: 'attender_id is required',
            },
        }

    }
)