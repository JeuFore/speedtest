const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const server = sequelize.define('server',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            country: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            location: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            host: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            port: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ip: {
                type: DataTypes.STRING,
                allowNull: false,
            }
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        })

    return server
}