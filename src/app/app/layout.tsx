'use client';

import React, { useState } from 'react';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { Topbar } from '@/components/layout/Topbar';
import { AiAssistantDrawer } from '@/components/ai/AiAssistantDrawer';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [isAiOpen, setIsAiOpen] = useState(false);

  return (
    <div className="flex h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white overflow-hidden print:block print:h-auto print:bg-white print:overflow-visible">
      {/* Agency Sidebar (Hidden during document print) */}
      <div className="print:hidden">
        <AppSidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden print:block print:overflow-visible">
        <div className="print:hidden">
          <Topbar onOpenAi={() => setIsAiOpen(true)} />
        </div>
        <main className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950 print:p-0 print:m-0 print:bg-white print:overflow-visible print:block">
          <div className="max-w-7xl mx-auto space-y-6 print:m-0 print:p-0 print:max-w-full">{children}</div>
        </main>
      </div>

      {/* AI Assistant Drawer (Hidden during document print) */}
      <div className="print:hidden">
        <AiAssistantDrawer isOpen={isAiOpen} onClose={() => setIsAiOpen(false)} />
      </div>
    </div>
  );
}
