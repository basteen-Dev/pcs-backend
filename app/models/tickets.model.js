module.exports = (sequelize, Sequelize) => {
    const Ticket = sequelize.define("tickets", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        phone_no: {
            type: Sequelize.STRING
        },
        room_no: { 
            type: Sequelize.STRING
        },
        department_cat_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'departments',
                key: 'id'
            },
        },
        service_type_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'servicetypes',
                key: 'id'
            },
        },
        discription: {
            type: Sequelize.STRING
        },
        attender_description: {
            type: Sequelize.STRING
        },
        feedback_image: {
            type: Sequelize.TEXT
        },
        completion_image: {
            type: Sequelize.TEXT,
            allowNull: true,
        },

        ticket_date: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW, // Automatically set to the current timestamp
            allowNull: false
        },
        status: {
            type: Sequelize.INTEGER
        },
        manager_id: {
            type: Sequelize.INTEGER
        },
        property_id: {
            type: Sequelize.INTEGER,
            references: {
                model: 'properties',
                key: 'id'
            },
        },
        attender_id: {
            type: Sequelize.INTEGER
        },
    }, {
        timestamps: true, // Since created_at and updated_at are manually defined
        tableName: 'tickets'
    });

    return Ticket;
};