import User from "../models/UserModel.js";
import { Op } from "sequelize";
import jwt from 'jsonwebtoken';

export const verifyUser = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Ambil token dari "Bearer <token>"

    if (!token) {
        return res.status(401).json({msg: "Mohon login ke akun Anda! Token tidak ditemukan"});
    }
    
    try {
        // Verifikasi token
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        // Tambahkan validasi UUID
        if (!decoded.uuid) {
            return res.status(401).json({msg: "Token tidak valid - UUID tidak ditemukan"});
        }
        
        // Cari user berdasarkan data dari token
        const user = await User.findOne({
            where: {
                uuid: decoded.uuid
            }
        });

        if (!user) {
            return res.status(404).json({msg: "User tidak ditemukan"});
        }
        
        // Set data user ke request
        req.userId = user.uuid;
        req.role = user.role;
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({msg: "Token tidak valid!"});
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({msg: "Token sudah expired!"});
        } else {
            return res.status(500).json({msg: "Error verifikasi token"});
        }
    }
};

export const adminOnly = async (req, res, next) =>{
    const user = await User.findOne({
        where: {
            uuid: req.userId,
            role: "admin"
        }
    });
    if(!user) return res.status(404).json({msg: "User tidak ditemukan"});
    if(user.role !== "admin") return res.status(403).json({msg: "Akses terlarang"});
    next();
}