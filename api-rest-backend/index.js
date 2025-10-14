const express = require('express');
const cors = require('cors');

const connection = require("./database/conection");
console.log("conectado a colorfullchat");
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
const AuthRoutes = require("./routes/auth");
const AdminRoutes = require("./routes/admin")
const ReportRoutes = require("./routes/report");
const BuzzonRoutes = require('./routes/buzzon');
const LikeRoutes = require("./routes/like");
const CommentRoutes = require("./routes/comment");
const FriendRoutes = require("./routes/friend");

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes);
app.use("/api/auth", AuthRoutes);
app.use("/api/admin", AdminRoutes);
app.use("/api/report", ReportRoutes);
app.use('/api/buzzon', BuzzonRoutes);
app.use("/api/like", LikeRoutes);
app.use("/api/comment", CommentRoutes);
app.use("/api/friend", FriendRoutes);

app.listen(puerto, () => {
    console.log("ColorFullChat Funcionando en el Puerto:", puerto);
});
