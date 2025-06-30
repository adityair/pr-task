import User from "../models/UserModel.js";
import Department from "../models/DepartmentModel.js";
import argon2 from "argon2";

export const getUsers = async(req, res) =>{
    try {
        // Ambil query dari request
        const { role, department } = req.query;
        console.log("🚀 ~ getUsers ~ role:", role)
        console.log("🚀 ~ getUsers ~ department:", department)
        const where = {};

        if (role) where.role = role;
        if (department) {
            // Cari departmentId dari nama department
            const dept = await Department.findOne({ where: { name: department } });
            if (dept) where.departmentId = dept.id;
            else return res.status(404).json({ msg: "Department tidak ditemukan" });
        }

        const response = await User.findAll({
            attributes:['uuid','name','email','role','departmentId'],
            where,
            include: [{
                model: Department,
                attributes: ['name'],
                as: 'department'
            }]
        });
        
        // Transform response untuk menampilkan department langsung
        const transformedResponse = response.map(user => ({
            uuid: user.uuid,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department.name
        }));
        
        res.status(200).json(transformedResponse);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const getUserById = async(req, res) =>{
    try {
        const response = await User.findOne({
            attributes:['uuid','name','email','role','departmentId'],
            include: [
                {
                  model: Department,
                  attributes: ['name'],
                  as: 'department'
                }
              ],
            where: {
                uuid: req.params.uuid
            }
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}

export const createUser = async(req, res) =>{
    const {name, email, password, confPassword, role, departmentId} = req.body;
    if(password !== confPassword) return res.status(400).json({msg: "Password dan Confirm Password tidak cocok"});
    const hashPassword = await argon2.hash(password);
    try {
        await User.create({
            name: name,
            email: email,
            password: hashPassword,
            role: role,
            departmentId: departmentId
        });
        res.status(201).json({msg: "Register Berhasil"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}

export const updateUser = async(req, res) =>{

    const user = await User.findOne({
        attributes:['uuid','name','email','role','departmentId'],
        where: {
            uuid: req.params.uuid
        }
    });


    if(!user) return res.status(404).json({msg: "User tidak ditemukan"});
    const {name, email, password, confPassword, role, departmentId} = req.body;
    if(password || confPassword){
        if(password !== confPassword){
            return res.status(400).json({msg: "Password dan Confirm Password tidak cocok"});
        }
        if(password.length < 6){
            return res.status(400).json({msg: "Password minimal 6 karakter"});
        }
    }

    let hashPassword = user.password;
    if(password){
        hashPassword = await argon2.hash(password);
    }
    try {
        await User.update({
            name: name,
            email: email,
            password: hashPassword,
            role: role,
            departmentId: departmentId
        },{
            where:{
                uuid: user.uuid
            }
        });

        
        res.status(200).json({msg: "User Updated"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}

export const deleteUser = async(req, res) =>{
    const user = await User.findOne({
        where: {
            uuid: req.params.uuid
        }
    });
    if(!user) return res.status(404).json({msg: "User tidak ditemukan"});
    try {
        await User.destroy({
            where:{
                uuid: user.uuid
            }
        });
        res.status(200).json({msg: "User Deleted"});
    } catch (error) {
        res.status(400).json({msg: error.message});
    }
}