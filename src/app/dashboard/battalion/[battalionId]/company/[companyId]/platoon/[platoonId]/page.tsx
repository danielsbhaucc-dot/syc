
import PlatoonDashboardPage from './PlatoonDashboard';

// This component receives the params from the URL and passes them to the client component.
export default function Page({ params }: { params: { platoonId: string } }) {
  return (
    <PlatoonDashboardPage params={params} />
  );
}
