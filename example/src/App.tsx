import { useState } from 'react';
import FlowEditor from './FlowEditor';
import ErdEditor from './ErdEditor';
import ShapesDemo from './ShapesDemo';
import CustomEdgesDemo from './CustomEdgesDemo';
import InteractionsDemo from './InteractionsDemo';

const PAGES = [
  { id: 'flow', label: '🔀 Flow Editor', component: FlowEditor },
  { id: 'erd', label: '🗄️ ERD', component: ErdEditor },
  { id: 'shapes', label: '🔷 Shapes', component: ShapesDemo },
  { id: 'edges', label: '〰️ Custom Edges', component: CustomEdgesDemo },
  { id: 'interactions', label: '🖱️ Interactions', component: InteractionsDemo },
] as const;

export default function App() {
  const [page, setPage] = useState('flow');
  const current = PAGES.find((p) => p.id === page)!;
  const Page = current.component;

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Sidebar nav */}
      <nav style={{ width: 200, background: '#111827', display: 'flex', flexDirection: 'column', padding: '16px 0' }}>
        <div style={{ padding: '0 16px 16px', fontSize: 14, fontWeight: 700, color: '#fff', borderBottom: '1px solid #374151' }}>
          ⬡ IntelliCore Canvas
        </div>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
          {PAGES.map((p) => (
            <button
              key={p.id}
              onClick={() => setPage(p.id)}
              style={{
                padding: '10px 16px',
                background: page === p.id ? '#1f2937' : 'transparent',
                border: 'none',
                borderLeft: page === p.id ? '3px solid #3b82f6' : '3px solid transparent',
                color: page === p.id ? '#fff' : '#9ca3af',
                fontSize: 13,
                textAlign: 'left',
                cursor: 'pointer',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 'auto', padding: '12px 16px', fontSize: 11, color: '#6b7280' }}>
          v0.1.0 • Examples
        </div>
      </nav>
      {/* Page content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <header style={{ padding: '10px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 14, fontWeight: 600, color: '#374151' }}>
          {current.label}
        </header>
        <div style={{ flex: 1 }}>
          <Page />
        </div>
      </div>
    </div>
  );
}
