import { AuthProvider, useAuth } from "./lib/auth";
import { SiteContentProvider } from "./content/SiteContentProvider";
import Pages from "./pages";

/**
 * The content provider needs to know who is signed in so a publish can be
 * stamped with an author, but the public pages never depend on that.
 */
function Root() {
  const { session } = useAuth();
  return (
    <SiteContentProvider session={session}>
      <Pages />
    </SiteContentProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
