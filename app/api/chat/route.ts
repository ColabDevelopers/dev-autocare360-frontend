import { convertToModelMessages, streamText, type UIMessage, tool } from "ai"
import { z } from "zod"

export const maxDuration = 30

// Mock appointment data
const mockAppointments = [
  { date: "2024-01-18", time: "10:00 AM", available: true, service: "Oil Change" },
  { date: "2024-01-18", time: "2:00 PM", available: false, service: "Brake Service" },
  { date: "2024-01-19", time: "9:00 AM", available: true, service: "Tire Rotation" },
  { date: "2024-01-19", time: "11:00 AM", available: true, service: "AC Service" },
  { date: "2024-01-20", time: "1:00 PM", available: true, service: "Engine Diagnostic" },
]

const checkAvailabilityTool = tool({
  description: "Check available appointment slots for automotive services",
  inputSchema: z.object({
    date: z.string().optional().describe("Preferred date in YYYY-MM-DD format"),
    serviceType: z.string().optional().describe("Type of service needed"),
    timePreference: z.enum(["morning", "afternoon", "any"]).optional().describe("Time preference"),
  }),
  execute: async ({ date, serviceType, timePreference }) => {
    let availableSlots = mockAppointments.filter((slot) => slot.available)

    if (date) {
      availableSlots = availableSlots.filter((slot) => slot.date === date)
    }

    if (serviceType) {
      availableSlots = availableSlots.filter((slot) => slot.service.toLowerCase().includes(serviceType.toLowerCase()))
    }

    if (timePreference === "morning") {
      availableSlots = availableSlots.filter((slot) => {
        const hour = Number.parseInt(slot.time.split(":")[0])
        return hour < 12
      })
    } else if (timePreference === "afternoon") {
      availableSlots = availableSlots.filter((slot) => {
        const hour = Number.parseInt(slot.time.split(":")[0])
        return hour >= 12
      })
    }

    return {
      availableSlots,
      totalFound: availableSlots.length,
      searchCriteria: { date, serviceType, timePreference },
    }
  },
})

const bookAppointmentTool = tool({
  description: "Book an appointment slot for automotive service",
  inputSchema: z.object({
    date: z.string().describe("Date in YYYY-MM-DD format"),
    time: z.string().describe("Time slot"),
    serviceType: z.string().describe("Type of service"),
    customerName: z.string().describe("Customer name"),
    vehicleInfo: z.string().describe("Vehicle information"),
  }),
  execute: async ({ date, time, serviceType, customerName, vehicleInfo }) => {
    // Simulate booking logic
    const bookingId = `BK-${Date.now()}`

    return {
      success: true,
      bookingId,
      confirmation: {
        date,
        time,
        serviceType,
        customerName,
        vehicleInfo,
        estimatedDuration: "2 hours",
        location: "AutoCare360 Center - Bay 3",
      },
    }
  },
})

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: "openai/gpt-4o",
    messages: convertToModelMessages(messages),
    system: `You are an AI assistant for an automobile service center. You help customers:
    
    1. Check available appointment slots
    2. Book appointments for various automotive services
    3. Provide information about services offered
    4. Answer questions about vehicle maintenance
    
    Services offered:
    - Oil Change (30 min)
    - Brake Service (1-2 hours)
    - Tire Rotation (45 min)
    - AC Service (1 hour)
    - Engine Diagnostic (2-3 hours)
    - Custom Modifications (varies)
    
    Be helpful, professional, and always confirm details before booking appointments.
    When showing available slots, format them clearly with date, time, and service type.
    Always ask for customer name and vehicle information before confirming a booking.`,
    tools: {
      checkAvailability: checkAvailabilityTool,
      bookAppointment: bookAppointmentTool,
    },
    maxSteps: 5,
  })

  return result.toUIMessageStreamResponse()
}
