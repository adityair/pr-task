import Department from "../models/DepartmentModel.js";

export const getDepartments = async(req, res) =>{
    try {
        const response = await Department.findAll();
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({msg: error.message});
    }
}


export const createDepartment = async (req, res) => {
    const { name } = req.body;
  
    if (!name || name.trim() === "") {
      return res.status(400).json({ msg: "Nama departemen wajib diisi" });
    }
  
    try {
      const department = await Department.create({ name });
      res.status(201).json({
        msg: "Departemen berhasil ditambahkan",
        uuid: department.uuid,
        name: department.name
      });
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  };