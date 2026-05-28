import FlowEditor from './FlowEditor';
import ErdEditor from './ErdEditor';

export default function App() {
  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151' }}>🔀 Logic Flow</div>
        <div style={{ flex: 1 }}><FlowEditor /></div>
      </div>
      <div style={{ width: 1, background: '#d1d5db' }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '8px 16px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', fontSize: 13, fontWeight: 600, color: '#374151' }}>🗄️ ERD</div>
        <div style={{ flex: 1 }}><ErdEditor /></div>
      </div>
    </div>
  );
}
