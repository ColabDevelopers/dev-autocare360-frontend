Vehicle & Service Management frontend notes

This folder contains pages for customers to manage their vehicles and request services.

Data contracts (see `../types`):

- `CreateVehiclePayload` - vehicle registration payload
- `CreateServicePayload` - request service payload

Expected backend endpoints:

- GET /api/vehicles
- GET /api/vehicles/:id
- POST /api/vehicles
- PUT /api/vehicles/:id
- DELETE /api/vehicles/:id
- GET /api/vehicles/:id/services
- GET /api/services
- POST /api/services

Adjust `lib/vehicles.ts` and `lib/services.ts` if your backend uses a different path prefix.
