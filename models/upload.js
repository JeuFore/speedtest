const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const upload = sequelize.define('upload',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            bytes: {
                type: DataTypes.BIGINT,
                allowNull: false,
            },
            bandwidth: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            elapsed: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            latency_iqm: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            latency_jitter: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            latency_low: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            latency_high: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            },
            latency_avg: {
                type: DataTypes.DECIMAL,
                allowNull: false,
            }
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        })

    return upload;
}