require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const errorMiddleware = require("./src/middleware/errorHandling");

const router = require("./src/routes/places");
const { default: mongoose } = require("mongoose");

const PATH_TO_UPLOADS = path.join(__dirname, "/assets/uploads");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/uploads", express.static(PATH_TO_UPLOADS));

if (process.env.NODE_ENV === "development") {
    app.use(cors({
        credentials: true,
        origin: ["http://127.0.0.1:5173", "http://127.0.0.1:5174", "http://localhost:5173", "http://localhost:5174"]
    }));
} else {
    app.use(
        cors({
            credentials: true,
            origin: "https://cheery-gumdrop-619967.netlify.app",
        })
    );
}

mongoose
    .connect(process.env.MONGO_URL)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((error) => {
        console.log("Error connecting to MongoDB", error);
    });

app.use(errorMiddleware);
app.use("/", router);

app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;

    res.status(statusCode).json({
        error: {
            message: err.message || "Internal serrver error.",
        },
    });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}...`));
