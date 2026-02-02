module.exports = (sequelize, Sequelize) => {

    const OTP_table = sequelize.define(
        "OTP",
        {

            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            otp: {
                type: Sequelize.INTEGER,
            },
            phone_number: {
                type: Sequelize.BIGINT,
            },
            user_id: {
                type: Sequelize.INTEGER,
            }
        },
        {
            timestamps: true, // Since created_at and updated_at are manually defined
            tableName: 'otp'
        }
    );

    // OTP_table.associate = (models) => {};

    return OTP_table;

}