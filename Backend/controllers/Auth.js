import User from "../models/UserModel.js";
import argon2 from "argon2";
import Department from '../models/DepartmentModel.js';
import jwt from "jsonwebtoken";

export const Login = async (req, res) =>{
    try {
        const user = await User.findOne({
            where: {
                email: req.body.email
            }
        });

        if(!user) return res.status(400).json({status: false, message: "User tidak ditemukan"});
        const match = await argon2.verify(user.password, req.body.password);
        if(!match) return res.status(400).json({status: false, message: "Password salah"});
        
        const payload = {
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role: user.role,
            departmentId: user.departmentId
        }
        
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {expiresIn: process.env.JWT_EXPIRES});
        
        res.status(200).json({status: true, token, user: payload});
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({status: false, message: "Terjadi kesalahan server"});
    }
}

export const Me = async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({status: false, message: "Mohon login ke akun Anda."});
    }
    
    try {
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        
        if (!decoded.uuid) {
            return res.status(401).json({status: false, message: "Token tidak valid - UUID tidak ditemukan"});
        }
        
        const user = await User.findOne({
            attributes: ['uuid', 'name', 'email', 'role'],
            where: {
                uuid: decoded.uuid
            },
            include: [{
                model: Department,
                attributes: ['name'],
                as: 'department'
            }]
        });
        
        
        if (!user) {
            return res.status(404).json({status: false, message: "User tidak ditemukan"});
        }

        const response = {
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department.name
        };

        res.status(200).json({status: true, user: response});
        
    } catch (error) {
        console.error('Me error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({status: false, message: "Token tidak valid!"});
        } else if (error.name === 'TokenExpiredError') {
            return res.status(401).json({status: false, message: "Token sudah expired!"});
        } else {
            return res.status(500).json({status: false, message: "Error verifikasi token"});
        }
    }
};

export const logOut = async (req, res) => {
    try {
        // Hapus session dari database
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    console.error('Session destroy error:', err);
                    return res.status(400).json({status: false, message: "Tidak dapat logout"});
                }
            });
        }

        res.status(200).json({status: true, message: "Anda telah logout"});
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({status: false, message: "Terjadi kesalahan saat logout"});
    }
};