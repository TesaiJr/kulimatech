'use client';

import React, { useState } from 'react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface TabsProps {
  tabs: TabItem[];
  defaultTabId?: string;
  className?: string;
}

export function Tabs({ tabs, defaultTabId, className = '' }: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(defaultTabId || tabs[0]?.id || '');

  const currentTab = tabs.find((t) => t.id === activeTab);

  return (
    <div className={`w-full space-y-4 ${className}`}>
      {/* Tab Navigation List */}
      <div className="flex border-b border-secondary/20 space-x-2 overflow-x-auto pb-1">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-xl transition-all duration-200 border-b-2 whitespace-nowrap ${
                isActive
                  ? 'border-accent text-primary bg-muted/20 shadow-sm'
                  : 'border-transparent text-secondary/70 hover:text-primary hover:bg-muted/10'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="py-2 animate-in fade-in duration-200">{currentTab?.content}</div>
    </div>
  );
}
