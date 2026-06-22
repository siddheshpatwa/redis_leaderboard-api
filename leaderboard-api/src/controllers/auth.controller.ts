
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { redis } from "../config/redis";
import { scoreQueue } from "../queue/score.queue";
import { pool } from "../config/db";


//  module.exports.
//  const login = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { email, password } = req.body;

//     const userData = await redis.get(`user:${email}`);

//     if (!userData) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const user = JSON.parse(userData);

//     const isMatch = await bcrypt.compare(
//       password,
//       user.password
//     );

//     if (!isMatch) {
//       return res.status(401).json({
//         success: false,
//         message: "Invalid credentials",
//       });
//     }

//     const token = jwt.sign(
//       {
//         email: user.email,
//       },
//       process.env.JWT_SECRET as string,
//       {
//         expiresIn: "1d",
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       token,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query(
      `
      SELECT *
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user.id,
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: "1d",
      }
    );

    return res.status(200).json({
      success: true,
      token,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};


//  const register = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const { name, email, password } = req.body;

//     if (!name || !email || !password) {
//       return res.status(400).json({
//         success: false,
//         message: "All fields are required",
//       });
//     }

//     const userExists = await redis.get(`user:${email}`);

//     if (userExists) {
//       return res.status(409).json({
//         success: false,
//         message: "User already exists",
//       });
//     }

//     const hashedPassword = await bcrypt.hash(password, 10);

//     const user = {
//       name,
//       email,
//       password: hashedPassword,
//     };

//     await redis.set(
//       `user:${email}`,
//       JSON.stringify(user)
//     );

//     return res.status(201).json({
//       success: true,
//       message: "User registered successfully",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };


const register = async (
  req: Request,
  res: Response
) => {
  try {
    console.log("Register request body:", req.body);
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingUser = await pool.query(
      `
      SELECT id
      FROM users
      WHERE email = $1
      `,
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    await pool.query(
      `
      INSERT INTO users
      (name,email,password,score)
      VALUES($1,$2,$3,$4)
      `,
      [
        name,
        email,
        hashedPassword,
        0,
      ]
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
// const getAllUsers = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const keys = await redis.keys("user:*");

//     const users = await Promise.all(
//       keys.map(async (key) => {
//         const user = await redis.get(key);
//         return user ? JSON.parse(user) : null;
//       })
//     );

//     return res.status(200).json({
//       success: true,
//       count: users.length,
//       users,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

// const addScore = async (req: Request, res: Response) => {
//   try {
//     const { email, score } = req.body;
//         await scoreQueue.add("update-score", {
//       email,
//       score,
//     });

//     const userData = await redis.get(`user:${email}`);

//     if (!userData) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found",
//       });
//     }

//     const user = JSON.parse(userData);

//     const newScore = (user.score || 0) + Number(score);

//     // update user object (optional, for profile)
//     user.score = newScore;

//     await redis.set(`user:${email}`, JSON.stringify(user));

//     // THIS is the important part 👇
//     await redis.zadd("leaderboard", newScore, email);

//     return res.status(200).json({
//       success: true,
//       message: "Score updated",
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };


const getAllUsers = async (
  req: Request,
  res: Response
) => {
  try {

    const result = await pool.query(
      `
      SELECT
        id,
        name,
        email,
        score,
        created_at
      FROM users
      ORDER BY id DESC
      `
    );

    return res.status(200).json({
      success: true,
      count: result.rows.length,
      users: result.rows,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

const addScore = async (req: Request, res: Response) => {
  try {
    const { email, score } = req.body;

    await scoreQueue.add("update-score", {
      email,
      score: Number(score),
    });

    return res.status(200).json({
      success: true,
      message: "Score update queued",
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const topUsers = await redis.zrevrange(
      "leaderboard",
      0,
      req.query.limit ? Number(req.query.limit) - 1 : 9,
      "WITHSCORES"
    );
    // console.log("Top Users:", req.query.limit);

    // convert flat array → structured format
    const result = [];

    for (let i = 0; i < topUsers.length; i += 2) {
      result.push({
        email: topUsers[i],
        score: Number(topUsers[i + 1]),
      });
    }

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error fetching leaderboard:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

 const editScore = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, newScore } = req.body;

    const userData = await redis.get(`user:${email}`);

    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = JSON.parse(userData);

    const oldScore = user.score || 0;

    user.score = Number(newScore);

    await redis.set(
      `user:${email}`,
      JSON.stringify(user)
    );

    await redis.zadd("leaderboard", Number(newScore), email);

    return res.status(200).json({
      success: true,
      message: "Score updated successfully",
      oldScore,
      newScore,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

 const getRank = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body as { email: string };

    const rank = await redis.zrevrank(
      "leaderboard",
      email
    );

    if (rank === null) {
      return res.status(404).json({
        success: false,
        message: "User not found in leaderboard",
      });
    }

    const score = await redis.zscore(
      "leaderboard",
      email
    );

    return res.status(200).json({
      success: true,
      email,
      rank: rank + 1, // Redis rank starts from 0
      score,
    });
  } catch (error) {
    console.error("Error fetching rank:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

 const clearLeaderboard = async (
  req: Request,
  res: Response
) => {
  try {
    const deletedCount = await redis.del("leaderboard");

    return res.status(200).json({
      success: true,
      message: "Leaderboard cleared successfully",
      deletedCount,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

 const deletePlayer = async (
  req: Request,
  res: Response
) => {
  try {
    const { email } = req.body;

    const removed = await redis.zrem(
      "leaderboard",
      email
    );

    return res.status(200).json({
      success: true,
      removed,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};



// const getRank = async (
//   req: Request,
//   res: Response
// ) => {
//   try {
//     const email = req.params.email as string;

//     const rank = await redis.zrevrank(
//       "leaderboard",
//       email
//     );

//     if (rank === null) {
//       return res.status(404).json({
//         success: false,
//         message: "User not found in leaderboard",
//       });
//     }

//     const score = await redis.zscore(
//       "leaderboard",
//       email
//     );

//     return res.status(200).json({
//       success: true,
//       email,
//       rank: rank + 1,
//       score,
//     });
//   } catch (error) {
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };
export { register, login, getAllUsers, addScore, getLeaderboard, editScore, getRank, clearLeaderboard ,deletePlayer };
