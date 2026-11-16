import type { UserRole } from '@attendly/shared';

// Placeholder until the module pages (src/modules/<module>/) are built.
const roles: UserRole[] = ['STUDENT', 'PROFESSOR', 'ADMIN'];

function App() {
  return (
    <main>
      <h1>Attendly</h1>
      <p>QR-based attendance system. Roles: {roles.join(', ')}</p>
    </main>
  );
}

export default App;
