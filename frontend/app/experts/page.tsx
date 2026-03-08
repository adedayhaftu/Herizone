import { ChatbotWidget } from '@/components/chatbot-widget';
import { ExpertsPage } from '@/components/experts-page';
import { Footer } from '@/components/footer';
import { Navbar } from '@/components/navbar';

export default function Experts() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="flex-1">
        <ExpertsPage />
      </div>
      <Footer />
      <ChatbotWidget />
    </div>
  );
}
