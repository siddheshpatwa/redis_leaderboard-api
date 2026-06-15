import { Router } from "express";
// import { register, login } from "./controllers/auth.controller";

import { addScore, getAllUsers, login,register,getLeaderboard,editScore,getRank, clearLeaderboard, deletePlayer } from "../controllers/auth.controller";
const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers);
router.post("/score", addScore);
router.get("/leaderboard", getLeaderboard);
// router.put("/score", editScore);
router.post("/score/rank", getRank);
router.delete( "/leaderboard",clearLeaderboard);
router.delete("/player", deletePlayer);
// router.get("/rank/:email", getRank);

export default router;