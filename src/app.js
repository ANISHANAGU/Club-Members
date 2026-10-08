const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));


// =======================
// MONGOOSE SCHEMA
// =======================

const memberSchema = new mongoose.Schema({
    memberId: {
        type: String,
        required: true,
        unique: true
    },

    name: {
        type: String,
        required: true
    },

    clubName: {
        type: String,
        required: true
    },

    year: {
        type: Number,
        required: true
    },

    role: {
        type: String,
        required: true
    },

    points: {
        type: Number,
        required: true
    },

    interests: {
        type: String
    },

    status: {
        type: String,
        required: true
    }
});

const Member = mongoose.model("Member", memberSchema);


// =======================
// MONGODB CONNECTION
// =======================

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");

        app.listen(process.env.PORT || 3000, () => {
            console.log("Server running on port 3000");
        });
    })
    .catch((error) => {
        console.log("MongoDB Connection Error:", error);
    });


// =======================
// HOME PAGE
// =======================

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


// =======================
// TASK 4
// ADD MEMBERS
// =======================

app.post("/add", async (req, res) => {
    try {
        const member = new Member(req.body);

        await member.save();

        res.json({
            message: "Member added successfully",
            member: member
        });

    } catch (error) {
        res.status(400).json({
            message: "Error adding member",
            error: error.message
        });
    }
});


// =======================
// TASK 5
// CLUB + POINTS
// =======================

app.get("/club", async (req, res) => {
    try {
        const members = await Member.find({
            clubName: req.query.club,
            points: { $gt: Number(req.query.points) }
        });

        res.json(members);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// TASK 6 + TASK 7
// SEARCH MEMBER BY ID
// DISPLAY SELECTED DETAILS
// =======================

app.get("/member/:memberId", async (req, res) => {
    try {
        const member = await Member.findOne({
            memberId: req.params.memberId
        }).select("name clubName role points -_id");

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.json(member);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// TASK 8
// UPDATE ROLE + POINTS
// =======================

app.put("/member/:memberId", async (req, res) => {
    try {
        const member = await Member.findOneAndUpdate(
            { memberId: req.params.memberId },
            {
                role: req.body.role,
                points: req.body.points
            },
            { new: true }
        );

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.json({
            message: "Member updated successfully",
            member: member
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// TASK 9
// INCREASE CLUB POINTS
// =======================

app.put("/club/:clubName/points", async (req, res) => {
    try {
        const increase = Number(req.body.increase);

        await Member.updateMany(
            { clubName: req.params.clubName },
            { $inc: { points: increase } }
        );

        res.json({
            message: "Points increased successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// TASK 10
// POINT RANGE
// =======================

app.get("/range", async (req, res) => {
    try {
        const members = await Member.find({
            points: {
                $gte: Number(req.query.min),
                $lte: Number(req.query.max)
            }
        });

        res.json(members);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// TASK 11
// DELETE MEMBER
// =======================

app.delete("/member/:memberId", async (req, res) => {
    try {
        const member = await Member.findOneAndDelete({
            memberId: req.params.memberId
        });

        if (!member) {
            return res.status(404).json({
                message: "Member not found"
            });
        }

        res.json({
            message: "Member deleted successfully"
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// =======================
// TASK 12
// ALL MEMBERS
// DESCENDING POINTS
// =======================

app.get("/members", async (req, res) => {
    try {
        const members = await Member.find()
            .sort({ points: -1 });

        res.json(members);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});