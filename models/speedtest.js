const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const speedtest = sequelize.define('speedtest',
        {
            id: {
                type: DataTypes.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            upload_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            download_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            ping_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            result_id: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            result_url: {
                type: DataTypes.STRING,
                allowNull: false,
            },
            server_id: {
                type: DataTypes.INTEGER,
                allowNull: false,
            }
        },
        {
            timestamps: true,
            createdAt: 'created_at',
            updatedAt: 'updated_at'
        })

    speedtest.associate = (models) => {
        speedtest.belongsTo(models.Server, { foreignKey: 'server_id', as: 'server' });
        speedtest.belongsTo(models.Download, { foreignKey: 'download_id', as: 'download' });
        speedtest.belongsTo(models.Upload, { foreignKey: 'upload_id', as: 'upload' });
        speedtest.belongsTo(models.Ping, { foreignKey: 'ping_id', as: 'ping' });
    }

    return speedtest
}