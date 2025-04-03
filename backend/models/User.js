const { DataTypes, Sequelize } = require('sequelize');
const bcrypt = require('bcryptjs');

const User = Sequelize.afterDefine('User', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false
    },
    rol: {
        type: DataTypes.STRING,
        defaultValue: 'USER'
    },
    fecha_registro: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        allowNull: false
    }
}, {
    tableName: 'usuarios',
    hooks: {
        beforeCreate: async (user) => {
            if(user.password){
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});
// Este metodo lo que hace es comparar las contraseñas
User.prototype.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
  };

module.exports = User;