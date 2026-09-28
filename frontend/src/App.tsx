import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, PageId } from './components/Sidebar';

import { OverviewPage } from './pages/OverviewPage';
import { SupplierIntelligencePage } from './pages/SupplierIntelligencePage';
import { SupplierDetailPage } from './pages/SupplierDetailPage';
import { RiskObservatoryPage } from './pages/RiskObservatoryPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { ScenarioLabPage } from './pages/ScenarioLabPage';
import { CopilotPage } from './pages/CopilotPage';
import { IntelligenceFeedPage } from './pages/IntelligenceFeedPage';
import { ActionCenterPage } from './pages/ActionCenterPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { ReportsPage } from './pages/ReportsPage';
import { AgentActivityPage } from './pages/AgentActivityPage';
import { ModelEvalPage } from './pages/ModelEvalPage';

export const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | null>(null);

  const handleNavigate = (page: PageId, supplierId?: number) => {
    if (supplierId) {
      setSelectedSupplierId(supplierId);
    }
    setCurrentPage(page);
  };

  const handleSelectSupplier = (supplierId: number) => {
    setSelectedSupplierId(supplierId);
    setCurrentPage('suppliers'); // Will render detail sub-view if selectedSupplierId is set
  };

  const handleSimulateDisruption = (supplierId: number) => {
    setSelectedSupplierId(supplierId);
    setCurrentPage('scenario-lab');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* High-Density Top Navigation Bar */}
      <Navbar pendingActionsCount={3} />

      <div className="flex-1 flex overflow-hidden">
        {/* Enterprise Collapsible Sidebar */}
        <Sidebar
          currentPage={currentPage}
          onNavigate={(page) => {
            if (page === 'suppliers') {
              setSelectedSupplierId(null); // Reset detail view when clicking main directory
            }
            setCurrentPage(page);
          }}
          pendingActionsCount={3}
        />

        {/* Main Content Workspace Canvas */}
        <main className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {currentPage === 'overview' && (
            <OverviewPage
              onNavigate={(page, supId) => handleNavigate(page as PageId, supId)}
            />
          )}

          {currentPage === 'suppliers' && (
            selectedSupplierId ? (
              <SupplierDetailPage
                supplierId={selectedSupplierId}
                onBack={() => setSelectedSupplierId(null)}
                onSimulateDisruption={(id) => handleSimulateDisruption(id)}
              />
            ) : (
              <SupplierIntelligencePage
                onSelectSupplier={handleSelectSupplier}
              />
            )
          )}

          {currentPage === 'risk-observatory' && (
            <RiskObservatoryPage
              onSelectSupplier={handleSelectSupplier}
            />
          )}

          {currentPage === 'digital-twin' && (
            <DigitalTwinPage
              onSelectSupplier={handleSelectSupplier}
            />
          )}

          {currentPage === 'scenario-lab' && (
            <ScenarioLabPage
              initialSupplierId={selectedSupplierId || 1}
              onNavigateToActions={() => setCurrentPage('actions')}
            />
          )}

          {currentPage === 'copilot' && (
            <CopilotPage />
          )}

          {currentPage === 'intelligence' && (
            <IntelligenceFeedPage />
          )}

          {currentPage === 'actions' && (
            <ActionCenterPage />
          )}

          {currentPage === 'knowledge' && (
            <KnowledgeBasePage />
          )}

          {currentPage === 'reports' && (
            <ReportsPage />
          )}

          {currentPage === 'agent-activity' && (
            <AgentActivityPage />
          )}

          {currentPage === 'model-eval' && (
            <ModelEvalPage />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
