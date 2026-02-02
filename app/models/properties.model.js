module.exports = (sequelize, Sequelize) => {
    const Property = sequelize.define("Property", {
        id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: Sequelize.STRING
        },
        user_role: {
            type: Sequelize.INTEGER
        },
        address_1: {
            type: Sequelize.STRING
        },
        address_2: {
            type: Sequelize.STRING
        },
        city: {
            type: Sequelize.STRING
        },
        state_id: {
            type: Sequelize.INTEGER
        },
        zip_code: {
            type: Sequelize.STRING
        },
        contact_person: {
            type: Sequelize.STRING
        },
        contact_no: {
            type: Sequelize.STRING
        },
        contact_email: {
            type: Sequelize.STRING
        },
        status: {
            type: Sequelize.SMALLINT
        },
        food_url: {
            type: Sequelize.STRING
        },
        breakfast_date: {
            type: Sequelize.DATE
        },
        breakfast_menu: {
            type: Sequelize.TEXT
        },
        lunch_date: {
            type: Sequelize.DATE
        },
        lunch_menu: {
            type: Sequelize.TEXT
        },
        dinner_date: {
            type: Sequelize.DATE
        },
        dinner_menu: {
            type: Sequelize.TEXT
        },
        food_created_by: {
            type: Sequelize.INTEGER
        },
        created_by: {
            type: Sequelize.INTEGER
        },
        updated_by: {
            type: Sequelize.INTEGER
        },
        is_deleted: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        qrcode_url: {
            type: Sequelize.TEXT
        },
        qrcode_encoded_link: {
            type: Sequelize.TEXT
        },
    }, {
        timestamps: true, // Since created_at and updated_at are manually defined
        tableName: 'properties'
    });

    Property.associate = (models) => {
        Property.hasMany(models.tickets, {
            foreignKey: 'property_id'
        });
    };


    return Property;
};