"use client";
import React, { useState } from "react";
import { Service } from "@/types/service";
import toast from 'react-hot-toast';

interface Props {
  service: Service;
  onClose: () => void;
  onUpdated: () => void;
  updateService: (id: string | number, data: Partial<Service>) => Promise<void>;
}

export default function EditServiceModal({ service, onClose, onUpdated, updateService }: Props) {
  const [form, setForm] = useState({
    serviceName: service.serviceName || "",
    category: service.category || "",
    duration: service.duration || 0,
    price: service.price || 0,
    status: service.status || "inactive",
    description: service.description || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      await updateService(service.id, { ...form, duration: Number(form.duration), price: Number(form.price) });
      toast.success(`Service "${form.serviceName}" updated successfully`);
      onUpdated();
      onClose();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update service");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Edit Service</h2>

        <input name="serviceName" value={form.serviceName} onChange={handleChange} placeholder="Service Name" className="w-full p-2 mb-2 rounded bg-[#111]" />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="w-full p-2 mb-2 rounded bg-[#111]" />
        <input name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="Duration" className="w-full p-2 mb-2 rounded bg-[#111]" />
        <input name="price" type="number" value={form.price} onChange={handleChange} placeholder="Price" className="w-full p-2 mb-2 rounded bg-[#111]" />
        <select name="status" value={form.status} onChange={handleChange} className="w-full p-2 mb-2 rounded bg-[#111]">
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="w-full p-2 mb-2 rounded bg-[#111]" />

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">Cancel</button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-green-500 rounded">Save</button>
        </div>
      </div>
    </div>
  );
}
