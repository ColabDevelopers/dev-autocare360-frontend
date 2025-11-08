'use client'
import React, { useEffect, useState } from 'react'
import { useServices } from '@/hooks/useServices'
import { useRouter } from 'next/navigation'
import AddServiceModal from './AddServiceModal'
import EditServiceModal from './EditServiceModal'
import DeleteServiceModal from './DeleteServiceModal'
import { Service, CreateServicePayload } from '@/types/service'

export default function ServiceManagementPage() {
  const router = useRouter()
  const { services, stats, loading, error, updateService, deleteService, refresh } = useServices()

  const [searchTerm, setSearchTerm] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [serviceToEdit, setServiceToEdit] = useState<Service | null>(null)
  const [serviceToDelete, setServiceToDelete] = useState<Service | null>(null)

  // Debug logs
  useEffect(() => {
    console.log('Services:', services)
    console.log('Stats:', stats)
    console.log('Loading:', loading)
    console.log('Error:', error)
  }, [services, stats, loading, error])

  // Filter by name or type
  const filteredServices = services.filter(
    service =>
      String(service.serviceName ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      String(service.category ?? '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  if (loading && services.length === 0) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
        <div className="text-gray-400">Loading services...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
        <div className="text-red-500">Error: {error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      {/* Header */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Service Management</h1>
          <p className="text-gray-400">Manage service offerings, pricing, and availability</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition font-medium"
        >
          + Add Service
        </button>

        {showAddModal && (
          <AddServiceModal onClose={() => setShowAddModal(false)} onServiceAdded={refresh} />
        )}
      </div>

      {/* Stats Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Total Services</p>
            <p className="text-3xl font-bold">{stats.totalServices}</p>
            <p className="text-sm text-gray-400">{stats.activeServices} active</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Average Price</p>
            <p className="text-3xl font-bold">${stats.averagePrice.toFixed(2)}</p>
          </div>
          <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6">
            <p className="text-gray-400 text-sm mb-2">Average Duration</p>
            <p className="text-3xl font-bold">{stats.averageDuration.toFixed(1)} hr</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="mb-6 relative">
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gray-600"
        />
      </div>

      {/* Service Catalog Table */}
      <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg p-6 overflow-x-auto">
        <h2 className="text-xl font-bold mb-4">Service Catalog</h2>

        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2a2a2a]">
              <th className="text-left p-4 text-sm font-medium text-gray-400">Service Name</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Category</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Duration</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Price</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Status</th>
              <th className="text-left p-4 text-sm font-medium text-gray-400">Description</th>
              <th className="text-right p-4 text-sm font-medium text-gray-400">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredServices.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-500">
                  No services found
                </td>
              </tr>
            ) : (
              filteredServices.map(service => (
                <tr
                  key={service.id}
                  className="border-b border-[#2a2a2a] hover:bg-[#111] transition"
                >
                  <td className="p-4 text-white font-medium">{service.serviceName || '-'}</td>
                  <td className="p-4 text-gray-300 capitalize">{service.category || '-'}</td>
                  <td className="p-4 text-gray-300">
                    {service.duration ? `${service.duration} hr` : '-'}
                  </td>
                  <td className="p-4 text-gray-300">
                    {service.price ? `$${service.price.toFixed(2)}` : '-'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        service.status === 'active'
                          ? 'bg-green-500/10 text-green-500'
                          : service.status === 'inactive'
                            ? 'bg-red-500/10 text-red-500'
                            : 'bg-gray-500/10 text-gray-500'
                      }`}
                    >
                      {service.status?.charAt(0).toUpperCase() + service.status?.slice(1)}
                    </span>
                  </td>
                  <td className="p-4 text-gray-400 max-w-xs truncate">
                    {service.description ?? '-'}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => setServiceToEdit(service)}
                      className="text-gray-400 hover:text-white mr-4 text-sm transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setServiceToDelete(service)}
                      className="text-red-500 hover:text-red-400 text-sm transition"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Edit/Delete Modals */}
      {serviceToEdit && (
        <EditServiceModal
          service={serviceToEdit}
          onClose={() => setServiceToEdit(null)}
          onUpdated={refresh}
          updateService={async (id, data) => {
            // Convert id to string and data to CreateServicePayload type
            await updateService(String(id), data as Partial<CreateServicePayload>)
          }}
        />
      )}

      {serviceToDelete && (
        <DeleteServiceModal
          service={serviceToDelete}
          onClose={() => setServiceToDelete(null)}
          onDeleted={refresh}
          deleteService={async id => {
            // Convert id to string to match the hook's expected type
            await deleteService(String(id))
          }}
        />
      )}
    </div>
  )
}
