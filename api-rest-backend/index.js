const express = require('express');
const cors = require('cors');

const connection = require("./database/conection")
console.log("conectado a colorfullchat")
connection();

const app = express();
const puerto = process.env.PORT || 5000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cargar conf rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);


app.listen(puerto, () => {
    console.log("ColorFullChat Funcionando en el Puerto:", puerto);
});