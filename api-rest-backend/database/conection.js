const mongoose = require("mongoose");

const connection = async () => {
    try {
        mongoose.set("strictQuery", false)
        await mongoose.connect("mongodb://localhost:27017/colorfullchat");
        console.log("Conectado a la Base de datos de ColorFullChat");
    } catch (error) {
        console.log(error)
        throw new Error("No se ha podido conectar a la base de datos")
    }
}
module.exports = connection;
