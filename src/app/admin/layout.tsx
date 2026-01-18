import { AdminAuthWrapper } from './components/admin-auth-wrapper';
import { AdminLayoutContent } from './components/admin-layout-content';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthWrapper>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminAuthWrapper>
  );
}
