import { AIChatbot } from '@/components/ai-chatbot/chatbot'

export default function ChatPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">AI Assistant</h1>
        <p className="text-muted-foreground">Get help with appointments and service information</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">What I can help you with:</h2>
          <div className="space-y-3">
            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">🗓️ Check Availability</h3>
              <p className="text-sm text-muted-foreground">
                Ask me about available appointment slots for any date or service type.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try: "What appointments are available tomorrow morning?"
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">📅 Book Appointments</h3>
              <p className="text-sm text-muted-foreground">
                I can help you book appointments for various automotive services.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try: "Book an oil change for January 18th at 10 AM"
              </p>
            </div>

            <div className="p-4 border border-border rounded-lg">
              <h3 className="font-medium mb-2">🔧 Service Information</h3>
              <p className="text-sm text-muted-foreground">
                Get details about our services, pricing, and estimated durations.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Try: "How long does a brake service take?"
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Services Available:</h2>
          <div className="grid grid-cols-1 gap-3">
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Oil Change</span>
                <span className="text-sm text-muted-foreground">30 min</span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Brake Service</span>
                <span className="text-sm text-muted-foreground">1-2 hours</span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Tire Rotation</span>
                <span className="text-sm text-muted-foreground">45 min</span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">AC Service</span>
                <span className="text-sm text-muted-foreground">1 hour</span>
              </div>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="font-medium">Engine Diagnostic</span>
                <span className="text-sm text-muted-foreground">2-3 hours</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AIChatbot />
    </div>
  )
}
