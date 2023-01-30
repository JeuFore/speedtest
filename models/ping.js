const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const ping = sequelize.define('ping',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            jitter: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            latency: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            low: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            high: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            avg: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            }
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        })

    return ping;
}