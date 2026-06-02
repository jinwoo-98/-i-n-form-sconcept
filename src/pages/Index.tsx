"use client";

import React, { useState } from 'react';
import BookingForm from '@/components/booking/BookingForm';
import SuccessView from '@/components/booking/SuccessView';
import SettingsView from '@/components/booking/SettingsView';
import BookingHeader from '@/components/booking/BookingHeader';
import { MadeWithDyad } from "@/components/made-with-dyad";

const Index = () => {
  const [view, setView] = useState<'form' | 'success' | 'settings'>('form');
  const [submittedData, setSubmittedData] = useState<any>(null);

  const handleSuccess = (data: any) => {
    setSubmittedData(data);
    setView('success');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-container h-[100dvh] overflow-hidden bg-vugia-cream flex flex-col font-sans selection:bg-vugia-navy selection:text-vugia-cream">
      <div className="flex-1 flex flex-col w-full max-w-2xl mx-auto px-4 py-2 md:py-4 overflow-hidden h-full min-h-0">
        {view !== 'settings' && (
          <div className="mobile-hide-on-focus flex-shrink-0">
            <BookingHeader />
          </div>
        )}

        <div className="flex-1 min-h-0 w-full overflow-hidden">
          {view === 'form' && (
            <BookingForm
              onSuccess={handleSuccess}
              onOpenSettings={() => setView('settings')}
            />
          )}

          {view === 'success' && (
            <div className="h-full overflow-y-auto rounded-[24px] md:rounded-[32px] shadow-xl bg-white scrollbar-hide">
              <SuccessView
                data={submittedData}
                onReset={() => setView('form')}
              />
            </div>
          )}

          {view === 'settings' && (
            <div className="h-full overflow-y-auto rounded-[24px] md:rounded-[32px] shadow-xl bg-white scrollbar-hide">
              <SettingsView
                onClose={() => setView('form')}
              />
            </div>
          )}
        </div>

        <div className="flex-shrink-0 mt-1 pb-1 opacity-60 hover:opacity-100 transition-opacity">
          <MadeWithDyad />
        </div>
      </div>
    </div>
  );
};

export default Index;