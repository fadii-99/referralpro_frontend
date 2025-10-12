import React from "react";
import { Outlet } from "react-router-dom";
import AdminNavbar from "../adminComponents/AdminNavbar";

const AdminParent: React.FC = () => {
  return (
    <div className="w-full max-h-screen">
      <AdminNavbar />
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default AdminParent;
