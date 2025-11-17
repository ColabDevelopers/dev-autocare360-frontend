'use client'
import React, { useState } from 'react'
import { createService } from '@/lib/services'
import { toast } from 'react-hot-toast'

export default function AddServiceModal({
  onClose,
  onServiceAdded,
}: {
  onClose: () => void
  onServiceAdded: () => void
}) {
  const [form, setForm] = useState({
    name: '',
    type: '',
    price: '',
    duration: '',
    notes: '',
    status: 'active',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await createService({
        vehicleId: 1, // or dynamically pick from selected vehicle later
        name: form.name,
        type: form.type,
        price: parseFloat(form.price),
        duration: parseFloat(form.duration),
        notes: form.notes,
        status: form.status,
      })

      toast.success(`Service "${form.name}" added successfully!`)
      onServiceAdded()
      onClose()
    } catch (err) {
      console.error('Error creating service:', err)
      toast.error('Failed to add service')
      setError('Failed to create service')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-6 w-full max-w-md text-white">
        <h2 className="text-xl font-bold mb-4">Add New Service</h2>

        {error && <div className="text-red-500 mb-2 text-sm">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-400">Service Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter service name"
              required
              className="w-full p-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">Category</label>
            <input
              type="text"
              name="type"
              value={form.type}
              onChange={handleChange}
              placeholder="Enter service type"
              required
              className="w-full p-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-400">Duration (hrs)</label>
              <input
                type="number"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                placeholder="Estimated duration"
                step="0.1"
                required
                className="w-full p-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-400">Price ($)</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Price"
                required
                className="w-full p-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange as any}
              className="w-full p-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
            >
              <option value="active" className="bg-[#222] text-white">
                Active
              </option>
              <option value="inactive" className="bg-[#222] text-white">
                Inactive
              </option>
              <option value="requested">Requested</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-400">Notes</label>
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Enter description"
              rows={3}
              className="w-full p-2 bg-[#111] border border-[#2a2a2a] rounded-lg text-white"
            />
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition"
            >
              {loading ? 'Adding...' : 'Add Service'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
