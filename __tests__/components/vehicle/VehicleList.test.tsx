// Test scaffolding placeholder: your project doesn't include a test runner or testing-library
// as devDependencies yet. Keep this file as a scaffold and install test deps before
// enabling tests (e.g. `npm i -D @testing-library/react @testing-library/jest-dom vitest`)

// Export a small mock dataset so other dev utilities can import it while tests are
// not yet configured.
import { Vehicle } from '@/src/types/vehicle'

export const mockVehicles: Vehicle[] = [
  { id: '1', userId: 'u1', make: 'Toyota', model: 'Camry', year: 2020, createdAt: '', updatedAt: '', vin: 'VIN1' },
]

export default mockVehicles
