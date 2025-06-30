import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const Index = () => {

  const [users, setUsers] = useState([]);

  const token = localStorage.getItem('token');
  console.log("🚀 ~ Index ~ token:", token)

  // const getUsers = async () => {
  //   const response = await axios.get(process.env.REACT_APP_API_URL + "api/users", {
  //     withCredentials: true
  //   });

  //   console.log(response.data);

  //   // setUsers(response.data);
  // };

  // const deleteUser = async (userId) => {
  //   const token = localStorage.getItem('token');
  //   await axios.delete(process.env.REACT_APP_API_URL + `api/users/${userId}`, {
     
  //     withCredentials: true
  //   });
  //   getUsers();
  // };

  // useEffect(() => {
  //   getUsers();
  // }, []);

  return (<></>
    // <div>
    //   <h1 className="title">Users</h1>
    //   <Link to="/users/add" className="button mb-4">
    //     <div style={{ display: 'flex', alignItems: 'center' }}>
    //       <img src="/gif/add.gif" alt="add icon" width="24" height="24" style={{ marginRight: '8px' }} />
    //       Add New
    //     </div>
    //   </Link>
    //   <table className="table is-striped is-fullwidth">
    //     <thead>
    //       <tr>
    //         <th>No</th>
    //         <th>Name</th>
    //         <th>Email</th>
    //         <th>Role</th>
    //         <th>Actions</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {users.map((user, index) => (
    //         <tr key={index} >
    //           <td>{index + 1}</td>
    //           <td>{user.name}</td>
    //           <td>{user.email}</td>
    //           <td>{user.role}</td>
    //           <td>
    //             <Link
    //               to={`/users/edit/${user.uuid}`}
    //               className="button is-small is-info"
    //             >
    //               Edit
    //             </Link>
    //             <button
    //               onClick={() => deleteUser(user.uuid)}
    //               className="button is-small is-danger"
    //             >
    //               Delete
    //             </button>
    //           </td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
  );
};

  export default Index;
