"use client";
import React, { useState } from "react";
import { Vehicle } from "@/types/vehicle";
import * as vehiclesApi from "@/lib/vehicles";
import { useVehicles } from "@/hooks/useVehicles";
import toast, { Toaster } from "react-hot-toast";

export default function VehiclesList() {
  const { vehicles, setVehicles } = useVehicles();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    make: "",
    model: "",
    year: "",
    plateNumber: "",
    color: "",
  });
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  // 🔹 ADD new vehicle
  const handleAdd = async () => {
  try {
    // backend requires VIN
    const payload = { 
      ...form, 
      year: Number(form.year),
      vin: crypto.randomUUID().replace(/-/g, "").slice(0, 17) // generate fake VIN
    };

    const newVehicle = await vehiclesApi.createVehicle(payload);
    setVehicles?.((prev) => [...prev, newVehicle]);

    toast.success("Vehicle added successfully! 🚗");
    closeModal();
  } catch (err) {
    console.error("Failed to add vehicle:", err);
    toast.error("Failed to add vehicle.");
  }
};

  // 🔹 UPDATE existing vehicle
  const handleUpdate = async () => {
    if (!editingVehicle) return;

    try {
      const payload = { ...form, year: Number(form.year) };
      const updatedVehicle = await vehiclesApi.updateVehicle(editingVehicle.id, payload);

      setVehicles?.((prev) =>
        prev.map((v) => (v.id === editingVehicle.id ? updatedVehicle : v))
      );

      toast.success("Vehicle updated successfully ✅");
      closeModal();
    } catch (err) {
      console.error("Failed to update vehicle:", err);
      toast.error("Failed to update vehicle.");
    }
  };

  // 🔹 DELETE vehicle
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await vehiclesApi.deleteVehicle(id);
      setVehicles?.((prev) => prev.filter((v) => v.id !== id));
      toast.success("Vehicle deleted successfully 🗑️");
    } catch (err) {
      console.error("Failed to delete vehicle:", err);
      toast.error("Failed to delete vehicle.");
    }
  };

  // 🔹 EDIT setup
  const handleEdit = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setForm({
      make: vehicle.make || "",
      model: vehicle.model || "",
      year: String(vehicle.year || ""),
      plateNumber: vehicle.plateNumber || "",
      color: vehicle.color || "",
    });
    setShowModal(true);
  };

  // 🔹 Helper to close modal & reset
  const closeModal = () => {
    setShowModal(false);
    setEditingVehicle(null);
    setForm({ make: "", model: "", year: "", plateNumber: "", color: "" });
  };

  return (
    <div className="p-4 text-white">
      <Toaster position="top-right" reverseOrder={false} />
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Your Vehicles</h1>
        <button
          onClick={() => {
            setEditingVehicle(null);
            setForm({ make: "", model: "", year: "", plateNumber: "", color: "" });
            setShowModal(true);
          }}
          className="bg-white hover:bg-gray-700 text-black font-medium py-2 px-4 rounded-lg shadow-md transition"
        >
          + Register Vehicle
        </button>
      </div>

      {/* Vehicle list */}
      <div className="space-y-3">
        {vehicles.map((v) => (
          <div
            key={v.id}
            className="bg-[#1a1a1a] p-4 rounded-lg flex justify-between items-center"
          >
            <div>
              <h2 className="font-semibold text-lg">
                {v.make} {v.model}
              </h2>
              <p>Year: {v.year}</p>
              <p>Plate: {v.plateNumber || "N/A"}</p>
              <p>Color: {v.color || "N/A"}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(v)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-1 px-3 rounded-lg"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(v.id)}
                className="bg-red-600 hover:bg-red-700 text-white py-1 px-3 rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Popup */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-[#222] p-6 rounded-2xl w-[400px] shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-white">
              {editingVehicle ? "Edit Vehicle" : "Add New Vehicle"}
            </h2>

            {/* Form */}
            <div className="space-y-4">
              {["make", "model", "year", "plateNumber", "color"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-gray-300 mb-1 capitalize">
                    {field === "plateNumber" ? "License Plate Number" : field}
                  </label>
                  <input
                    type={field === "year" ? "number" : "text"}
                    placeholder={`Enter ${field}`}
                    value={(form as any)[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full p-2 rounded-md bg-[#333] text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={closeModal}
                className="bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white"
              >
                Cancel
              </button>
              <button
                onClick={editingVehicle ? handleUpdate : handleAdd}
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white"
              >
                {editingVehicle ? "Update" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
