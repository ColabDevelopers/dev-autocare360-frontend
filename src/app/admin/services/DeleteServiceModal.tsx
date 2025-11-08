'use client'
import React from 'react'
import { Service } from '@/types/service'
import toast from 'react-hot-toast'

interface Props {
  service: Service
  onClose: () => void
  onDeleted: () => void
  deleteService: (id: string | number) => Promise<void>
}

export default function DeleteServiceModal({ service, onClose, onDeleted, deleteService }: Props) {
  const handleDelete = async () => {
    try {
      await deleteService(String(service.id))
      toast.success(`Service "${service.serviceName}" deleted successfully`)
      onDeleted()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete service')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[#0a0a0a] p-6 rounded-lg w-96">
        <h2 className="text-xl font-bold mb-4">Delete Service</h2>
        <p>
          Are you sure you want to delete <strong>{service.serviceName}</strong>?
        </p>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 bg-gray-700 rounded">
            Cancel
          </button>
          <button onClick={handleDelete} className="px-4 py-2 bg-red-500 rounded">
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
