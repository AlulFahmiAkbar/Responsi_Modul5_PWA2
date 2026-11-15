import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Explore from "./pages/Explore";
import ItemDetail from "./pages/ItemDetail";
import CreateReport from "./pages/CreateReport";
import EditReport from "./pages/EditReport";
import MyReports from "./pages/MyReports";
import Profile from "./pages/Profile";
import About from "./pages/About";
import { useReports } from "./hooks/useReports";

export default function App() {
  const { reports, create, update, remove } = useReports();
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard reports={reports} />} />
        <Route path="jelajah" element={<Explore reports={reports} />} />
        <Route path="barang/:id" element={<ItemDetail reports={reports} />} />
        <Route path="buat" element={<CreateReport create={create} />} />
        <Route path="edit/:id" element={<EditReport reports={reports} update={update} />} />
        <Route path="laporan-saya" element={<MyReports reports={reports} update={update} remove={remove} />} />
        <Route path="profil" element={<Profile />} />
        <Route path="tentang" element={<About />} />
        <Route path="*" element={<div className="empty">Halaman tidak ditemukan.</div>} />
      </Route>
    </Routes>
  );
}
